import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface PeriodSelectorProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {periods.map((period) => {
        const isSelected = selectedPeriod === period;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => onPeriodChange(period)}
            style={[styles.button, isSelected && styles.buttonActive]}
          >
            <Text style={[styles.text, isSelected && styles.textActive]}>
              {period}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  buttonActive: { backgroundColor: '#16a34a' },
  text: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  textActive: { color: '#fff' },
});

export default PeriodSelector;
