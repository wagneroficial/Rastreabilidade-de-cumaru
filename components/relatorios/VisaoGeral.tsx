// src/components/relatorios/VisaoGeral.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 32;

interface VisaoGeralProps {
  data: {
    data: string;
    producao: number;
  }[];
}

const VisaoGeral: React.FC<VisaoGeralProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>Nenhuma coleta registrada.</Text>
      </View>
    );
  }

  // Ordenar por data crescente
  const sortedData = [...data].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  // Datas e produções para o gráfico
  const labels = sortedData.map((item) => item.data);
  const values = sortedData.map((item) => item.producao);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Evolução das Coletas</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={Math.max(screenWidth, labels.length * 80)} // largura dinâmica para muitas datas
          height={260}
          yAxisSuffix="kg"
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#16a34a',
            },
          }}
          bezier
          style={styles.chart}
          fromZero
        />
      </ScrollView>

      {/* Cards abaixo do gráfico */}
      <View style={styles.cardsContainer}>
        {sortedData.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.data}</Text>
            <Text style={styles.cardSubtitle}>Produção total</Text>
            <Text style={styles.cardValue}>{item.producao} kg</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 12,
    marginLeft: 16,
  },
  chart: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '45%',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 15,
  },
});

export default VisaoGeral;
