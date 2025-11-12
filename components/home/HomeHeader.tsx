// components/home/HomeHeader.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ✅ Importar serviço de notificações
import { subscribeToUserNotifications } from '@/hooks/userNotificacao';

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

  // Carregar dados do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('📄 Dados do usuário carregados:', data);
            setUserData({
              nome: data.nomeCompleto || data.displayName || data.nome || 'Usuário',
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setUserData(null);
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Listener em tempo real para notificações não lidas
  useEffect(() => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }

    console.log('📡 Inscrevendo para contagem de notificações do usuário:', currentUserId);

    const unsubscribe = subscribeToUserNotifications(currentUserId, (notifications) => {
      const unread = notifications.filter(n => !n.read).length;
      console.log(`🔔 ${unread} notificações não lidas`);
      setUnreadCount(unread);
    });

    return () => {
      console.log('🔌 Desinscrevendo de notificações no header');
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