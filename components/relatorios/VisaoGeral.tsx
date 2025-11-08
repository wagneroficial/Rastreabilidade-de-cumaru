import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface VisaoGeralProps {
  data: {
    loteNome: string;
    producao: number;
    data?: string;
  }[];
}

const VisaoGeral: React.FC<VisaoGeralProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Text style={styles.placeholder}>Nenhum dado disponível.</Text>
    );
  }

  // 🔹 Gráfico de produção total por lote
  const chartData = {
    labels: data.map((item) => item.loteNome),
    datasets: [
      {
        data: data.map((item) => item.producao || 0),
      },
    ],
  };

  // 🔹 Cálculos para indicadores
  const totalProducao = data.reduce((acc, item) => acc + (item.producao || 0), 0);
  
  const mediaProducao = totalProducao / data.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visão Geral</Text>

      {/* Indicadores principais */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="leaf" size={20} color="#16a34a" />
          <Text style={styles.statValue}>{totalProducao.toFixed(0)} kg</Text>
          <Text style={styles.statLabel}>Produção Total</Text>
        </View>


        <View style={styles.statCard}>
          <Ionicons name="analytics-outline" size={20} color="#16a34a" />
          <Text style={styles.statValue}>{mediaProducao.toFixed(0)} kg</Text>
          <Text style={styles.statLabel}>Média por Lote</Text>
        </View>
      </View>

      {/* Gráfico de barras */}
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={230}
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          barPercentage: 0.6,
        }}
        style={styles.chart}
      />

      {/* Lista de detalhes resumidos */}
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>Lote: {item.loteNome}</Text>
          <Text style={styles.info}>Produção: {item.producao} kg</Text>
          {item.data && <Text style={styles.info}>Data: {item.data}</Text>}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  info: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  placeholder: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 20,
  },
});

export default VisaoGeral;
