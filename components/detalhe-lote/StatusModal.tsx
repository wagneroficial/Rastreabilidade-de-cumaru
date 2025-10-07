// components/detalhe-lote/StatusModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatusModalProps {
  visible: boolean;
  currentStatus: string;
  isUpdating: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  currentStatus,
  isUpdating,
  onClose,
  onStatusChange,
}) => {
  if (!visible) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return '#10B981';
      case 'planejado': return '#F59E0B';
      case 'concluído': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Alterar Status</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.options}>
          {['ativo', 'planejado', 'concluído'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.option,
                currentStatus.toLowerCase() === status.toLowerCase() && styles.optionActive
              ]}
              onPress={() => onStatusChange(status)}
              disabled={isUpdating}
            >
              <View style={[
                styles.indicator, 
                { backgroundColor: getStatusColor(status) }
              ]} />
              <Text style={[
                styles.optionText,
                currentStatus.toLowerCase() === status.toLowerCase() && styles.optionTextActive
              ]}>
                {status}
              </Text>
              {currentStatus.toLowerCase() === status.toLowerCase() && (
                <Ionicons name="checkmark" size={20} color="#059669" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {isUpdating && (
          <View style={styles.updatingContainer}>
            <Text style={styles.updatingText}>Atualizando...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 280,
    maxWidth: 350,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  optionActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextActive: {
    color: '#059669',
    fontWeight: '500',
  },
  updatingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default StatusModal;