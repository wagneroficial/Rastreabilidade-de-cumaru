import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChartDataItem, ChartType } from '../../types/relatorios.types';

interface ChartViewProps {
  activeChart: ChartType;
  chartData: {
    volume: ChartDataItem[];
    lotes: ChartDataItem[];
  };
}

const ChartView: React.FC<ChartViewProps> = ({ activeChart, chartData }) => {
  const renderBarChart = (data: ChartDataItem[]) => {
    if (data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyChartText}>Nenhum dado disponível para o período</Text>
        </View>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabel}>
                <Text style={styles.barLabelText}>{item.name}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${percentage}%` }]} />
                <View style={styles.barValueContainer}>
                  <Text style={styles.barValue}>{item.value} kg</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>
        {activeChart === 'volume' ? 'Colheita por Período' : 'Colheita por Lote'}
      </Text>
      {renderBarChart(activeChart === 'volume' ? chartData.volume : chartData.lotes)}
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,

  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 50,
  },
  barLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  barTrack: {
    flex: 1,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 16,
  },
  barValueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default ChartView;