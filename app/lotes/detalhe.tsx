import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

interface HistoricoItem {
  id: string;
  codigo: string;
  tipo: string;
  qualidade: 'Saudavel' | 'Excelente' | 'Bom';
  data: string;
  responsavel: string;
  arvoresColetadas: number;
  producaoTotal: string;
}

interface ArvoreItem {
  id: string;
  codigo: string;
  tipo: string;
  ultimaColeta: string;
  producaoTotal: string;
  diasAtras: number;
}

export default function DetalheLoteScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('visao-geral');

  const handleBack = () => {
    router.back();
  };

  // Dados mockados do lote
  const loteData = {
    id: 'A-12',
    nome: 'Lote Norte A-12',
    identificacao: 'A-12',
    area: '2.5',
    arvores: 45,
    colhido: '234.5',
    status: 'Ativo',
    localizacao: 'Zona Norte da Propriedade',
    responsavel: 'João Silva',
    dataInicio: '14/01/2024',
    dataFim: '20/03/2024',
    ultimaColeta: '2 horas atrás',
    latitude: '-3.123456',
    longitude: '-60.123456',
    observacoes: 'Lote com boa produtividade, solo bem drenado'
  };

  const arvoresData: ArvoreItem[] = [
    {
      id: '1',
      codigo: 'CUM-A12-001',
      tipo: 'Dipteryx odorata',
      ultimaColeta: 'Produção Total',
      producaoTotal: '5.2 kg',
      diasAtras: 2
    },
    {
      id: '2',
      codigo: 'CUM-A12-002',
      tipo: 'Dipteryx odorata',
      ultimaColeta: 'Produção Total',
      producaoTotal: '6.8 kg',
      diasAtras: 1
    },
    {
      id: '3',
      codigo: 'CUM-A12-003',
      tipo: 'Dipteryx odorata',
      ultimaColeta: 'Produção Total',
      producaoTotal: '4.1 kg',
      diasAtras: 3
    },
    {
      id: '4',
      codigo: 'CUM-A12-004',
      tipo: 'Dipteryx odorata',
      ultimaColeta: 'Produção Total',
      producaoTotal: '3.8 kg',
      diasAtras: 5
    }
  ];

  const historicoData: HistoricoItem[] = [
    {
      id: '1',
      codigo: 'CUM-A12-001',
      tipo: 'Dipteryx odorata',
      qualidade: 'Saudavel',
      data: '27/01/2024',
      responsavel: 'João Silva',
      arvoresColetadas: 12,
      producaoTotal: '45.2 kg'
    },
    {
      id: '2',
      codigo: 'CUM-A12-002',
      tipo: 'Dipteryx odorata',
      qualidade: 'Excelente',
      data: '24/01/2024',
      responsavel: 'João Silva',
      arvoresColetadas: 10,
      producaoTotal: '38.7 kg'
    },
    {
      id: '3',
      codigo: 'CUM-A12-003',
      tipo: 'Dipteryx odorata',
      qualidade: 'Bom',
      data: '21/01/2024',
      responsavel: 'Ana Maria Santos',
      arvoresColetadas: 15,
      producaoTotal: '52.1 kg'
    },
    {
      id: '4',
      codigo: 'CUM-A12-004',
      tipo: 'Dipteryx odorata',
      qualidade: 'Saudavel',
      data: '18/01/2024',
      responsavel: 'João Silva',
      arvoresColetadas: 11,
      producaoTotal: '41.3 kg'
    }
  ];

  const getQualidadeColor = (qualidade: string) => {
    switch (qualidade) {
      case 'Saudavel': return '#10B981';
      case 'Excelente': return '#059669';
      case 'Bom': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderVisaoGeral = () => (
    <View style={styles.tabContent}>
      {/* Informações Gerais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{loteData.localizacao}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Responsável</Text>
            <Text style={styles.infoValue}>{loteData.responsavel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dados Início</Text>
            <Text style={styles.infoValue}>{loteData.dataInicio}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fim do cultivo</Text>
            <Text style={styles.infoValue}>{loteData.dataFim}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última coleção</Text>
            <Text style={styles.infoValue}>{loteData.ultimaColeta}</Text>
          </View>
        </View>
      </View>

      {/* Localização GPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização GPS</Text>
        <View style={styles.gpsContainer}>
          <View style={styles.gpsItem}>
            <Text style={styles.gpsLabel}>Latitude</Text>
            <Text style={styles.gpsValue}>{loteData.latitude}</Text>
          </View>
          <View style={styles.gpsItem}>
            <Text style={styles.gpsLabel}>Longitude</Text>
            <Text style={styles.gpsValue}>{loteData.longitude}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="location-outline" size={16} color="#059669" />
          <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Observações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observações</Text>
        <Text style={styles.observacoes}>{loteData.observacoes}</Text>
      </View>

      {/* Cadastrar Nova Árvore */}
      <TouchableOpacity style={styles.cadastrarButton}>
        <Ionicons name="add-outline" size={20} color="white" />
        <Text style={styles.cadastrarButtonText}>Cadastrar Nova Árvore</Text>
      </TouchableOpacity>
    </View>
  );

  const renderArvores = () => (
    <View style={styles.tabContent}>
      {arvoresData.map((arvore, index) => (
        <View key={arvore.id} style={styles.arvoreCard}>
          <View style={styles.arvoreHeader}>
            <View>
              <Text style={styles.arvoreCode}>{arvore.codigo}</Text>
              <Text style={styles.arvoreTipo}>{arvore.tipo}</Text>
            </View>
            <View style={[styles.qualidadeBadge, { backgroundColor: getQualidadeColor('Saudavel') }]}>
              <Text style={styles.qualidadeText}>Saudável</Text>
            </View>
          </View>
          <View style={styles.arvoreDetails}>
            <View style={styles.arvoreDetailItem}>
              <Text style={styles.arvoreDetailLabel}>Última Coleta</Text>
              <Text style={styles.arvoreDetailValue}>{arvore.diasAtras} dias atrás</Text>
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

  const renderHistorico = () => (
    <View style={styles.tabContent}>
      {historicoData.map((item, index) => (
        <View key={item.id} style={styles.historicoCard}>
          <View style={styles.historicoHeader}>
            <View style={styles.historicoData}>
              <Text style={styles.historicoDate}>{item.data}</Text>
              <Text style={styles.historicoResponsavel}>por {item.responsavel}</Text>
            </View>
            <Text style={styles.historicoProducao}>{item.producaoTotal}</Text>
          </View>
          <View style={styles.historicoDetails}>
            <Ionicons name="leaf-outline" size={16} color="#059669" />
            <Text style={styles.historicoArvores}>{item.arvoresColetadas} árvores coletadas</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visao-geral':
        return renderVisaoGeral();
      case 'arvores':
        return renderArvores();
      case 'historico':
        return renderHistorico();
      default:
        return renderVisaoGeral();
    }
  };

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
              <Text style={styles.headerTitle}>{loteData.nome}</Text>
              <Text style={styles.headerSubtitle}>Identificação: {loteData.identificacao}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{loteData.status}</Text>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{loteData.area}</Text>
            <Text style={styles.statLabel}>hectares</Text>
            <Text style={styles.statSubLabel}>Área Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{loteData.arvores}</Text>
            <Text style={styles.statLabel}>Árvores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{loteData.colhido} kg</Text>
            <Text style={styles.statLabel}>Colhido</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visao-geral' && styles.activeTab]}
          onPress={() => setActiveTab('visao-geral')}
        >
          <Text style={[styles.tabText, activeTab === 'visao-geral' && styles.activeTabText]}>
            Visão Geral
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'arvores' && styles.activeTab]}
          onPress={() => setActiveTab('arvores')}
        >
          <Text style={[styles.tabText, activeTab === 'arvores' && styles.activeTabText]}>
            Árvores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historico' && styles.activeTab]}
          onPress={() => setActiveTab('historico')}
        >
          <Text style={[styles.tabText, activeTab === 'historico' && styles.activeTabText]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#BBF7D0',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#059669',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  gpsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  gpsItem: {
    flex: 1,
  },
  gpsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  gpsValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  observacoes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  cadastrarButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  cadastrarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  historicoCard: {
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
  historicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historicoData: {
    flex: 1,
  },
  historicoDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historicoResponsavel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historicoProducao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  historicoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historicoArvores: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 32,
  },
});