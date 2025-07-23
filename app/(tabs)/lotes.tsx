import NovoLoteModal from '@/components/novo_lote';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Lote {
  id: string;
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
  
  const [lotes, setLotes] = useState<Lote[]>([
    {
      id: 'A-12',
      nome: 'Lote Norte A-12',
      area: '2.5 hectares',
      arvores: 45,
      colhidoTotal: '234.5 kg',
      status: 'ativo',
      dataInicio: '2024-01-15',
      dataFim: '2024-03-30',
      ultimaColeta: '2 horas atrás'
    },
    {
      id: 'B-07',
      nome: 'Lote Sul B-07',
      area: '1.8 hectares',
      arvores: 32,
      colhidoTotal: '189.2 kg',
      status: 'ativo',
      dataInicio: '2024-01-20',
      dataFim: '2024-04-05',
      ultimaColeta: '1 dia atrás'
    },
    {
      id: 'C-05',
      nome: 'Lote Oeste C-05',
      area: '3.2 hectares',
      arvores: 67,
      colhidoTotal: '456.8 kg',
      status: 'concluido',
      dataInicio: '2023-12-01',
      dataFim: '2024-02-28',
      ultimaColeta: '5 dias atrás'
    },
    {
      id: 'D-15',
      nome: 'Lote Leste D-15',
      area: '2.1 hectares',
      arvores: 38,
      colhidoTotal: '0 kg',
      status: 'planejado',
      dataInicio: '2024-02-15',
      dataFim: '2024-05-20',
      ultimaColeta: 'Não iniciado'
    }
  ]); 

  const filteredLotes = lotes.filter(lote => {
    if (activeFilter === 'todos') return true;
    return lote.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'concluido': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'planejado': return { backgroundColor: '#fed7aa', color: '#c2410c' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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
    setLotes(prev => [...prev, newLote]);
  };

  const handleLotePress = (loteId: string) => {
  router.push(`/lotes/detalhe?id=${loteId}`  as any);
};

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativo', label: 'Ativos' },
    { key: 'concluido', label: 'Concluídos' },
    { key: 'planejado', label: 'Planejados' }
  ];

  const totalLotes = lotes.length;
  const lotesAtivos = lotes.filter(l => l.status === 'ativo').length;

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
                    activeFilter === filter.key ? styles.filterButtonActive : styles.filterButtonInactive
                  ]}
                >
                  <Text style={[
                    styles.filterButtonText,
                    activeFilter === filter.key ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                  ]}>
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
                {lotes.filter(l => l.status === 'ativo').length}
              </Text>
              <Text style={styles.summaryLabel}>Ativos</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#2563eb' }]}>
                {lotes.filter(l => l.status === 'concluido').length}
              </Text>
              <Text style={styles.summaryLabel}>Concluídos</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#ea580c' }]}>
                {lotes.filter(l => l.status === 'planejado').length}
              </Text>
              <Text style={styles.summaryLabel}>Planejados</Text>
            </View>
          </View>
        </View>

        {/* Lotes List */}
        <View style={styles.lotesContainer}>
          {filteredLotes.map((lote) => (
            <TouchableOpacity
              key={lote.id}
              style={styles.loteCard}
              onPress={() => handleLotePress(lote.id)}
            >
              <View style={styles.loteHeader}>
                <View style={styles.loteInfo}>
                  <Text style={styles.loteNome}>{lote.nome}</Text>
                  <Text style={styles.loteId}>ID: {lote.id}</Text>
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
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal para Novo Lote */}
      <NovoLoteModal
        visible={showModal}
        onClose={handleModalClose}
        onSuccess={handleLoteCreated}
      />
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
});

export default LotesScreen;