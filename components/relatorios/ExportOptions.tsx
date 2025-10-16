import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExportOptionsProps {
  onExport: (format: string) => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ onExport }) => {
  return (
    <View style={styles.section}>
      <View style={styles.exportCard}>
        <Text style={styles.exportTitle}>Opções de Exportação</Text>
        <View style={styles.exportOptions}>
          <TouchableOpacity style={styles.exportOption} onPress={() => onExport('PDF')}>
            <View style={[styles.exportIconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="document-text-outline" size={20} color="#dc2626" />
            </View>
            <Text style={styles.exportOptionText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportOption} onPress={() => onExport('Excel')}>
            <View style={[styles.exportIconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="grid-outline" size={20} color="#16a34a" />
            </View>
            <Text style={styles.exportOptionText}>Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportOption} onPress={() => onExport('E-mail')}>
            <View style={[styles.exportIconContainer, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="mail-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.exportOptionText}>E-mail</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  exportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 20,
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportOption: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default ExportOptions;