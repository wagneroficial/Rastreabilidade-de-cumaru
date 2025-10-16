import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChartType } from '../../types/relatorios.types';

interface ChartSelectorProps {
  activeChart: ChartType;
  onChartChange: (chart: ChartType) => void;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({ activeChart, onChartChange }) => {
  return (
    <View style={styles.chartSelectorContainer}>
      <View style={styles.chartSelectorButtons}>
        <TouchableOpacity
          onPress={() => onChartChange('volume')}
          style={[
            styles.chartSelectorButton,
            activeChart === 'volume' ? styles.chartSelectorButtonActive : styles.chartSelectorButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.chartSelectorButtonText,
              activeChart === 'volume'
                ? styles.chartSelectorButtonTextActive
                : styles.chartSelectorButtonTextInactive,
            ]}
          >
            Volume por Período
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChartChange('lotes')}
          style={[
            styles.chartSelectorButton,
            activeChart === 'lotes' ? styles.chartSelectorButtonActive : styles.chartSelectorButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.chartSelectorButtonText,
              activeChart === 'lotes' ? styles.chartSelectorButtonTextActive : styles.chartSelectorButtonTextInactive,
            ]}
          >
            Volume por Lote
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartSelectorButtons: {
    flexDirection: 'row',

  },
  chartSelectorButton: {
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  chartSelectorButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: '#16a34a',
  },
  chartSelectorButtonInactive: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chartSelectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSelectorButtonTextActive: {
    color:'#16a34a',
  },
  chartSelectorButtonTextInactive: {
    color:  '#4b5563',
  },
});

export default ChartSelector;