import { db } from '@/app/services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface Lote {
  id: string;
  codigo: string;
  nome: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'planejado' | 'andamento' | 'colheita' | 'concluido';
  area: string;
  arvores: number;
}

interface CurrentLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

const GeolocalizacaoScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [selectedLote, setSelectedLote] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    fetchLotes();
  }, []);

  useEffect(() => {
    // Centralizar mapa quando a localização for obtida
    if (mapReady && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [currentLocation, mapReady]);

  const getCurrentLocation = async () => {
    try {
      setLocationStatus('loading');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('error');
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir o acesso à localização para usar esta funcionalidade.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
      setLocationStatus('success');
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setLocationStatus('error');
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.'
      );
    }
  };

  const fetchLotes = async () => {
    try {
      setLoadingLotes(true);
      const lotesSnapshot = await getDocs(collection(db, 'lotes'));
      
      const lotesData: Lote[] = [];
      lotesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            lotesData.push({
              id: doc.id,
              codigo: data.codigo || doc.id,
              nome: data.nome || `Lote ${data.codigo}`,
              coordinates: { lat, lng },
              status: data.status || 'planejado',
              area: data.area || 'Não informado',
              arvores: data.arvores || 0,
            });
          }
        }
      });

      setLotes(lotesData);
    } catch (error) {
      console.error('Erro ao buscar lotes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os lotes.');
    } finally {
      setLoadingLotes(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Raio da Terra em metros
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
    return distance <= 20;
  };

  const getDistanceToLote = (lote: Lote) => {
    if (!currentLocation) return null;
    return calculateDistance(
      currentLocation.lat, currentLocation.lng,
      lote.coordinates.lat, lote.coordinates.lng
    );
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const handleLotePress = (lote: Lote) => {
    setSelectedLote(lote.id);
    
    // Centralizar mapa no lote selecionado
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lote.coordinates.lat,
        longitude: lote.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleMarkerPress = (lote: Lote) => {
    setSelectedLote(selectedLote === lote.id ? null : lote.id);
  };

  const handleNavigateToLote = async (lote: Lote) => {
    const lat = lote.coordinates.lat;
    const lng = lote.coordinates.lng;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${lote.nome})`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.');
      }
    }
  };

  const centerOnMyLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const fitAllMarkers = () => {
    if (mapRef.current && lotes.length > 0) {
      const coordinates = lotes.map(lote => ({
        latitude: lote.coordinates.lat,
        longitude: lote.coordinates.lng,
      }));
      
      if (currentLocation) {
        coordinates.push({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        });
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'planejado': return '#f59e0b';
      case 'ativo': return '#16a34a';
      case 'inativo': return '#f00b0bff';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'planejado': 'Planejado',
      'ativo': 'ativo',
      'inativo': 'inativo',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return { bg: '#f3f4f6', text: '#f59e0b' };
      case 'ativo': return { bg: '#fef3c7', text: '#16a34a' };
      case 'inativo': return { bg: '#dcfce7', text: '#f00b0bff' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const sortedLotes = [...lotes].sort((a, b) => {
    const distA = getDistanceToLote(a);
    const distB = getDistanceToLote(b);
    if (distA === null) return 1;
    if (distB === null) return -1;
    return distA - distB;
  });

  const selectedLoteData = lotes.find(l => l.id === selectedLote);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Geolocalização</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapSection}>
        {loadingLotes || locationStatus === 'loading' ? (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.mapLoadingText}>Carregando mapa...</Text>
          </View>
        ) : currentLocation ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType="standard"
            initialRegion={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            showsBuildings
            onMapReady={() => setMapReady(true)}
          >
            {/* Marcadores dos Lotes */}
            {lotes.map((lote) => (
              <React.Fragment key={lote.id}>
                <Marker
                  coordinate={{
                    latitude: lote.coordinates.lat,
                    longitude: lote.coordinates.lng,
                  }}
                  title={lote.nome}
                  description={`${lote.area} • ${lote.arvores} árvores`}
                  pinColor={getMarkerColor(lote.status)}
                  onPress={() => handleMarkerPress(lote)}
                />
                {/* Círculo de 20m ao redor do lote */}
                <Circle
                  center={{
                    latitude: lote.coordinates.lat,
                    longitude: lote.coordinates.lng,
                  }}
                  radius={20}
                  strokeColor="#16a34a80"
                  fillColor="#16a34a20"
                  strokeWidth={2}
                />
              </React.Fragment>
            ))}
          </MapView>
        ) : (
          <View style={styles.mapErrorContainer}>
            <Ionicons name="location-outline" size={48} color="#dc2626" />
            <Text style={styles.mapErrorText}>Erro ao obter localização</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botões flutuantes no mapa */}
        {currentLocation && (
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlButton} onPress={centerOnMyLocation}>
              <Ionicons name="locate" size={24} color="#16a34a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton} onPress={fitAllMarkers}>
              <Ionicons name="expand" size={24} color="#16a34a" />
            </TouchableOpacity>
          </View>
        )}

        {/* Info card do lote selecionado */}
        {selectedLoteData && (
          <View style={styles.selectedLoteCard}>
            <View style={styles.selectedLoteHeader}>
              <View style={styles.selectedLoteInfo}>
                <Text style={styles.selectedLoteNome}>{selectedLoteData.nome}</Text>
                <Text style={styles.selectedLoteId}>ID: {selectedLoteData.codigo}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLote(null)}>
                <Ionicons name="close-circle" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedLoteDetails}>
              <Text style={styles.selectedLoteDetail}>
                <Ionicons name="resize" size={14} color="#6b7280" /> {selectedLoteData.area}
              </Text>
              <Text style={styles.selectedLoteDetail}>
                <Ionicons name="leaf" size={14} color="#6b7280" /> {selectedLoteData.arvores} árvores
              </Text>
              {getDistanceToLote(selectedLoteData) && (
                <Text style={styles.selectedLoteDetail}>
                  <Ionicons name="navigate" size={14} color="#6b7280" />{' '}
                  {formatDistance(getDistanceToLote(selectedLoteData)!)}
                </Text>
              )}
            </View>
            <View style={styles.selectedLoteActions}>
              <TouchableOpacity
                style={styles.selectedLoteActionButton}
                onPress={() => handleNavigateToLote(selectedLoteData)}
              >
                <Ionicons name="navigate" size={16} color="#16a34a" />
                <Text style={styles.selectedLoteActionText}>Navegar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectedLoteActionButton}
                onPress={() => router.push(`/lote/${selectedLoteData.id}` as any)}
              >
                <Ionicons name="information-circle" size={16} color="#16a34a" />
                <Text style={styles.selectedLoteActionText}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Lista de Lotes */}
      <ScrollView style={styles.lotesList} showsVerticalScrollIndicator={false}>
        <View style={styles.lotesListHeader}>
          <Text style={styles.lotesListTitle}>Lotes Próximos</Text>
          <Text style={styles.lotesListCount}>{lotes.length} lote(s)</Text>
        </View>

        {lotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Nenhum lote com localização</Text>
            <Text style={styles.emptyText}>
              Cadastre lotes com coordenadas GPS para visualizá-los aqui.
            </Text>
          </View>
        ) : (
          sortedLotes.map((lote) => {
            const distance = getDistanceToLote(lote);
            const isInside = isInsideLote(lote);
            const isSelected = selectedLote === lote.id;
            const statusColors = getStatusColor(lote.status);

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
                    <Text style={styles.loteId}>ID: {lote.codigo}</Text>
                  </View>
                  <View style={styles.loteStatusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                        {getStatusLabel(lote.status)}
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

                {distance !== null && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="navigate" size={16} color="#6b7280" />
                    <Text style={styles.distanceText}>{formatDistance(distance)} de distância</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Coordenadas Atuais */}
        {currentLocation && (
          <View style={styles.currentLocationCard}>
            <View style={styles.currentLocationHeader}>
              <Ionicons name="location" size={20} color="#16a34a" />
              <Text style={styles.currentLocationTitle}>Sua Localização Atual</Text>
            </View>
            
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
              {currentLocation.accuracy && (
                <View style={styles.currentLocationItem}>
                  <Text style={styles.currentLocationLabel}>Precisão GPS:</Text>
                  <Text style={[styles.currentLocationValue, { color: '#16a34a' }]}>
                    ±{Math.round(currentLocation.accuracy)}m
                  </Text>
                </View>
              )}
            </View>

            {/* Aviso sobre imprecisão */}
            <View style={styles.precisionWarning}>
              <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
              <Text style={styles.precisionWarningText}>
                A detecção "Você está aqui" considera uma margem de segurança de 20 metros para compensar possíveis imprecisões do GPS.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    marginLeft: 12,
  },
  refreshButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSection: {
    height: 300,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    gap: 12,
  },
  mapErrorText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLoteCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectedLoteInfo: {
    flex: 1,
  },
  selectedLoteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedLoteId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  selectedLoteDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  selectedLoteDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedLoteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedLoteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  selectedLoteActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  lotesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  lotesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  lotesListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  lotesListCount: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  loteStatusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
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
  currentLocationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  currentLocationGrid: {
    gap: 8,
    marginBottom: 12,
  },
  currentLocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  currentLocationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentLocationValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1f2937',
    fontWeight: '500',
  },
  precisionWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  precisionWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default GeolocalizacaoScreen;