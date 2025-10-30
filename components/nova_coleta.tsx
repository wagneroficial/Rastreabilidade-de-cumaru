// screens/ColetaScreen.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import ColetaForm from '@/components/coleta/ColetaForm';
import Header from '@/components/coleta/Header';
import QRScannerButton from '@/components/coleta/QRScannerButton';
import QRScannerModal from '@/components/coleta/QRScannerModal';
import RecentCollections from '@/components/coleta/RecentCollections';
import SelectionModal from '@/components/coleta/SelectionModal';

import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface NovaColetaModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (coletaData?: any) => void;
}

interface Lote {
  id: string;
  codigo: string;
  nome: string;
}

interface Arvore {
  id: string;
  codigo: string;
  loteId: string;
}

interface RecentCollection {
  id: string;
  lote: string;
  arvore: string;
  quantidade: string;
  hora: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

const NovaColetaModal: React.FC<NovaColetaModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedLote, setSelectedLote] = useState('');
  const [selectedArvore, setSelectedArvore] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showArvoreModal, setShowArvoreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [arvores, setArvores] = useState<Arvore[]>([]);
  const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleClose = () => {
    onClose();
  };

  // Monitorar autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().tipo === 'admin');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
          setIsAdmin(false);
        }
      } else {
        setCurrentUserId(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Carregar lotes e árvores
  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId) return;

      try {
        setIsLoading(true);
        let lotesQuery;

        if (isAdmin) {
          lotesQuery = query(collection(db, 'lotes'), where('status', '==', 'ativo'));
        } else {
          lotesQuery = query(
            collection(db, 'lotes'),
            where('colaboradoresResponsaveis', 'array-contains', currentUserId),
            where('status', '==', 'ativo')
          );
        }

        const lotesSnapshot = await getDocs(lotesQuery);
        const lotesData: Lote[] = lotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          codigo: doc.data().codigo || `L-${doc.id.slice(-3)}`,
          nome: doc.data().nome || 'Lote sem nome',
        }));
        setLotes(lotesData);

        if (lotesData.length > 0) {
          const loteIds = lotesData.map((l) => l.id);
          const arvoresQuery = query(collection(db, 'arvores'), where('loteId', 'in', loteIds));
          const arvoresSnapshot = await getDocs(arvoresQuery);

          const arvoresData: Arvore[] = arvoresSnapshot.docs.map((doc) => ({
            id: doc.id,
            codigo: doc.data().codigo || `ARV-${doc.id.slice(-3)}`,
            loteId: doc.data().loteId,
          }));

          setArvores(arvoresData);
        }

        await loadRecentCollections(lotesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Falha ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserId) loadData();
  }, [currentUserId, isAdmin]);

  // Carregar coletas recentes
  const loadRecentCollections = async (lotesData: Lote[]) => {
    if (!currentUserId) return;
    try {
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('coletorId', '==', currentUserId)
      );
      const coletasSnapshot = await getDocs(coletasQuery);

      const lotesMap = new Map(lotesData.map(l => [l.id, l]));
      const arvoresMap = new Map(arvores.map(a => [a.id, a]));

      const today = dayjs().utc();
      const coletasData: RecentCollection[] = [];

      for (const docSnapshot of coletasSnapshot.docs) {
        const data = docSnapshot.data();
        const dataColeta = data.dataColeta?.toDate?.();
        if (!dataColeta) continue;

        const dataColetaDay = dayjs(dataColeta).utc();
        if (!dataColetaDay.isSame(today, 'day')) continue;

        const loteNome = lotesMap.get(data.loteId)?.codigo || 'Lote não encontrado';
        const arvoreCodigo = arvoresMap.get(data.arvoreId)?.codigo || 'Árvore não encontrada';
        const hora = dataColetaDay.local().format('HH:mm');

        coletasData.push({
          id: docSnapshot.id,
          lote: loteNome,
          arvore: arvoreCodigo,
          quantidade: `${data.quantidade || 0} kg`,
          hora,
          status: data.status || 'pendente',
        });
      }

      coletasData.sort((a, b) => b.hora.localeCompare(a.hora));
      setRecentCollections(coletasData.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar coletas recentes:', error);
      setRecentCollections([]);
    }
  };

  // Submeter coleta
  const handleSubmit = async () => {
    if (!selectedLote || !selectedArvore || !quantidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const quantidadeNum = parseFloat(quantidade.replace(',', '.'));
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      Alert.alert('Erro', 'Digite uma quantidade válida');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const userDoc = await getDoc(doc(db, 'usuarios', currentUserId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const status = isAdmin ? 'aprovada' : 'pendente';
      const coletaData = {
        loteId: selectedLote,
        arvoreId: selectedArvore,
        coletorId: currentUserId,
        coletorNome: userData.nome || 'Usuário sem nome',
        quantidade: quantidadeNum,
        observacoes: observacoes.trim(),
        status,
        dataColeta: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...(isAdmin && {
          aprovadoPor: currentUserId,
          aprovadoEm: serverTimestamp(),
        }),
      };

      await addDoc(collection(db, 'coletas'), coletaData);

      Alert.alert('Sucesso!', isAdmin
        ? 'Coleta registrada e aprovada com sucesso!'
        : 'Coleta registrada! Aguardando aprovação do administrador.', [{ text: 'OK' }]
      );

      setSelectedLote('');
      setSelectedArvore('');
      setQuantidade('');
      setObservacoes('');

      await loadRecentCollections(lotes);
      onSuccess?.(coletaData);
    } catch (error) {
      console.error('Erro ao registrar coleta:', error);
      Alert.alert('Erro', 'Falha ao registrar coleta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const arvoresDoLote = arvores.filter((arvore) => arvore.loteId === selectedLote);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
        <Header onBack={onClose} />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <QRScannerButton onPress={() => setShowQRScanner(true)} />

          <ColetaForm
            lotes={lotes}
            selectedLote={selectedLote}
            selectedArvore={selectedArvore}
            arvoresDoLote={arvoresDoLote}
            quantidade={quantidade}
            observacoes={observacoes}
            isSubmitting={isSubmitting}
            isAdmin={isAdmin}
            onLotePress={() => setShowLoteModal(true)}
            onArvorePress={() => selectedLote && setShowArvoreModal(true)}
            onQuantidadeChange={setQuantidade}
            onObservacoesChange={setObservacoes}
            onSubmit={handleSubmit}
          />

          <RecentCollections collections={recentCollections} />
          <View style={styles.bottomSpacing} />
        </ScrollView>

        <QRScannerModal
          visible={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onCodeScanned={() => { }}
        />

        <SelectionModal
          visible={showLoteModal}
          title="Selecionar Lote"
          options={lotes.map((l) => ({ id: l.id, label: `${l.codigo} - ${l.nome}` }))}
          selectedId={selectedLote}
          onClose={() => setShowLoteModal(false)}
          onSelect={(id) => { setSelectedLote(id); setSelectedArvore(''); setShowLoteModal(false); }}
        />

        <SelectionModal
          visible={showArvoreModal}
          title="Selecionar Árvore"
          options={arvoresDoLote.map((a) => ({ id: a.id, label: a.codigo }))}
          selectedId={selectedArvore}
          onClose={() => setShowArvoreModal(false)}
          onSelect={(id) => { setSelectedArvore(id); setShowArvoreModal(false); }}
          emptyMessage="Nenhuma árvore cadastrada neste lote"
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16, color: '#6b7280'
  },
  scrollView: {
    flex: 1
  },
  bottomSpacing: {
    height: 80
  },
});

export default NovaColetaModal;
