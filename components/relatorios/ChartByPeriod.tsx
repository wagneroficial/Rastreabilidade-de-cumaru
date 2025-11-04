import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartDataItem } from '../../types/relatorios.types';

interface ChartByPeriodProps {
  data: ChartDataItem[];
}

const screenWidth = Dimensions.get('window').width - 32;

const ChartByPeriod: React.FC<ChartByPeriodProps> = ({ data }) => {
  // Ordenar por valor ou por nome se necessário
  const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

  const chartData = {
    labels: sortedData.map(d => d.name),
    datasets: [
      {
        data: sortedData.map(d => d.value),
        color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`, // cor da linha
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#f9fafb',
    backgroundGradientTo: '#f3f4f6',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#059669',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // linhas de fundo contínuas
    },
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', height: 200 }]}>
        <Text style={{ color: '#6b7280' }}>Nenhum dado disponível para o período selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={260}
        chartConfig={chartConfig}
        bezier
        style={styles.chartStyle}
        verticalLabelRotation={-30}
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 12,
  },
  chartStyle: {
    borderRadius: 12,
  },
});

export default ChartByPeriod;
