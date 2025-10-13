import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PerformanceIndicator } from '../../types/relatorios.types';

interface PerformanceIndicatorsProps {
  indicators: PerformanceIndicator[];
}

const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({ indicators }) => {
  return (
    <View style={styles.performanceContainer}>
      <View style={styles.performanceCard}>
        <Text style={styles.performanceTitle}>Indicadores de Performance</Text>

        <View style={styles.performanceList}>
          {indicators.map((indicator, index) => (
            <View
              key={index}
              style={[styles.performanceItem, { backgroundColor: indicator.backgroundColor }]}
            >
              <View style={styles.performanceContent}>
                <Ionicons name={indicator.icon as any} size={20} color={indicator.color} />
                <View style={styles.performanceInfo}>
                  <Text style={styles.performanceItemTitle}>{indicator.title}</Text>
                  <Text style={styles.performanceSubtitle}>{indicator.subtitle}</Text>
                </View>
              </View>
              <Text style={[styles.performanceValue, { color: indicator.color }]}>
                {indicator.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  performanceContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  performanceList: {
    gap: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  performanceSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerformanceIndicators;