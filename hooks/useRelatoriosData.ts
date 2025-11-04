import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '@/app/services/firebaseConfig.js';

import {
  ChartDataItem,
  ChartType,
  PerformanceIndicator,
  Period,
  RecentReport,
  SummaryData,
  TabType,
} from '../types/relatorios.types';

export const useRelatoriosData = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeChart, setActiveChart] = useState<ChartType>('volume');
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

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
    periods: any; volume: ChartDataItem[]; lotes: ChartDataItem[] 
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
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // ========================
  // 🔹 Helpers
  // ========================

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'semanal':
        startDate.setDate(now.getDate() - 6);
        break;
      case 'mensal':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'trimestral':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
    }

    endDate = now;
    return { startDate, endDate };
  };

  const calcularCrescimento = async (period: string, producaoAtual: number) => {
    try {
      const { startDate } = getDateRange(period);
      const previousStart = new Date(startDate);
      const previousEnd = new Date(startDate);

      switch (period) {
        case 'semanal':
          previousStart.setDate(startDate.getDate() - 7);
          break;
        case 'mensal':
          previousStart.setMonth(startDate.getMonth() - 1);
          break;
        case 'trimestral':
          previousStart.setMonth(startDate.getMonth() - 3);
          break;
      }
      previousEnd.setTime(startDate.getTime());

      const prevQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', previousStart),
        where('dataColeta', '<=', previousEnd)
      );

      const prevSnapshot = await getDocs(prevQuery);
      let producaoAnterior = 0;
      prevSnapshot.docs.forEach((doc) => {
        producaoAnterior += doc.data().quantidade || 0;
      });

      if (producaoAnterior === 0) return 100;
      return ((producaoAtual - producaoAnterior) / producaoAnterior) * 100;
    } catch (error) {
      console.error('Erro ao calcular crescimento:', error);
      return 0;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadSummaryData(), loadChartData(), loadRecentReports()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar dados dos relatórios.');
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🔹 Resumo
  // ========================

  const loadSummaryData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);

      const coletasQuery = query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate)
      );
      const coletasSnapshot = await getDocs(coletasQuery);
      const lotesSnapshot = await getDocs(collection(db, 'lotes'));
      const arvoresSnapshot = await getDocs(collection(db, 'arvores'));

      let totalProducao = 0;
      const producaoPorLote: Record<string, { total: number; codigo: string; nome: string }> = {};

      lotesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        producaoPorLote[doc.id] = {
          total: 0,
          codigo: data.codigo || `L-${doc.id.slice(-3)}`,
          nome: data.nome || 'Lote sem nome',
        };
      });

      coletasSnapshot.docs.forEach((doc) => {
        const coleta = doc.data();
        const loteId = coleta.loteId;
        const qtd = coleta.quantidade || 0;
        totalProducao += qtd;
        if (loteId && producaoPorLote[loteId]) producaoPorLote[loteId].total += qtd;
      });

      let melhorLote = 'N/A';
      let maiorProducao = 0;
      Object.entries(producaoPorLote).forEach(([_, lote]) => {
        if (lote.total > maiorProducao) {
          maiorProducao = lote.total;
          melhorLote = lote.codigo;
        }
      });

      const crescimento = await calcularCrescimento(selectedPeriod, totalProducao);

      const diasDoPeriodo =
        selectedPeriod === 'semanal'
          ? 7
          : selectedPeriod === 'mensal'
          ? endDate.getMonth() + 1
          : selectedPeriod === 'trimestral'
          ? 90
          : 0;

      setSummaryData({
        totalColhido: `${totalProducao.toFixed(1)} kg`,
        mediaDiaria: `${(totalProducao / diasDoPeriodo).toFixed(1)} kg`,
        melhorLote,
        crescimento: `${crescimento > 0 ? '+' : ''}${crescimento.toFixed(1)}%`,
        totalLotes: lotesSnapshot.docs.length,
        totalArvores: arvoresSnapshot.docs.length,
        coletasRealizadas: coletasSnapshot.docs.length,
      });

      setPerformanceIndicators([
        {
          icon: 'trophy',
          title: 'Lote Mais Produtivo',
          subtitle: melhorLote,
          value: `${maiorProducao.toFixed(1)} kg`,
          color: '#16a34a',
          backgroundColor: '#dcfce7',
        },
        {
          icon: 'calendar',
          title: 'Período Analisado',
          subtitle: periods.find((p) => p.key === selectedPeriod)?.label || '',
          value: `${totalProducao.toFixed(1)} kg`,
          color: '#0ea5e9',
          backgroundColor: '#e0f2fe',
        },
        {
          icon: 'leaf',
          title: 'Produtividade Média',
          subtitle: `${arvoresSnapshot.docs.length} árvores`,
          value:
            arvoresSnapshot.docs.length > 0
              ? `${(totalProducao / arvoresSnapshot.docs.length).toFixed(1)} kg`
              : '0 kg',
          color: '#facc15',
          backgroundColor: '#fef9c3',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  // ========================
  // 🔹 Dados dos Gráficos
  // ========================

  const loadChartData = async () => {
  try {
    const { startDate, endDate } = getDateRange(selectedPeriod);

    // Buscar apenas coletas dentro do período selecionado
    const coletasSnapshot = await getDocs(
      query(
        collection(db, 'coletas'),
        where('dataColeta', '>=', startDate),
        where('dataColeta', '<=', endDate),
        orderBy('dataColeta', 'asc')
      )
    );

    const volumeData: Record<string, number> = {};
    const producaoPorLote: Record<string, number> = {};

    coletasSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const quantidade = Number(data.quantidade) || 0;
      const dataColeta = data.dataColeta?.toDate ? data.dataColeta.toDate() : data.dataColeta;
      const loteId = data.loteId || 'N/A';
      if (!(dataColeta instanceof Date) || isNaN(dataColeta.getTime())) return;

      let label = '';
      if (selectedPeriod === 'semanal') {
        label = dataColeta.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else if (selectedPeriod === 'mensal') {
        label = dataColeta.toLocaleDateString('pt-BR', { month: 'short' });
      } else if (selectedPeriod === 'trimestral') {
        const quarter = Math.floor(dataColeta.getMonth() / 3) + 1;
        label = `T${quarter}`;
      }

      // Soma os valores reais
      volumeData[label] = (volumeData[label] || 0) + quantidade;
      producaoPorLote[loteId] = (producaoPorLote[loteId] || 0) + quantidade;
    });

    const volume: ChartDataItem[] = Object.entries(volumeData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(1)),
    }));

    const lotes: ChartDataItem[] = Object.entries(producaoPorLote)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    setChartData({ volume, lotes });
  } catch (error) {
    console.error('Erro ao carregar gráficos:', error);
  }
};

  // ========================
  // 🔹 Relatórios Recentes 3410.2
  // ========================

  const loadRecentReports = async () => {
    const mock: RecentReport[] = [
      {
        id: '1',
        title: `Relatório - ${new Date().toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`,
        type: 'Produção',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'completo',
        size: '2.3 MB',
        pdfUrl: '',
      },
    ];
    setRecentReports(mock);
  };

  return {
    selectedPeriod,
    setSelectedPeriod,
    activeTab,
    setActiveTab,
    activeChart,
    setActiveChart,
    loading,
    generatingReport,
    summaryData,
    chartData,
    performanceIndicators,
    recentReports,
    periods,
  };
};
