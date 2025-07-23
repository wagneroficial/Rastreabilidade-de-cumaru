import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

interface ColetaScreenProps {
  navigation: any;
}

interface Lote {
  id: string;
  nome: string;
}

interface Arvore {
  id: string;
  codigo: string;
}

interface RecentCollection {
  lote: string;
  arvore: string;
  quantidade: string;
  hora: string;
}

const ColetaScreen: React.FC<ColetaScreenProps> = ({ navigation }) => {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedLote, setSelectedLote] = useState('');
  const [selectedArvore, setSelectedArvore] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showArvoreModal, setShowArvoreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lotes: Lote[] = [
    { id: 'A-12', nome: 'Lote Norte A-12' },
    { id: 'B-07', nome: 'Lote Sul B-07' },
    { id: 'C-05', nome: 'Lote Oeste C-05' }
  ];

  const arvores: Arvore[] = [
    { id: '001', codigo: 'CUM-001' },
    { id: '002', codigo: 'CUM-002' },
    { id: '003', codigo: 'CUM-003' },
    { id: '004', codigo: 'CUM-004' }
  ];

  const recentCollections: RecentCollection[] = [
    { lote: 'A-12', arvore: 'CUM-001', quantidade: '2.5 kg', hora: '14:30' },
    { lote: 'A-12', arvore: 'CUM-003', quantidade: '1.8 kg', hora: '14:15' },
    { lote: 'B-07', arvore: 'CUM-012', quantidade: '3.2 kg', hora: '13:45' }
  ];

  const handleSubmit = async () => {
    if (!selectedLote || !selectedArvore || !quantidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar coleta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Simular scan de QR após 2 segundos
    setTimeout(() => {
      setSelectedLote('A-12');
      setSelectedArvore('001');
      setShowQRScanner(false);
      Alert.alert(
        'QR Code Escaneado!',
        'Árvore CUM-001 do Lote A-12 selecionada.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleBack = () => {
      router.back();
    };



  const getLoteNome = (id: string) => {
    const lote = lotes.find(l => l.id === id);
    return lote ? lote.nome : 'Selecione um lote';
  };

  const getArvoreNome = (id: string) => {
    const arvore = arvores.find(a => a.id === id);
    return arvore ? arvore.codigo : 'Selecione uma árvore';
  };

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
                  {getArvoreNome(selectedArvore)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
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
                keyboardType="numeric"
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
              disabled={isSubmitting || !selectedLote || !selectedArvore || !quantidade}
              style={[styles.submitButton, (isSubmitting || !selectedLote || !selectedArvore || !quantidade) && styles.submitButtonDisabled]}
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
          </View>
        </View>

        {/* Recent Collections */}
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Coletas de Hoje</Text>
          <View style={styles.recentList}>
            {recentCollections.map((coleta, index) => (
              <View key={index} style={styles.recentCard}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentLote}>
                    {coleta.lote} - {coleta.arvore}
                  </Text>
                  <Text style={styles.recentQuantidade}>{coleta.quantidade}</Text>
                </View>
                <Text style={styles.recentHora}>{coleta.hora}</Text>
              </View>
            ))}
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
                    {lote.nome}
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
              {arvores.map((arvore) => (
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
              ))}
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

  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default ColetaScreen;