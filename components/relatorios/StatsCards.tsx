import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardsProps {
  summaryData: {
    totalColhido: string;
    mediaDiaria: string;
    melhorLote: string;
    crescimento: string;
    totalLotes: number;
    totalArvores: number;
    coletasRealizadas: number;
  };
}

export default function StatsCards({ summaryData }: StatsCardsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={styles.statContent}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Total Colhido</Text>
            <Text style={styles.statValue}>{summaryData.totalColhido}</Text>
          </View>
          <View style={styles.statChange}>
            <Text style={styles.statChangeText}>{summaryData.crescimento}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statContent}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Média Diária</Text>
            <Text style={styles.statValue}>{summaryData.mediaDiaria}</Text>
          </View>
          <View style={styles.statChange}>
            <Text style={styles.statChangeText}>{summaryData.coletasRealizadas} coletas</Text>
          </View>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statContent}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Melhor Lote</Text>
            <Text style={styles.statValue}>{summaryData.melhorLote}</Text>
          </View>
          <View style={styles.statChange}>
            <Text style={styles.statChangeText}>Top performer</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statChange: {
    alignItems: 'flex-end',
  },
  statChangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
});