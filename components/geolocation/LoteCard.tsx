// components/geolocation/LoteCard.tsx
import { LoteGeo } from '@/hooks/useLotesGeolocation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LoteCardProps {
  lote: LoteGeo;
  distance: number | null;
  isInside: boolean;
  isSelected: boolean;
  onPress: () => void;
  formatDistance: (distance: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => { bg: string; text: string };
}

export const LoteCard: React.FC<LoteCardProps> = ({
  lote,
  distance,
  isInside,
  isSelected,
  onPress,
  formatDistance,
  getStatusLabel,
  getStatusColor,
}) => {
  const statusColors = getStatusColor(lote.status);

  return (
    <TouchableOpacity
      style={[
        styles.loteCard,
        isSelected && styles.loteCardSelected,
        isInside && styles.loteCardInside
      ]}
      onPress={onPress}
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
};

const styles = StyleSheet.create({
  loteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
});