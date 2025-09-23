import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from './services/firebaseConfig';

interface Period {
  key: string;
  label: string;
}

interface RecentReport {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'completo' | 'processando';
  size: string;
  data?: any;
}

interface SummaryData {
  totalColhido: string;
  mediaDiaria: string;
  melhorLote: string;
  crescimento: string;
  totalLotes: number;
  totalArvores: number;
  coletasRealizadas: number;
}

interface ColetaData {
  id: string;
  loteId: string;
  arvoreId: string;
  quantidade: number;
  dataColeta: Date;
  coletorNome: string;
  loteCodigo?: string;
  loteNome?: string;
}

const RelatoriosScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalColhido: '0 kg',
    mediaDiaria: '0 kg',
    melhorLote: 'N/A',
    crescimento: '0%',
    totalLotes: 0,
    totalArvores: 0,
    coletasRealizadas: 0
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  const periods: Period[] = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'trimestral', label: 'Trimestral' },
    { key: 'anual', label: 'Anual' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const getDateRange = (period: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'semanal':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'mensal':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'trimestral':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'anual':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return { startDate, endDate: now };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSummaryData(),
        loadRecentReports()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      // Buscar coletas do período
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate)
      );
      const coletasSnapshot = await getDocs(coletasQuery);
      
      // Buscar lotes
      const lotesQuery = query(collection(db, 'lotes'));
      const lotesSnapshot = await getDocs(lotesQuery);
      
      // Buscar árvores
      const arvoresQuery = query(collection(db, 'arvores'));
      const arvoresSnapshot = await getDocs(arvoresQuery);

      // Processar dados das coletas
      let totalProducao = 0;
      const producaoPorLote: { [key: string]: { total: number, codigo: string, nome: string } } = {};
      const coletasPorDia: { [key: string]: number } = {};

      // Criar mapa de lotes para referência
      const lotesMap: { [key: string]: any } = {};
      lotesSnapshot.docs.forEach(doc => {
        const loteData = doc.data();
        lotesMap[doc.id] = {
          codigo: loteData.codigo || `L-${doc.id.slice(-3)}`,
          nome: loteData.nome || 'Lote sem nome'
        };
      });

      coletasSnapshot.docs.forEach(doc => {
        const coleta = doc.data();
        const quantidade = coleta.quantidade || 0;
        const dataColeta = coleta.dataColeta?.toDate();
        const loteId = coleta.loteId;

        totalProducao += quantidade;

        // Produção por lote
        if (loteId && lotesMap[loteId]) {
          if (!producaoPorLote[loteId]) {
            producaoPorLote[loteId] = { 
              total: 0, 
              codigo: lotesMap[loteId].codigo,
              nome: lotesMap[loteId].nome
            };
          }
          producaoPorLote[loteId].total += quantidade;
        }

        // Produção por dia
        if (dataColeta) {
          const dateKey = dataColeta.toDateString();
          coletasPorDia[dateKey] = (coletasPorDia[dateKey] || 0) + quantidade;
        }
      });

      // Encontrar melhor lote
      let melhorLote = 'N/A';
      let maiorProducao = 0;
      Object.entries(producaoPorLote).forEach(([loteId, data]) => {
        if (data.total > maiorProducao) {
          maiorProducao = data.total;
          melhorLote = data.codigo;
        }
      });

      // Calcular média diária
      const diasComColeta = Object.keys(coletasPorDia).length;
      const mediaDiaria = diasComColeta > 0 ? totalProducao / diasComColeta : 0;

      // Calcular crescimento (comparar com período anterior)
      const crescimento = await calcularCrescimento(selectedPeriod, totalProducao);

      setSummaryData({
        totalColhido: `${totalProducao.toFixed(1)} kg`,
        mediaDiaria: `${mediaDiaria.toFixed(1)} kg`,
        melhorLote,
        crescimento: `${crescimento > 0 ? '+' : ''}${crescimento.toFixed(1)}%`,
        totalLotes: lotesSnapshot.docs.length,
        totalArvores: arvoresSnapshot.docs.length,
        coletasRealizadas: coletasSnapshot.docs.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados de resumo:', error);
    }
  };

  const calcularCrescimento = async (period: string, producaoAtual: number): Promise<number> => {
    try {
      const now = new Date();
      const startDatePeriodoAnterior = new Date();
      const endDatePeriodoAnterior = new Date();

      switch (period) {
        case 'semanal':
          startDatePeriodoAnterior.setDate(now.getDate() - 14);
          endDatePeriodoAnterior.setDate(now.getDate() - 7);
          break;
        case 'mensal':
          startDatePeriodoAnterior.setMonth(now.getMonth() - 2);
          endDatePeriodoAnterior.setMonth(now.getMonth() - 1);
          break;
        case 'trimestral':
          startDatePeriodoAnterior.setMonth(now.getMonth() - 6);
          endDatePeriodoAnterior.setMonth(now.getMonth() - 3);
          break;
        case 'anual':
          startDatePeriodoAnterior.setFullYear(now.getFullYear() - 2);
          endDatePeriodoAnterior.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return 0;
      }

      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDatePeriodoAnterior),
        where('dataColeta', '<=', endDatePeriodoAnterior)
      );
      const coletasSnapshot = await getDocs(coletasQuery);
      
      let producaoAnterior = 0;
      coletasSnapshot.docs.forEach(doc => {
        const coleta = doc.data();
        producaoAnterior += coleta.quantidade || 0;
      });

      if (producaoAnterior === 0) return 0;
      return ((producaoAtual - producaoAnterior) / producaoAnterior) * 100;
    } catch (error) {
      console.error('Erro ao calcular crescimento:', error);
      return 0;
    }
  };

  const loadRecentReports = async () => {
    // Por enquanto, vamos simular relatórios recentes
    // Em uma implementação real, você salvaria os relatórios gerados no Firebase
    const mockReports: RecentReport[] = [
      {
        id: '1',
        title: `Relatório de Produção - ${selectedPeriod}`,
        type: 'Produção',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'completo',
        size: '2.1 MB'
      }
    ];
    setRecentReports(mockReports);
  };

  const formatLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      totalColhido: 'Total Colhido',
      mediaDiaria: 'Média Diária',
      melhorLote: 'Melhor Lote',
      crescimento: 'Crescimento',
      totalLotes: 'Total de Lotes',
      totalArvores: 'Total de Árvores',
      coletasRealizadas: 'Coletas Realizadas'
    };
    return labels[key] || key;
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      // Buscar todos os dados necessários
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate),
        orderBy('dataColeta', 'desc')
      );
      const coletasSnapshot = await getDocs(coletasQuery);
      
      const lotesQuery = query(collection(db, 'lotes'));
      const lotesSnapshot = await getDocs(lotesQuery);

      // Processar dados
      const coletas: ColetaData[] = [];
      const lotesMap: { [key: string]: any } = {};
      
      lotesSnapshot.docs.forEach(doc => {
        const loteData = doc.data();
        lotesMap[doc.id] = {
          codigo: loteData.codigo || `L-${doc.id.slice(-3)}`,
          nome: loteData.nome || 'Lote sem nome'
        };
      });

      coletasSnapshot.docs.forEach(doc => {
        const coletaData = doc.data();
        const loteInfo = lotesMap[coletaData.loteId] || {};
        
        coletas.push({
          id: doc.id,
          loteId: coletaData.loteId,
          arvoreId: coletaData.arvoreId,
          quantidade: coletaData.quantidade || 0,
          dataColeta: coletaData.dataColeta?.toDate() || new Date(),
          coletorNome: coletaData.coletorNome || 'Não informado',
          loteCodigo: loteInfo.codigo,
          loteNome: loteInfo.nome
        });
      });

      // Gerar conteúdo do relatório
      const reportContent = generateReportContent(coletas, summaryData);
      
      Alert.alert(
        'Relatório Gerado',
        'Relatório de produção gerado com sucesso!',
        [{ text: 'OK' }]
      );
      
      // Adicionar à lista de relatórios recentes
      const newReport: RecentReport = {
        id: Date.now().toString(),
        title: `Relatório de Produção - ${periods.find(p => p.key === selectedPeriod)?.label}`,
        type: 'Produção',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'completo',
        size: `${(reportContent.length / 1024).toFixed(1)} KB`,
        data: coletas
      };
      
      setRecentReports(prev => [newReport, ...prev].slice(0, 5));
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Falha ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateReportContent = (coletas: ColetaData[], summary: SummaryData): string => {
    const periodLabel = periods.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    let content = `RELATÓRIO DE PRODUÇÃO - ${periodLabel.toUpperCase()}\n`;
    content += `Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    content += `RESUMO EXECUTIVO\n`;
    content += `================\n`;
    content += `Total Colhido: ${summary.totalColhido}\n`;
    content += `Média Diária: ${summary.mediaDiaria}\n`;
    content += `Melhor Lote: ${summary.melhorLote}\n`;
    content += `Crescimento: ${summary.crescimento}\n`;
    content += `Total de Lotes: ${summary.totalLotes}\n`;
    content += `Total de Árvores: ${summary.totalArvores}\n`;
    content += `Coletas Realizadas: ${summary.coletasRealizadas}\n\n`;
    
    content += `DETALHAMENTO DAS COLETAS\n`;
    content += `========================\n`;
    
    if (coletas.length === 0) {
      content += `Nenhuma coleta realizada no período.\n`;
    } else {
      coletas.forEach((coleta, index) => {
        content += `${index + 1}. ${coleta.dataColeta.toLocaleDateString('pt-BR')} - `;
        content += `Lote: ${coleta.loteCodigo || 'N/A'} - `;
        content += `Quantidade: ${coleta.quantidade.toFixed(1)} kg - `;
        content += `Coletor: ${coleta.coletorNome}\n`;
      });
    }
    
    content += `\n--- Fim do Relatório ---\n`;
    
    return content;
  };

  const handleViewReport = (report: RecentReport) => {
    if (report.data) {
      const content = generateReportContent(report.data, summaryData);
      Alert.alert('Visualizar Relatório', content, [{ text: 'Fechar' }]);
    } else {
      Alert.alert('Visualizar', `Abrindo: ${report.title}`);
    }
  };

  const handleDownloadReport = async (report: RecentReport) => {
    Alert.alert('Download', `Baixando: ${report.title}`);
  };

  const handleShareReport = async (report: RecentReport) => {
    Alert.alert('Compartilhar', `Compartilhando: ${report.title}`);
  };

  const handleExportOption = (format: string) => {
    Alert.alert('Em Desenvolvimento', `Exportação em formato ${format} será implementada em breve`);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Carregando dados dos relatórios...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity 
            onPress={generateReport} 
            style={[styles.generateButton, generatingReport && styles.generateButtonDisabled]}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <>
                <ActivityIndicator size={20} color="white" />
                <Text style={styles.generateButtonText}>Gerando Relatório...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color="white" />
                <Text style={styles.generateButtonText}>Gerar Relatório de Produção</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relatórios de Produção Recentes</Text>
          <View style={styles.recentReportsList}>
            {recentReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Nenhum relatório gerado ainda</Text>
              </View>
            ) : (
              recentReports.map((report, index) => (
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
              ))
            )}
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
    fontSize: 20,
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
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentReportsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
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