// components/detalhe-lote/ArvoresTab.tsx
import { ArvoreItem } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ArvoresTabProps {
  arvores: ArvoreItem[];
  isAdmin: boolean;
}

const ArvoresTab: React.FC<ArvoresTabProps> = ({ arvores, isAdmin }) => {
  const getQualidadeColor = (qualidade: string) => {
    switch (qualidade.toLowerCase()) {
      case 'saudavel':
      case 'saudável': return '#10B981';
      case 'excelente': return '#059669';
      case 'bom': return '#F59E0B';
      case 'ruim':
      case 'doente': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (arvores.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyStateTitle}>Nenhuma árvore cadastrada</Text>
        <Text style={styles.emptyStateText}>
          {isAdmin 
            ? 'Cadastre a primeira árvore deste lote clicando no botão acima.' 
            : 'Ainda não há árvores cadastradas neste lote.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {arvores.map((arvore) => (
        <View key={arvore.id} style={styles.arvoreCard}>
          <View style={styles.arvoreHeader}>
            <View>
              <Text style={styles.arvoreCode}>{arvore.codigo}</Text>
              <Text style={styles.arvoreTipo}>{arvore.tipo}</Text>
            </View>
            <View style={[
              styles.qualidadeBadge, 
              { backgroundColor: getQualidadeColor(arvore.estadoSaude || 'Saudável') }
            ]}>
              <Text style={styles.qualidadeText}>
                {arvore.estadoSaude || 'Saudável'}
              </Text>
            </View>
          </View>
          <View style={styles.arvoreDetails}>
            <View style={styles.arvoreDetailItem}>
              <Text style={styles.arvoreDetailLabel}>Última Coleta</Text>
              <Text style={styles.arvoreDetailValue}>
                {arvore.diasAtras === 0 ? arvore.ultimaColeta : 
                 arvore.ultimaColeta === 'Nunca coletada' ? 'Nunca coletada' : 
                 `${arvore.ultimaColeta} (${arvore.diasAtras} dias atrás)`
                }
              </Text>
            </View>
            <View style={styles.arvoreDetailItem}>
              <Text style={styles.arvoreDetailLabel}>Produção Total</Text>
              <Text style={styles.arvoreDetailValue}>{arvore.producaoTotal}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  arvoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  arvoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  arvoreCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  arvoreTipo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  qualidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualidadeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  arvoreDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  arvoreDetailItem: {
    flex: 1,
  },
  arvoreDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  arvoreDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});

export default ArvoresTab;