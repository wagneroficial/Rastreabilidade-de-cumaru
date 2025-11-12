import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Componentes principais
import HeaderRelatorios from '@/components/relatorios/HeaderRelatorios';
import TabNavigation from '@/components/relatorios/TabNavigation';

// Subcomponentes de relatório
import VisaoGeral from '@/components/relatorios/VisaoGeral';
import LotesView from '@/components/relatorios/LotesView';
import PeriodoView from '@/components/relatorios/PeriodoView';

// Hooks
import { useHomeData } from '@/hooks/useHomeData';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';

const RelatoriosAnalyticsScreen: React.FC = () => {
  const homeHook = useHomeData();


  const {
    lotesCount,
    arvoresCount,
    totalColhido,
    melhorLote,
    lotesAtivos,
  } = homeHook;

  // ✅ Dados do hook de Home
  const homeData = {
    lotesCount,
    arvoresCount,
    totalColhido,
    melhorLote,
    lotesAtivos,
  };


  const {
    loading,
    activeTab,
    setActiveTab,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    lotesData,
    periodData,
  } = useRelatoriosData();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🔹 Função auxiliar para evitar tipagem implícita incompatível
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as any);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <VisaoGeral
          dadosHome={homeData}
          lotesData={lotesData.map(lote => ({
            codigo: lote.codigo || lote.loteId || 'Sem código',
            loteId: lote.loteId,
            nome: lote.loteNome || 'Sem nome',
            area: lote.area || 0,
            arvores: lote.arvores || 0,
            colhidoTotal: lote.producao ? `${lote.producao} kg` : '0 kg',
            status: lote.status || 'Inativo',
            ultimaColeta: lote.data || 'Nunca'
          }))}
        />

      case 'lotes':
        return <LotesView lotesData={lotesData} />;

      case 'periodo':
        return (
          <PeriodoView
            periodoData={periodData}
            periods={periods}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        );

      default:
        return (
          <Text style={styles.placeholder}>
            Selecione uma aba para visualizar os dados.
          </Text>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor='#16a34a' barStyle="light-content" />
      <HeaderRelatorios />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { fontSize: 16, color: '#6b7280' },
  scrollView: { flex: 1 },
  placeholder: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
    fontSize: 15,
  },
});

export default RelatoriosAnalyticsScreen;
