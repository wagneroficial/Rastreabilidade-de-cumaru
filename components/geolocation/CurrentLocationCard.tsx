// components/geolocation/CurrentLocationCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CurrentLocationCardProps {
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

export const CurrentLocationCard: React.FC<CurrentLocationCardProps> = ({ location }) => {
  return (
    <View style={styles.currentLocationCard}>
      <View style={styles.currentLocationHeader}>
        <Ionicons name="location" size={20} color="#16a34a" />
        <Text style={styles.currentLocationTitle}>Sua Localização Atual</Text>
      </View>
      
      <View style={styles.currentLocationGrid}>
        <View style={styles.currentLocationItem}>
          <Text style={styles.currentLocationLabel}>Latitude:</Text>
          <Text style={styles.currentLocationValue}>
            {location.lat.toFixed(6)}
          </Text>
        </View>
        <View style={styles.currentLocationItem}>
          <Text style={styles.currentLocationLabel}>Longitude:</Text>
          <Text style={styles.currentLocationValue}>
            {location.lng.toFixed(6)}
          </Text>
        </View>
        {location.accuracy && (
          <View style={styles.currentLocationItem}>
            <Text style={styles.currentLocationLabel}>Precisão GPS:</Text>
            <Text style={[styles.currentLocationValue, { color: '#16a34a' }]}>
              ±{Math.round(location.accuracy)}m
            </Text>
          </View>
        )}
      </View>

      <View style={styles.precisionWarning}>
        <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
        <Text style={styles.precisionWarningText}>
          A detecção "Você está aqui" considera uma margem de segurança de 20 metros para compensar possíveis imprecisões do GPS.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});