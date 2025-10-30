import NovoLoteModal from '@/components/novo_lote';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';

interface Lote {
  id: string;
  codigo: string;
  nome: string;
  area: string;
  arvoresEstimadas: number;  // Quantidade planejada/estimada
  arvoresReais: number;      // Quantidade real cadastrada
  colhidoTotal: string;      // Agora será calculado das coletas reais
  status: 'ativo' | 'concluído' | 'planejado';
  dataInicio: string;
  dataFim: string;
  ultimaColeta: string;
  colaboradoresResponsaveis?: string[];
}

const LotesScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  

  // Verificar se o usuário é admin e obter ID do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
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
        setCurrentUserId(null);
      }
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Buscar lotes e configurar listeners
  useEffect(() => {
    if (userLoading || !currentUserId) return;

    let lotesQuery;

    if (isAdmin) {
      lotesQuery = collection(db, 'lotes');
    } else {
      lotesQuery = query(
        collection(db, 'lotes'),
        where('colaboradoresResponsaveis', 'array-contains', currentUserId)
      );
    }

    // Estados para armazenar contagens
    let arvoresPorLote: Record<string, number> = {};
    let coletasPorLote: Record<string, { total: number, ultima: string }> = {};

    // Listener para árvores
    const unsubscribeArvores = onSnapshot(collection(db, 'arvores'), (arvoresSnapshot) => {
      // Resetar contagem
      arvoresPorLote = {};

      // Contar árvores por lote
      arvoresSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const loteId = data.loteId;
        if (loteId) {
          arvoresPorLote[loteId] = (arvoresPorLote[loteId] || 0) + 1;
        }
      });

      // Atualizar apenas a contagem de árvores reais nos lotes existentes
      setLotes(currentLotes =>
        currentLotes.map(lote => ({
          ...lote,
          arvoresReais: arvoresPorLote[lote.id] || 0
        }))
      );
    });

    // Listener para coletas - NOVA FUNCIONALIDADE
    const unsubscribeColetas = onSnapshot(collection(db, 'coletas'), (coletasSnapshot) => {
      // Resetar contagem
      coletasPorLote = {};

      // Processar coletas por lote
      coletasSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const loteId = data.loteId;
        const quantidade = data.quantidade || 0;
        const dataColeta = data.dataColeta?.toDate?.() || new Date();

        if (loteId && quantidade > 0) {
          if (!coletasPorLote[loteId]) {
            coletasPorLote[loteId] = { total: 0, ultima: '' };
          }

          // Somar quantidade total
          coletasPorLote[loteId].total += quantidade;

          // Verificar se é a coleta mais recente
          const dataFormatada = dataColeta.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          });

          if (!coletasPorLote[loteId].ultima || dataColeta > new Date(coletasPorLote[loteId].ultima)) {
            coletasPorLote[loteId].ultima = dataFormatada;
          }
        }
      });

      // Atualizar coletas nos lotes existentes
      setLotes(currentLotes =>
        currentLotes.map(lote => {
          const coletasInfo = coletasPorLote[lote.id];
          return {
            ...lote,
            colhidoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
            ultimaColeta: coletasInfo?.ultima || 'Nunca'
          };
        })
      );
    });

    const unsubscribeLotes = onSnapshot(lotesQuery, async (querySnapshot) => {
      const lotesFromFirestore: Lote[] = [];

      // Processar cada lote
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const loteId = docSnapshot.id;

        // Obter dados das coletas e árvores para este lote específico
        const coletasInfo = coletasPorLote[loteId];
        const arvoresReais = arvoresPorLote[loteId] || 0;

        lotesFromFirestore.push({
          id: loteId,
          codigo: data.codigo || `L-${loteId.slice(-3)}`,
          nome: data.nome || 'Lote sem nome',
          area: data.area || '0 hectares',
          arvoresEstimadas: data.arvores || 0,
          arvoresReais: arvoresReais,
          colhidoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
          status: data.status || 'planejado',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          ultimaColeta: coletasInfo?.ultima || 'Nunca',
          colaboradoresResponsaveis: data.colaboradoresResponsaveis || [],
        });
      }

      setLotes(lotesFromFirestore);
      setLoading(false);
    });

    return () => {
      unsubscribeArvores();
      unsubscribeColetas();
      unsubscribeLotes();
    };
  }, [isAdmin, userLoading, currentUserId]);

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
      case 'concluído': return 'Concluído';
      case 'planejado': return 'Planejado';
      default: return 'Indefinido';
    }
  };

  const getArvoresStatusColor = (estimadas: number, reais: number) => {
    if (reais === 0) return '#6b7280'; // Cinza - nenhuma cadastrada
    if (reais >= estimadas) return '#059669'; // Verde - meta atingida
    if (reais >= estimadas * 0.7) return '#f59e0b'; // Amarelo - parcialmente atingida
    return '#ef4444'; // Vermelho - baixo progresso
  };

  // Função para obter estatísticas totais
  const getTotalStats = () => {
    const totalColhido = lotes.reduce((acc, lote) => {
      const quantidade = parseFloat(lote.colhidoTotal.replace(' kg', '')) || 0;
      return acc + quantidade;
    }, 0);

    return {
      totalColhido: `${totalColhido.toFixed(1)} kg`,
      totalArvores: lotes.reduce((acc, lote) => acc + lote.arvoresReais, 0)
    };
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

  const handleLoteCreated = (newLote: any) => {
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
  const stats = getTotalStats();

  if (loading || userLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando lotes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {isAdmin ? 'Todos os Lotes' : 'Meus Lotes'}
              </Text>
            </View>
          </View>
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
        {isAdmin && (
          <TouchableOpacity style={styles.addLoteButton} onPress={handleAddLote}>
            <Ionicons name="add-outline" size={20} color="white" />
            <Text style={styles.addLoteButtonText}>Novo Lote</Text>
          </TouchableOpacity>
        )}
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
                {lotes.filter((l) => l.status === 'concluído').length}
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
                  ? (isAdmin
                    ? 'Crie seu primeiro lote clicando no botão + acima'
                    : 'Você ainda não foi atribuído a nenhum lote'
                  )
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
                    <View style={styles.arvoresContainer}>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: getArvoresStatusColor(lote.arvoresEstimadas, lote.arvoresReais) }
                        ]}
                      >
                        {lote.arvoresReais}/{lote.arvoresEstimadas}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${lote.arvoresEstimadas > 0 ? (lote.arvoresReais / lote.arvoresEstimadas) * 100 : 0}%`,
                              backgroundColor: getArvoresStatusColor(lote.arvoresEstimadas, lote.arvoresReais)
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.loteFooter}>
                  <View style={styles.footerInfo}>
                    <View>
                      <Text style={styles.footerLabel}>Total Coletado</Text>
                      <Text style={styles.totalColhido}>{lote.colhidoTotal}</Text>
                    </View>
                    <View style={styles.ultimaColetaContainer}>
                      <Text style={styles.footerLabel}>Última Coleta</Text>
                      <Text style={styles.ultimaColeta}>{lote.ultimaColeta}</Text>
                    </View>
                  </View>
                </View>

                {/* Indicador para admin - mostra se é responsável pelo lote */}
                {isAdmin && lote.colaboradoresResponsaveis && lote.colaboradoresResponsaveis.length > 0 && (
                  <View style={styles.colaboradoresIndicator}>
                    <Ionicons name="people" size={14} color="#6b7280" />
                    <Text style={styles.colaboradoresText}>
                      {lote.colaboradoresResponsaveis.length} responsável(eis)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      {/* Modal só aparece para admins */}
      {isAdmin && (
        <NovoLoteModal visible={showModal} onClose={handleModalClose} onSuccess={handleLoteCreated} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 0,
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
  addLoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    marginHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  addLoteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  arvoresContainer: {
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 2,
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
  colaboradoresIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  colaboradoresText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default LotesScreen;