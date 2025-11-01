// hooks/useHomeData.ts
import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useHomeData = () => {
  const [lotesCount, setLotesCount] = useState(0);
  const [arvoresCount, setArvoresCount] = useState(0);
  const [kgHoje, setKgHoje] = useState(0);
  const [kgOntem, setKgOntem] = useState(0);
  const [lotesAtivos, setLotesAtivos] = useState(0);
  const [atividadeRecente, setAtividadeRecente] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalColhido, setTotalColhido] = useState(0);
  const [melhorLote, setMelhorLote] = useState('--');

  // Verificar tipo de usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.tipo === 'admin');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
          setIsAdmin(false);
        }
      } else {
        setCurrentUserId(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Carregar dados COM ATUALIZAÇÃO EM TEMPO REAL
  useEffect(() => {
    if (loading || !currentUserId) return;

    let unsubscribeLotes: (() => void) | undefined;
    let unsubscribeArvores: (() => void) | undefined;
    let unsubscribeColetas: (() => void) | undefined;

    const carregarDados = async () => {
      try {
        let lotesDoUsuario: string[] = [];

        // --- LOTES COM LISTENER EM TEMPO REAL ---
        let lotesQuery;
        if (isAdmin) {
          lotesQuery = collection(db, "lotes");
        } else {
          lotesQuery = query(
            collection(db, "lotes"),
            where('colaboradoresResponsaveis', 'array-contains', currentUserId)
          );
        }

        unsubscribeLotes = onSnapshot(lotesQuery, (lotesSnap) => {
          setLotesCount(lotesSnap.size);

          const lotesMap: Record<string, string> = {};
          lotesDoUsuario = [];
          
          lotesSnap.forEach(doc => {
            const data = doc.data();
            lotesMap[doc.id] = data.codigo || "Sem código";
            lotesDoUsuario.push(doc.id);
          });

          // Contar lotes ativos
          const ativos = lotesSnap.docs.filter(doc => doc.data().status === "ativo");
          setLotesAtivos(ativos.length);

          // --- ÁRVORES COM LISTENER ---
          if (lotesDoUsuario.length > 0) {
            const arvoresQuery = query(
              collection(db, "arvores"),
              where('loteId', 'in', lotesDoUsuario)
            );
            
            unsubscribeArvores = onSnapshot(arvoresQuery, (arvoresSnap) => {
              setArvoresCount(arvoresSnap.size);
            });
          } else {
            setArvoresCount(0);
          }

          // --- COLETAS COM LISTENER ---
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          ontem.setHours(0, 0, 0, 0);

          let coletasQuery;
          if (isAdmin) {
            coletasQuery = collection(db, "coletas");
          } else {
            if (lotesDoUsuario.length > 0) {
              coletasQuery = query(
                collection(db, "coletas"),
                where('loteId', 'in', lotesDoUsuario)
              );
            } else {
              setKgHoje(0);
              setKgOntem(0);
              setTotalColhido(0);
              setMelhorLote('--');
              setAtividadeRecente([]);
              return;
            }
          }

          unsubscribeColetas = onSnapshot(coletasQuery, (coletasSnap) => {
            let totalHoje = 0;
            let totalOntem = 0;
            let totalGeral = 0;
            let recentes: any[] = [];
            
            // Map para armazenar total por lote
            const totalPorLote: Record<string, { total: number; codigo: string }> = {};

            coletasSnap.forEach(doc => {
              const data = doc.data();
              const quantidade = data.quantidade || 0;
              const dataColeta = data.dataColeta?.toDate?.() || null;
              
              // Somar total geral
              totalGeral += quantidade;

              // Calcular total por lote
              if (data.loteId) {
                if (!totalPorLote[data.loteId]) {
                  totalPorLote[data.loteId] = {
                    total: 0,
                    codigo: lotesMap[data.loteId] || "Sem código"
                  };
                }
                totalPorLote[data.loteId].total += quantidade;
              }

              if (!dataColeta) return;

              const dataColetaSemHora = new Date(dataColeta);
              dataColetaSemHora.setHours(0, 0, 0, 0);

              if (dataColetaSemHora.getTime() === hoje.getTime()) {
                totalHoje += quantidade;
              } else if (dataColetaSemHora.getTime() === ontem.getTime()) {
                totalOntem += quantidade;
              }

              const loteCodigo = data.loteId ? lotesMap[data.loteId] : "Sem lote";

              recentes.push({
                action: "Coleta realizada",
                lote: loteCodigo,
                amount: `${quantidade} kg`,
                time: dataColeta.toLocaleDateString("pt-BR"),
                timestamp: dataColeta.getTime()
              });
            });

            // Encontrar o melhor lote
            let melhorLoteId = '';
            let maiorTotal = 0;
            
            Object.entries(totalPorLote).forEach(([loteId, data]) => {
              if (data.total > maiorTotal) {
                maiorTotal = data.total;
                melhorLoteId = loteId;
              }
            });

            setKgHoje(totalHoje);
            setKgOntem(totalOntem);
            setTotalColhido(totalGeral);
            setMelhorLote(melhorLoteId ? totalPorLote[melhorLoteId].codigo : '--');

            const recentesOrdenadas = recentes
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map(({ timestamp, ...rest }) => rest);

            setAtividadeRecente(recentesOrdenadas);
          });
        });

      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      }
    };

    carregarDados();

    // Cleanup dos listeners
    return () => {
      if (unsubscribeLotes) unsubscribeLotes();
      if (unsubscribeArvores) unsubscribeArvores();
      if (unsubscribeColetas) unsubscribeColetas();
    };
  }, [isAdmin, currentUserId, loading]);

  // --- Percentual hoje vs ontem ---
  const percentualHoje = kgOntem > 0
    ? `${(((kgHoje - kgOntem) / kgOntem) * 100).toFixed(1)}%`
    : kgHoje > 0
      ? '+100%'
      : '0%';

  return {
    lotesCount,
    arvoresCount,
    kgHoje,
    lotesAtivos,
    atividadeRecente,
    isAdmin,
    loading,
    percentualHoje,
    totalColhido: `${totalColhido.toFixed(1)}kg`, // ✅ ADICIONADO
    melhorLote, // ✅ ADICIONADO
  };
};