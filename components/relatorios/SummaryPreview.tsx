import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SummaryData } from '../../types/relatorios.types';

interface SummaryPreviewProps {
  summaryData: SummaryData;
}

const SummaryPreview: React.FC<SummaryPreviewProps> = ({ summaryData }) => {
  return (
    <View style={styles.section}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo da Produção</Text>

        <View style={styles.summaryList}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Colhido</Text>
            <Text style={styles.summaryValue}>{summaryData.totalColhido}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Média Diária</Text>
            <Text style={styles.summaryValue}>{summaryData.mediaDiaria}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Melhor Lote</Text>
            <Text style={styles.summaryValue}>{summaryData.melhorLote}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Crescimento</Text>
            <Text style={styles.summaryValue}>{summaryData.crescimento}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total de Lotes</Text>
            <Text style={styles.summaryValue}>{summaryData.totalLotes}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total de Árvores</Text>
            <Text style={styles.summaryValue}>{summaryData.totalArvores}</Text>
          </View>
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryList: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default SummaryPreview;
