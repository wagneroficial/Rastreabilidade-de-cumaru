import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { db } from '@/app/services/firebaseConfig.js';
import {
    ChartDataItem,
    ChartType,
    ColetaData,
    PerformanceIndicator,
    Period,
    RecentReport,
    SummaryData,
    TabType,
} from '../types/relatorios.types';

export const useRelatoriosData = () => {
  // Estados principais
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [activeChart, setActiveChart] = useState<ChartType>('volume');
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Dados
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalColhido: '0 kg',
    mediaDiaria: '0 kg',
    melhorLote: 'N/A',
    crescimento: '0%',
    totalLotes: 0,
    totalArvores: 0,
    coletasRealizadas: 0,
  });

  const [chartData, setChartData] = useState<{
    volume: ChartDataItem[];
    lotes: ChartDataItem[];
  }>({
    volume: [],
    lotes: [],
  });

  const [performanceIndicators, setPerformanceIndicators] = useState<PerformanceIndicator[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  const periods: Period[] = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'trimestral', label: 'Trimestral' },
    { key: 'anual', label: 'Anual' },
  ];

  // Carregar dados quando o período muda
  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Funções auxiliares
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
      await Promise.all([loadSummaryData(), loadChartData(), loadRecentReports()]);
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
      const producaoPorLote: { [key: string]: { total: number; codigo: string; nome: string } } = {};
      const coletasPorDia: { [key: string]: number } = {};

      // Criar mapa de lotes para referência
      const lotesMap: { [key: string]: any } = {};
      lotesSnapshot.docs.forEach((doc) => {
        const loteData = doc.data();
        lotesMap[doc.id] = {
          codigo: loteData.codigo || `L-${doc.id.slice(-3)}`,
          nome: loteData.nome || 'Lote sem nome',
        };
      });

      coletasSnapshot.docs.forEach((doc) => {
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
              nome: lotesMap[loteId].nome,
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

      // Calcular crescimento
      const crescimento = await calcularCrescimento(selectedPeriod, totalProducao);

      setSummaryData({
        totalColhido: `${totalProducao.toFixed(1)} kg`,
        mediaDiaria: `${mediaDiaria.toFixed(1)} kg`,
        melhorLote,
        crescimento: `${crescimento > 0 ? '+' : ''}${crescimento.toFixed(1)}%`,
        totalLotes: lotesSnapshot.docs.length,
        totalArvores: arvoresSnapshot.docs.length,
        coletasRealizadas: coletasSnapshot.docs.length,
      });

      // Configurar indicadores de performance
      const indicators: PerformanceIndicator[] = [
        {
          icon: 'trophy',
          title: 'Lote Mais Produtivo',
          subtitle: melhorLote,
          value: `${maiorProducao.toFixed(1)} kg`,
          color: '#16a34a',
          backgroundColor: '#f0fdf4',
        },
        {
          icon: 'calendar',
          title: 'Período Analisado',
          subtitle: periods.find((p) => p.key === selectedPeriod)?.label || 'Mensal',
          value: `${totalProducao.toFixed(1)} kg`,
          color: '#2563eb',
          backgroundColor: '#eff6ff',
        },
        {
          icon: 'leaf',
          title: 'Produtividade Média',
          subtitle: `${arvoresSnapshot.docs.length} árvores`,
          value:
            arvoresSnapshot.docs.length > 0
              ? `${(totalProducao / arvoresSnapshot.docs.length).toFixed(1)} kg`
              : '0 kg',
          color: '#ea580c',
          backgroundColor: '#fff7ed',
        },
      ];

      setPerformanceIndicators(indicators);
    } catch (error) {
      console.error('Erro ao carregar dados de resumo:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);

      // Buscar coletas
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate)
      );
      const coletasSnapshot = await getDocs(coletasQuery);

      // Buscar lotes
      const lotesQuery = query(collection(db, 'lotes'));
      const lotesSnapshot = await getDocs(lotesQuery);

      // Criar mapa de lotes
      const lotesMap: { [key: string]: any } = {};
      lotesSnapshot.docs.forEach((doc) => {
        const loteData = doc.data();
        lotesMap[doc.id] = {
          codigo: loteData.codigo || `L-${doc.id.slice(-3)}`,
          nome: loteData.nome || 'Lote sem nome',
        };
      });

      // Dados por período (volume)
      const volumeData: { [key: string]: number } = {};
      const producaoPorLote: { [key: string]: number } = {};

      coletasSnapshot.docs.forEach((doc) => {
        const coleta = doc.data();
        const quantidade = coleta.quantidade || 0;
        const dataColeta = coleta.dataColeta?.toDate();
        const loteId = coleta.loteId;

        // Volume por período
        if (dataColeta) {
          let periodKey = '';
          if (selectedPeriod === 'semanal') {
            periodKey = `Sem ${Math.ceil((dataColeta.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
          } else if (selectedPeriod === 'mensal') {
            periodKey = dataColeta.toLocaleDateString('pt-BR', { month: 'short' });
          } else if (selectedPeriod === 'trimestral') {
            const quarter = Math.floor(dataColeta.getMonth() / 3) + 1;
            periodKey = `T${quarter}`;
          } else {
            periodKey = dataColeta.getFullYear().toString();
          }

          volumeData[periodKey] = (volumeData[periodKey] || 0) + quantidade;
        }

        // Produção por lote
        if (loteId && lotesMap[loteId]) {
          const loteKey = lotesMap[loteId].codigo;
          producaoPorLote[loteKey] = (producaoPorLote[loteKey] || 0) + quantidade;
        }
      });

      // Converter para formato do gráfico
      const volumeChartData: ChartDataItem[] = Object.entries(volumeData).map(([key, value]) => ({
        name: key,
        value: parseFloat(value.toFixed(1)),
      }));

      const lotesChartData: ChartDataItem[] = Object.entries(producaoPorLote)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([key, value]) => ({
          name: key,
          value: parseFloat(value.toFixed(1)),
        }));

      setChartData({
        volume: volumeChartData,
        lotes: lotesChartData,
      });
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
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
      coletasSnapshot.docs.forEach((doc) => {
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
    const mockReports: RecentReport[] = [
      {
        id: '1',
        title: `Relatório ${periods.find((p) => p.key === selectedPeriod)?.label} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        type: 'Produção',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'completo',
        size: '2.1 MB',
      },
    ];
    setRecentReports(mockReports);
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);

      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate),
        orderBy('dataColeta', 'desc')
      );
      const coletasSnapshot = await getDocs(coletasQuery);

      const lotesQuery = query(collection(db, 'lotes'));
      const lotesSnapshot = await getDocs(lotesQuery);

      const coletas: ColetaData[] = [];
      const lotesMap: { [key: string]: any } = {};

      lotesSnapshot.docs.forEach((doc) => {
        const loteData = doc.data();
        lotesMap[doc.id] = {
          codigo: loteData.codigo || `L-${doc.id.slice(-3)}`,
          nome: loteData.nome || 'Lote sem nome',
        };
      });

      coletasSnapshot.docs.forEach((doc) => {
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
          loteNome: loteInfo.nome,
        });
      });

      const reportContent = generateReportContent(coletas, summaryData, chartData);

      Alert.alert('Relatório Gerado', 'Relatório completo com analytics gerado com sucesso!', [{ text: 'OK' }]);

      const newReport: RecentReport = {
        id: Date.now().toString(),
        title: `Relatório Analytics - ${periods.find((p) => p.key === selectedPeriod)?.label}`,
        type: 'Analytics',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'completo',
        size: `${(reportContent.length / 1024).toFixed(1)} KB`,
        data: { coletas, chartData, summaryData },
      };

      setRecentReports((prev) => [newReport, ...prev].slice(0, 5));
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Falha ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateReportContent = (coletas: ColetaData[], summary: SummaryData, charts: any): string => {
    const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label || selectedPeriod;
    const { startDate, endDate } = getDateRange(selectedPeriod);

    let content = `RELATÓRIO DE ANALYTICS E PRODUÇÃO - ${periodLabel.toUpperCase()}\n`;
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

    content += `ANÁLISE POR VOLUME\n`;
    content += `==================\n`;
    charts.volume.forEach((item: ChartDataItem, index: number) => {
      content += `${index + 1}. ${item.name}: ${item.value} kg\n`;
    });

    content += `\nANÁLISE POR LOTE\n`;
    content += `================\n`;
    charts.lotes.forEach((item: ChartDataItem, index: number) => {
      content += `${index + 1}. ${item.name}: ${item.value} kg\n`;
    });

    content += `\nDETALHAMENTO DAS COLETAS\n`;
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
      const content = generateReportContent(
        report.data.coletas || [],
        report.data.summaryData || summaryData,
        report.data.chartData || chartData
      );
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

  return {
    // Estados
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

    // Setters
    setSelectedPeriod,
    setActiveTab,
    setActiveChart,

    // Funções
    generateReport,
    handleViewReport,
    handleDownloadReport,
    handleShareReport,
    handleExportOption,
  };
};