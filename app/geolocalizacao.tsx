// app/geolocalizacao.tsx
import { CurrentLocationCard } from '@/components/geolocation/CurrentLocationCard';
import { LoteCard } from '@/components/geolocation/LoteCard';
import { MapControls } from '@/components/geolocation/MapControls';
import { MapViewComponent } from '@/components/geolocation/MapViewComponent';
import { SelectedLoteCard } from '@/components/geolocation/SelectedLoteCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLotesGeolocation } from '@/hooks/useLotesGeolocation';
import {
  formatDistance,
  getMarkerColor,
  getStatusColor,
  getStatusLabel,
  isWithinRadius,
} from '@/utils/geoHelpers';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView from 'react-native-maps';

const GeolocalizacaoScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedLote, setSelectedLote] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Hooks customizados
  const { currentLocation, locationStatus, getCurrentLocation, calculateDistance } = useGeolocation();
  const { lotes, loading: loadingLotes } = useLotesGeolocation();

  // Centralizar mapa quando localização for obtida
  useEffect(() => {
    if (mapReady && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [currentLocation, mapReady]);

  // Calcular distância até o lote
  const getDistanceToLote = (lote: typeof lotes[0]) => {
    if (!currentLocation) return null;
    return calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      lote.coordinates.lat,
      lote.coordinates.lng
    );
  };

  // Verificar se está dentro do raio do lote (20m)
  const isInsideLote = (lote: typeof lotes[0]) => {
    if (!currentLocation) return false;
    return isWithinRadius(
      currentLocation.lat,
      currentLocation.lng,
      lote.coordinates.lat,
      lote.coordinates.lng,
      20
    );
  };

  // Handler para selecionar lote da lista
  const handleLotePress = (lote: typeof lotes[0]) => {
    setSelectedLote(lote.id);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lote.coordinates.lat,
        longitude: lote.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  // Handler para clicar no marcador do mapa
  const handleMarkerPress = (lote: typeof lotes[0]) => {
    setSelectedLote(selectedLote === lote.id ? null : lote.id);
  };

  // Abrir navegação externa (Google Maps/Apple Maps)
  const handleNavigateToLote = async (lote: typeof lotes[0]) => {
    const { lat, lng } = lote.coordinates;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${lote.nome})`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  };

  // Centralizar mapa na localização do usuário
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

  // Ajustar mapa para mostrar todos os marcadores
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

  // Ordenar lotes por distância (mais perto primeiro)
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Geolocalização</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção do Mapa */}
      <View style={styles.mapSection}>
        <MapViewComponent
          mapRef={mapRef}
          currentLocation={currentLocation}
          lotes={lotes}
          loading={loadingLotes}
          locationStatus={locationStatus}
          onMapReady={() => setMapReady(true)}
          onMarkerPress={handleMarkerPress}
          onRetry={getCurrentLocation}
          getMarkerColor={getMarkerColor}
        />

        {/* Controles do mapa (centralizar e ajustar zoom) */}
        {currentLocation && (
          <MapControls
            onCenterLocation={centerOnMyLocation}
            onFitAllMarkers={fitAllMarkers}
          />
        )}

        {/* Card do lote selecionado (flutuante no mapa) */}
        {selectedLoteData && (
          <SelectedLoteCard
            lote={selectedLoteData}
            distance={getDistanceToLote(selectedLoteData)}
            onClose={() => setSelectedLote(null)}
            onNavigate={() => handleNavigateToLote(selectedLoteData)}
            onDetails={() => router.push(`/lote/${selectedLoteData.id}` as any)}
            formatDistance={formatDistance}
          />
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
          sortedLotes.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              distance={getDistanceToLote(lote)}
              isInside={isInsideLote(lote)}
              isSelected={selectedLote === lote.id}
              onPress={() => handleLotePress(lote)}
              formatDistance={formatDistance}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
            />
          ))
        )}

        {/* Card de Localização Atual */}
        {currentLocation && <CurrentLocationCard location={currentLocation} />}

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
  bottomSpacer: {
    height: 32,
  },
});

export default GeolocalizacaoScreen;