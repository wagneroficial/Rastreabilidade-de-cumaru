// hooks/useRelatoriosData.ts
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>('último mês');
  const [periods] = useState(['última semana', 'último mês', 'último trimestre']);

  const [visaoGeralData, setVisaoGeralData] = useState<VisaoGeralItem[]>([]);
  const [lotesData, setLotesData] = useState<any[]>([]);
  const [periodData, setPeriodData] = useState<any[]>([]);

  useEffect(() => {
    const unsubLotes = onSnapshot(collection(db, 'lotes'), async (lotesSnap) => {
      try {
        setLoading(true);

        const lotes = lotesSnap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome || `Lote ${doc.id.slice(-4)}`,
        }));

        const coletasSnap = await getDocs(collection(db, 'coletas'));
        const coletas = coletasSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          loteId: doc.data().loteId,
          quantidade: doc.data().quantidade || 0,
          dataColeta: doc.data().dataColeta?.toDate?.() || new Date(),
        }));

        // Agrupar produção total por lote
        const dadosAgrupados = lotes.map((lote) => {
          const coletasDoLote = coletas.filter((c) => c.loteId === lote.id);
          const producaoTotal = coletasDoLote.reduce((acc, c) => acc + c.quantidade, 0);
          const dataMaisRecente =
            coletasDoLote.length > 0
              ? new Date(
                  Math.max(...coletasDoLote.map((c) => c.dataColeta.getTime()))
                ).toLocaleDateString('pt-BR')
              : undefined;

          return {
            loteId: lote.id,
            loteNome: lote.nome,
            producao: producaoTotal,
            data: dataMaisRecente,
          };
        });

        setVisaoGeralData(dadosAgrupados);
        setLotesData(dadosAgrupados);

        // 🔹 Filtragem por período
        const agora = new Date();
        const periodoFiltrado = coletas.filter((c) => {
          const data = c.dataColeta;
          if (selectedPeriod === 'última semana') {
            const umaSemana = 7 * 24 * 60 * 60 * 1000;
            return agora.getTime() - data.getTime() <= umaSemana;
          }
          if (selectedPeriod === 'último mês') {
            const umMes = 30 * 24 * 60 * 60 * 1000;
            return agora.getTime() - data.getTime() <= umMes;
          }
          if (selectedPeriod === 'último trimestre') {
            const tresMeses = 90 * 24 * 60 * 60 * 1000;
            return agora.getTime() - data.getTime() <= tresMeses;
          }
          return true;
        });

        const dadosPorPeriodo = periodoFiltrado.map((c) => ({
          loteNome:
            lotes.find((l) => l.id === c.loteId)?.nome || 'Lote desconhecido',
          producao: c.quantidade,
          data: c.dataColeta.toLocaleDateString('pt-BR'),
        }));

        setPeriodData(dadosPorPeriodo);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubLotes();
  }, [selectedPeriod]);

  return {
    loading,
    activeTab,
    setActiveTab,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    visaoGeralData,
    lotesData,
    periodData,
  };
};
