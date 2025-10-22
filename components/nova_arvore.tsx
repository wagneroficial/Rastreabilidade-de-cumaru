import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
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

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
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

  // Estados para geolocalização
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verificar permissões ao abrir o modal
  useEffect(() => {
    if (visible) {
      checkLocationPermission();
    }
  }, [visible]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status !== Location.PermissionStatus.GRANTED) {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(newStatus);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões de localização:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      // Verificar permissões
      if (locationPermission !== Location.PermissionStatus.GRANTED) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          Alert.alert(
            'Permissão Negada',
            'É necessário permitir o acesso à localização para usar esta funcionalidade.',
            [{ text: 'OK' }]
          );
          return;
        }
        setLocationPermission(status);
      }

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      const { latitude, longitude } = location.coords;

      const locationData: LocationData = {
        latitude,
        longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      setCurrentLocation(locationData);
      
      // Atualizar os campos do formulário
      updateFormData('latitude', latitude.toFixed(6));
      updateFormData('longitude', longitude.toFixed(6));

      Alert.alert(
        'Localização Obtida',
        `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const validateCoordinates = (lat: string, lng: string): boolean => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && 
           !isNaN(longitude) && 
           latitude >= -90 && 
           latitude <= 90 && 
           longitude >= -180 && 
           longitude <= 180;
  };

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
      } else if (!validateCoordinates(formData.latitude, formData.longitude)) {
        newErrors.latitude = 'Coordenadas inválidas';
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
    setCurrentLocation(null);
    onClose();
  };

  const updateFormData = (field: keyof ArvoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

      <Text style={styles.stepSubtitle}>Adicione a Localização da Árvore</Text>

      <View style={styles.form}>
        {/* Seção de localização atual */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={styles.locationHeaderLeft}>
              <Ionicons name="location" size={20} color="#16a34a" />
              <Text style={styles.locationTitle}>Localização GPS</Text>
            </View>
            {locationPermission === Location.PermissionStatus.GRANTED && (
              <View style={styles.permissionBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.permissionText}>Permitido</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.locationButton, loadingLocation && styles.disabledButton]}
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.locationButtonText}>Obtendo localização...</Text>
              </>
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="white" />
                <Text style={styles.locationButtonText}>Usar Localização Atual</Text>
              </>
            )}
          </TouchableOpacity>

          {currentLocation && (
            <View style={styles.currentLocationInfo}>
              <View style={styles.locationInfoHeader}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.locationInfoTitle}>Localização Obtida</Text>
              </View>
              <Text style={styles.coordinatesText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
              {currentLocation.accuracy && (
                <Text style={styles.accuracyText}>
                  Precisão: ±{Math.round(currentLocation.accuracy)}m
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Entrada manual de coordenadas */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Coordenadas Manuais (opcional)*</Text>
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
            <Text style={styles.errorText}>
              {errors.latitude || errors.longitude || 'Coordenadas são obrigatórias'}
            </Text>
          )}

          {/* Validação visual */}
          {formData.latitude && formData.longitude && (
            <View style={styles.coordinatesValidation}>
              {validateCoordinates(formData.latitude, formData.longitude) ? (
                <View style={styles.validationSuccess}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={styles.validationText}>
                    Coordenadas válidas
                  </Text>
                </View>
              ) : (
                <View style={styles.validationError}>
                  <Ionicons name="alert-circle" size={16} color="#dc2626" />
                  <Text style={styles.validationTextError}>Coordenadas inválidas</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Aviso sobre permissões */}
        {locationPermission !== Location.PermissionStatus.GRANTED && (
          <View style={styles.permissionWarning}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <View style={styles.permissionWarningContent}>
              <Text style={styles.permissionWarningTitle}>Permissão de Localização</Text>
              <Text style={styles.permissionWarningText}>
                Para usar a localização automática, é necessário permitir o acesso à localização do dispositivo.
              </Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={checkLocationPermission}
              >
                <Text style={styles.permissionButtonText}>Solicitar Permissão</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
            <Text style={styles.headerTitle}>Cadastrar Nova Árvore</Text>
            <Text style={styles.headerSubtitle}>Etapa {currentStep} de 2</Text>
          </View>
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
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    paddingHorizontal: 16,
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
  content: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
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
    fontWeight: '600',
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
  locationSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  currentLocationInfo: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  locationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationInfoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#15803d',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 11,
    color: '#16a34a',
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
  coordinatesValidation: {
    marginTop: 8,
  },
  validationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  validationTextError: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  permissionWarning: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  permissionWarningContent: {
    flex: 1,
  },
  permissionWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  permissionWarningText: {
    fontSize: 12,
    color: '#a16207',
    marginBottom: 8,
  },
  permissionButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  locationButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
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