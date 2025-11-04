import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componentes principais
import HeaderRelatorios from '@/components/relatorios/HeaderRelatorios';
import TabNavigation from '@/components/relatorios/TabNavigation';
import PeriodSelector from '@/components/relatorios/PeriodSelector';
import VisaoGeral from '@/components/relatorios/VisaoGeral';
import LotesView from '@/components/relatorios/LotesView';

// Hook de dados
import { useRelatoriosData } from '@/hooks/useRelatoriosData';

const RelatoriosAnalyticsScreen: React.FC = () => {
  const {
    selectedPeriod,
    activeTab,
    loading,
    summaryData,
    chartData,
    performanceIndicators,
    periods,
    setSelectedPeriod,
    setActiveTab,
    activeChart,
    setActiveChart,
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <VisaoGeral
            summaryData={summaryData}
            chartData={chartData}
            activeChart={activeChart}
            setActiveChart={setActiveChart}
            performanceIndicators={performanceIndicators}
          />
        );

      case 'lotes':
        return <LotesView chartData={chartData.lotes} />;

      case 'periodo':
        // Pega os dados do período selecionado
        const periodChartData = chartData.periods?.[selectedPeriod] || [];

        // Calcula o período com maior produção
        const melhorPeriodo = periodChartData.reduce(
          (prev, current) => (current.value > prev.value ? current : prev),
          { name: '', value: 0 }
        );

        return (
          <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
 

            {/* Gráfico e cards usando o LotesView */}
            <LotesView chartData={periodChartData} />

            {/* Insight automático */}
            {melhorPeriodo.name ? (
              <View style={styles.insightBox}>
                <Ionicons name="trending-up" size={22} color="#16a34a" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>Melhor Desempenho</Text>
                  <Text style={styles.insightText}>
                    O <Text style={{ fontWeight: '600' }}>{melhorPeriodo.name}</Text> teve o maior
                    volume de produção neste período, com{' '}
                    <Text style={{ color: '#16a34a' }}>{melhorPeriodo.value.toFixed(1)} kg</Text>.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
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
        <PeriodSelector
          periods={periods}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: { flex: 1 },
  placeholder: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
    fontSize: 15,
  },
  periodTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  insightBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#065f46',
    lineHeight: 18,
  },
});

export default RelatoriosAnalyticsScreen;
