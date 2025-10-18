// hooks/useUsers.ts
import { db } from '@/app/services/firebaseConfig';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  propriedade: string;
  tipo: string;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'desativado';
  criadoEm: Date;
  atualizadoEm?: Date;
  aprovadoPor?: string;
  motivoReprovacao?: string;
  lotesAtribuidos?: string[];
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          propriedade: data.propriedade,
          tipo: data.tipo || 'colaborador',
          status: data.status || 'pendente',
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate(),
          aprovadoPor: data.aprovadoPor,
          motivoReprovacao: data.motivoReprovacao,
          lotesAtribuidos: data.lotesAtribuidos || []
        });
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar usuários:', error);
      Alert.alert('Erro', 'Erro ao carregar usuários');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserStatus = async (
    userId: string, 
    newStatus: 'aprovado' | 'reprovado' | 'desativado', 
    motivo?: string
  ) => {
    try {
      const updateData: any = {
        status: newStatus,
        atualizadoEm: new Date(),
        aprovadoPor: 'admin@sistema.com' // Substituir pelo usuário logado
      };

      if (newStatus === 'reprovado' && motivo) {
        updateData.motivoReprovacao = motivo;
      } else if (newStatus === 'aprovado') {
        updateData.motivoReprovacao = null;
      }

      await updateDoc(doc(db, 'usuarios', userId), updateData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  };

  const updateUserLotes = async (userId: string, lotes: string[]) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        lotesAtribuidos: lotes,
        atualizadoEm: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lotes:', error);
      return false;
    }
  };

  return {
    users,
    loading,
    updateUserStatus,
    updateUserLotes
  };
};