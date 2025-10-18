// components/ProductionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductionCardProps {
  productionToday: string; // Ex: "12.5 kg"
  changePercent: string; // Ex: "+8% em relação a ontem"
}

const ProductionCard: React.FC<ProductionCardProps> = ({
  productionToday,
  changePercent,
}) => {
  return (
    <View style={styles.card}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Produção de Hoje</Text>
          <Text style={styles.value}>{productionToday}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={28} color="#16a34a" />
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Ionicons name="arrow-up-outline" size={16} color="#16a34a" style={styles.footerIcon} />
        <Text style={styles.footerText}>{changePercent}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 0,
    marginBottom: 24,
    borderWidth: 1,
    borderColor:'#2e8b561c',
    backgroundColor: '#16a34a10',// Ajuste a cor conforme necessário
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#000',
    fontSize: 15,
    marginBottom: 2,
  },
  value: {
    color: '#000',
    fontSize: 29,
    fontWeight: '500',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    color: '#2E8B57',
    fontSize: 12,
  },
});

export default ProductionCard;
