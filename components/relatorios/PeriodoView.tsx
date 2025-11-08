import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';

const screenWidth = Dimensions.get('window').width - 32;

interface PeriodoViewProps {
  selectedPeriod: 'última semana' | 'último mês' | 'último trimestre';
}

const PeriodoView: React.FC<PeriodoViewProps> = ({ selectedPeriod }) => {
  const { periodData, loading } = useRelatoriosData(selectedPeriod);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={24} color="#888" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (!periodData || periodData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={22} color="#999" />
        <Text style={styles.emptyText}>Nenhum dado encontrado para este período.</Text>
      </View>
    );
  }

  // 🔹 Dados do gráfico
  const chartData = {
    labels: periodData.map((item) => item.loteNome),
    datasets: [
      {
        data: periodData.map((item) => item.producao),
      },
    ],
  };

  // 🔹 Renderização
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Gráfico */}
      <Text style={styles.sectionTitle}>Produção por Lote</Text>
      <BarChart
        data={chartData}
        width={screenWidth}
        height={240}
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.6,
        }}
        style={styles.chart}
      />

      {/* Cards detalhados */}
      <Text style={styles.sectionTitle}>Detalhes de Coletas</Text>
      <View style={styles.cardsContainer}>
        {periodData.map((item, index) => {
          let cardTitle = '';
          let cardSubtitle = '';
          let cardValue = '';

          switch (selectedPeriod) {
            case 'última semana':
              cardTitle = item.diaSemana || '—';
              cardSubtitle = `Data: ${item.data}`;
              cardValue = `${item.loteNome} · ${item.producao} kg`;
              break;
            case 'último mês':
              cardTitle = `Lote: ${item.loteNome}`;
              cardSubtitle = `Data: ${item.data}`;
              cardValue = `Total coletado · ${item.producao} kg`;
              break;
            case 'último trimestre':
              cardTitle = `Lote: ${item.loteNome}`;
              cardSubtitle = `Período: ${item.data}`;
              cardValue = `Produção acumulada · ${item.producao} kg`;
              break;
            default:
              cardTitle = item.loteNome;
              cardSubtitle = `Data: ${item.data}`;
              cardValue = `${item.producao} kg`;
          }

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{cardTitle}</Text>
              <Text style={styles.cardSubtitle}>{cardSubtitle}</Text>
              <Text style={styles.cardValue}>{cardValue}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#2E7D32',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  cardValue: {
    marginTop: 8,
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#777',
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
});

export default PeriodoView;
