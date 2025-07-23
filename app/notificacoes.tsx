import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  backgroundColor: string;
}

const NotificacoesScreen: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState('todas');

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'clima',
      title: 'Alerta Climático',
      message: 'Previsão de chuva forte para os próximos 2 dias. Considere adiar coletas.',
      time: '2 horas atrás',
      read: false,
      icon: 'cloud-outline',
      color: '#2563eb',
      backgroundColor: '#eff6ff'
    },
    {
      id: 2,
      type: 'coleta',
      title: 'Nova Coleta Registrada',
      message: 'Coleta de 8.5kg registrada no Lote A-12, árvore CUM-001.',
      time: '3 horas atrás',
      read: true,
      icon: 'leaf-outline',
      color: '#16a34a',
      backgroundColor: '#f0fdf4'
    },
    {
      id: 3,
      type: 'meta',
      title: 'Meta Mensal Alcançada',
      message: 'Parabéns! Você alcançou 89% da meta mensal de colheita.',
      time: '1 dia atrás',
      read: false,
      icon: 'trophy-outline',
      color: '#d97706',
      backgroundColor: '#fffbeb'
    },
    {
      id: 4,
      type: 'sistema',
      title: 'Atualização Disponível',
      message: 'Nova versão do CumaruApp disponível com melhorias de performance.',
      time: '2 dias atrás',
      read: true,
      icon: 'download-outline',
      color: '#7c3aed',
      backgroundColor: '#f3e8ff'
    },
    {
      id: 5,
      type: 'pendencia',
      title: 'Lote Pendente',
      message: 'Lote B-07 não teve coletas registradas há 3 dias.',
      time: '2 dias atrás',
      read: false,
      icon: 'alert-circle-outline',
      color: '#ea580c',
      backgroundColor: '#fff7ed'
    },
    {
      id: 6,
      type: 'relatorio',
      title: 'Relatório Pronto',
      message: 'Relatório de produção mensal foi gerado e está disponível.',
      time: '3 dias atrás',
      read: true,
      icon: 'document-text-outline',
      color: '#4f46e5',
      backgroundColor: '#eef2ff'
    }
  ];

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

  const markAsRead = (id: number) => {
    // Simular marcar como lida
    console.log(`Marcando notificação ${id} como lida`);
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Marcar todas como lidas',
      'Todas as notificações serão marcadas como lidas',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

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
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
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
              <Text style={styles.emptyStateText}>Nenhuma notificação encontrada</Text>
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
                  onPress={() => markAsRead(notification.id)}
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
                          {notification.time}
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
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    color: '#aa',
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: '#2E8B57',
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
    backgroundColor: '#2E8B57',
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
    borderLeftColor: '#ea580c',
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
    backgroundColor: '#ea580c',
    borderRadius: 4,
  },
  unreadText: {
    fontSize: 12,
    color: '#ea580c',
    fontWeight: '500',
  },
});

export default NotificacoesScreen;