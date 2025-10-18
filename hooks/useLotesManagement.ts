// hooks/useLotesManagement.ts
import { db } from '@/app/services/firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface Lote {
  id: string;
  codigo: string;
  nome: string;
  area: string;
  status: string;
}

export const useLotesManagement = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLotes = async () => {
    if (lotes.length > 0) return; // Não buscar se já tem
    
    setLoading(true);
    try {
      const q = query(collection(db, 'lotes'), orderBy('nome'));
      const querySnapshot = await getDocs(q);
      const lotesList: Lote[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lotesList.push({
          id: doc.id,
          codigo: data.codigo || `L-${doc.id.slice(-3)}`,
          nome: data.nome || `Lote ${doc.id.slice(-6)}`,
          area: data.area || '0',
          status: data.status || 'Inativo'
        });
      });
      
      setLotes(lotesList);
    } catch (error) {
      console.error('Erro ao buscar lotes:', error);
      Alert.alert('Erro', 'Erro ao carregar lotes');
    } finally {
      setLoading(false);
    }
  };

  const getLoteNome = (loteId: string) => {
    const lote = lotes.find(l => l.id === loteId);
    return lote?.nome || 'Lote não encontrado';
  };

  const getLoteCodigo = (loteId: string) => {
    const lote = lotes.find(l => l.id === loteId);
    return lote?.codigo || 'N/A';
  };

  return {
    lotes,
    loading,
    fetchLotes,
    getLoteNome,
    getLoteCodigo
  };
};