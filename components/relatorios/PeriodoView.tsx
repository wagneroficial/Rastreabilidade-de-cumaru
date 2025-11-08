import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface PeriodoViewProps {
  periodData: {
    loteNome: string;
    producao: number;
    data: string;
  }[];
}

const PeriodoView: React.FC<PeriodoViewProps> = ({ periodData }) => {
  if (!periodData || periodData.length === 0) {
    return <Text style={styles.placeholder}>Nenhuma coleta neste período.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {periodData.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.loteNome}>{item.loteNome}</Text>
          <Text style={styles.producao}>Produção: {item.producao} kg</Text>
          <Text style={styles.data}>Data: {item.data}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  loteNome: { fontSize: 16, fontWeight: '600', color: '#111827' },
  producao: { fontSize: 14, color: '#15803d', marginTop: 4 },
  data: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  placeholder: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});

export default PeriodoView;
