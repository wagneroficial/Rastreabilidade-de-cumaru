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
        <Text style={styles.summaryTitle}>Resumo - Produção</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.totalColhido}</Text>
            <Text style={styles.summaryLabel}>Total Colhido</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.mediaDiaria}</Text>
            <Text style={styles.summaryLabel}>Média Diária</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.melhorLote}</Text>
            <Text style={styles.summaryLabel}>Melhor Lote</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.crescimento}</Text>
            <Text style={styles.summaryLabel}>Crescimento</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.totalLotes}</Text>
            <Text style={styles.summaryLabel}>Total de Lotes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summaryData.totalArvores}</Text>
            <Text style={styles.summaryLabel}>Total de Árvores</Text>
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
    padding: 16,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    width: '45%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SummaryPreview;