// components/detalhe-lote/ArvoresTab.tsx
import { ArvoreItem } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ArvoresTabProps {
  arvores: ArvoreItem[];
  isAdmin: boolean;
}

const ArvoresTab: React.FC<ArvoresTabProps> = ({ arvores, isAdmin }) => {
  const router = useRouter();

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

  const handleArvorePress = (arvoreId: string) => {
    router.push(`/arvore/${arvoreId}` as any);
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
    { [...arvores].sort((a, b) => b.id.localeCompare(a.id)).map((arvore) => (
        <TouchableOpacity
          key={arvore.id}
          style={styles.arvoreCard}
          onPress={() => handleArvorePress(arvore.id)}
          activeOpacity={0.7}
        >
          <View style={styles.arvoreHeader}>
            <View style={styles.arvoreHeaderLeft}>
              <Text style={styles.arvoreCode}>{arvore.codigo}</Text>
            </View>
            <View style={styles.arvoreHeaderRight}>
              <View style={[
                styles.qualidadeBadge,
                { backgroundColor: getQualidadeColor(arvore.estadoSaude || 'Saudável') }
              ]}>
                <Text style={styles.qualidadeText}>
                  {arvore.estadoSaude || 'Saudável'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.chevron} />
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
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  arvoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  arvoreHeaderLeft: {
    flex: 1,
  },
  arvoreHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arvoreCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
  chevron: {
    marginLeft: 4,
  },
  arvoreDetails: {
    flexDirection: 'row',
    gap: 62,
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