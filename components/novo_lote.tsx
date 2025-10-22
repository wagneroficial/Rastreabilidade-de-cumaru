import { Lote } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
import { db } from '../app/services/firebaseConfig.js';


interface NovoLoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (loteData?: any) => void;
  loteParaEditar?: Lote | null;
}

interface FormData {
  nome: string;
  area: string;
  descricao: string;
  latitude: string;
  longitude: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  tipoSolo: string;
  numeroArvores: string;
  colaboradoresResponsaveis: string[];
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  propriedade?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

const NovoLoteModal: React.FC<NovoLoteModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess,
  loteParaEditar = null
}) => {
  const isEditMode = !!loteParaEditar;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    area: '',
    descricao: '',
    latitude: '',
    longitude: '',
    dataInicio: null,
    dataFim: null,
    tipoSolo: '',
    numeroArvores: '',
    colaboradoresResponsaveis: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSoloModal, setShowSoloModal] = useState(false);
  const [showColaboradoresModal, setShowColaboradoresModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'inicio' | 'fim' | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    if (visible && isEditMode && loteParaEditar) {
      setFormData({
        nome: loteParaEditar.nome || '',
        area: loteParaEditar.area || '',
        descricao: loteParaEditar.observacoes || '',
        latitude: loteParaEditar.latitude || '',
        longitude: loteParaEditar.longitude || '',
        dataInicio: loteParaEditar.dataInicio ? new Date(loteParaEditar.dataInicio) : null,
        dataFim: loteParaEditar.dataFim ? new Date(loteParaEditar.dataFim) : null,
        tipoSolo: loteParaEditar.tipoSolo || '',
        numeroArvores: loteParaEditar.arvores?.toString() || '',
        colaboradoresResponsaveis: loteParaEditar.colaboradoresResponsaveis || []
      });
    }
  }, [visible, isEditMode, loteParaEditar]);

  useEffect(() => {
    if (visible) {
      checkLocationPermission();
      fetchColaboradores();
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

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
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
      
      handleInputChange('latitude', latitude.toFixed(6));
      handleInputChange('longitude', longitude.toFixed(6));

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

  const formatCoordinates = (lat: string, lng: string): string => {
    if (!lat || !lng) return '';
    
    if (validateCoordinates(lat, lng)) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    
    return 'Coordenadas inválidas';
  };

  const openInMaps = () => {
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Erro', 'Nenhuma coordenada definida para abrir no mapa.');
      return;
    }

    if (!validateCoordinates(formData.latitude, formData.longitude)) {
      Alert.alert('Erro', 'Coordenadas inválidas.');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    const url = Platform.select({
      ios: `maps:${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    if (url) {
      Alert.alert(
        'Abrir no Mapa',
        `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n\nEm um app real, isso abriria o aplicativo de mapas do dispositivo.`,
        [{ text: 'OK' }]
      );
    }
  };

  const fetchColaboradores = async () => {
    setLoadingColaboradores(true);
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'colaborador'),
        where('status', '==', 'aprovado')
      );
      const querySnapshot = await getDocs(q);
      const colaboradoresList: Colaborador[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        colaboradoresList.push({
          id: doc.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          propriedade: data.propriedade
        });
      });
      
      setColaboradores(colaboradoresList);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      Alert.alert('Erro', 'Falha ao carregar colaboradores');
    } finally {
      setLoadingColaboradores(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | Date | null | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColaboradorToggle = (colaboradorId: string) => {
    const currentColaboradores = formData.colaboradoresResponsaveis;
    const isSelected = currentColaboradores.includes(colaboradorId);
    
    if (isSelected) {
      handleInputChange('colaboradoresResponsaveis', 
        currentColaboradores.filter(id => id !== colaboradorId)
      );
    } else {
      handleInputChange('colaboradoresResponsaveis', 
        [...currentColaboradores, colaboradorId]
      );
    }
  };

  const getSelectedColaboradoresText = () => {
    const selected = formData.colaboradoresResponsaveis;
    if (selected.length === 0) return 'Selecione os colaboradores';
    if (selected.length === 1) {
      const colaborador = colaboradores.find(c => c.id === selected[0]);
      return colaborador?.nome || 'Colaborador selecionado';
    }
    return `${selected.length} colaboradores selecionados`;
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
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'O nome do lote é obrigatório');
      return;
    }

    if (!formData.area.trim()) {
      Alert.alert('Erro', 'A área do lote é obrigatória');
      return;
    }

    if ((formData.latitude || formData.longitude) && 
        !validateCoordinates(formData.latitude, formData.longitude)) {
      Alert.alert('Erro', 'Coordenadas inválidas. Verifique os valores inseridos.');
      return;
    }

    setIsLoading(true);

    try {
      const loteData = {
        nome: formData.nome,
        area: formData.area,
        arvores: parseInt(formData.numeroArvores) || 0,
        observacoes: formData.descricao,
        latitude: formData.latitude || '',
        longitude: formData.longitude || '',
        localizacao: currentLocation?.address || 
                    (formData.latitude && formData.longitude ? 
                     formatCoordinates(formData.latitude, formData.longitude) : ''),
        tipoSolo: formData.tipoSolo,
        colaboradoresResponsaveis: formData.colaboradoresResponsaveis,
      };

      if (isEditMode && loteParaEditar) {
        await updateDoc(doc(db, 'lotes', loteParaEditar.id), {
          ...loteData,
          updatedAt: new Date().toISOString(),
        });

        Alert.alert('Sucesso!', 'Lote atualizado com sucesso!', [
          { text: 'OK', onPress: () => {
            onSuccess();
            handleClose();
          }}
        ]);
      } else {
        const newLote = {
          ...loteData,
          codigo: `L-${Date.now().toString().slice(-3)}`,
          colhidoTotal: '0 kg',
          status: 'planejado' as const,
          dataInicio: formData.dataInicio ? formData.dataInicio.toISOString().split('T')[0] : '',
          dataFim: formData.dataFim ? formData.dataFim.toISOString().split('T')[0] : '',
          ultimaColeta: 'Não iniciado',
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'lotes'), newLote);

        Alert.alert('Sucesso!', 'Lote criado com sucesso!', [
          { text: 'OK', onPress: () => {
            onSuccess(newLote);
            handleClose();
          }}
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao ${isEditMode ? 'atualizar' : 'criar'} o lote. Tente novamente.`);
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
      latitude: '',
      longitude: '',
      dataInicio: null,
      dataFim: null,
      tipoSolo: '',
      numeroArvores: '',
      colaboradoresResponsaveis: []
    });
    setCurrentStep(1);
    setCurrentLocation(null);
    setShowSoloModal(false);
    setShowColaboradoresModal(false);
    setShowDatePicker(null);
  };

  const nextStep = () => {
    if (currentStep < 2) {
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
  const isStep2Valid = true;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
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
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Editar Lote' : 'Novo Lote'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode ? loteParaEditar?.codigo : `Etapa ${currentStep} de 2`}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step 1: Informações Básicas */}
          {(currentStep === 1 || isEditMode) && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Informações Básicas</Text>
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Colaboradores Responsáveis</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowColaboradoresModal(true)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    formData.colaboradoresResponsaveis.length === 0 && styles.selectButtonPlaceholder
                  ]}>
                    {getSelectedColaboradoresText()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                </TouchableOpacity>
                {formData.colaboradoresResponsaveis.length > 0 && (
                  <Text style={styles.helperText}>
                    {formData.colaboradoresResponsaveis.length} colaborador(es) selecionado(s)
                  </Text>
                )}
              </View>

              {!isEditMode && (
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
                      <Text style={styles.summaryLabel}>Localização:</Text>
                      <Text style={styles.summaryValue}>
                        {formData.latitude && formData.longitude 
                          ? formatCoordinates(formData.latitude, formData.longitude)
                          : 'Não informado'
                        }
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Responsáveis:</Text>
                      <Text style={styles.summaryValue}>
                        {formData.colaboradoresResponsaveis.length > 0 
                          ? `${formData.colaboradoresResponsaveis.length} colaborador(es)`
                          : 'Nenhum'
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Step 2: Localização com GPS funcional */}
          {(currentStep === 2 || isEditMode) && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Localização</Text>
                <Text style={styles.stepSubtitle}>Defina a localização do lote</Text>
              </View>

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
                  style={[styles.getCurrentLocationButton, loadingLocation && styles.disabledButton]}
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.getCurrentLocationText}>Obtendo localização...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="navigate" size={20} color="white" />
                      <Text style={styles.getCurrentLocationText}>Usar Localização Atual</Text>
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
                <Text style={styles.inputLabel}>Coordenadas Manuais (opcional)</Text>
                <View style={styles.coordenadasContainer}>
                  <View style={styles.coordenadasInputs}>
                    <View style={styles.coordenadaInput}>
                      <Text style={styles.coordenadasLabel}>Latitude</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.latitude}
                        onChangeText={(value) => handleInputChange('latitude', value)}
                        placeholder="-3.7195"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.coordenadaInput}>
                      <Text style={styles.coordenadasLabel}>Longitude</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.longitude}
                        onChangeText={(value) => handleInputChange('longitude', value)}
                        placeholder="-38.5434"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
                
                {formData.latitude && formData.longitude && (
                  <View style={styles.coordinatesValidation}>
                    {validateCoordinates(formData.latitude, formData.longitude) ? (
                      <View style={styles.validationSuccess}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.validationText}>
                          Coordenadas válidas: {formatCoordinates(formData.latitude, formData.longitude)}
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

              {/* Botão para abrir no mapa */}
              {formData.latitude && formData.longitude && validateCoordinates(formData.latitude, formData.longitude) && (
                <TouchableOpacity style={styles.openMapButton} onPress={openInMaps}>
                  <Ionicons name="map-outline" size={16} color="#374151" />
                  <Text style={styles.openMapButtonText}>Ver no Mapa</Text>
                </TouchableOpacity>
              )}

              {/* Informações sobre permissões */}
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
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {currentStep > 1 && !isEditMode && (
              <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#374151" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 2 && !isEditMode ? (
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
                    <Text style={styles.submitButtonText}>
                      {isEditMode ? 'Salvando...' : 'Criando...'}
                    </Text>
                  </>
                ) : (
                  <>
                  
                    <Text style={styles.submitButtonText}>
                      {isEditMode ? 'Salvar Alterações' : 'Cadastrar Lote'}
                    </Text>
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

        {/* Modal para seleção de colaboradores */}
        <Modal
          visible={showColaboradoresModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowColaboradoresModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Colaboradores Responsáveis</Text>
                <TouchableOpacity onPress={() => setShowColaboradoresModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {loadingColaboradores ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#16a34a" />
                  <Text style={styles.loadingText}>Carregando colaboradores...</Text>
                </View>
              ) : (
                <ScrollView style={styles.modalOptions}>
                  {colaboradores.length === 0 ? (
                    <View style={styles.emptyCollaboratorsContainer}>
                      <Ionicons name="people-outline" size={48} color="#9ca3af" />
                      <Text style={styles.emptyCollaboratorsText}>
                        Nenhum colaborador aprovado encontrado
                      </Text>
                    </View>
                  ) : (
                    colaboradores.map((colaborador) => {
                      const isSelected = formData.colaboradoresResponsaveis.includes(colaborador.id);
                      return (
                        <TouchableOpacity
                          key={colaborador.id}
                          style={[
                            styles.colaboradorOption,
                            isSelected && styles.colaboradorOptionSelected
                          ]}
                          onPress={() => handleColaboradorToggle(colaborador.id)}
                        >
                          <View style={styles.colaboradorInfo}>
                            <Text style={[
                              styles.colaboradorNome,
                              isSelected && styles.colaboradorNomeSelected
                            ]}>
                              {colaborador.nome}
                            </Text>
                            <Text style={styles.colaboradorEmail}>
                              {colaborador.email}
                            </Text>
                            {colaborador.propriedade && (
                              <Text style={styles.colaboradorPropriedade}>
                                {colaborador.propriedade}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalFooterButton}
                  onPress={() => setShowColaboradoresModal(false)}
                >
                  <Text style={styles.modalFooterButtonText}>
                    Confirmar ({formData.colaboradoresResponsaveis.length} selecionados)
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#fdfdfd',
  },
  header: {
    backgroundColor: '#16a34a',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingLeft: 16,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
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
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    marginBottom: 4,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
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
  helperText: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 4,
    fontWeight: '500',
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
  getCurrentLocationButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  getCurrentLocationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  currentLocationInfo: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
  coordenadasContainer: {
    gap: 12,
  },
  coordenadasInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  coordenadaInput: {
    flex: 1,
  },
  coordenadasLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
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
  openMapButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  openMapButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
    maxHeight: '80%',
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
    maxHeight: 400,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyCollaboratorsContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyCollaboratorsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  colaboradorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  colaboradorOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  colaboradorInfo: {
    flex: 1,
  },
  colaboradorNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  colaboradorNomeSelected: {
    color: '#16a34a',
  },
  colaboradorEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  colaboradorPropriedade: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  modalFooterButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalFooterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default NovoLoteModal;