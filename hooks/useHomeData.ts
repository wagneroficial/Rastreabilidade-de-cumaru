// hooks/useHomeData.ts
import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useHomeData = () => {
  const [lotesCount, setLotesCount] = useState(0);
  const [arvoresCount, setArvoresCount] = useState(0);
  const [kgHoje, setKgHoje] = useState(0);
  const [lotesAtivos, setLotesAtivos] = useState(0);
  const [atividadeRecente, setAtividadeRecente] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Carregar dados
  useEffect(() => {
    if (loading || !currentUserId) return;

    const carregarDados = async () => {
      try {
        let lotesDoUsuario: string[] = [];

        // --- LOTES ---
        let lotesQuery;
        if (isAdmin) {
          lotesQuery = collection(db, "lotes");
        } else {
          lotesQuery = query(
            collection(db, "lotes"),
            where('colaboradoresResponsaveis', 'array-contains', currentUserId)
          );
        }

        const lotesSnap = await getDocs(lotesQuery);
        setLotesCount(lotesSnap.size);

        const lotesMap: Record<string, string> = {};
        lotesSnap.forEach(doc => {
          const data = doc.data();
          lotesMap[doc.id] = data.codigo || "Sem código";
          lotesDoUsuario.push(doc.id);
        });

        // Contar lotes ativos
        const ativos = lotesSnap.docs.filter(doc => doc.data().status === "ativo");
        setLotesAtivos(ativos.length);

        // --- ÁRVORES ---
        if (lotesDoUsuario.length > 0) {
          const arvoresQuery = query(
            collection(db, "arvores"),
            where('loteId', 'in', lotesDoUsuario)
          );
          const arvoresSnap = await getDocs(arvoresQuery);
          setArvoresCount(arvoresSnap.size);
        } else {
          setArvoresCount(0);
        }

        // --- COLETAS ---
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

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
            setAtividadeRecente([]);
            return;
          }
        }

        const coletasSnap = await getDocs(coletasQuery);
        let totalHoje = 0;
        let recentes: any[] = [];

        coletasSnap.forEach(doc => {
          const data = doc.data();
          const dataColeta = data.dataColeta?.toDate?.() || null;

          if (dataColeta) {
            const dataColetaSemHora = new Date(dataColeta);
            dataColetaSemHora.setHours(0, 0, 0, 0);

            if (dataColetaSemHora.getTime() === hoje.getTime()) {
              totalHoje += data.quantidade || 0;
            }

            const loteCodigo = data.loteId ? lotesMap[data.loteId] : "Sem lote";

            recentes.push({
              action: "Coleta realizada",
              lote: loteCodigo,
              amount: `${data.quantidade || 0} kg`,
              time: dataColeta.toLocaleDateString("pt-BR"),
              timestamp: dataColeta.getTime()
            });
          }
        });

        setKgHoje(totalHoje);

        const recentesOrdenadas = recentes
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map(({ timestamp, ...rest }) => rest);

        setAtividadeRecente(recentesOrdenadas);

      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      }
    };

    carregarDados();
  }, [isAdmin, currentUserId, loading]);

  return {
    lotesCount,
    arvoresCount,
    kgHoje,
    lotesAtivos,
    atividadeRecente,
    isAdmin,
    loading,
  };
};