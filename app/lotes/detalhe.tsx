import CadastrarArvoreModal from '@/components/nova_arvore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

interface Lote {
  id: string;
  codigo: string;
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
  colaboradoresResponsaveis?: string[];
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  propriedade?: string;
}

interface HistoricoItem {
  id: string;
  data: string;
  responsavel: string;
  quantidade: string;
  observacoes?: string;
  hora: string;
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
  const [colaboradoresModalVisible, setColaboradoresModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Estados para admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.tipo === 'admin');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loteId = Array.isArray(id) ? id[0] : id;
    if (!loteId) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await fetchLoteData(loteId);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Configurar listeners para dados em tempo real
    setupRealtimeListeners(loteId);

  }, [id]);

  // Configurar listeners em tempo real
  const setupRealtimeListeners = (loteId: string) => {
    // Estados para armazenar dados calculados
    let coletasPorArvore: Record<string, { total: number, ultima: string, diasAtras: number }> = {};
    let coletasDoLote: HistoricoItem[] = [];
    let totalColetadoLote = 0;
    let ultimaColetaLote = 'Nunca';

    // Listener para árvores
    const unsubscribeArvores = onSnapshot(
      query(collection(db, 'arvores'), where('loteId', '==', loteId)),
      (arvoresSnapshot) => {
        const arvoresList: ArvoreItem[] = [];
        
        arvoresSnapshot.docs.forEach(doc => {
          const arv = doc.data();
          const coletasInfo = coletasPorArvore[doc.id];
          
          arvoresList.push({
            id: doc.id,
            codigo: arv.codigo || `ARV-${doc.id.slice(-3)}`,
            tipo: arv.especie || arv.tipo || 'Não informado',
            ultimaColeta: coletasInfo?.ultima || 'Nunca coletada',
            producaoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
            diasAtras: coletasInfo?.diasAtras || 0,
            estadoSaude: arv.estadoSaude || 'Saudável',
          });
        });
        
        setArvores(arvoresList);

        // Atualizar contador de árvores no lote
        setLoteData(prev => prev ? { ...prev, arvores: arvoresList.length } : null);
      }
    );

    // Listener para coletas
    const unsubscribeColetas = onSnapshot(
      query(collection(db, 'coletas'), where('loteId', '==', loteId)),
      async (coletasSnapshot) => {
        // Resetar dados
        coletasPorArvore = {};
        coletasDoLote = [];
        totalColetadoLote = 0;
        let ultimaDataColeta = new Date(0);

        // Processar coletas
        for (const docSnapshot of coletasSnapshot.docs) {
          const data = docSnapshot.data();
          const quantidade = data.quantidade || 0;
          const dataColeta = data.dataColeta?.toDate?.() || new Date();
          const arvoreId = data.arvoreId;
          const coletorId = data.coletorId;

          // Somar total do lote
          totalColetadoLote += quantidade;

          // Verificar última coleta do lote
          if (dataColeta > ultimaDataColeta) {
            ultimaDataColeta = dataColeta;
            ultimaColetaLote = dataColeta.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            });
          }

          // Calcular produção por árvore
          if (arvoreId) {
            if (!coletasPorArvore[arvoreId]) {
              coletasPorArvore[arvoreId] = { total: 0, ultima: '', diasAtras: 0 };
            }
            
            coletasPorArvore[arvoreId].total += quantidade;
            
            // Verificar última coleta da árvore
            if (!coletasPorArvore[arvoreId].ultima || dataColeta > new Date(coletasPorArvore[arvoreId].ultima)) {
              coletasPorArvore[arvoreId].ultima = dataColeta.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
              });
              
              // Calcular dias atrás
              const hoje = new Date();
              const diffTime = Math.abs(hoje.getTime() - dataColeta.getTime());
              coletasPorArvore[arvoreId].diasAtras = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
          }

          // Buscar nome do coletor
          let nomeColetorCompleto = 'Coletor não encontrado';
          try {
            if (coletorId) {
              const coletorDoc = await getDoc(doc(db, 'usuarios', coletorId));
              if (coletorDoc.exists()) {
                const coletorData = coletorDoc.data();
                nomeColetorCompleto = coletorData.nome || data.coletorNome || 'Coletor';
              } else {
                nomeColetorCompleto = data.coletorNome || 'Coletor';
              }
            }
          } catch (error) {
            nomeColetorCompleto = data.coletorNome || 'Coletor';
          }

          // Adicionar ao histórico
          coletasDoLote.push({
            id: docSnapshot.id,
            data: dataColeta.toLocaleDateString('pt-BR'),
            responsavel: nomeColetorCompleto,
            quantidade: `${quantidade.toFixed(1)} kg`,
            observacoes: data.observacoes || '',
            hora: dataColeta.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
        }

        // Ordenar histórico por data decrescente
        coletasDoLote.sort((a, b) => {
          const dateA = new Date(a.data.split('/').reverse().join('-'));
          const dateB = new Date(b.data.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });

        // Atualizar estados
        setHistoricoData(coletasDoLote);
        
        // Atualizar dados do lote
        setLoteData(prev => prev ? {
          ...prev,
          colhidoTotal: `${totalColetadoLote.toFixed(1)} kg`,
          ultimaColeta: ultimaColetaLote
        } : null);

        // Forçar re-renderização das árvores com novos dados
        setArvores(currentArvores => 
          currentArvores.map(arvore => {
            const coletasInfo = coletasPorArvore[arvore.id];
            return {
              ...arvore,
              ultimaColeta: coletasInfo?.ultima || 'Nunca coletada',
              producaoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
              diasAtras: coletasInfo?.diasAtras || 0
            };
          })
        );
      }
    );

    // Retornar função de cleanup
    return () => {
      unsubscribeArvores();
      unsubscribeColetas();
    };
  };

  // Buscar colaboradores quando modal abrir
  useEffect(() => {
    if (colaboradoresModalVisible) {
      fetchColaboradores();
    }
  }, [colaboradoresModalVisible]);

  const fetchColaboradores = async () => {
    setLoadingColaboradores(true);
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'colaborador'),
        where('status', '==', 'aprovado')
      );
      const querySnapshot = await getDocs(q);
      const colaboradoresList: Colaborador[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        colaboradoresList.push({
          id: doc.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          propriedade: data.propriedade
        });
      });
      
      setColaboradores(colaboradoresList);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      Alert.alert('Erro', 'Falha ao carregar colaboradores');
    } finally {
      setLoadingColaboradores(false);
    }
  };

  const fetchLoteData = async (loteId: string) => {
    try {
      const loteDocRef = doc(db, 'lotes', loteId);
      const loteDoc = await getDoc(loteDocRef);

      if (loteDoc.exists()) {
        const data = loteDoc.data();
        
        setLoteData({
          id: loteDoc.id,
          codigo: data.codigo || `L-${loteDoc.id.slice(-3)}`,
          nome: data.nome || '',
          area: data.area || '0',
          arvores: data.arvores || 0,
          colhidoTotal: '0 kg', // Será calculado em tempo real
          status: data.status || 'Inativo',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          ultimaColeta: 'Nunca', // Será calculado em tempo real
          localizacao: data.localizacao || '',
          responsavel: data.responsavel || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          observacoes: data.observacoes || '',
          colaboradoresResponsaveis: data.colaboradoresResponsaveis || [],
        });
      } else {
        console.log('Lote não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do lote:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNovaArvore = async (arvoreData: ArvoreFormData) => {
    // A árvore será adicionada automaticamente pelo listener
    console.log('Nova árvore cadastrada:', arvoreData.idArvore);
  };

  const handleStatusChange = async (novoStatus: string) => {
    if (!loteData) return;
    
    setUpdatingStatus(true);
    try {
      const loteId = Array.isArray(id) ? id[0] : id;
      const loteDocRef = doc(db, 'lotes', loteId);
      
      await updateDoc(loteDocRef, {
        status: novoStatus
      });
      
      setLoteData(prev => prev ? { ...prev, status: novoStatus } : null);
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleColaboradorToggle = async (colaboradorId: string) => {
    if (!loteData) return;

    const currentColaboradores = loteData.colaboradoresResponsaveis || [];
    const isSelected = currentColaboradores.includes(colaboradorId);
    
    let newColaboradores: string[];
    if (isSelected) {
      newColaboradores = currentColaboradores.filter(id => id !== colaboradorId);
    } else {
      newColaboradores = [...currentColaboradores, colaboradorId];
    }

    try {
      const loteId = Array.isArray(id) ? id[0] : id;
      const loteDocRef = doc(db, 'lotes', loteId);
      
      await updateDoc(loteDocRef, {
        colaboradoresResponsaveis: newColaboradores
      });
      
      setLoteData(prev => prev ? { 
        ...prev, 
        colaboradoresResponsaveis: newColaboradores 
      } : null);
      
    } catch (error) {
      console.error('Erro ao atualizar colaboradores:', error);
      Alert.alert('Erro', 'Falha ao atualizar colaboradores responsáveis');
    }
  };

  const getColaboradorNome = (colaboradorId: string) => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.nome || 'Colaborador';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return '#10B981';
      case 'planejado': return '#F59E0B';
      case 'concluido':
      case 'concluído': return '#6B7280';
      default: return '#6B7280';
    }
  };

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

      {/* Colaboradores Responsáveis */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Colaboradores Responsáveis</Text>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={() => setColaboradoresModalVisible(true)}
            >
              <Ionicons name="settings-outline" size={16} color="#059669" />
              <Text style={styles.manageButtonText}>Gerenciar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loteData?.colaboradoresResponsaveis && loteData.colaboradoresResponsaveis.length > 0 ? (
          <View style={styles.colaboradoresList}>
            {loteData.colaboradoresResponsaveis.map((colaboradorId, index) => (
              <View key={colaboradorId} style={styles.colaboradorItem}>
                <View style={styles.colaboradorAvatar}>
                  <Ionicons name="person" size={16} color="#059669" />
                </View>
                <Text style={styles.colaboradorNome}>
                  {getColaboradorNome(colaboradorId)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noColaboradores}>
            {isAdmin ? 'Nenhum colaborador atribuído. Clique em "Gerenciar" para adicionar.' : 'Nenhum colaborador atribuído a este lote.'}
          </Text>
        )}
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
            {isAdmin ? 'Cadastre a primeira árvore deste lote clicando no botão acima.' : 'Ainda não há árvores cadastradas neste lote.'}
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
                <Text style={styles.historicoHora}>às {item.hora}</Text>
              </View>
              <Text style={styles.historicoProducao}>{item.quantidade}</Text>
            </View>
            {item.observacoes && (
              <View style={styles.historicoObservacoesContainer}>
                <Text style={styles.historicoObservacoes}>"{item.observacoes}"</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visao-geral': return renderVisaoGeral();
      case 'arvores': return renderArvores();
      case 'historico': return renderHistorico();
      default: return renderVisaoGeral();
    }
  };

  if (loading || userLoading) {
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
          {isAdmin && (
            <View style={[styles.statusContainer, { backgroundColor: getStatusColor(loteData.status) }]}>
              <TouchableOpacity 
                onPress={() => setStatusModalVisible(true)}
                style={styles.statusTouchable}
              >
                <Text style={styles.statusText}>{loteData.status}</Text>
                <Ionicons name="chevron-down" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
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

      {/* Botão Cadastrar Nova Árvore - Só para Admin */}
      {isAdmin && (
        <View style={styles.cadastrarContainer}>
          <TouchableOpacity 
            style={styles.cadastrarButton} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-outline" size={20} color="white" />
            <Text style={styles.cadastrarButtonText}>Cadastrar Nova Árvore</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* Modal de Cadastro - Só para Admin */}
      {isAdmin && (
        <CadastrarArvoreModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleNovaArvore}
          loteId={loteData.id}
        />
      )}

      {/* Modal de Status - Só para Admin */}
      {isAdmin && statusModalVisible && (
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
              {['ativo', 'planejado', 'concluído'].map((status) => (
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

      {/* Modal de Colaboradores - Só para Admin */}
      {isAdmin && (
        <Modal
          visible={colaboradoresModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setColaboradoresModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.colaboradoresModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Gerenciar Colaboradores</Text>
                <TouchableOpacity onPress={() => setColaboradoresModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {loadingColaboradores ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando colaboradores...</Text>
                </View>
              ) : (
                <ScrollView style={styles.modalContent}>
                  {colaboradores.length === 0 ? (
                    <View style={styles.emptyCollaboratorsContainer}>
                      <Ionicons name="people-outline" size={48} color="#9ca3af" />
                      <Text style={styles.emptyCollaboratorsText}>
                        Nenhum colaborador aprovado encontrado
                      </Text>
                    </View>
                  ) : (
                    colaboradores.map((colaborador) => {
                      const isSelected = loteData.colaboradoresResponsaveis?.includes(colaborador.id) || false;
                      return (
                        <TouchableOpacity
                          key={colaborador.id}
                          style={[
                            styles.colaboradorModalOption,
                            isSelected && styles.colaboradorModalOptionSelected
                          ]}
                          onPress={() => handleColaboradorToggle(colaborador.id)}
                        >
                          <View style={styles.colaboradorModalInfo}>
                            <Text style={[
                              styles.colaboradorModalNome,
                              isSelected && styles.colaboradorModalNomeSelected
                            ]}>
                              {colaborador.nome}
                            </Text>
                            <Text style={styles.colaboradorModalEmail}>
                              {colaborador.email}
                            </Text>
                            {colaborador.propriedade && (
                              <Text style={styles.colaboradorModalPropriedade}>
                                {colaborador.propriedade}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#059669" />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalFooterButton}
                  onPress={() => setColaboradoresModalVisible(false)}
                >
                  <Text style={styles.modalFooterButtonText}>
                    Confirmar ({loteData.colaboradoresResponsaveis?.length || 0} selecionados)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  manageButtonText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  colaboradoresList: {
    gap: 8,
  },
  colaboradorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  colaboradorAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colaboradorNome: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  noColaboradores: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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
  historicoHora: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  historicoProducao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  historicoObservacoesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  historicoObservacoes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 32,
  },
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
  colaboradoresModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    maxHeight: 400,
  },
  emptyCollaboratorsContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyCollaboratorsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  colaboradorModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  colaboradorModalOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  colaboradorModalInfo: {
    flex: 1,
  },
  colaboradorModalNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  colaboradorModalNomeSelected: {
    color: '#059669',
  },
  colaboradorModalEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  colaboradorModalPropriedade: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  modalFooterButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalFooterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});