// components/home/HomeHeader.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where
} from 'firebase/firestore';

interface HomeHeaderProps {
  isAdmin: boolean;
  onNotificationsPress: () => void;
}

interface UserData {
  nome: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ isAdmin, onNotificationsPress }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 🔥 Monitorar autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Usuário autenticado:', user.uid);
        setCurrentUserId(user.uid);
      } else {
        console.log('❌ Usuário deslogado');
        setCurrentUserId(null);
        setUserData(null);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LISTENER EM TEMPO REAL PARA DADOS DO USUÁRIO
  useEffect(() => {
    if (!currentUserId) {
      setUserData(null);
      return;
    }

    console.log('📡 Iniciando listener de dados do usuário:', currentUserId);

    const userDocRef = doc(db, 'usuarios', currentUserId);

    const unsubscribe: Unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const nomeUsuario = data.nomeCompleto || data.displayName || data.nome || 'Usuário';
          
          console.log('👤 Dados do usuário atualizados:', {
            nome: nomeUsuario,
            email: data.email,
            tipo: data.tipo
          });
          
          setUserData({
            nome: nomeUsuario,
          });
        } else {
          console.warn('⚠️ Documento de usuário não existe');
          setUserData({ nome: 'Usuário' });
        }
      },
      (error) => {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        setUserData({ nome: 'Usuário' });
      }
    );

    return () => {
      console.log('🛑 Removendo listener de dados do usuário');
      unsubscribe();
    };
  }, [currentUserId]);

  // 🔥 LISTENER EM TEMPO REAL PARA NOTIFICAÇÕES NÃO LIDAS
  useEffect(() => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }

    console.log('📡 Iniciando listener de notificações para usuário:', currentUserId);

    // Query para buscar notificações não lidas do usuário
    const notificationsQuery = query(
      collection(db, 'notificacoes'),
      where('userId', '==', currentUserId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    // ⚡ onSnapshot atualiza em tempo real
    const unsubscribe: Unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const unreadNotifications = snapshot.docs.length;
        console.log(`🔔 Notificações não lidas atualizadas: ${unreadNotifications}`);
        
        // Log das notificações para debug
        if (unreadNotifications > 0) {
          console.log('📬 Notificações não lidas:', 
            snapshot.docs.map(doc => ({
              id: doc.id,
              tipo: doc.data().tipo,
              mensagem: doc.data().mensagem,
              createdAt: doc.data().createdAt?.toDate?.()
            }))
          );
        }
        
        setUnreadCount(unreadNotifications);
      },
      (error) => {
        console.error('❌ Erro ao buscar notificações:', error);
        // Em caso de erro, tenta sem orderBy (se o índice não existir)
        console.log('⚠️ Tentando query sem orderBy...');
        
        const simpleQuery = query(
          collection(db, 'notificacoes'),
          where('userId', '==', currentUserId),
          where('read', '==', false)
        );
        
        const fallbackUnsubscribe = onSnapshot(
          simpleQuery,
          (snapshot) => {
            const count = snapshot.docs.length;
            console.log(`🔔 Notificações não lidas (fallback): ${count}`);
            setUnreadCount(count);
          },
          (fallbackError) => {
            console.error('❌ Erro no fallback de notificações:', fallbackError);
            setUnreadCount(0);
          }
        );
        
        return () => fallbackUnsubscribe();
      }
    );

    // 🧹 Cleanup: remove listener quando componente desmontar
    return () => {
      console.log('🛑 Removendo listener de notificações');
      unsubscribe();
    };
  }, [currentUserId]);

  const displayName = userData?.nome || 'Produtor';

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Olá, {displayName}</Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin
              ? 'Como vai sua colheita hoje?'
              : 'Como vai sua colheita hoje?'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
          
          {/* ✅ Badge de notificações não lidas */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default HomeHeader;