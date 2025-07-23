import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Period {
  key: string;
  label: string;
}

interface RecentReport {
  title: string;
  type: string;
  date: string;
  status: 'completo' | 'processando';
  size: string;
}

const RelatoriosScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');

  const periods: Period[] = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'trimestral', label: 'Trimestral' },
    { key: 'anual', label: 'Anual' }
  ];

  const recentReports: RecentReport[] = [
    {
      title: 'Relatório de Produção - Janeiro 2024',
      type: 'Produção',
      date: '31/01/2024',
      status: 'completo',
      size: '2.1 MB'
    },
    {
      title: 'Relatório de Produção - Dezembro 2023',
      type: 'Produção',
      date: '15/01/2024',
      status: 'completo',
      size: '1.8 MB'
    },
    {
      title: 'Relatório de Produção - Novembro 2023',
      type: 'Produção',
      date: '05/01/2024',
      status: 'processando',
      size: '0.9 MB'
    }
  ];

  const summaryData = {
    totalColhido: '1.245 kg',
    mediaDiaria: '8.5 kg',
    melhorLote: 'C-05',
    crescimento: '+12%'
  };

  const formatLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      totalColhido: 'Total Colhido',
      mediaDiaria: 'Média Diária',
      melhorLote: 'Melhor Lote',
      crescimento: 'Crescimento'
    };
    return labels[key] || key;
  };

  const handleGenerateReport = () => {
    Alert.alert(
      'Gerar Relatório',
      'Relatório de Produção sendo gerado! Você será notificado quando estiver pronto.',
      [{ text: 'OK' }]
    );
  };

  const handleViewReport = (report: RecentReport) => {
    Alert.alert('Visualizar', `Abrindo: ${report.title}`);
  };

  const handleDownloadReport = (report: RecentReport) => {
    Alert.alert('Download', `Baixando: ${report.title}`);
  };

  const handleShareReport = (report: RecentReport) => {
    Alert.alert('Compartilhar', `Compartilhando: ${report.title}`);
  };

  const handleExportOption = (format: string) => {
    Alert.alert('Exportar', `Exportando relatório em formato ${format}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatórios</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodButtons}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key)}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period.key ? styles.periodButtonActive : styles.periodButtonInactive
                  ]}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key ? styles.periodButtonTextActive : styles.periodButtonTextInactive
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Summary Preview */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo - Produção</Text>
            <View style={styles.summaryGrid}>
              {Object.entries(summaryData).map(([key, value], index) => (
                <View key={index} style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{value}</Text>
                  <Text style={styles.summaryLabel}>{formatLabel(key)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Generate Report Button */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleGenerateReport} style={styles.generateButton}>
            <Ionicons name="cloud-download-outline" size={20} color="white" />
            <Text style={styles.generateButtonText}>Gerar Relatório de Produção</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relatórios de Produção Recentes</Text>
          <View style={styles.recentReportsList}>
            {recentReports.map((report, index) => (
              <View key={index} style={styles.reportCard}>
                <View style={styles.reportCardHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <View style={styles.reportMeta}>
                      <Text style={styles.reportMetaText}>{report.type}</Text>
                      <Text style={styles.reportMetaText}>{report.date}</Text>
                      <Text style={styles.reportMetaText}>{report.size}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    report.status === 'completo' ? styles.statusBadgeComplete : styles.statusBadgeProcessing
                  ]}>
                    <Text style={[
                      styles.statusText,
                      report.status === 'completo' ? styles.statusTextComplete : styles.statusTextProcessing
                    ]}>
                      {report.status === 'completo' ? 'Completo' : 'Processando'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.reportActions}>
                  {report.status === 'completo' ? (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButtonPrimary}
                        onPress={() => handleViewReport(report)}
                      >
                        <Ionicons name="eye-outline" size={16} color="#16a34a" />
                        <Text style={styles.actionButtonPrimaryText}>Visualizar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButtonSecondary}
                        onPress={() => handleDownloadReport(report)}
                      >
                        <Ionicons name="download-outline" size={16} color="#6b7280" />
                        <Text style={styles.actionButtonSecondaryText}>Download</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButtonIcon}
                        onPress={() => handleShareReport(report)}
                      >
                        <Ionicons name="share-outline" size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.processingIndicator}>
                      <Ionicons name="hourglass-outline" size={16} color="#6b7280" />
                      <Text style={styles.processingText}>Processando...</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <View style={styles.exportCard}>
            <Text style={styles.exportTitle}>Opções de Exportação</Text>
            <View style={styles.exportOptions}>
              <TouchableOpacity 
                style={styles.exportOption}
                onPress={() => handleExportOption('PDF')}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#dc2626" />
                </View>
                <Text style={styles.exportOptionText}>PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.exportOption}
                onPress={() => handleExportOption('Excel')}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="grid-outline" size={20} color="#16a34a" />
                </View>
                <Text style={styles.exportOptionText}>Excel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.exportOption}
                onPress={() => handleExportOption('E-mail')}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="mail-outline" size={20} color="#2563eb" />
                </View>
                <Text style={styles.exportOptionText}>E-mail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: '#16a34a',
  },
  periodButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  periodButtonTextInactive: {
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    width: '45%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentReportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeComplete: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeProcessing: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextComplete: {
    color: '#166534',
  },
  statusTextProcessing: {
    color: '#a16207',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionButtonIcon: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  exportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportOption: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default RelatoriosScreen;