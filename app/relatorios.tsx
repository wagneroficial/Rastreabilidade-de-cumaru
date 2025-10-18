import ChartSelector from '@/components/relatorios/ChartSelector';
import ChartView from '@/components/relatorios/ChartView';
import ExportOptions from '@/components/relatorios/ExportOptions';
import GenerateReportButton from '@/components/relatorios/GenerateReportButton';
import HeaderRelatorios from '@/components/relatorios/HeaderRelatorios';
import PerformanceIndicators from '@/components/relatorios/PerformanceIndicators';
import PeriodSelector from '@/components/relatorios/PeriodSelector';
import RecentReportsList from '@/components/relatorios/RecentReportsList';
import StatsCards from '@/components/relatorios/StatsCards';
import SummaryPreview from '@/components/relatorios/SummaryPreview';
import TabNavigation from '@/components/relatorios/TabNavigation';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


const RelatoriosAnalyticsScreen: React.FC = () => {
  const {
    selectedPeriod,
    activeTab,
    activeChart,
    loading,
    generatingReport,
    summaryData,
    chartData,
    performanceIndicators,
    recentReports,
    periods,
    setSelectedPeriod,
    setActiveTab,
    setActiveChart,
    generateReport,
    handleViewReport,
    handleDownloadReport,
    handleShareReport,
    handleExportOption,
  } = useRelatoriosData();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Carregando analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {activeTab === 'analytics' ? (
          <>
            <StatsCards summaryData={summaryData} />

            <ChartSelector activeChart={activeChart} onChartChange={setActiveChart} />

            <ChartView activeChart={activeChart} chartData={chartData} />

            <PerformanceIndicators indicators={performanceIndicators} />
          </>
        ) : (
          <>
            <SummaryPreview summaryData={summaryData} />

            <GenerateReportButton onGenerate={generateReport} isGenerating={generatingReport} />

            <RecentReportsList
              reports={recentReports}
              onView={handleViewReport}
              onDownload={handleDownloadReport}
              onShare={handleShareReport}
            />

            <ExportOptions onExport={handleExportOption} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
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
  scrollView: {
    flex: 1,
  },
});

export default RelatoriosAnalyticsScreen;