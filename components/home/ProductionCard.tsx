// components/ProductionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductionCardProps {
  productionToday: string; // Ex: "12.5 kg"
  changePercent: string;   // Ex: "+8% em relação a ontem"
}

const ProductionCard: React.FC<ProductionCardProps> = ({
  productionToday,
  changePercent,
}) => {
  const isPositive = changePercent.trim().startsWith('+');

  return (
    <View style={styles.card}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Produção de hoje</Text>
          <Text style={styles.value}>{productionToday}</Text>
        </View>

        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={24} color="#16a34a" />
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Ionicons
          name={isPositive ? 'arrow-up-outline' : 'arrow-down-outline'}
          size={16}
          color={isPositive ? '#16a34a' : '#dc2626'}
          style={styles.footerIcon}
        />
        <Text
          style={[
            styles.footerText,
            { color: isPositive ? '#16a34a' : '#dc2626' },
          ]}
        >
          {changePercent}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fffa',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#c4e0cc',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#052e16',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: '#052e16',
    fontSize: 32,
    fontWeight: '600',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
  },
});

export default ProductionCard;
