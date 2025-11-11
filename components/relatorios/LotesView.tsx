import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface LotesViewProps {
  lotesData: {
    loteNome: string;
    producao: number;
    data?: string;
  }[];
}


const LotesView: React.FC<LotesViewProps> = ({ lotesData }) => {
  if (!lotesData || lotesData.length === 0) {
    return <Text style={styles.placeholder}>Nenhum dado de lote encontrado.</Text>;
  }

  // Dados para o gráfico
  const labels = lotesData.map((lote) => {
    const nome = lote.loteNome;
    return nome.length > 8 ? nome.slice(0, 8) + '…' : nome;
  });
  const data = lotesData.map((lote) => lote.producao);
  const chartWidth = Math.max(labels.length * 40, Dimensions.get('window').width);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gráfico */}
      <Text style={styles.chartTitle}>Produção Total por Lote</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: labels.length * 60 }}>
          <BarChart
            data={{
              labels,
              datasets: [{ data }],
            }}
            width={chartWidth}
            height={320}
            fromZero
            showValuesOnTopOfBars
            verticalLabelRotation={40}
            withInnerLines={false}
            chartConfig={{
              backgroundGradientFrom: '#fdfdfd',
              backgroundGradientTo: '#fdfdfd',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
              labelColor: () => '#374151',
              style: { borderRadius: 12 },
              fillShadowGradient: '#16a34a',
              fillShadowGradientOpacity: 1,
            }}
            style={{
              minWidth: chartWidth,
              paddingBottom: 40,
              paddingRight: 40,
            }}
            segments={8}
            spacingInner={0.3}
            barPercentage={0.8}
            showBarTops
            decorator={() => null}
          />
        </View>
      </ScrollView>

      {/* Cards individuais */}
      {lotesData.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.loteNome}>{item.loteNome}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Produção:</Text>
            <Text
              style={styles.producao}
            >
              {item.producao} kg
            </Text>
          </View>

          {item.data && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Última coleta:</Text>
              <Text style={styles.data}>{item.data}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#fdfdfd',
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 32,
  },

  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  loteNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  producao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  data: {
    fontSize: 14,
    color: '#374151',
  },

  placeholder: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 20,
    fontSize: 16,
  },

  badgeContainer: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LotesView;
