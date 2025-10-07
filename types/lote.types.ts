// types/lote.types.ts

export interface Lote {
  id: string;
  codigo: string;
  nome: string;
  area: string;
  arvores: number;
  colhidoTotal: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  ultimaColeta: string;
  localizacao?: string;
  responsavel?: string;
  latitude?: string;
  longitude?: string;
  observacoes?: string;
  colaboradoresResponsaveis?: string[];
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  propriedade?: string;
}

export interface HistoricoItem {
  id: string;
  data: string;
  responsavel: string;
  quantidade: string;
  observacoes?: string;
  hora: string;
  status: 'pendente' | 'aprovada' | 'rejeitada'; 
}

export interface ArvoreItem {
  id: string;
  codigo: string;
  tipo: string;
  ultimaColeta: string;
  producaoTotal: string;
  diasAtras: number;
  estadoSaude?: string;
}

export interface ArvoreFormData {
  idArvore: string;
  estadoSaude: string;
  especie: string;
  dataPlantio: string;
  latitude: string;
  longitude: string;
  notasAdicionais: string;
}

export type TabType = 'visao-geral' | 'arvores' | 'historico';