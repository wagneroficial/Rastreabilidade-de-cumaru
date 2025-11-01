// hooks/useHomeData.ts
import { useEffect, useState } from 'react';
import { auth, db } from '@/app/services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

interface Lote {
  codigo?: string;
  status?: string;
  colaboradoresResponsaveis?: string[];
}

interface Coleta {
  quantidade?: number;
  dataColeta?: { toDate: () => Date };
  loteId?: string;
}

interface AtividadeRecente {
  action: string;
  lote: string;
  amount: string;
  time: string;
}

export const useHomeData = () => {
  const [lotesCount, setLotesCount] = useState(0);
  const [arvoresCount, setArvoresCount] = useState(0);
  const [kgHoje, setKgHoje] = useState(0);
  const [kgOntem, setKgOntem] = useState(0);
  const [lotesAtivos, setLotesAtivos] = useState(0);
  const [atividadeRecente, setAtividadeRecente] = useState<AtividadeRecente[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar tipo de usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as { tipo?: string };
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
        const lotesQuery = isAdmin
          ? collection(db, 'lotes')
          : query(
              collection(db, 'lotes'),
              where('colaboradoresResponsaveis', 'array-contains', currentUserId)
            );

        const lotesSnap = await getDocs(lotesQuery);
        setLotesCount(lotesSnap.size);

        const lotesMap: Record<string, string> = {};
        lotesSnap.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data() as Lote;
          lotesMap[doc.id] = data.codigo || 'Sem código';
          lotesDoUsuario.push(doc.id);
        });

        // Lotes ativos
        const ativos = lotesSnap.docs.filter(
          (doc) => (doc.data() as Lote).status === 'ativo'
        );
        setLotesAtivos(ativos.length);

        // --- ÁRVORES ---
        if (lotesDoUsuario.length > 0) {
          const arvoresQuery = query(
            collection(db, 'arvores'),
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
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        ontem.setHours(0, 0, 0, 0);

        let coletasQuery;
        if (isAdmin) {
          coletasQuery = collection(db, 'coletas');
        } else if (lotesDoUsuario.length > 0) {
          coletasQuery = query(
            collection(db, 'coletas'),
            where('loteId', 'in', lotesDoUsuario)
          );
        } else {
          setKgHoje(0);
          setKgOntem(0);
          setAtividadeRecente([]);
          return;
        }

        const coletasSnap = await getDocs(coletasQuery);
        let totalHoje = 0;
        let totalOntem = 0;
        const recentes: AtividadeRecente[] = [];

        coletasSnap.forEach((doc) => {
          const data = doc.data() as Coleta;
          const dataColeta = data.dataColeta?.toDate?.();
          if (!dataColeta) return;

          const dataColetaSemHora = new Date(dataColeta);
          dataColetaSemHora.setHours(0, 0, 0, 0);

          if (dataColetaSemHora.getTime() === hoje.getTime()) {
            totalHoje += data.quantidade || 0;
          } else if (dataColetaSemHora.getTime() === ontem.getTime()) {
            totalOntem += data.quantidade || 0;
          }

          const loteCodigo = data.loteId ? lotesMap[data.loteId] : 'Sem lote';

          recentes.push({
            action: 'Coleta realizada',
            lote: loteCodigo,
            amount: `${data.quantidade || 0} kg`,
            time: dataColeta.toLocaleDateString('pt-BR'),
          });
        });

        setKgHoje(totalHoje);
        setKgOntem(totalOntem);

        const recentesOrdenadas = recentes
          .sort(
            (a, b) =>
              new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          .slice(0, 5);

        setAtividadeRecente(recentesOrdenadas);
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
      }
    };

    carregarDados();
  }, [isAdmin, currentUserId, loading]);

  const percentualHoje =
    kgOntem > 0
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
  };
};
