import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../app/services/firebaseConfig.js';

interface CadastrarArvoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (arvoreData?: any) => void;
  editMode?: boolean;
  arvoreToEdit?: any;
}

interface Lote {
  id: string;
  nome: string;
  codigo: string;
}

interface ArvoreFormData {
  idArvore: string;
  loteId: string;
  estadoSaude: string;
  dataPlantio: string;
  latitude: string;
  longitude: string;
  notasAdicionais: string;
}

const estadosSaude = [
  { label: 'Saudável', value: 'saudavel' },
  { label: 'Ruim', value: 'ruim' },
];

const CadastrarArvoreModal: React.FC<CadastrarArvoreModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editMode = false,
  arvoreToEdit,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<ArvoreFormData>({
    idArvore: '',
    loteId: '',
    estadoSaude: '',
    dataPlantio: '',
    latitude: '',
    longitude: '',
    notasAdicionais: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Lotes do Firebase ---
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        setLoadingLotes(true);
        const snapshot = await getDocs(collection(db, 'lotes'));
        const lotesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setLotes(lotesList);
      } catch (error) {
        console.error('Erro ao buscar lotes:', error);
      } finally {
        setLoadingLotes(false);
      }
    };
    fetchLotes();
  }, []);

  // Preencher dados quando em modo de edição
  useEffect(() => {
    if (editMode && arvoreToEdit && visible) {
      setFormData({
        idArvore: arvoreToEdit.codigo || '',
        loteId: arvoreToEdit.loteId || '',
        estadoSaude: arvoreToEdit.estadoSaude || '',
        dataPlantio: arvoreToEdit.dataPlantio
          ? (arvoreToEdit.dataPlantio.seconds
            ? new Date(arvoreToEdit.dataPlantio.seconds * 1000).toISOString()
            : arvoreToEdit.dataPlantio)
          : '',
        latitude: arvoreToEdit.latitude?.toString() || '',
        longitude: arvoreToEdit.longitude?.toString() || '',
        notasAdicionais: arvoreToEdit.observacoes || arvoreToEdit.notasAdicionais || '',
      });
    }
  }, [editMode, arvoreToEdit, visible]);

  const updateFormData = (field: keyof ArvoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.idArvore.trim()) newErrors.idArvore = 'ID da árvore é obrigatório';
      if (!formData.loteId.trim()) newErrors.loteId = 'Selecione um lote';
      if (!formData.estadoSaude.trim()) newErrors.estadoSaude = 'Estado é obrigatório';
      if (!formData.dataPlantio.trim()) newErrors.dataPlantio = 'Data do plantio é obrigatória';
    }
    if (currentStep === 2) {
      if (!formData.latitude.trim()) newErrors.latitude = 'Latitude é obrigatória';
      if (!formData.longitude.trim()) newErrors.longitude = 'Longitude é obrigatória';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      handleClose();
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('dataPlantio', selectedDate.toISOString());
    }
  };

  const handleUseCurrentLocation = () => {
    updateFormData('latitude', '-3.123456');
    updateFormData('longitude', '-60.123456');
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setIsLoading(true);
    try {
      const arvoreData = {
        codigo: formData.idArvore,
        loteId: formData.loteId,
        estadoSaude: formData.estadoSaude,
        dataPlantio: formData.dataPlantio,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        observacoes: formData.notasAdicionais,
        ...(editMode ? {} : {
          producaoTotal: '0 kg',
          ultimaColeta: 'Nunca coletada',
          diasAtras: 0,
          createdAt: new Date().toISOString(),
        }),
      };

      if (editMode && arvoreToEdit?.id) {
        // Atualizar árvore existente
        await updateDoc(doc(db, 'arvores', arvoreToEdit.id), arvoreData);
        onSuccess({ id: arvoreToEdit.id, ...arvoreData });
        Alert.alert('Sucesso!', 'Árvore atualizada com sucesso!');
      } else {
        // Criar nova árvore
        const docRef = await addDoc(collection(db, 'arvores'), arvoreData);
        onSuccess({ id: docRef.id, ...arvoreData });
        Alert.alert('Sucesso!', 'Árvore cadastrada com sucesso!');
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar árvore:', error);
      Alert.alert('Erro', `Falha ao ${editMode ? 'atualizar' : 'cadastrar'} a árvore.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      idArvore: '',
      loteId: '',
      estadoSaude: '',
      dataPlantio: '',
      latitude: '',
      longitude: '',
      notasAdicionais: '',
    });
    setErrors({});
    setShowEstadoModal(false);
    setShowLoteModal(false);
    setCurrentStep(1);
    onClose();
  };


  const renderStep1 = () => (
    <View>
      <Text style={styles.stepSubtitle}>
        {editMode ? 'Edite os dados da árvore' : 'Preencha os dados abaixo para cadastrar uma nova árvore'}
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}><Text style={styles.span}>* </Text>ID da Árvore</Text>
          <TextInput
            style={[styles.input, errors.idArvore && styles.inputError]}
            value={formData.idArvore}
            onChangeText={value => updateFormData('idArvore', value)}
            placeholder="e.g. CUM-A12-001"
          />
          {errors.idArvore && <Text style={styles.errorText}>{errors.idArvore}</Text>}
        </View>
        {/* Lote */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lote</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, errors.loteId && styles.inputError]}
            onPress={() => setShowLoteModal(true)}
            disabled={loadingLotes}
          >
            <Text style={[styles.selectText, !formData.loteId && styles.selectPlaceholder]}>
              {loadingLotes
                ? 'Carregando lotes...'
                : formData.loteId
                  ? lotes.find(lote => lote.id === formData.loteId)?.nome || 'Selecione um lote'
                  : 'Selecione um lote'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {errors.loteId && <Text style={styles.errorText}>{errors.loteId}</Text>}
        </View>

        {/* Modal de Lotes */}
        <Modal
          visible={showLoteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Lote</Text>
                <TouchableOpacity onPress={() => setShowLoteModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalOptions}>
                {loadingLotes ? (
                  <Text style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>
                    Carregando lotes...
                  </Text>
                ) : lotes.length === 0 ? (
                  <Text style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>
                    Nenhum lote cadastrado
                  </Text>
                ) : (
                  lotes.map(lote => (
                    <TouchableOpacity
                      key={lote.id}
                      style={[
                        styles.modalOption,
                        formData.loteId === lote.id && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        updateFormData('loteId', lote.id);
                        setShowLoteModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          formData.loteId === lote.id && styles.modalOptionTextSelected,
                        ]}
                      >
                        {lote.nome}
                      </Text>
                      {formData.loteId === lote.id && (
                        <Ionicons name="checkmark" size={20} color="#16a34a" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>


        {/* Estado da Árvore */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Estado da Árvore</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, errors.estadoSaude && styles.inputError]}
            onPress={() => setShowEstadoModal(true)}
          >
            <Text style={[styles.selectText, !formData.estadoSaude && styles.selectPlaceholder]}>
              {formData.estadoSaude
                ? estadosSaude.find(e => e.value === formData.estadoSaude)?.label
                : 'Selecione um estado'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Data do plantio */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data de Cadastro</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity

              onPress={() => setShowDatePicker(true)}
            >
              <TextInput
                style={[styles.input, styles.dateInput, errors.dataPlantio && styles.inputError]}
                value={formData.dataPlantio ? new Date(formData.dataPlantio).toLocaleDateString('pt-BR') : ''}
                placeholder="DD/MM/AAAA"
                editable={false}
              />

              <View style={styles.dateIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" /></View>
            </TouchableOpacity>
          </View>
          {errors.dataPlantio && <Text style={styles.errorText}>{errors.dataPlantio}</Text>}
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dataPlantio ? new Date(formData.dataPlantio) : new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepSubtitle}>Adicione a Localização da Árvore</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Localização GPS*</Text>
          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <TextInput
                style={[styles.input, styles.coordinateInput, errors.latitude && styles.inputError]}
                value={formData.latitude}
                onChangeText={value => updateFormData('latitude', value)}
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
                onChangeText={value => updateFormData('longitude', value)}
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
            onChangeText={value => updateFormData('notasAdicionais', value)}
            placeholder="Alguma observação adicional sobre esta árvore..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.characterCount}>
            {formData.notasAdicionais.length}/300 caracteres
          </Text>
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

  const getButtonText = () => (currentStep === 1 ? 'Continuar' : (editMode ? 'Atualizar' : 'Cadastrar'));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {editMode ? 'Editar árvore' : 'Cadastrar nova árvore'}
            </Text>
            <Text style={styles.headerSubtitle}>Etapa {currentStep} de 2</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.bottomButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButtonBottom} onPress={handleClose}>
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
                <Text style={styles.continueButtonText}>{editMode ? 'Atualizando...' : 'Salvando...'}</Text>
              </>
            ) : (
              <Text style={styles.continueButtonText}>{getButtonText()}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showEstadoModal} transparent animationType="fade" onRequestClose={() => setShowEstadoModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Estado da Árvore</Text>
                <TouchableOpacity onPress={() => setShowEstadoModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalOptions}>
                {estadosSaude.map(estado => (
                  <TouchableOpacity
                    key={estado.value}
                    style={[
                      styles.modalOption,
                      formData.estadoSaude === estado.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      updateFormData('estadoSaude', estado.value);
                      setShowEstadoModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        formData.estadoSaude === estado.value && styles.modalOptionTextSelected,
                      ]}
                    >
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
    paddingLeft: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 2,
  },
  headerInfo: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  span: {
    color: '#EF4444',
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
    paddingVertical: 14,
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
export default CadastrarArvoreModal;