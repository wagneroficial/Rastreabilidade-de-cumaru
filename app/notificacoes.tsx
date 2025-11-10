// screens/NotificacoesScreen.tsx
import { auth } from '@/app/services/firebaseConfig';
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToUserNotifications,
  type Notification
} from '@/hooks/userNotificacao';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const NotificacoesScreen: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState('todas');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Pegar ID do usuário atual
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    }
  }, []);

  // Carregar notificações em tempo real
  useEffect(() => {
    if (!currentUserId) return;

    console.log('📡 Inscrevendo para notificações do usuário:', currentUserId);

    const unsubscribe = subscribeToUserNotifications(currentUserId, (notifs) => {
      console.log(`📬 ${notifs.length} notificações recebidas`);
      setNotifications(notifs);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Desinscrevendo de notificações');
      unsubscribe();
    };
  }, [currentUserId]);

  const filterOptions = [
    { key: 'todas', label: 'Todas' },
    { key: 'nao-lidas', label: 'Não Lidas' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'todas') return true;
    if (filter === 'nao-lidas') return !notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      console.log('✅ Notificação marcada como lida:', id);
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    if (!currentUserId) return;

    Alert.alert(
      'Marcar todas como lidas',
      'Todas as notificações serão marcadas como lidas',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              await markAllNotificationsAsRead(currentUserId);
              Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
            } catch (error) {
              console.error('❌ Erro ao marcar todas como lidas:', error);
              Alert.alert('Erro', 'Não foi possível marcar as notificações');
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return '1 dia atrás';
    if (days < 7) return `${days} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Notificações</Text>
              {unreadCount > 0 && (
                <Text style={styles.headerSubtitle}>{unreadCount} não lidas</Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllButtonText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContent}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilter(option.key)}
                style={[
                  styles.filterButton,
                  filter === option.key ? styles.filterButtonActive : styles.filterButtonInactive
                ]}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === option.key ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>
                {filter === 'nao-lidas' 
                  ? 'Você não tem notificações não lidas'
                  : 'Você não tem notificações'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.notificationCardUnread
                  ]}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <View style={[
                      styles.notificationIcon,
                      { backgroundColor: notification.backgroundColor }
                    ]}>
                      <Ionicons 
                        name={notification.icon as any} 
                        size={20} 
                        color={notification.color} 
                      />
                    </View>
                    <View style={styles.notificationBody}>
                      <View style={styles.notificationHeader}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.read && styles.notificationTitleUnread
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTime(notification.createdAt)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.notificationMessage,
                        !notification.read && styles.notificationMessageUnread
                      ]}>
                        {notification.message}
                      </Text>
                      {!notification.read && (
                        <View style={styles.unreadIndicator}>
                          <View style={styles.unreadDot} />
                          <Text style={styles.unreadText}>Nova</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 0, 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  markAllButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterContent: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#16a34a',
  },
  filterButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  filterButtonTextInactive: {
    color: '#4b5563',
  },
  scrollView: {
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    color: '#1f2937',
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notificationMessageUnread: {
    color: '#374151',
  },
  unreadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#16a34a',
    borderRadius: 4,
  },
  unreadText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
});

export default NotificacoesScreen;