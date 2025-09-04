import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../app/services/firebaseConfig';

interface NovoLoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (loteData: any) => void;
}

interface FormData {
  nome: string;
  area: string;
  descricao: string;
  coordenadas: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  tipoSolo: string;
  numeroArvores: string;
}

const NovoLoteModal: React.FC<NovoLoteModalProps> = ({ visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    area: '',
    descricao: '',
    coordenadas: '',
    dataInicio: null,
    dataFim: null,
    tipoSolo: '',
    numeroArvores: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSoloModal, setShowSoloModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'inicio' | 'fim' | null>(null);

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate) {
      if (showDatePicker === 'inicio') {
        handleInputChange('dataInicio', selectedDate);
      } else if (showDatePicker === 'fim') {
        handleInputChange('dataFim', selectedDate);
      }
    }
    
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
      setShowDatePicker(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return 'Selecione a data';
    return date.toLocaleDateString('pt-BR');
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const newLote = {
        codigo: `L-${Date.now().toString().slice(-3)}`,
        nome: formData.nome,
        area: `${formData.area} hectares`,
        arvores: parseInt(formData.numeroArvores) || 0,
        colhidoTotal: '0 kg',
        status: 'planejado' as const,
        dataInicio: formData.dataInicio ? formData.dataInicio.toISOString().split('T')[0] : '',
        dataFim: formData.dataFim ? formData.dataFim.toISOString().split('T')[0] : '',
        ultimaColeta: 'Não iniciado',
        descricao: formData.descricao,
        coordenadas: formData.coordenadas,
        tipoSolo: formData.tipoSolo,
        createdAt: new Date().toISOString(),
      };

      // Enviar para Firestore
      await addDoc(collection(db, 'lotes'), newLote);

      onSuccess(newLote);
      resetForm();
      onClose();

      Alert.alert('Sucesso!', 'Lote criado com sucesso!', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar o lote. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      area: '',
      descricao: '',
      coordenadas: '',
      dataInicio: null,
      dataFim: null,
      tipoSolo: '',
      numeroArvores: ''
    });
    setCurrentStep(1);
    setShowSoloModal(false);
    setShowDatePicker(null);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isStep1Valid = formData.nome.trim() !== '' && formData.area.trim() !== '';
  const isStep2Valid = true; // Coordenadas são opcionais
  const isStep3Valid = formData.dataInicio !== null && formData.dataFim !== null;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      default: return false;
    }
  };

  const tiposSolo = [
    { label: 'Argiloso', value: 'argiloso' },
    { label: 'Arenoso', value: 'arenoso' },
    { label: 'Siltoso', value: 'siltoso' },
    { label: 'Orgânico', value: 'organico' },
    { label: 'Misto', value: 'misto' },
  ];

  const getSoloLabel = (value: string) => {
    const tipo = tiposSolo.find(t => t.value === value);
    return tipo ? tipo.label : 'Selecione o tipo de solo';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Novo Lote</Text>
              <Text style={styles.headerSubtitle}>Etapa {currentStep} de 3</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, currentStep >= 1 && styles.progressStepTextActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, currentStep >= 2 && styles.progressStepTextActive]}>2</Text>
            </View>
            <View style={[styles.progressLine, currentStep >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, currentStep >= 3 && styles.progressStepTextActive]}>3</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Informações Básicas</Text>
                <Text style={styles.stepSubtitle}>Defina o nome e características do lote</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Lote</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(value) => handleInputChange('nome', value)}
                  placeholder="Ex: Lote Norte A-15"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Área (hectares)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.area}
                  onChangeText={(value) => handleInputChange('area', value)}
                  placeholder="Ex: 2.5"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descricao}
                  onChangeText={(value) => handleInputChange('descricao', value)}
                  placeholder="Descreva características do lote..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{formData.descricao.length}/500 caracteres</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Solo</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowSoloModal(true)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    !formData.tipoSolo && styles.selectButtonPlaceholder
                  ]}>
                    {getSoloLabel(formData.tipoSolo)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: Localização */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Localização</Text>
                <Text style={styles.stepSubtitle}>Defina a localização do lote</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Coordenadas GPS</Text>
                <View style={styles.coordenadasContainer}>
                  <TextInput
                    style={[styles.input, styles.coordenadasInput]}
                    value={formData.coordenadas}
                    onChangeText={(value) => handleInputChange('coordenadas', value)}
                    placeholder="Ex: -3.7195, -38.5434"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity style={styles.locationButton}>
                    <Ionicons name="location" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="map" size={20} color="#16a34a" />
                  <Text style={styles.infoCardTitle}>Localização Atual</Text>
                </View>
                <Text style={styles.infoCardText}>Sua localização atual será usada como referência</Text>
                <TouchableOpacity style={styles.infoCardButton}>
                  <Ionicons name="map-outline" size={16} color="#374151" />
                  <Text style={styles.infoCardButtonText}>Usar Localização Atual</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mapCard}>
                <Text style={styles.mapCardTitle}>Mapa de Referência</Text>
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={48} color="#93c5fd" />
                </View>
                <Text style={styles.mapCardText}>Visualização do mapa será exibida aqui</Text>
              </View>
            </View>
          )}

          {/* Step 3: Planejamento */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Planejamento</Text>
                <Text style={styles.stepSubtitle}>Defina o período de colheita</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Início</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker('inicio')}
                >
                  <Ionicons name="calendar-outline" size={20} color="#16a34a" />
                  <Text style={[
                    styles.dateButtonText,
                    !formData.dataInicio && styles.dateButtonPlaceholder
                  ]}>
                    {formatDateForDisplay(formData.dataInicio)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Fim</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker('fim')}
                >
                  <Ionicons name="calendar-outline" size={20} color="#16a34a" />
                  <Text style={[
                    styles.dateButtonText,
                    !formData.dataFim && styles.dateButtonPlaceholder
                  ]}>
                    {formatDateForDisplay(formData.dataFim)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Árvores (estimado)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.numeroArvores}
                  onChangeText={(value) => handleInputChange('numeroArvores', value)}
                  placeholder="Ex: 45"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb" size={18} color="#d97706" />
                  <Text style={styles.tipTitle}>Dica</Text>
                </View>
                <Text style={styles.tipText}>
                  O número de árvores pode ser ajustado posteriormente conforme a identificação no campo.
                </Text>
              </View>

              {/* Resumo */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo do Lote</Text>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Nome:</Text>
                    <Text style={styles.summaryValue}>{formData.nome || 'Não informado'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Área:</Text>
                    <Text style={styles.summaryValue}>{formData.area ? `${formData.area} ha` : 'Não informado'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Árvores:</Text>
                    <Text style={styles.summaryValue}>{formData.numeroArvores || 'Não informado'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Período:</Text>
                    <Text style={styles.summaryValue}>
                      {formData.dataInicio && formData.dataFim 
                        ? `${formatDate(formData.dataInicio)} - ${formatDate(formData.dataFim)}`
                        : 'Não informado'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#374151" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity
                onPress={nextStep}
                disabled={!canProceed()}
                style={[styles.nextButton, !canProceed() && styles.disabledButton]}
              >
                <Text style={[styles.nextButtonText, !canProceed() && styles.disabledButtonText]}>
                  Próximo
                </Text>
                <Ionicons name="arrow-forward" size={16} color={!canProceed() ? "#9ca3af" : "white"} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading || !canProceed()}
                style={[styles.submitButton, (!canProceed() || isLoading) && styles.disabledButton]}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.submitButtonText}>Criando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="save" size={16} color="white" />
                    <Text style={styles.submitButtonText}>Criar Lote</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modal para seleção de tipo de solo */}
        <Modal
          visible={showSoloModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSoloModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tipo de Solo</Text>
                <TouchableOpacity onPress={() => setShowSoloModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalOptions}>
                {tiposSolo.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.modalOption,
                      formData.tipoSolo === tipo.value && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      handleInputChange('tipoSolo', tipo.value);
                      setShowSoloModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      formData.tipoSolo === tipo.value && styles.modalOptionTextSelected
                    ]}>
                      {tipo.label}
                    </Text>
                    {formData.tipoSolo === tipo.value && (
                      <Ionicons name="checkmark" size={20} color="#16a34a" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* DatePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'inicio' 
                ? formData.dataInicio || new Date()
                : formData.dataFim || new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            locale="pt-BR"
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#16a34a',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  progressStepTextActive: {
    color: 'white',
  },
  progressLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#16a34a',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 12,
    paddingHorizontal: 16,
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
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerOptionSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#16a34a',
    fontWeight: '500',
  },
  coordenadasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  coordenadasInput: {
    flex: 1,
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  infoCardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  infoCardButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  infoCardButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  mapCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#bfdbfe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapCardText: {
    fontSize: 12,
    color: '#1e40af',
  },
  tipCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400e',
  },
  tipText: {
    fontSize: 14,
    color: '#a16207',
  },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#15803d',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#166534',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
  },
  navigationContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  // Novos estilos para Select e DatePicker
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectButtonPlaceholder: {
    color: '#9ca3af',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  dateButtonPlaceholder: {
    color: '#9ca3af',
  },
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
});

export default NovoLoteModal;