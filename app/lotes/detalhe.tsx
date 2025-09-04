import CadastrarArvoreModal from '@/components/nova_arvore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';

interface Lote {
  id: string;         // ID do documento do Firestore
  codigo: string;     // Código de identificação visual (L-123)
  nome: string;
  area: string;
  arvores: number;
  colhidoTotal: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  ultimaColeta: string;
  localizacao?: string;
  responsavel?: string;
  latitude?: string;
  longitude?: string;
  observacoes?: string;
}

interface HistoricoItem {
  id: string;
  data: string;
  responsavel: string;
  arvoresColetadas: number;
  producaoTotal: string;
  observacoes?: string;
}

interface ArvoreItem {
  id: string;
  codigo: string;
  tipo: string;
  ultimaColeta: string;
  producaoTotal: string;
  diasAtras: number;
  estadoSaude?: string;
}

interface ArvoreFormData {
  idArvore: string;
  estadoSaude: string;
  especie: string;
  dataPlantio: string;
  latitude: string;
  longitude: string;
  notasAdicionais: string;
}

export default function DetalheLoteScreen() {
  const { id, codigo, nome } = useLocalSearchParams();
  
  const [loteData, setLoteData] = useState<Lote | null>(null);
  const [arvores, setArvores] = useState<ArvoreItem[]>([]);
  const [historicoData, setHistoricoData] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const loteId = Array.isArray(id) ? id[0] : id;

        if (!loteId) {
          console.log('ID do lote é inválido ou vazio');
          return;
        }

        // Buscar dados do lote
        await fetchLoteData(loteId);
        
        // Buscar árvores do lote
        await fetchArvores(loteId);
        
        // Buscar histórico do lote
        await fetchHistorico(loteId);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchLoteData = async (loteId: string) => {
    try {
      const loteDocRef = doc(db, 'lotes', loteId);
      const loteDoc = await getDoc(loteDocRef);

      if (loteDoc.exists()) {
        const data = loteDoc.data();
        
        setLoteData({
          id: loteDoc.id,           // ID do documento do Firestore
          codigo: data.codigo || `L-${loteDoc.id.slice(-3)}`, // Código de identificação, com fallback
          nome: data.nome || '',
          area: data.area || '0',
          arvores: data.arvores || 0,
          colhidoTotal: data.colhidoTotal || '0',
          status: data.status || 'Inativo',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          ultimaColeta: data.ultimaColeta || 'Nunca',
          localizacao: data.localizacao || '',
          responsavel: data.responsavel || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          observacoes: data.observacoes || '',
        });
      } else {
        console.log('Lote não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do lote:', error);
    }
  };

  const fetchArvores = async (loteId: string) => {
    try {
      const arvoresQuery = query(
        collection(db, 'arvores'),
        where('loteId', '==', loteId)
      );

      const arvoresSnapshot = await getDocs(arvoresQuery);
      const arvoresList: ArvoreItem[] = [];
      
      arvoresSnapshot.forEach(doc => {
        const arv = doc.data();
        arvoresList.push({
          id: doc.id,
          codigo: arv.codigo || `ARV-${doc.id}`,
          tipo: arv.especie || arv.tipo || 'Não informado',
          ultimaColeta: arv.ultimaColeta || 'Nunca coletada',
          producaoTotal: arv.producaoTotal || '0 kg',
          diasAtras: arv.diasAtras || 0,
          estadoSaude: arv.estadoSaude || 'Não informado',
        });
      });
      
      setArvores(arvoresList);
    } catch (error) {
      console.error('Erro ao buscar árvores:', error);
    }
  };

  const fetchHistorico = async (loteId: string) => {
    try {
      // Primeiro, tenta buscar sem orderBy para evitar erro de índice
      const historicoQuery = query(
        collection(db, 'historico_coletas'),
        where('loteId', '==', loteId)
      );
      
      const historicoSnapshot = await getDocs(historicoQuery);
      const historicoList: HistoricoItem[] = [];
      
      historicoSnapshot.forEach(doc => {
        const hist = doc.data();
        historicoList.push({
          id: doc.id,
          data: hist.data || '',
          responsavel: hist.responsavel || 'Não informado',
          arvoresColetadas: hist.arvoresColetadas || 0,
          producaoTotal: hist.producaoTotal || '0 kg',
          observacoes: hist.observacoes || '',
        });
      });
      
      // Ordenar no cliente por data (mais recente primeiro)
      historicoList.sort((a, b) => {
        if (!a.data || !b.data) return 0;
        
        // Tenta diferentes formatos de data
        const dateA = new Date(a.data.split('/').reverse().join('-')); // DD/MM/YYYY -> YYYY-MM-DD
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Se não conseguir converter, mantém ordem original
        }
        
        return dateB.getTime() - dateA.getTime();
      });
      
      setHistoricoData(historicoList);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      // Se der erro, define array vazio
      setHistoricoData([]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNovaArvore = async (arvoreData: ArvoreFormData) => {
    // Atualizar o estado local imediatamente para feedback do usuário
    const novaArvore: ArvoreItem = {
      id: `temp-${Date.now()}`,
      codigo: arvoreData.idArvore,
      tipo: arvoreData.especie,
      ultimaColeta: 'Nunca coletada',
      producaoTotal: '0 kg',
      diasAtras: 0,
      estadoSaude: arvoreData.estadoSaude,
    };
    
    setArvores(prev => [...prev, novaArvore]);
    
    // Atualizar o contador de árvores no lote
    if (loteData) {
      setLoteData(prev => prev ? { ...prev, arvores: prev.arvores + 1 } : null);
    }
  };

  const handleStatusChange = async (novoStatus: string) => {
    if (!loteData) return;
    
    setUpdatingStatus(true);
    try {
      const loteId = Array.isArray(id) ? id[0] : id;
      const loteDocRef = doc(db, 'lotes', loteId);
      
      // Atualizar no Firebase
      await updateDoc(loteDocRef, {
        status: novoStatus
      });
      
      // Atualizar estado local
      setLoteData(prev => prev ? { ...prev, status: novoStatus } : null);
      
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      // Aqui você pode adicionar um toast ou alert para mostrar o erro
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return '#10B981'; // Verde
      case 'planejado':
        return '#F59E0B'; // Amarelo
      case 'concluido':
      case 'concluído':
        return '#6B7280'; // Cinza
      default:
        return '#6B7280';
    }
  };

  const getQualidadeColor = (qualidade: string) => {
    switch (qualidade.toLowerCase()) {
      case 'saudavel':
      case 'saudável': 
        return '#10B981';
      case 'excelente': 
        return '#059669';
      case 'bom': 
        return '#F59E0B';
      case 'ruim':
      case 'doente':
        return '#EF4444';
      default: 
        return '#6B7280';
    }
  };

  const renderVisaoGeral = () => (
    <View style={styles.tabContent}>
      {/* Informações Gerais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Código do Lote</Text>
            <Text style={styles.infoValue}>{loteData?.codigo || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{loteData?.localizacao || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Responsável</Text>
            <Text style={styles.infoValue}>{loteData?.responsavel || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data Início</Text>
            <Text style={styles.infoValue}>{loteData?.dataInicio || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fim do cultivo</Text>
            <Text style={styles.infoValue}>{loteData?.dataFim || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última coleta</Text>
            <Text style={styles.infoValue}>{loteData?.ultimaColeta || 'Nunca'}</Text>
          </View>
        </View>
      </View>

      {/* Localização GPS */}
      {(loteData?.latitude || loteData?.longitude) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização GPS</Text>
          <View style={styles.gpsContainer}>
            <View style={styles.gpsItem}>
              <Text style={styles.gpsLabel}>Latitude</Text>
              <Text style={styles.gpsValue}>{loteData?.latitude || 'N/A'}</Text>
            </View>
            <View style={styles.gpsItem}>
              <Text style={styles.gpsLabel}>Longitude</Text>
              <Text style={styles.gpsValue}>{loteData?.longitude || 'N/A'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="location-outline" size={16} color="#059669" />
            <Text style={styles.mapButtonText}>Ver no Mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Observações */}
      {loteData?.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoes}>{loteData.observacoes}</Text>
        </View>
      )}
    </View>
  );

  const renderArvores = () => (
    <View style={styles.tabContent}>
      {arvores.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Nenhuma árvore cadastrada</Text>
          <Text style={styles.emptyStateText}>
            Cadastre a primeira árvore deste lote clicando no botão acima.
          </Text>
        </View>
      ) : (
        arvores.map((arvore) => (
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
                  {arvore.diasAtras === 0 ? 'Nunca coletada' : `${arvore.diasAtras} dias atrás`}
                </Text>
              </View>
              <View style={styles.arvoreDetailItem}>
                <Text style={styles.arvoreDetailLabel}>Produção Total</Text>
                <Text style={styles.arvoreDetailValue}>{arvore.producaoTotal}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderHistorico = () => (
    <View style={styles.tabContent}>
      {historicoData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Nenhum histórico encontrado</Text>
          <Text style={styles.emptyStateText}>
            Quando houver coletas neste lote, elas aparecerão aqui.
          </Text>
        </View>
      ) : (
        historicoData.map((item) => (
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
              <Text style={styles.historicoArvores}>
                {item.arvoresColetadas} árvores coletadas
              </Text>
            </View>
            {item.observacoes && (
              <Text style={styles.historicoObservacoes}>{item.observacoes}</Text>
            )}
          </View>
        ))
      )}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados do lote...</Text>
      </SafeAreaView>
    );
  }

  if (!loteData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lote não encontrado.</Text>
        <TouchableOpacity style={styles.backButtonError} onPress={handleBack}>
          <Text style={styles.backButtonErrorText}>Voltar</Text>
        </TouchableOpacity>
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
              <Text style={styles.headerTitle}>{loteData.nome}</Text>
              <Text style={styles.headerSubtitle}>Código: {loteData.codigo}</Text>
            </View>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(loteData.status) }]}>
            <TouchableOpacity 
              onPress={() => setStatusModalVisible(true)}
              style={styles.statusTouchable}
            >
              <Text style={styles.statusText}>{loteData.status}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
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
            <Text style={styles.statValue}>{loteData.colhidoTotal}</Text>
            <Text style={styles.statLabel}>Colhido</Text>
          </View>
        </View>
      </View>

      {/* Botão Cadastrar Nova Árvore */}
      <View style={styles.cadastrarContainer}>
        <TouchableOpacity 
          style={styles.cadastrarButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-outline" size={20} color="white" />
          <Text style={styles.cadastrarButtonText}>Cadastrar Nova Árvore</Text>
        </TouchableOpacity>
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
            Árvores ({arvores.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historico' && styles.activeTab]}
          onPress={() => setActiveTab('historico')}
        >
          <Text style={[styles.tabText, activeTab === 'historico' && styles.activeTabText]}>
            Histórico ({historicoData.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de Cadastro */}
      <CadastrarArvoreModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleNovaArvore}
        loteId={loteData.id}
      />

      {/* Modal de Status */}
      {statusModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <View style={styles.statusModalHeader}>
              <Text style={styles.statusModalTitle}>Alterar Status</Text>
              <TouchableOpacity 
                onPress={() => setStatusModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusOptions}>
              {['Ativo', 'Planejado', 'Concluído'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    loteData.status.toLowerCase() === status.toLowerCase() && styles.statusOptionActive
                  ]}
                  onPress={() => handleStatusChange(status)}
                  disabled={updatingStatus}
                >
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: getStatusColor(status) }
                  ]} />
                  <Text style={[
                    styles.statusOptionText,
                    loteData.status.toLowerCase() === status.toLowerCase() && styles.statusOptionTextActive
                  ]}>
                    {status}
                  </Text>
                  {loteData.status.toLowerCase() === status.toLowerCase() && (
                    <Ionicons name="checkmark" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {updatingStatus && (
              <View style={styles.updatingContainer}>
                <Text style={styles.updatingText}>Atualizando...</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButtonError: {
    marginTop: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
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
  cadastrarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cadastrarButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cadastrarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  historicoObservacoes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 32,
  },
  // Estilos do Modal de Status
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 280,
    maxWidth: 350,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  statusOptionActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  statusOptionTextActive: {
    color: '#059669',
    fontWeight: '500',
  },
  updatingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});