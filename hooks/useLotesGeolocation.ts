// hooks/useLotesGeolocation.ts
import { db } from '@/app/services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface LoteGeo {
  id: string;
  codigo: string;
  nome: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'planejado' | 'ativo' | 'inativo';
  area: string;
  arvores: number;
}

export const useLotesGeolocation = () => {
  const [lotes, setLotes] = useState<LoteGeo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const lotesSnapshot = await getDocs(collection(db, 'lotes'));
      
      const lotesData: LoteGeo[] = [];
      lotesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            lotesData.push({
              id: doc.id,
              codigo: data.codigo || doc.id,
              nome: data.nome || `Lote ${data.codigo}`,
              coordinates: { lat, lng },
              status: data.status || 'planejado',
              area: data.area || 'Não informado',
              arvores: data.arvores || 0,
            });
          }
        }
      });

      setLotes(lotesData);
    } catch (error) {
      console.error('Erro ao buscar lotes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os lotes.');
    } finally {
      setLoading(false);
    }
  };

  return { lotes, loading, refetch: fetchLotes };
};