import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
import { auth, db } from '../services/firebaseConfig';

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
  
  // Estados para dados do Firebase
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [arvores, setArvores] = useState<Arvore[]>([]);
  const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar autenticação e tipo de usuário
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

  // Carregar coletas recentes
  const loadRecentCollections = async () => {
    if (!currentUserId) return;

    try {
      // Consulta simples sem índice para evitar erros
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

      // Ordenar por data decrescente no lado do cliente
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
          hora: hora
        });
      }

      setRecentCollections(coletasData);
    } catch (error) {
      console.error('Erro ao carregar coletas recentes:', error);
      setRecentCollections([]);
    }
  };

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId) return;

      try {
        setIsLoading(true);

        // Carregar lotes (todos para admin, apenas atribuídos para colaborador)
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

        // Carregar todas as árvores para os lotes disponíveis
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

        // Carregar coletas recentes
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
      // Buscar informações do coletor
      const userDoc = await getDoc(doc(db, 'usuarios', currentUserId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Dados da coleta
      const coletaData = {
        loteId: selectedLote,
        arvoreId: selectedArvore,
        coletorId: currentUserId,
        coletorNome: userData.nome || 'Usuário sem nome',
        quantidade: quantidadeNum,
        observacoes: observacoes.trim(),
        dataColeta: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Salvar no Firebase
      await addDoc(collection(db, 'coletas'), coletaData);
      
      Alert.alert(
        'Sucesso!',
        'Coleta registrada com sucesso!',
        [{ text: 'OK' }]
      );
      
      // Limpar formulário
      setSelectedLote('');
      setSelectedArvore('');
      setQuantidade('');
      setObservacoes('');

      // Recarregar coletas recentes
      await loadRecentCollections();

    } catch (error) {
      console.error('Erro ao registrar coleta:', error);
      Alert.alert('Erro', 'Falha ao registrar coleta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Simular scan de QR após 2 segundos
    setTimeout(() => {
      if (lotes.length > 0) {
        setSelectedLote(lotes[0].id);
        if (arvores.length > 0) {
          setSelectedArvore(arvores[0].id);
        }
      }
      setShowQRScanner(false);
      Alert.alert(
        'QR Code Escaneado!',
        'Árvore selecionada automaticamente.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleBack = () => {
    router.back();
  };

  const getLoteNome = (id: string) => {
    const lote = lotes.find(l => l.id === id);
    return lote ? `${lote.codigo} - ${lote.nome}` : 'Selecione um lote';
  };

  const getArvoreNome = (id: string) => {
    const arvore = arvores.find(a => a.id === id);
    return arvore ? arvore.codigo : 'Selecione uma árvore';
  };

  // Filtrar árvores do lote selecionado
  const arvoresDoLote = arvores.filter(arvore => arvore.loteId === selectedLote);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Coleta</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* QR Scanner Button */}
        <View style={styles.qrScannerContainer}>
          <TouchableOpacity onPress={handleQRScan} style={styles.qrScannerButton}>
            <Ionicons name="qr-code-outline" size={48} color="white" />
            <View style={styles.qrScannerText}>
              <Text style={styles.qrScannerTitle}>Escanear QR Code</Text>
              <Text style={styles.qrScannerSubtitle}>Aponte para o QR da árvore</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Manual Form */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Registro Manual</Text>
            
            {/* Verificar se há lotes disponíveis */}
            {lotes.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
                <Text style={styles.noDataTitle}>Nenhum lote disponível</Text>
                <Text style={styles.noDataText}>
                  {isAdmin 
                    ? 'Não há lotes ativos no sistema'
                    : 'Você não foi atribuído a nenhum lote ativo'
                  }
                </Text>
              </View>
            ) : (
              <>
                {/* Lote Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Lote</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowLoteModal(true)}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      !selectedLote && styles.selectButtonPlaceholder
                    ]}>
                      {getLoteNome(selectedLote)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Árvore Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Árvore</Text>
                  <TouchableOpacity
                    style={[styles.selectButton, !selectedLote && styles.selectButtonDisabled]}
                    onPress={() => selectedLote && setShowArvoreModal(true)}
                    disabled={!selectedLote}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      !selectedArvore && styles.selectButtonPlaceholder,
                      !selectedLote && styles.selectButtonDisabledText
                    ]}>
                      {selectedLote && arvoresDoLote.length === 0 
                        ? 'Nenhuma árvore neste lote' 
                        : getArvoreNome(selectedArvore)
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  {selectedLote && arvoresDoLote.length === 0 && (
                    <Text style={styles.helperText}>
                      Nenhuma árvore cadastrada neste lote
                    </Text>
                  )}
                </View>

                {/* Quantidade */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantidade (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={quantidade}
                    onChangeText={setQuantidade}
                    placeholder="0.0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Observações */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Observações (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    placeholder="Condições da colheita, qualidade dos frutos..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{observacoes.length}/500</Text>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || !selectedLote || !selectedArvore || !quantidade || arvoresDoLote.length === 0}
                  style={[
                    styles.submitButton, 
                    (isSubmitting || !selectedLote || !selectedArvore || !quantidade || arvoresDoLote.length === 0) && styles.submitButtonDisabled
                  ]}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.submitButtonText}>Registrando...</Text>
                    </>
                  ) : (
                    <Text style={styles.submitButtonText}>Registrar Coleta</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Recent Collections */}
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Coletas de Hoje</Text>
          <View style={styles.recentList}>
            {recentCollections.length === 0 ? (
              <View style={styles.emptyRecent}>
                <Text style={styles.emptyRecentText}>
                  Nenhuma coleta registrada hoje
                </Text>
              </View>
            ) : (
              recentCollections.map((coleta) => (
                <View key={coleta.id} style={styles.recentCard}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentLote}>
                      {coleta.lote} - {coleta.arvore}
                    </Text>
                    <Text style={styles.recentQuantidade}>{coleta.quantidade}</Text>
                  </View>
                  <Text style={styles.recentHora}>{coleta.hora}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={96} color="#9ca3af" />
            </View>
            <Text style={styles.qrModalTitle}>Escaneando...</Text>
            <Text style={styles.qrModalSubtitle}>Aponte a câmera para o QR Code</Text>
            <TouchableOpacity
              onPress={() => setShowQRScanner(false)}
              style={styles.qrCancelButton}
            >
              <Text style={styles.qrCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lote Selection Modal */}
      <Modal
        visible={showLoteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Lote</Text>
              <TouchableOpacity onPress={() => setShowLoteModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalOptions}>
              {lotes.map((lote) => (
                <TouchableOpacity
                  key={lote.id}
                  style={[
                    styles.modalOption,
                    selectedLote === lote.id && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedLote(lote.id);
                    setSelectedArvore(''); // Reset árvore quando muda lote
                    setShowLoteModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedLote === lote.id && styles.modalOptionTextSelected
                  ]}>
                    {lote.codigo} - {lote.nome}
                  </Text>
                  {selectedLote === lote.id && (
                    <Ionicons name="checkmark" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Árvore Selection Modal */}
      <Modal
        visible={showArvoreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArvoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Árvore</Text>
              <TouchableOpacity onPress={() => setShowArvoreModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalOptions}>
              {arvoresDoLote.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyText}>
                    Nenhuma árvore cadastrada neste lote
                  </Text>
                </View>
              ) : (
                arvoresDoLote.map((arvore) => (
                  <TouchableOpacity
                    key={arvore.id}
                    style={[
                      styles.modalOption,
                      selectedArvore === arvore.id && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedArvore(arvore.id);
                      setShowArvoreModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedArvore === arvore.id && styles.modalOptionTextSelected
                    ]}>
                      {arvore.codigo}
                    </Text>
                    {selectedArvore === arvore.id && (
                      <Ionicons name="checkmark" size={20} color="#16a34a" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  qrScannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  qrScannerButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrScannerText: {
    alignItems: 'center',
  },
  qrScannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  qrScannerSubtitle: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectButtonPlaceholder: {
    color: '#9ca3af',
  },
  selectButtonDisabledText: {
    color: '#d1d5db',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  recentContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  recentList: {
    gap: 12,
  },
  emptyRecent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 14,
    color: '#6b7280',
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recentInfo: {
    flex: 1,
  },
  recentLote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  recentQuantidade: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  recentHora: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 80,
  },
  // QR Scanner Modal
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  qrPlaceholder: {
    width: 192,
    height: 192,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  qrModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  qrCancelButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  // Selection Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalOptions: {
    maxHeight: 300,
  },
  modalEmptyState: {
    padding: 20,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#16a34a',
    fontWeight: '500',
  },
});

export default ColetaScreen;