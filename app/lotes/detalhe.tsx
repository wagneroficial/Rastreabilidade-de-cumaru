// screens/DetalheLoteScreen.tsx
import CadastrarArvoreModal from '@/components/nova_arvore';
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

// Componentes
import ArvoresTab from '@/components/detalhe-lote/ArvoresTab';
import ColaboradoresModal from '@/components/detalhe-lote/ColaboradoresModal';
import HistoricoTab from '@/components/detalhe-lote/HistoricoTab';
import LoteHeader from '@/components/detalhe-lote/LoteHeader';
import StatusModal from '@/components/detalhe-lote/StatusModal';
import TabNavigator from '@/components/detalhe-lote/TabNavigator';
import VisaoGeralTab from '@/components/detalhe-lote/VisaoGeralTab';

// Hook customizado
import { useLoteData } from '@/hooks/useLoteData';

// Types
import { ArvoreFormData, TabType } from '@/types/lote.types';

export default function DetalheLoteScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('visao-geral');
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [colaboradoresModalVisible, setColaboradoresModalVisible] = useState(false);

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

  const handleBack = () => {
    router.back();
  };

  const handleNovaArvore = async (arvoreData: ArvoreFormData) => {
    console.log('Nova árvore cadastrada:', arvoreData.idArvore);
    setModalVisible(false);
  };

  const handleOpenColaboradoresModal = () => {
    setColaboradoresModalVisible(true);
    fetchColaboradores();
  };

  const getColaboradorNome = (colaboradorId: string) => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.nome || 'Colaborador';
  };

  const colaboradoresNomes = (loteData?.colaboradoresResponsaveis || [])
    .map(id => getColaboradorNome(id));

  const renderTabContent = () => {
    if (!loteData) return null;

    switch (activeTab) {
      case 'visao-geral':
        return (
          <VisaoGeralTab
            loteData={loteData}
            isAdmin={isAdmin}
            colaboradoresNomes={colaboradoresNomes}
            onManageColaboradores={isAdmin ? handleOpenColaboradoresModal : undefined}
          />
        );
      case 'arvores':
        return <ArvoresTab arvores={arvores} isAdmin={isAdmin} />;
      case 'historico':
        return <HistoricoTab historico={historicoData} />;
      default:
        return null;
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <LoteHeader
        loteData={loteData}
        isAdmin={isAdmin}
        onBack={handleBack}
        onStatusPress={isAdmin ? () => setStatusModalVisible(true) : undefined}
      />

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

      <TabNavigator
        activeTab={activeTab}
        onTabChange={setActiveTab}
        arvoresCount={arvores.length}
        historicoCount={historicoData.length}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      {isAdmin && (
        <>
          <CadastrarArvoreModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={handleNovaArvore}
            loteId={loteData.id}
          />

          <StatusModal
            visible={statusModalVisible}
            currentStatus={loteData.status}
            isUpdating={updatingStatus}
            onClose={() => setStatusModalVisible(false)}
            onStatusChange={(status) => {
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
        </>
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