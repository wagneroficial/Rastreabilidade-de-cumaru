import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChartDataItem } from '@/types/relatorios.types';
import { Ionicons } from '@expo/vector-icons';

interface PeriodViewProps {
  chartData?: ChartDataItem[];
  periodLabel?: string; // Ex: "Semanal", "Mensal", "Trimestral"
}

const LotesView: React.FC<PeriodViewProps> = ({ chartData = [], periodLabel = '' }) => {
  const getColor = (index: number) => {
    const colors = ['#16a34aac', '#0ea5e9ac', '#facc15ac', '#f87171ac', '#a855f7ac', '#f472b6ac', '#fbbf24ac', '#34d399ac'];
    return colors[index % colors.length];
  };

  const maiorValor = chartData.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    { name: '', value: 0 }
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume de Produção</Text>
        <BarChart
          data={chartData.map((item, index) => ({
            label: item.name,
            value: item.value,
            frontColor: getColor(index),
          }))}
          barWidth={52}
          spacing={16}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          isAnimated
        />
      </View>

      {maiorValor.name ? (
        <View style={[styles.section, styles.insightBox]}>
          <Ionicons name="trending-up" size={22} color="#16a34a" />
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Maior Produção</Text>
            <Text style={styles.insightText}>
              O período <Text style={{ fontWeight: '600' }}>{maiorValor.name}</Text> teve o maior volume de produção
              com <Text style={{ color: '#16a34a' }}>{maiorValor.value.toFixed(1)} kg</Text>.
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 12,
  },
  insightBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#065f46',
    lineHeight: 18,
  },
});

export default LotesView;
