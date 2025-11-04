import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import SummaryPreview from './SummaryPreview';
import { ChartType } from '@/types/relatorios.types';

interface VisaoGeralProps {
  summaryData: any;
  chartData: {
    volume: { name: string | Date; value: number; color?: string }[];
    lotes: { name: string | Date; value: number; color?: string }[];
  };
  activeChart: ChartType;
  setActiveChart: (chart: ChartType) => void;
  performanceIndicators?: any[];
}

const VisaoGeral: React.FC<VisaoGeralProps> = ({
  summaryData,
  chartData,
  activeChart,
  setActiveChart,
  performanceIndicators,
}) => {
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    barPercentage: 0.6,
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#16a34a',
    },
  };

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const labels = chartData.volume.map(item => {
    if (item.name instanceof Date) {
      return monthNames[item.name.getMonth()]; // mês
    }
    return String(item.name); // fallback
  });


  const dataValues = chartData.volume.map(item => item.value);

  const barWidth = 70;
  const chartWidth = Math.max(barWidth * labels.length, Dimensions.get('window').width - 32); // largura mínima da tela

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Visão Geral</Text>
          <Text style={styles.subtitle}>
            Visualize o desempenho e acompanhe seus indicadores em tempo real.
          </Text>
        </View>
      </View>

      <SummaryPreview summaryData={summaryData} />

      <Text style={styles.sectionTitle}>Resumo Geral das Colheitas</Text>

      {/* Gráfico */}
      <View style={styles.chartWrapper}>
        {activeChart === 'volume' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <BarChart
              data={{
                labels,
                datasets: [{ data: dataValues }],
              }}
              width={chartWidth}
              height={240}
              yAxisSuffix=" kg"
              fromZero
              showValuesOnTopOfBars
              chartConfig={chartConfig}
              style={styles.chartStyle}
            />
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  chartWrapper: {
    marginBottom: 24,
  },
  chartStyle: {
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
});

export default VisaoGeral;
