import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
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

// Hook customizado
import { useRelatoriosData } from '@/hooks/useRelatoriosData';

const RelatoriosAnalyticsScreen: React.FC = () => {
  const {
    loading,
    activeTab,
    setActiveTab,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    visaoGeralData,
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
        return <VisaoGeral data={[]} />;

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
