import NovoLoteModal from '@/components/novo_lote';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '@/app/sevices/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

interface Lote {
  id: string;         // ID do documento do Firestore
  codigo: string;     // Código de identificação visual (L-123)
  nome: string;
  area: string;
  arvores: number;
  colhidoTotal: string;
  status: 'ativo' | 'concluido' | 'planejado';
  dataInicio: string;
  dataFim: string;
  ultimaColeta: string;
}

const LotesScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'lotes'), (querySnapshot) => {
      const lotesFromFirestore: Lote[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lotesFromFirestore.push({
          id: doc.id,                                        // ID do documento do Firestore
          codigo: data.codigo || `L-${doc.id.slice(-3)}`,   // Código com fallback
          nome: data.nome || 'Lote sem nome',
          area: data.area || '0 hectares',
          arvores: data.arvores || 0,
          colhidoTotal: data.colhidoTotal || '0 kg',
          status: data.status || 'planejado',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          ultimaColeta: data.ultimaColeta || 'Nunca',
        });
      });
      setLotes(lotesFromFirestore);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLotes = lotes.filter((lote) => {
    if (activeFilter === 'todos') return true;
    return lote.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'concluido': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'planejado': return { backgroundColor: '#fed7aa', color: '#c2410c' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'Ativo';
      case 'concluido': return 'Concluído';
      case 'planejado': return 'Planejado';
      default: return 'Indefinido';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddLote = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleLoteCreated = (newLote: Lote) => {
    // Não precisa fazer nada aqui - o listener do Firestore vai detectar 
    // automaticamente a mudança e atualizar a lista
    console.log('Novo lote criado:', newLote.codigo);
  };

  const handleLotePress = (loteId: string) => {
    const lote = lotes.find((l) => l.id === loteId);
    router.push({
      pathname: '/lotes/detalhe',
      params: {
        id: loteId,
        codigo: lote?.codigo || '',
        nome: lote?.nome || '',
      },
    });
  };

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativo', label: 'Ativos' },
    { key: 'concluido', label: 'Concluídos' },
    { key: 'planejado', label: 'Planejados' },
  ];

  const totalLotes = lotes.length;
  const lotesAtivos = lotes.filter((l) => l.status === 'ativo').length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando lotes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Meus Lotes</Text>
              <Text style={styles.headerSubtitle}>
                {totalLotes} lotes • {lotesAtivos} ativos
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleAddLote} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <View style={styles.filtersContent}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.key ? styles.filterButtonActive : styles.filterButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      activeFilter === filter.key
                        ? styles.filterButtonTextActive
                        : styles.filterButtonTextInactive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                {lotes.filter((l) => l.status === 'ativo').length}
              </Text>
              <Text style={styles.summaryLabel}>Ativos</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#2563eb' }]}>
                {lotes.filter((l) => l.status === 'concluido').length}
              </Text>
              <Text style={styles.summaryLabel}>Concluídos</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#ea580c' }]}>
                {lotes.filter((l) => l.status === 'planejado').length}
              </Text>
              <Text style={styles.summaryLabel}>Planejados</Text>
            </View>
          </View>
        </View>

        {/* Lotes List */}
        <View style={styles.lotesContainer}>
          {filteredLotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>Nenhum lote encontrado</Text>
              <Text style={styles.emptyStateText}>
                {activeFilter === 'todos' 
                  ? 'Crie seu primeiro lote clicando no botão + acima'
                  : `Nenhum lote com status "${filters.find(f => f.key === activeFilter)?.label}"`
                }
              </Text>
            </View>
          ) : (
            filteredLotes.map((lote) => (
              <TouchableOpacity 
                key={`${lote.id}-${lote.codigo}`} 
                style={styles.loteCard} 
                onPress={() => handleLotePress(lote.id)}
              >
                <View style={styles.loteHeader}>
                  <View style={styles.loteInfo}>
                    <Text style={styles.loteNome}>{lote.nome}</Text>
                    <Text style={styles.loteId}>Código: {lote.codigo}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusColor(lote.status)]}>
                    <Text style={[styles.statusText, { color: getStatusColor(lote.status).color }]}>
                      {getStatusText(lote.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.loteDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Área</Text>
                    <Text style={styles.detailValue}>{lote.area}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Árvores</Text>
                    <Text style={styles.detailValue}>{lote.arvores}</Text>
                  </View>
                </View>

                <View style={styles.loteFooter}>
                  <View style={styles.footerInfo}>
                    <View>
                      <Text style={styles.footerLabel}>Total Colhido</Text>
                      <Text style={styles.totalColhido}>{lote.colhidoTotal}</Text>
                    </View>
                    <View style={styles.ultimaColetaContainer}>
                      <Text style={styles.footerLabel}>Última Coleta</Text>
                      <Text style={styles.ultimaColeta}>{lote.ultimaColeta}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <NovoLoteModal visible={showModal} onClose={handleModalClose} onSuccess={handleLoteCreated} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 32,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#16a34a',
  },
  filterButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  filterButtonTextInactive: {
    color: '#4b5563',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  lotesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  loteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loteInfo: {
    flex: 1,
  },
  loteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  loteId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loteDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 2,
  },
  loteFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalColhido: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 2,
  },
  ultimaColetaContainer: {
    alignItems: 'flex-end',
  },
  ultimaColeta: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LotesScreen;