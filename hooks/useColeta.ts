// @/hooks/useColeta.ts
import { db } from '@/app/services/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

// ✅ Exportar o tipo ColetaStatus
export type ColetaStatus = 'pendente' | 'aprovada' | 'rejeitada';

// ✅ Exportar a interface Coleta
export interface Coleta {
  id: string;
  loteNome: string;
  arvoreCodigo: string;
  quantidade: number;
  coletorNome: string;
  coletorId: string;
  status: ColetaStatus;
  data: string;
  observacoes?: string;
  createdAt: any;
  updatedAt: any;
}

const COLETAS_COLLECTION = 'coletas';

/**
 * Busca todas as coletas do sistema
 */
export const getAllColetas = async (): Promise<Coleta[]> => {
  try {
    const q = query(
      collection(db, COLETAS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const coletas: Coleta[] = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      coletas.push({
        id: document.id,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
        coletorId: data.coletorId,
        status: data.status,
        data: data.data,
        observacoes: data.observacoes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    console.log(`📋 ${coletas.length} coletas encontradas`);
    return coletas;
  } catch (error) {
    console.error('❌ Erro ao buscar coletas:', error);
    throw error;
  }
};

/**
 * Busca coletas de um coletor específico
 */
export const getColetasByColetor = async (coletorId: string): Promise<Coleta[]> => {
  try {
    const q = query(
      collection(db, COLETAS_COLLECTION),
      where('coletorId', '==', coletorId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const coletas: Coleta[] = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      coletas.push({
        id: document.id,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
        coletorId: data.coletorId,
        status: data.status,
        data: data.data,
        observacoes: data.observacoes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    console.log(`📋 ${coletas.length} coletas encontradas para o coletor ${coletorId}`);
    return coletas;
  } catch (error) {
    console.error('❌ Erro ao buscar coletas do coletor:', error);
    throw error;
  }
};

/**
 * Busca uma coleta específica por ID
 */
export const getColetaById = async (coletaId: string): Promise<Coleta | null> => {
  try {
    const coletaRef = doc(db, COLETAS_COLLECTION, coletaId);
    const coletaSnap = await getDoc(coletaRef);

    if (!coletaSnap.exists()) {
      console.log('❌ Coleta não encontrada');
      return null;
    }

    const data = coletaSnap.data();
    return {
      id: coletaSnap.id,
      loteNome: data.loteNome,
      arvoreCodigo: data.arvoreCodigo,
      quantidade: data.quantidade,
      coletorNome: data.coletorNome,
      coletorId: data.coletorId,
      status: data.status,
      data: data.data,
      observacoes: data.observacoes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar coleta:', error);
    throw error;
  }
};

/**
 * Cria uma nova coleta
 */
export const createColeta = async (
  coletaData: Omit<Coleta, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLETAS_COLLECTION), {
      ...coletaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Coleta criada com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar coleta:', error);
    throw error;
  }
};

/**
 * Atualiza o status de uma coleta
 */
export const updateColetaStatus = async (
  coletaId: string,
  newStatus: ColetaStatus
): Promise<void> => {
  try {
    const coletaRef = doc(db, COLETAS_COLLECTION, coletaId);
    await updateDoc(coletaRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Status da coleta ${coletaId} atualizado para ${newStatus}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar status da coleta:', error);
    throw error;
  }
};

/**
 * Atualiza os dados de uma coleta
 */
export const updateColeta = async (
  coletaId: string,
  coletaData: Partial<Omit<Coleta, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const coletaRef = doc(db, COLETAS_COLLECTION, coletaId);
    await updateDoc(coletaRef, {
      ...coletaData,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Coleta ${coletaId} atualizada com sucesso`);
  } catch (error) {
    console.error('❌ Erro ao atualizar coleta:', error);
    throw error;
  }
};

/**
 * Deleta uma coleta
 */
export const deleteColeta = async (coletaId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLETAS_COLLECTION, coletaId));
    console.log('✅ Coleta deletada:', coletaId);
  } catch (error) {
    console.error('❌ Erro ao deletar coleta:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para coletas
 */
export const subscribeToColetas = (
  callback: (coletas: Coleta[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLETAS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const coletas: Coleta[] = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      coletas.push({
        id: document.id,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
        coletorId: data.coletorId,
        status: data.status,
        data: data.data,
        observacoes: data.observacoes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    callback(coletas);
  });

  return unsubscribe;
};

/**
 * Listener em tempo real para coletas de um coletor específico
 */
export const subscribeToColetasByColetor = (
  coletorId: string,
  callback: (coletas: Coleta[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLETAS_COLLECTION),
    where('coletorId', '==', coletorId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const coletas: Coleta[] = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      coletas.push({
        id: document.id,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
        coletorId: data.coletorId,
        status: data.status,
        data: data.data,
        observacoes: data.observacoes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    callback(coletas);
  });

  return unsubscribe;
};

/**
 * Busca estatísticas de coletas
 */
export const getColetasStats = async (): Promise<{
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  quantidadeTotal: number;
}> => {
  try {
    const coletas = await getAllColetas();

    const stats = {
      total: coletas.length,
      pendentes: coletas.filter(c => c.status === 'pendente').length,
      aprovadas: coletas.filter(c => c.status === 'aprovada').length,
      rejeitadas: coletas.filter(c => c.status === 'rejeitada').length,
      quantidadeTotal: coletas.reduce((acc, c) => acc + c.quantidade, 0),
    };

    console.log('📊 Estatísticas das coletas:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    throw error;
  }
};

/**
 * Busca estatísticas de um coletor específico
 */
export const getColetasStatsByColetor = async (coletorId: string): Promise<{
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  quantidadeTotal: number;
}> => {
  try {
    const coletas = await getColetasByColetor(coletorId);

    const stats = {
      total: coletas.length,
      pendentes: coletas.filter(c => c.status === 'pendente').length,
      aprovadas: coletas.filter(c => c.status === 'aprovada').length,
      rejeitadas: coletas.filter(c => c.status === 'rejeitada').length,
      quantidadeTotal: coletas.reduce((acc, c) => acc + c.quantidade, 0),
    };

    console.log(`📊 Estatísticas do coletor ${coletorId}:`, stats);
    return stats;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do coletor:', error);
    throw error;
  }
};