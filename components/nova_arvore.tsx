import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
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
import { db } from '../app/services/firebaseConfig.js';

interface CadastrarArvoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (arvoreData: ArvoreFormData) => void;
  loteId: string;
}

interface ArvoreFormData {
  idArvore: string;
  estadoSaude: string;
  dataPlantio: string;
  latitude: string;
  longitude: string;
  notasAdicionais: string;
}

const estadosSaude = [
  { label: 'Saudável', value: 'saudavel' },
  { label: 'Ruim', value: 'ruim' },
  { label: 'Morta', value: 'morta' },
];

export default function CadastrarArvoreModal({ 
  visible, 
  onClose, 
  onSubmit, 
  loteId 
}: CadastrarArvoreModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [formData, setFormData] = useState<ArvoreFormData>({
    idArvore: '',
    estadoSaude: '',
    dataPlantio: '',
    latitude: '',
    longitude: '',
    notasAdicionais: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.idArvore.trim()) {
        newErrors.idArvore = 'ID da árvore é obrigatório';
      }
      if (!formData.estadoSaude.trim()) {
        newErrors.estadoSaude = 'Estado de saúde é obrigatório';
      }
      if (!formData.dataPlantio.trim()) {
        newErrors.dataPlantio = 'Data do plantio é obrigatória';
      }
    }

    if (currentStep === 2) {
      if (!formData.latitude.trim()) {
        newErrors.latitude = 'Latitude é obrigatória';
      }
      if (!formData.longitude.trim()) {
        newErrors.longitude = 'Longitude é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      const arvoreData = {
        codigo: formData.idArvore,
        loteId: loteId,
        estadoSaude: formData.estadoSaude,
        dataPlantio: formData.dataPlantio,
        latitude: formData.latitude,
        longitude: formData.longitude,
        notasAdicionais: formData.notasAdicionais,
        producaoTotal: '0 kg',
        ultimaColeta: 'Nunca coletada',
        diasAtras: 0,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'arvores'), arvoreData);

      onSubmit(formData);

      Alert.alert('Sucesso!', 'Árvore cadastrada com sucesso!', [
        { text: 'OK', onPress: handleClose }
      ]);

    } catch (error) {
      console.error('Erro ao cadastrar árvore:', error);
      Alert.alert('Erro', 'Falha ao cadastrar a árvore. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      idArvore: '',
      estadoSaude: '',
      dataPlantio: '',
      latitude: '',
      longitude: '',
      notasAdicionais: '',
    });
    setErrors({});
    setShowEstadoModal(false);
    onClose();
  };

  const updateFormData = (field: keyof ArvoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUseCurrentLocation = () => {
    updateFormData('latitude', '-3.123456');
    updateFormData('longitude', '-60.123456');
  };

  const getEstadoLabel = (value: string) => {
    const estado = estadosSaude.find(e => e.value === value);
    return estado ? estado.label : 'Selecione um estado';
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf-outline" size={24} color="#059669" />
        </View>
      </View>

      <Text style={styles.stepSubtitle}>Preencha os dados abaixo para vincular esta árvore à sua produção</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ID da Árvore*</Text>
          <TextInput
            style={[styles.input, errors.idArvore && styles.inputError]}
            value={formData.idArvore}
            onChangeText={(value) => updateFormData('idArvore', value)}
            placeholder="e.g. CUM-A12-001"
            placeholderTextColor="#9CA3AF"
          />
          {errors.idArvore && <Text style={styles.errorText}>{errors.idArvore}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Estado da Árvore*</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, errors.estadoSaude && styles.inputError]}
            onPress={() => setShowEstadoModal(true)}
          >
            <Text style={[
              styles.selectText,
              !formData.estadoSaude && styles.selectPlaceholder
            ]}>
              {getEstadoLabel(formData.estadoSaude)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {errors.estadoSaude && <Text style={styles.errorText}>{errors.estadoSaude}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data de plantio*</Text>
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.input, styles.dateInput, errors.dataPlantio && styles.inputError]}
              value={formData.dataPlantio}
              onChangeText={(value) => updateFormData('dataPlantio', value)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.dateIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {errors.dataPlantio && <Text style={styles.errorText}>{errors.dataPlantio}</Text>}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="location-outline" size={24} color="#059669" />
        </View>
      </View>

      <Text style={styles.stepSubtitle}> Adicione a Localização da Árvore</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Localização GPS*</Text>
          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <TextInput
                style={[styles.input, styles.coordinateInput, errors.latitude && styles.inputError]}
                value={formData.latitude}
                onChangeText={(value) => updateFormData('latitude', value)}
                placeholder="-3.123456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <TextInput
                style={[styles.input, styles.coordinateInput, errors.longitude && styles.inputError]}
                value={formData.longitude}
                onChangeText={(value) => updateFormData('longitude', value)}
                placeholder="-60.123456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>
          {(errors.latitude || errors.longitude) && (
            <Text style={styles.errorText}>Coordenadas são obrigatórias</Text>
          )}
          
          <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
            <Ionicons name="navigate" size={16} color="white" />
            <Text style={styles.locationButtonText}>Obter GPS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notas adicionais</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notasAdicionais}
            onChangeText={(value) => updateFormData('notasAdicionais', value)}
            placeholder="Alguma observação adicional sobre esta árvore..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.characterCount}>{formData.notasAdicionais.length}/300 caracteres</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return renderStep1();
    }
  };

  const getButtonText = () => currentStep === 1 ? 'Continuar' : 'Cadastrar';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Nova Árvore</Text>
            <Text style={styles.headerSubtitle}>Etapa {currentStep} de 2</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.bottomButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButtonBottom} onPress={handleBack}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.disabledButton]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.continueButtonText}>Salvando...</Text>
              </>
            ) : (
              <Text style={styles.continueButtonText}>{getButtonText()}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          visible={showEstadoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEstadoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Estado da Árvore</Text>
                <TouchableOpacity onPress={() => setShowEstadoModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalOptions}>
                {estadosSaude.map((estado) => (
                  <TouchableOpacity
                    key={estado.value}
                    style={[
                      styles.modalOption,
                      formData.estadoSaude === estado.value && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      updateFormData('estadoSaude', estado.value);
                      setShowEstadoModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      formData.estadoSaude === estado.value && styles.modalOptionTextSelected
                    ]}>
                      {estado.label}
                    </Text>
                    {formData.estadoSaude === estado.value && (
                      <Ionicons name="checkmark" size={20} color="#16a34a" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  header: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 600,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },
  dateContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 40,
  },
  dateIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  coordinateItem: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  coordinateInput: {
    fontSize: 14,
  },
  locationButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButtonBottom: {
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  // Modal styles
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