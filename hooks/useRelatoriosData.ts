import { useEffect, useState } from 'react';
import { db } from '@/app/services/firebaseConfig';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

interface VisaoGeralItem {
  loteId: string;
  loteNome: string;
  producao: number;
  data?: string;
}

export const useRelatoriosData = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lotes' | 'periodo'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'última semana' | 'último mês' | 'último trimestre'>('última semana');
  const [periods] = useState(['última semana', 'último mês', 'último trimestre']);

  const [visaoGeralData, setVisaoGeralData] = useState<VisaoGeralItem[]>([]);
  const [lotesData, setLotesData] = useState<any[]>([]);
  const [periodData, setPeriodData] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lotes'), async (lotesSnap) => {
      try {
        setLoading(true);

        const lotes = lotesSnap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome || `Lote ${doc.id.slice(-4)}`,
        }));

        const coletasSnap = await getDocs(collection(db, 'coletas'));
        const coletas = coletasSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            loteId: data.loteId,
            loteNome: data.loteNome,
            quantidade: data.quantidade || 0,
            dataColeta: data.dataColeta?.toDate?.() || new Date(),
          };
        });

        // ----- VISÃO GERAL -----
        const dadosAgrupados = lotes.map((lote) => {
          const coletasDoLote = coletas.filter((c) => c.loteId === lote.id);
          const producaoTotal = coletasDoLote.reduce((acc, c) => acc + c.quantidade, 0);
          const dataMaisRecente =
            coletasDoLote.length > 0
              ? new Date(Math.max(...coletasDoLote.map((c) => c.dataColeta.getTime()))).toLocaleDateString('pt-BR')
              : undefined;

          return {
            loteId: lote.id,
            loteNome: lote.nome,
            producao: producaoTotal,
            data: dataMaisRecente,
          };
        });

        setVisaoGeralData(dadosAgrupados);

        // ----- POR LOTE -----
        setLotesData(dadosAgrupados);

        // ----- POR PERÍODO (todas as coletas) -----
        const periodFormat = coletas.map((c) => ({
          loteId: c.loteId,
          loteNome: c.loteNome || lotes.find(l => l.id === c.loteId)?.nome || 'Sem nome',
          producao: c.quantidade,
          data: c.dataColeta, // mantém Date real
        }));
        setPeriodData(periodFormat);
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return {
    loading,
    activeTab,
    setActiveTab,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    visaoGeralData,
    lotesData,
    periodData, // ← usado em PeriodoView
  };
};
