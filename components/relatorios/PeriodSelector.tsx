import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Period } from '../../types/relatorios.types';

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periods, selectedPeriod, onPeriodChange }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Período</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.periodButtons}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => onPeriodChange(period.key)}
              style={[
                styles.periodButton,
                selectedPeriod === period.key ? styles.periodButtonActive : styles.periodButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key ? styles.periodButtonTextActive : styles.periodButtonTextInactive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: '#16a34a',
  },
  periodButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  periodButtonTextInactive: {
    color: '#6b7280',
  },
});

export default PeriodSelector;