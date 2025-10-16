// hooks/useLoteData.ts
import { auth, db } from '@/app/services/firebaseConfig.js';
import { ArvoreItem, Colaborador, HistoricoItem, Lote } from '@/types/lote.types';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useLoteData = (loteId: string | string[] | undefined) => {
  const [loteData, setLoteData] = useState<Lote | null>(null);
  const [arvores, setArvores] = useState<ArvoreItem[]>([]);
  const [historicoData, setHistoricoData] = useState<HistoricoItem[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
        setIsAdmin(false);
      }
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Carregar dados do lote
  useEffect(() => {
    if (!loteId) return;

    const id = Array.isArray(loteId) ? loteId[0] : loteId;
    if (!id) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await fetchLoteData(id);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    const cleanup = setupRealtimeListeners(id);

    return cleanup;
  }, [loteId]);

  const fetchLoteData = async (id: string) => {
    try {
      const loteDocRef = doc(db, 'lotes', id);
      const loteDoc = await getDoc(loteDocRef);

      if (loteDoc.exists()) {
        const data = loteDoc.data();
        
        setLoteData({
          id: loteDoc.id,
          codigo: data.codigo || `L-${loteDoc.id.slice(-3)}`,
          nome: data.nome || '',
          area: data.area || '0',
          arvores: data.arvores || 0,
          colhidoTotal: '0 kg',
          status: data.status || 'Inativo',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          ultimaColeta: 'Nunca',
          localizacao: data.localizacao || '',
          responsavel: data.responsavel || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          observacoes: data.observacoes || '',
          colaboradoresResponsaveis: data.colaboradoresResponsaveis || [],
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do lote:', error);
    }
  };

  const setupRealtimeListeners = (loteId: string) => {
    let coletasPorArvore: Record<string, { total: number, ultima: string, diasAtras: number }> = {};
    let coletasDoLote: HistoricoItem[] = [];
    let totalColetadoLote = 0;
    let ultimaColetaLote = 'Nunca';

    // Listener para árvores
    const unsubscribeArvores = onSnapshot(
      query(collection(db, 'arvores'), where('loteId', '==', loteId)),
      (arvoresSnapshot) => {
        const arvoresList: ArvoreItem[] = [];
        
        arvoresSnapshot.docs.forEach(doc => {
          const arv = doc.data();
          const coletasInfo = coletasPorArvore[doc.id];
          
          arvoresList.push({
            id: doc.id,
            codigo: arv.codigo || `ARV-${doc.id.slice(-3)}`,
            tipo: arv.especie || arv.tipo || 'Não informado',
            ultimaColeta: coletasInfo?.ultima || 'Nunca coletada',
            producaoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
            diasAtras: coletasInfo?.diasAtras || 0,
            estadoSaude: arv.estadoSaude || 'Saudável',
          });
        });
        
        setArvores(arvoresList);
        setLoteData(prev => prev ? { ...prev, arvores: arvoresList.length } : null);
      }
    );

    // Listener para coletas
    const unsubscribeColetas = onSnapshot(
      query(collection(db, 'coletas'), where('loteId', '==', loteId)),
      async (coletasSnapshot) => {
        coletasPorArvore = {};
        coletasDoLote = [];
        totalColetadoLote = 0;
        let ultimaDataColeta = new Date(0);

        for (const docSnapshot of coletasSnapshot.docs) {
          const data = docSnapshot.data();
          const quantidade = data.quantidade || 0;
          const dataColeta = data.dataColeta?.toDate?.() || new Date();
          const arvoreId = data.arvoreId;
          const coletorId = data.coletorId;

          totalColetadoLote += quantidade;

          if (dataColeta > ultimaDataColeta) {
            ultimaDataColeta = dataColeta;
            ultimaColetaLote = dataColeta.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            });
          }

          if (arvoreId) {
            if (!coletasPorArvore[arvoreId]) {
              coletasPorArvore[arvoreId] = { total: 0, ultima: '', diasAtras: 0 };
            }
            
            coletasPorArvore[arvoreId].total += quantidade;
            
            if (!coletasPorArvore[arvoreId].ultima || dataColeta > new Date(coletasPorArvore[arvoreId].ultima)) {
              coletasPorArvore[arvoreId].ultima = dataColeta.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
              });
              
              const hoje = new Date();
              const diffTime = Math.abs(hoje.getTime() - dataColeta.getTime());
              coletasPorArvore[arvoreId].diasAtras = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
          }

          let nomeColetorCompleto = 'Coletor não encontrado';
          try {
            if (coletorId) {
              const coletorDoc = await getDoc(doc(db, 'usuarios', coletorId));
              if (coletorDoc.exists()) {
                const coletorData = coletorDoc.data();
                nomeColetorCompleto = coletorData.nome || data.coletorNome || 'Coletor';
              } else {
                nomeColetorCompleto = data.coletorNome || 'Coletor';
              }
            }
          } catch (error) {
            nomeColetorCompleto = data.coletorNome || 'Coletor';
          }

          coletasDoLote.push({
                id: docSnapshot.id,
                data: dataColeta.toLocaleDateString('pt-BR'),
                responsavel: nomeColetorCompleto,
                quantidade: `${quantidade.toFixed(1)} kg`,
                observacoes: data.observacoes || '',
                hora: dataColeta.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                status: data.status || 'pendente' // ← ADICIONE ESTA LINHA
                });
          
        }

        coletasDoLote.sort((a, b) => {
          const dateA = new Date(a.data.split('/').reverse().join('-'));
          const dateB = new Date(b.data.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });

        setHistoricoData(coletasDoLote);
        
        setLoteData(prev => prev ? {
          ...prev,
          colhidoTotal: `${totalColetadoLote.toFixed(1)} kg`,
          ultimaColeta: ultimaColetaLote
        } : null);

        setArvores(currentArvores => 
          currentArvores.map(arvore => {
            const coletasInfo = coletasPorArvore[arvore.id];
            return {
              ...arvore,
              ultimaColeta: coletasInfo?.ultima || 'Nunca coletada',
              producaoTotal: coletasInfo ? `${coletasInfo.total.toFixed(1)} kg` : '0 kg',
              diasAtras: coletasInfo?.diasAtras || 0
            };
          })
        );
      }
    );

    return () => {
      unsubscribeArvores();
      unsubscribeColetas();
    };
  };

  const fetchColaboradores = async () => {
    setLoadingColaboradores(true);
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'colaborador'),
        where('status', '==', 'aprovado')
      );
      const querySnapshot = await getDocs(q);
      const colaboradoresList: Colaborador[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        colaboradoresList.push({
          id: doc.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          propriedade: data.propriedade
        });
      });
      
      setColaboradores(colaboradoresList);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      Alert.alert('Erro', 'Falha ao carregar colaboradores');
    } finally {
      setLoadingColaboradores(false);
    }
  };

  const handleStatusChange = async (novoStatus: string) => {
    if (!loteData || !loteId) return;
    
    setUpdatingStatus(true);
    try {
      const id = Array.isArray(loteId) ? loteId[0] : loteId;
      const loteDocRef = doc(db, 'lotes', id);
      
      await updateDoc(loteDocRef, {
        status: novoStatus
      });
      
      setLoteData(prev => prev ? { ...prev, status: novoStatus } : null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Falha ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleColaboradorToggle = async (colaboradorId: string) => {
    if (!loteData || !loteId) return;

    const currentColaboradores = loteData.colaboradoresResponsaveis || [];
    const isSelected = currentColaboradores.includes(colaboradorId);
    
    let newColaboradores: string[];
    if (isSelected) {
      newColaboradores = currentColaboradores.filter(id => id !== colaboradorId);
    } else {
      newColaboradores = [...currentColaboradores, colaboradorId];
    }

    try {
      const id = Array.isArray(loteId) ? loteId[0] : loteId;
      const loteDocRef = doc(db, 'lotes', id);
      
      await updateDoc(loteDocRef, {
        colaboradoresResponsaveis: newColaboradores
      });
      
      setLoteData(prev => prev ? { 
        ...prev, 
        colaboradoresResponsaveis: newColaboradores 
      } : null);
      
    } catch (error) {
      console.error('Erro ao atualizar colaboradores:', error);
      Alert.alert('Erro', 'Falha ao atualizar colaboradores responsáveis');
    }
  };

  return {
    loteData,
    arvores,
    historicoData,
    colaboradores,
    loading,
    userLoading,
    loadingColaboradores,
    updatingStatus,
    isAdmin,
    fetchColaboradores,
    handleStatusChange,
    handleColaboradorToggle,
  };
};