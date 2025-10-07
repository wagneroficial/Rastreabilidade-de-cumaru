// screens/ColetaScreen.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig';
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
  where
} from 'firebase/firestore';

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

const ColetaScreen: React.FC = () => {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.tipo === 'admin');
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

  const loadRecentCollections = async () => {
    if (!currentUserId) return;

    try {
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('coletorId', '==', currentUserId)
      );

      const coletasSnapshot = await getDocs(coletasQuery);
      const coletasTemp = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const docSnapshot of coletasSnapshot.docs) {
        const data = docSnapshot.data();
        
        const dataColeta = data.dataColeta?.toDate?.() || new Date();
        const dataColetaDay = new Date(dataColeta);
        dataColetaDay.setHours(0, 0, 0, 0);
        
        if (dataColetaDay.getTime() === today.getTime()) {
          coletasTemp.push({
            id: docSnapshot.id,
            data: data,
            dataColeta: dataColeta
          });
        }
      }

      coletasTemp.sort((a, b) => b.dataColeta.getTime() - a.dataColeta.getTime());

      const coletasData: RecentCollection[] = [];
      
      for (const coleta of coletasTemp.slice(0, 10)) {
        let loteNome = 'Lote não encontrado';
        let arvoreCodigo = 'Árvore não encontrada';

        try {
          if (coleta.data.loteId) {
            const loteDoc = await getDoc(doc(db, 'lotes', coleta.data.loteId));
            if (loteDoc.exists()) {
              const loteData = loteDoc.data();
              loteNome = loteData.codigo || loteData.nome || 'Lote sem nome';
            }
          }

          if (coleta.data.arvoreId) {
            const arvoreDoc = await getDoc(doc(db, 'arvores', coleta.data.arvoreId));
            if (arvoreDoc.exists()) {
              const arvoreData = arvoreDoc.data();
              arvoreCodigo = arvoreData.codigo || 'Sem código';
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados relacionados:', error);
        }

        const hora = coleta.dataColeta.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        coletasData.push({
          id: coleta.id,
          lote: loteNome,
          arvore: arvoreCodigo,
          quantidade: `${coleta.data.quantidade || 0} kg`,
          hora: hora,
          status: coleta.data.status || 'pendente'  // ← ADICIONE ESTA LINHA
        });
      }

      setRecentCollections(coletasData);
    } catch (error) {
      console.error('Erro ao carregar coletas recentes:', error);
      setRecentCollections([]);
    }
  };

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
        const lotesData: Lote[] = [];
        
        lotesSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          lotesData.push({
            id: doc.id,
            codigo: data.codigo || `L-${doc.id.slice(-3)}`,
            nome: data.nome || 'Lote sem nome'
          });
        });

        setLotes(lotesData);

        if (lotesData.length > 0) {
          const loteIds = lotesData.map(lote => lote.id);
          const arvoresQuery = query(
            collection(db, 'arvores'),
            where('loteId', 'in', loteIds)
          );

          const arvoresSnapshot = await getDocs(arvoresQuery);
          const arvoresData: Arvore[] = [];
          
          arvoresSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            arvoresData.push({
              id: doc.id,
              codigo: data.codigo || `ARV-${doc.id.slice(-3)}`,
              loteId: data.loteId
            });
          });

          setArvores(arvoresData);
        }

        await loadRecentCollections();

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Falha ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserId !== null) {
      loadData();
    }
  }, [currentUserId, isAdmin]);

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

      // Determina o status baseado no tipo de usuário
      const status = isAdmin ? 'aprovada' : 'pendente';

      const coletaData = {
        loteId: selectedLote,
        arvoreId: selectedArvore,
        coletorId: currentUserId,
        coletorNome: userData.nome || 'Usuário sem nome',
        quantidade: quantidadeNum,
        observacoes: observacoes.trim(),
        status: status, // 'pendente' ou 'aprovada'
        dataColeta: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...(isAdmin && { 
          aprovadoPor: currentUserId,
          aprovadoEm: serverTimestamp() 
        })
      };

      await addDoc(collection(db, 'coletas'), coletaData);
      
      const mensagemSucesso = isAdmin 
        ? 'Coleta registrada e aprovada com sucesso!' 
        : 'Coleta registrada! Aguardando aprovação do administrador.';
      
      Alert.alert('Sucesso!', mensagemSucesso, [{ text: 'OK' }]);
      
      setSelectedLote('');
      setSelectedArvore('');
      setQuantidade('');
      setObservacoes('');

      await loadRecentCollections();

    } catch (error) {
      console.error('Erro ao registrar coleta:', error);
      Alert.alert('Erro', 'Falha ao registrar coleta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRCodeScanned = async (data: string) => {
  setShowQRScanner(false);
  
  try {
    // Verificar se é URL inválida
    if (data.includes('exp://') || data.startsWith('http')) {
      Alert.alert('QR Code Inválido', 'Este não é um QR Code de árvore válido.');
      return;
    }

    let qrData;
    
    // Tentar fazer parse do JSON
    try {
      qrData = JSON.parse(data);
    } catch (parseError) {
      // Se não for JSON, assume formato simples: "L-001|ARV-042"
      const partes = data.trim().split('|');
      if (partes.length === 2) {
        qrData = {
          codigoLote: partes[0].trim(),
          codigoArvore: partes[1].trim()
        };
      } else {
        Alert.alert('Erro', 'Formato de QR Code inválido.');
        return;
      }
    }

    const { codigoLote, codigoArvore } = qrData;

    if (!codigoLote || !codigoArvore) {
      Alert.alert('Erro', 'QR Code incompleto.');
      return;
    }

    // Buscar o lote pelo código
    const loteQuery = query(
      collection(db, 'lotes'),
      where('codigo', '==', codigoLote)
    );
    const loteSnapshot = await getDocs(loteQuery);

    if (loteSnapshot.empty) {
      Alert.alert('Lote Não Encontrado', `O lote ${codigoLote} não foi encontrado.`);
      return;
    }

    const loteDoc = loteSnapshot.docs[0];
    const loteId = loteDoc.id;

    // Verificar se o usuário tem acesso ao lote
    const lotePermitido = lotes.find(l => l.id === loteId);
    
    if (!lotePermitido) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para acessar este lote.');
      return;
    }

    // Buscar a árvore pelo código e loteId
    const arvoreQuery = query(
      collection(db, 'arvores'),
      where('codigo', '==', codigoArvore),
      where('loteId', '==', loteId)
    );
    const arvoreSnapshot = await getDocs(arvoreQuery);

    if (arvoreSnapshot.empty) {
      Alert.alert('Árvore Não Encontrada', `A árvore ${codigoArvore} não foi encontrada no lote ${codigoLote}.`);
      return;
    }

    const arvoreDoc = arvoreSnapshot.docs[0];
    
    setSelectedLote(loteId);
    setSelectedArvore(arvoreDoc.id);
    
    Alert.alert('Sucesso!', `Lote: ${codigoLote}\nÁrvore: ${codigoArvore}`, [{ text: 'OK' }]);

  } catch (error) {
    console.error('Erro ao processar QR Code:', error);
    Alert.alert('Erro', 'Falha ao processar QR Code. Tente novamente.');
  }
};

  const arvoresDoLote = arvores.filter(arvore => arvore.loteId === selectedLote);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      
      <Header onBack={() => router.back()} />

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
        onCodeScanned={handleQRCodeScanned}
      />

      <SelectionModal
        visible={showLoteModal}
        title="Selecionar Lote"
        options={lotes.map(l => ({ id: l.id, label: `${l.codigo} - ${l.nome}` }))}
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
        options={arvoresDoLote.map(a => ({ id: a.id, label: a.codigo }))}
        selectedId={selectedArvore}
        onClose={() => setShowArvoreModal(false)}
        onSelect={(id) => {
          setSelectedArvore(id);
          setShowArvoreModal(false);
        }}
        emptyMessage="Nenhuma árvore cadastrada neste lote"
      />
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default ColetaScreen;