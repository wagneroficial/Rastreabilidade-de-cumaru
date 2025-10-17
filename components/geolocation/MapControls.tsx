// components/geolocation/MapControls.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface MapControlsProps {
  onCenterLocation: () => void;
  onFitAllMarkers: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onCenterLocation,
  onFitAllMarkers,
}) => {
  return (
    <View style={styles.mapControls}>
      <TouchableOpacity style={styles.mapControlButton} onPress={onCenterLocation}>
        <Ionicons name="locate" size={24} color="#16a34a" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mapControlButton} onPress={onFitAllMarkers}>
        <Ionicons name="expand" size={24} color="#16a34a" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});