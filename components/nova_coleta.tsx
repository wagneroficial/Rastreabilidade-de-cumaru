import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '@/app/services/firebaseConfig.js';
import ColetaForm from '@/components/coleta/ColetaForm';
import Header from '@/components/coleta/Header';
import QRScannerButton from '@/components/coleta/QRScannerButton';
import QRScannerModal from '@/components/coleta/QRScannerModal';
import SelectionModal from '@/components/coleta/SelectionModal';

import {
  getAllAdminIds,
  notifyAdminNewColeta
} from '@/hooks/userNotificacao';

import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Unsubscribe,
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
  ativo?: boolean;
  colaboradoresResponsaveis?: string[];
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

  // 🔥 LISTENER EM TEMPO REAL PARA LOTES
  useEffect(() => {
    if (!currentUserId || !visible) {
      setLotes([]);
      return;
    }

    let q;

    if (isAdmin) {
      // Admin vê todos os lotes ativos
      q = query(
        collection(db, 'lotes'),
        where('ativo', '==', true)
      );
    } else {
      // Colaborador vê apenas lotes onde tem permissão
      q = query(
        collection(db, 'lotes'),
        where('ativo', '==', true),
        where('colaboradoresResponsaveis', 'array-contains', currentUserId)
      );
    }

    console.log('📡 Iniciando listener de lotes...');
    setIsLoading(true);

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('🔄 Lotes atualizados! Total:', snapshot.docs.length);

        const lotesData: Lote[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          codigo: doc.data().codigo || `L-${doc.id.slice(-3)}`,
          nome: doc.data().nome || 'Lote sem nome',
          ativo: doc.data().ativo,
          colaboradoresResponsaveis: doc.data().colaboradoresResponsaveis || [],
        }));

        setLotes(lotesData);
        setIsLoading(false);

        // Se o lote selecionado não está mais disponível, limpa a seleção
        if (selectedLote && !lotesData.find(l => l.id === selectedLote)) {
          setSelectedLote('');
          setSelectedArvore('');
          Alert.alert(
            'Aviso',
            'O lote selecionado não está mais disponível para você'
          );
        }
      },
      (error) => {
        console.error('❌ Erro ao buscar lotes:', error);
        Alert.alert('Erro', 'Falha ao carregar lotes. Tente novamente.');
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🛑 Removendo listener de lotes');
      unsubscribe();
    };
  }, [currentUserId, isAdmin, visible, selectedLote]);

  // 🔥 LISTENER EM TEMPO REAL PARA ÁRVORES
  useEffect(() => {
    if (!visible || lotes.length === 0) {
      setArvores([]);
      return;
    }

    console.log('📡 Iniciando listener de árvores...');

    // Firestore limita o "in" a 10 elementos, então vamos usar múltiplos listeners
    const loteIds = lotes.map(l => l.id);
    const loteChunks: string[][] = [];
    
    for (let i = 0; i < loteIds.length; i += 10) {
      loteChunks.push(loteIds.slice(i, i + 10));
    }

    const unsubscribes: Unsubscribe[] = [];
    let allArvores: Arvore[] = [];

    loteChunks.forEach((chunk) => {
      const q = query(
        collection(db, 'arvores'),
        where('loteId', 'in', chunk)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Remove árvores antigas deste chunk
          allArvores = allArvores.filter(a => !chunk.includes(a.loteId));
          
          // Adiciona árvores novas
          const newArvores = snapshot.docs.map((doc) => ({
            id: doc.id,
            codigo: doc.data().codigo || `ARV-${doc.id.slice(-3)}`,
            loteId: doc.data().loteId,
          }));

          allArvores = [...allArvores, ...newArvores];
          setArvores([...allArvores]);

          console.log('🔄 Árvores atualizadas! Total:', allArvores.length);

          // Se a árvore selecionada não existe mais, limpa a seleção
          if (selectedArvore && !allArvores.find(a => a.id === selectedArvore)) {
            setSelectedArvore('');
          }
        },
        (error) => {
          console.error('❌ Erro ao buscar árvores:', error);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      console.log('🛑 Removendo listeners de árvores');
      unsubscribes.forEach(unsub => unsub());
    };
  }, [lotes, visible, selectedArvore]);

  // Carregar coletas recentes (mantém getDocs pois é histórico)
  useEffect(() => {
    if (!currentUserId || !visible || lotes.length === 0) return;
    
    loadRecentCollections(lotes);
  }, [currentUserId, visible, lotes]);

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
      // Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'usuarios', currentUserId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // ✅ BUSCAR LOTE E ÁRVORE PARA PEGAR NOME E CÓDIGO
      const lote = lotes.find(l => l.id === selectedLote);
      const arvore = arvores.find(a => a.id === selectedArvore);

      console.log('🔍 Debug - IDs selecionados:', { selectedLote, selectedArvore });
      console.log('🔍 Debug - Lote encontrado:', lote);
      console.log('🔍 Debug - Árvore encontrada:', arvore);

      // Validar se encontrou os dados
      if (!lote) {
        Alert.alert('Erro', 'Lote selecionado não foi encontrado');
        setIsSubmitting(false);
        return;
      }

      if (!arvore) {
        Alert.alert('Erro', 'Árvore selecionada não foi encontrada');
        setIsSubmitting(false);
        return;
      }

      const status = isAdmin ? 'aprovada' : 'pendente';
      
      const coletaData = {
        loteId: selectedLote,
        loteNome: lote.nome,
        arvoreId: selectedArvore,
        arvoreCodigo: arvore.codigo,
        coletorId: currentUserId,
        coletorNome: userData.nome || 'Usuário sem nome',
        quantidade: quantidadeNum,
        observacoes: observacoes.trim(),
        status,
        dataColeta: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(isAdmin && {
          aprovadoPor: currentUserId,
          aprovadoEm: serverTimestamp(),
        }),
      };

      console.log('📝 Salvando coleta com dados:', {
        loteNome: coletaData.loteNome,
        arvoreCodigo: coletaData.arvoreCodigo,
      });

      await addDoc(collection(db, 'coletas'), coletaData);
      
      console.log('✅ Coleta salva com sucesso!');

      // ✅ ENVIAR NOTIFICAÇÃO PARA ADMINS (apenas se não for admin)
      if (!isAdmin) {
        console.log('📬 Iniciando envio de notificações para admins...');
        try {
          const adminIds = await getAllAdminIds();
          console.log(`👥 ${adminIds.length} admins encontrados:`, adminIds);
          
          if (adminIds.length > 0) {
            const notificationPromises = adminIds.map(adminId => {
              console.log(`📨 Enviando notificação para admin ID: ${adminId}`);
              return notifyAdminNewColeta(adminId, {
                coletaId: '', 
                loteNome: lote.nome,
                arvoreCodigo: arvore.codigo,
                quantidade: quantidadeNum,
                coletorNome: userData.nome || 'Usuário sem nome',
              });
            });

            await Promise.all(notificationPromises);
            console.log(`✅ ${adminIds.length} notificações enviadas com sucesso!`);
          }
        } catch (notifError: any) {
          console.error('❌ Erro ao enviar notificações:', notifError);
        }
      }

      // Limpar formulário
      setSelectedLote('');
      setSelectedArvore('');
      setQuantidade('');
      setObservacoes('');

      // Recarregar coletas recentes
      await loadRecentCollections(lotes);
      onSuccess?.(coletaData);

      // Mostrar mensagem de sucesso
      Alert.alert(
        'Sucesso!',
        isAdmin
          ? 'Coleta registrada e aprovada com sucesso!'
          : 'Coleta registrada! Aguardando aprovação do administrador.'
      );
    } catch (error) {
      console.error('❌ Erro ao registrar coleta:', error);
      Alert.alert('Erro', 'Falha ao registrar coleta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const arvoresDoLote = arvores.filter((arvore) => arvore.loteId === selectedLote);

  if (isLoading) {
    return (
      <Modal visible={visible} transparent={false} animationType="slide">
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </SafeAreaView>
      </Modal>
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
          options={lotes.map((l) => ({ id: l.id, label: l.nome }))}
          selectedId={selectedLote}
          onClose={() => setShowLoteModal(false)}
          onSelect={(id) => {
            setSelectedLote(id);
            setSelectedArvore('');
            setShowLoteModal(false);
          }}
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