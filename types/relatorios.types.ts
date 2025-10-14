export interface Period {
  key: string;
  label: string;
}

export interface RecentReport {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'completo' | 'processando';
  size: string;
  data?: {
    coletas: ColetaData[];
    summaryData: SummaryData;
    chartData: {
      volume: ChartDataItem[];
      lotes: ChartDataItem[];
    };
  };
}

export interface SummaryData {
  totalColhido: string;
  mediaDiaria: string;
  melhorLote: string;
  crescimento: string;
  totalLotes: number;
  totalArvores: number;
  coletasRealizadas: number;
}

export interface ColetaData {
  id: string;
  loteId: string;
  arvoreId: string;
  quantidade: number;
  dataColeta: Date;
  coletorNome: string;
  loteCodigo?: string;
  loteNome?: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PerformanceIndicator {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  color: string;
  backgroundColor: string;
}

export type TabType = 'analytics' | 'relatorios';
export type ChartType = 'volume' | 'lotes';