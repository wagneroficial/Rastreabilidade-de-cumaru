// components/geolocation/SelectedLoteCard.tsx
import { LoteGeo } from '@/hooks/useLotesGeolocation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectedLoteCardProps {
  lote: LoteGeo;
  distance: number | null;
  onClose: () => void;
  onNavigate: () => void;
  onDetails: () => void;
  formatDistance: (distance: number) => string;
}

export const SelectedLoteCard: React.FC<SelectedLoteCardProps> = ({
  lote,
  distance,
  onClose,
  onNavigate,
  onDetails,
  formatDistance,
}) => {
  return (
    <View style={styles.selectedLoteCard}>
      <View style={styles.selectedLoteHeader}>
        <View style={styles.selectedLoteInfo}>
          <Text style={styles.selectedLoteNome}>{lote.nome}</Text>
          <Text style={styles.selectedLoteId}>ID: {lote.codigo}</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close-circle" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <View style={styles.selectedLoteDetails}>
        <Text style={styles.selectedLoteDetail}>
          <Ionicons name="resize" size={14} color="#6b7280" /> {lote.area}
        </Text>
        <Text style={styles.selectedLoteDetail}>
          <Ionicons name="leaf" size={14} color="#6b7280" /> {lote.arvores} árvores
        </Text>
        {distance !== null && (
          <Text style={styles.selectedLoteDetail}>
            <Ionicons name="navigate" size={14} color="#6b7280" />{' '}
            {formatDistance(distance)}
          </Text>
        )}
      </View>
      <View style={styles.selectedLoteActions}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={onNavigate}
        >
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={styles.navigateText}>Navegar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onDetails}
        >
          <Ionicons name="information-circle" size={16} color='#16a34a' />
          <Text style={styles.detailsText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
   navigateText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
    detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#e8fbef',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 8,
  },
    detailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
});