import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Lote {
  id: string;
  nome: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number;
  status: 'ativo' | 'concluido';
  area: string;
  arvores: number;
}

interface Location {
  lat: number;
  lng: number;
}

const GeolocalizacaoScreen: React.FC = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedLote, setSelectedLote] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const lotes: Lote[] = [
    { 
      id: 'A-12', 
      nome: 'Lote Norte A-12',
      coordinates: { lat: -3.105000, lng: -60.00501},
      radius: 500,
      status: 'ativo',
      area: '2.5 hectares',
      arvores: 45
    },
    { 
      id: 'B-07', 
      nome: 'Lote Sul B-07',
      coordinates: { lat: -3.1098, lng: -60.0126 },
      radius: 300,
      status: 'ativo',
      area: '1.8 hectares',
      arvores: 32
    },
    { 
      id: 'C-05', 
      nome: 'Lote Oeste C-05',
      coordinates: { lat: -3.0958, lng: -60.0186 },
      radius: 600,
      status: 'concluido',
      area: '3.2 hectares',
      arvores: 67
    },
    { 
      id: 'D-15', 
      nome: 'Lote Leste D-15',
      coordinates: { lat: -3.1058, lng: -59.9986 },
      radius: 400,
      status: 'ativo',
      area: '2.1 hectares',
      arvores: 38
    }
  ];

  useEffect(() => {
    // Simular obtenção de localização
    // Em um app real, você usaria expo-location
    setTimeout(() => {
      const simulatedLocation = {
        lat: -3.1050,
        lng: -60.0050
      };
      setCurrentLocation(simulatedLocation);
      setLocationStatus('success');
    }, 2000);
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isInsideLote = (lote: Lote) => {
    if (!currentLocation) return false;
    const distance = calculateDistance(
      currentLocation.lat, currentLocation.lng,
      lote.coordinates.lat, lote.coordinates.lng
    );
    return distance <= lote.radius;
  };

  const getDistanceToLote = (lote: Lote) => {
    if (!currentLocation) return null;
    const distance = calculateDistance(
      currentLocation.lat, currentLocation.lng,
      lote.coordinates.lat, lote.coordinates.lng
    );
    return distance;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const handleLotePress = (lote: Lote) => {
    setSelectedLote(selectedLote === lote.id ? null : lote.id);
  };

  const handleNavigateToLote = (lote: Lote) => {
    Alert.alert(
      'Navegar para Lote',
      `Abrir navegação para ${lote.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Navegar', onPress: () => {
          // Aqui você abriria o app de navegação
          Alert.alert('Navegação', `Navegando para ${lote.nome}`);
        }}
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const getLocationStatusIcon = () => {
    switch (locationStatus) {
      case 'success': return 'location';
      case 'error': return 'warning';
      default: return 'hourglass';
    }
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'success': return '#16a34a';
      case 'error': return '#dc2626';
      default: return '#d97706';
    }
  };

  const getLocationStatusBg = () => {
    switch (locationStatus) {
      case 'success': return '#f0fdf4';
      case 'error': return '#fef2f2';
      default: return '#fffbeb';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Geolocalização</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Status */}
        <View style={styles.section}>
          <View style={[styles.statusCard, { backgroundColor: getLocationStatusBg() }]}>
            <View style={styles.statusContent}>
              <Ionicons 
                name={getLocationStatusIcon() as any} 
                size={24} 
                color={getLocationStatusColor()} 
              />
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: getLocationStatusColor() }]}>
                  {locationStatus === 'success' ? 'Localização Obtida' :
                   locationStatus === 'error' ? 'Erro na Localização' :
                   'Obtendo Localização...'}
                </Text>
                <Text style={[styles.statusSubtitle, { color: getLocationStatusColor() }]}>
                  {locationStatus === 'success' ? 'GPS ativo e funcionando' :
                   locationStatus === 'error' ? 'Ative o GPS e tente novamente' :
                   'Aguarde enquanto obtemos sua posição'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mapa com Lotes */}
        <View style={styles.section}>
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Mapa dos Lotes</Text>
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={48} color="#6b7280" />
                <Text style={styles.mapPlaceholderText}>
                  Mapa interativo com todos os lotes
                </Text>
                <Text style={styles.mapPlaceholderSubtext}>
                  Toque nos lotes abaixo para ver detalhes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lista de Lotes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lotes Cadastrados</Text>
          <View style={styles.lotesList}>
            {lotes.map((lote) => {
              const distance = getDistanceToLote(lote);
              const isInside = isInsideLote(lote);
              const isSelected = selectedLote === lote.id;

              return (
                <TouchableOpacity
                  key={lote.id}
                  style={[
                    styles.loteCard,
                    isSelected && styles.loteCardSelected,
                    isInside && styles.loteCardInside
                  ]}
                  onPress={() => handleLotePress(lote)}
                >
                  <View style={styles.loteHeader}>
                    <View style={styles.loteInfo}>
                      <Text style={styles.loteNome}>{lote.nome}</Text>
                      <Text style={styles.loteId}>ID: {lote.id}</Text>
                    </View>
                    <View style={styles.loteStatus}>
                      <View style={[
                        styles.statusBadge,
                        lote.status === 'ativo' ? styles.statusBadgeActive : styles.statusBadgeComplete
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          lote.status === 'ativo' ? styles.statusBadgeTextActive : styles.statusBadgeTextComplete
                        ]}>
                          {lote.status === 'ativo' ? 'Ativo' : 'Concluído'}
                        </Text>
                      </View>
                      {isInside && (
                        <View style={styles.insideBadge}>
                          <Ionicons name="location" size={12} color="#16a34a" />
                          <Text style={styles.insideBadgeText}>Você está aqui</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {distance && (
                    <View style={styles.distanceContainer}>
                      <Ionicons name="navigate" size={16} color="#6b7280" />
                      <Text style={styles.distanceText}>
                        {formatDistance(distance)} de distância
                      </Text>
                    </View>
                  )}

                  {isSelected && (
                    <View style={styles.loteDetails}>
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Área</Text>
                          <Text style={styles.detailValue}>{lote.area}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Árvores</Text>
                          <Text style={styles.detailValue}>{lote.arvores}</Text>
                        </View>
                      </View>

                      <View style={styles.coordinatesContainer}>
                        <Text style={styles.coordinatesTitle}>Coordenadas</Text>
                        <View style={styles.coordinatesGrid}>
                          <View style={styles.coordinateItem}>
                            <Text style={styles.coordinateLabel}>Latitude:</Text>
                            <Text style={styles.coordinateValue}>
                              {lote.coordinates.lat.toFixed(6)}
                            </Text>
                          </View>
                          <View style={styles.coordinateItem}>
                            <Text style={styles.coordinateLabel}>Longitude:</Text>
                            <Text style={styles.coordinateValue}>
                              {lote.coordinates.lng.toFixed(6)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.loteActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleNavigateToLote(lote)}
                        >
                          <Ionicons name="navigate" size={16} color="#16a34a" />
                          <Text style={styles.actionButtonText}>Navegar</Text>
                        </TouchableOpacity>
                        
                        {isInside && (
                          <TouchableOpacity 
                            style={styles.actionButtonPrimary}
                            onPress={() => router.push('/coleta')}
                          >
                            <Ionicons name="qr-code" size={16} color="white" />
                            <Text style={styles.actionButtonPrimaryText}>Coletar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Coordenadas Atuais */}
        {currentLocation && (
          <View style={styles.section}>
            <View style={styles.currentLocationCard}>
              <Text style={styles.currentLocationTitle}>Sua Localização Atual</Text>
              <View style={styles.currentLocationGrid}>
                <View style={styles.currentLocationItem}>
                  <Text style={styles.currentLocationLabel}>Latitude:</Text>
                  <Text style={styles.currentLocationValue}>
                    {currentLocation.lat.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.currentLocationItem}>
                  <Text style={styles.currentLocationLabel}>Longitude:</Text>
                  <Text style={styles.currentLocationValue}>
                    {currentLocation.lng.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.currentLocationItem}>
                  <Text style={styles.currentLocationLabel}>Precisão:</Text>
                  <Text style={[styles.currentLocationValue, { color: '#16a34a' }]}>
                    Alta (GPS)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a', // Verde em vez de azul
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  lotesList: {
    gap: 12,
  },
  loteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  loteCardSelected: {
    borderColor: '#16a34a',
  },
  loteCardInside: {
    backgroundColor: '#f0fdf4',
  },
  loteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loteInfo: {
    flex: 1,
  },
  loteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  loteId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  loteStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeComplete: {
    backgroundColor: '#dbeafe',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeTextActive: {
    color: '#166534',
  },
  statusBadgeTextComplete: {
    color: '#1e40af',
  },
  insideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  insideBadgeText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loteDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 2,
  },
  coordinatesContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  coordinatesGrid: {
    gap: 4,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  coordinateValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1f2937',
  },
  loteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  currentLocationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentLocationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  currentLocationGrid: {
    gap: 8,
  },
  currentLocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentLocationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentLocationValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1f2937',
  },
});

export default GeolocalizacaoScreen;