// screens/DetalheLoteScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Componentes
import ArvoresTab from '@/components/detalhe-lote/ArvoresTab';
import ColaboradoresModal from '@/components/detalhe-lote/ColaboradoresModal';
import HistoricoTab from '@/components/detalhe-lote/HistoricoTab';
import LoteHeader from '@/components/detalhe-lote/LoteHeader';
import StatusModal from '@/components/detalhe-lote/StatusModal';
import TabNavigator from '@/components/detalhe-lote/TabNavigator';
import VisaoGeralTab from '@/components/detalhe-lote/VisaoGeralTab';
import CadastrarArvoreModal from '@/components/nova_arvore';
import NovoLoteModal from '@/components/novo_lote';

// Hook customizado
import { useLoteData } from '@/hooks/useLoteData';

// Tipos
import { ArvoreFormData, ArvoreItem, Lote, TabType } from '@/types/lote.types';

export default function DetalheLoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('visao-geral');
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [colaboradoresModalVisible, setColaboradoresModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loteParaEditar, setLoteParaEditar] = useState<Lote | null>(null);

  const {
    loteData,
    arvores,
    historicoData,
    colaboradores,
    loading,
    userLoading,
    loadingColaboradores,
    updatingStatus,
    isAdmin,
    fetchColaboradores,
    handleStatusChange,
    handleColaboradorToggle,
  } = useLoteData(id);

  // Estado derivado para atualizar as árvores localmente
  const [arvoresState, setArvoresState] = useState<ArvoreItem[]>([]);

  useEffect(() => {
    if (arvores) setArvoresState(arvores);
  }, [arvores]);

  const handleBack = () => router.back();

const handleArvoreCadastrada = (novaArvore: ArvoreItem) => {
  setArvoresState(prev => [novaArvore, ...prev]); // sempre aparece primeiro
  setModalVisible(false);
};

// 🔹 Atualiza o estado local quando o hook arvores mudar
useEffect(() => {
  if (arvores) setArvoresState([...arvores].reverse()); // coloca o último cadastrado no topo
}, [arvores]);

  const handleOpenColaboradoresModal = () => {
    setColaboradoresModalVisible(true);
    fetchColaboradores();
  };

  const getColaboradorNome = (colaboradorId: string) => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.nome || 'Colaborador';
  };

  const colaboradoresNomes = (loteData?.colaboradoresResponsaveis || []).map(id =>
    getColaboradorNome(id)
  );

  const handleEditLote = (lote: Lote) => {
    setLoteParaEditar(lote);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
  };

  const renderTabContent = () => {
    if (!loteData) return null;

    switch (activeTab) {
      case 'visao-geral':
        return (
          <VisaoGeralTab
            loteData={loteData}
            isAdmin={isAdmin}
            colaboradoresNomes={colaboradoresNomes}
            historico={historicoData}
            onManageColaboradores={isAdmin ? handleOpenColaboradoresModal : undefined}
            onEditLote={handleEditLote}
          />
        );

      case 'arvores':
        return <ArvoresTab arvores={arvoresState} isAdmin={isAdmin} />;

      case 'historico':
        return <HistoricoTab historico={historicoData} />;

      default:
        return null;
    }
  };

  if (loading || userLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.loadingText}>Carregando dados do lote...</Text>
      </SafeAreaView>
    );
  }

  if (!loteData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lote não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LoteHeader
        loteData={loteData}
        isAdmin={isAdmin}
        onBack={handleBack}
        onStatusPress={isAdmin ? () => setStatusModalVisible(true) : undefined}
      />

      {isAdmin && (
        <View style={styles.cadastrarContainer}>
          <TouchableOpacity
            style={styles.cadastrarButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-outline" size={20} color="white" />
            <Text style={styles.cadastrarButtonText}>Nova Árvore</Text>
          </TouchableOpacity>
        </View>
      )}

      <TabNavigator
        activeTab={activeTab}
        onTabChange={setActiveTab}
        arvoresCount={arvoresState.length}
        historicoCount={historicoData.length}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {isAdmin && (
        <>
          <CadastrarArvoreModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSuccess={handleArvoreCadastrada}
          />

          <StatusModal
            visible={statusModalVisible}
            currentStatus={loteData.status}
            isUpdating={updatingStatus}
            onClose={() => setStatusModalVisible(false)}
            onStatusChange={status => {
              handleStatusChange(status);
              setStatusModalVisible(false);
            }}
          />

          <ColaboradoresModal
            visible={colaboradoresModalVisible}
            colaboradores={colaboradores}
            selectedIds={loteData.colaboradoresResponsaveis || []}
            isLoading={loadingColaboradores}
            onClose={() => setColaboradoresModalVisible(false)}
            onToggle={handleColaboradorToggle}
          />

          <NovoLoteModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSuccess={handleEditSuccess}
            loteParaEditar={loteParaEditar}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cadastrarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cadastrarButton: {
    backgroundColor: '#16a34a',
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
  content: {
    flex: 1,
  },
  bottomSpacing: {
    height: 32,
  },
});
