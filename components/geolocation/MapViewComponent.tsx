// components/geolocation/MapViewComponent.tsx
import { LoteGeo } from '@/hooks/useLotesGeolocation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

interface MapViewComponentProps {
  mapRef: React.RefObject<MapView | null>; 
  currentLocation: { lat: number; lng: number; accuracy?: number } | null;
  lotes: LoteGeo[];
  loading: boolean;
  locationStatus: 'loading' | 'success' | 'error';
  onMapReady: () => void;
  onMarkerPress: (lote: LoteGeo) => void;
  onRetry: () => void;
  getMarkerColor: (status: string) => string;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  mapRef,
  currentLocation,
  lotes,
  loading,
  locationStatus,
  onMapReady,
  onMarkerPress,
  onRetry,
  getMarkerColor,
}) => {
  if (loading || locationStatus === 'loading') {
    return (
      <View style={styles.mapLoadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.mapLoadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.mapErrorContainer}>
        <Ionicons name="location-outline" size={48} color="#dc2626" />
        <Text style={styles.mapErrorText}>Erro ao obter localização</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
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
      onMapReady={onMapReady}
    >
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
            onPress={() => onMarkerPress(lote)}
          />
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
  );
};

const styles = StyleSheet.create({
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
});