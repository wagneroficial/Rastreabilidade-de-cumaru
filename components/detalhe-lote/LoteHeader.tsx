// components/detalhe-lote/LoteHeader.tsx
import { Lote } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LoteHeaderProps {
  loteData: Lote;
  isAdmin: boolean;
  onBack: () => void;
  onStatusPress?: () => void;
}

const LoteHeader: React.FC<LoteHeaderProps> = ({
  loteData,
  isAdmin,
  onBack,
  onStatusPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return '#e3ffed47';
      case 'planejado': return '#e3ffed47';
      case 'concluido':
      case 'concluído': return '#e3ffed47';
      default: return '#e3ffed47';
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{loteData.nome}</Text>
          </View>
        </View>
        {isAdmin && onStatusPress && (
          <View style={[styles.statusContainer, { backgroundColor: '#16a34a', borderWidth: 1,borderColor: getStatusColor(loteData.status) }]}>
            <TouchableOpacity onPress={onStatusPress} style={styles.statusTouchable}>
              <Text style={styles.statusText}>{loteData.status}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
    
        </View>
        <View style={styles.statItem}>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 20,
    
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#BBF7D0',
  },
});

export default LoteHeader;