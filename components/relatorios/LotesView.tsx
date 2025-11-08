import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

interface LotesViewProps {
  lotesData: {
    loteNome: string;
    producao: number;
    data?: string;
  }[];
}

const screenWidth = Dimensions.get('window').width - 32;

const LotesView: React.FC<LotesViewProps> = ({ lotesData }) => {
  if (!lotesData || lotesData.length === 0) {
    return <Text style={styles.placeholder}>Nenhum dado de lote encontrado.</Text>;
  }

  // Dados para o gráfico
  const labels = lotesData.map((lote) => lote.loteNome);
  const data = lotesData.map((lote) => lote.producao);

  // Função para definir cor da barra
  const getBarColor = (value: number) => {
    if (value > 100) return '#16a34a'; // verde = alta produção
    if (value > 50) return '#facc15'; // amarelo = média produção
    return '#ef4444'; // vermelho = baixa produção
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gráfico */}
      <Text style={styles.chartTitle}>Produção Total por Lote</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={{ minWidth: labels.length * 60, paddingBottom: 46 }}>
    <BarChart
      data={{
        labels,
        datasets: [{ data }],
      }}
      width={labels.length * 80}
      height={330}
      fromZero
      showValuesOnTopOfBars
      verticalLabelRotation={40}
      withInnerLines={false}
      chartConfig={{
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
        labelColor: () => '#374151',
        style: { borderRadius: 12, paddingRight: 12 },
        fillShadowGradient: '#16a34a',
        fillShadowGradientOpacity: 1,
      }}
      style={{ borderRadius: 12 }}
      segments={4}
      showBarTops
      decorator={() => null}
    />
  </View>
</ScrollView>


      {/* Cards individuais */}
      {lotesData.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="leaf" size={20} color="#16a34a" style={{ marginRight: 8 }} />
            <Text style={styles.loteNome}>{item.loteNome}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Produção:</Text>
            <Text
              style={[
                styles.producao,
                { color: item.producao > 100 ? '#16a34a' : item.producao > 50 ? '#facc15' : '#ef4444' },
              ]}
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

          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: item.producao > 100 ? '#d1fae5' : item.producao > 50 ? '#fef3c7' : '#fee2e2' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.producao > 100 ? '#047857' : item.producao > 50 ? '#b45309' : '#b91c1c' },
              ]}
            >
              {item.producao > 100 ? 'Alta Produção' : item.producao > 50 ? 'Produção Média' : 'Baixa Produção'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fdfdfd' },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  loteNome: { fontSize: 18, fontWeight: '700', color: '#111827' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  producao: { fontSize: 16, fontWeight: '600' },
  data: { fontSize: 14, color: '#374151' },
  placeholder: { textAlign: 'center', color: '#9ca3af', marginTop: 20, fontSize: 16 },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
});

export default LotesView;
