// screens/HomeScreen.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import HomeHeader from '@/components/home/HomeHeader';
import QuickActions from '@/components/home/QuickActions';
import RecentActivity from '@/components/home/RecentActivity';
import StatsCards from '@/components/home/StatsCards';
import { useHomeData } from '@/hooks/useHomeData';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  
  const {
    lotesCount,
    arvoresCount,
    kgHoje,
    lotesAtivos,
    atividadeRecente,
    isAdmin,
    loading,
  } = useHomeData();

  const stats = [
    { 
      label: isAdmin ? 'Lotes Cadastrados' : 'Meus Lotes', 
      value: lotesCount.toString(), 
      icon: 'map-outline' as const 
    },
    { 
      label: 'Árvores Registradas', 
      value: arvoresCount.toString(), 
      icon: 'leaf-outline' as const 
    },
    { 
      label: 'Kg Colhidos Hoje', 
      value: kgHoje.toFixed(1), 
      icon: 'scale-outline' as const 
    },
    { 
      label: 'Lotes Ativos', 
      value: lotesAtivos.toString(), 
      icon: 'checkmark-circle-outline' as const 
    }
  ];

  const quickActions = [
    { title: 'Nova Coleta', icon: 'qr-code-outline' as const, route: 'coleta', color: '#10b981' },
    { title: 'Ver Lotes', icon: 'map-outline' as const, route: 'lotes', color: '#3b82f6' },
    { title: 'Relatórios', icon: 'bar-chart-outline' as const, route: 'relatorios', color: '#8b5cf6' },
    { title: 'Localização', icon: 'location-outline' as const, route: 'geolocalizacao', color: '#f97316' }
  ];

  const handleQuickAction = (route: string) => {
    router.push(`/${route}` as any);
  };

  const handleNotifications = () => {
    router.push('/notificacoes');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

      <HomeHeader isAdmin={isAdmin} onNotificationsPress={handleNotifications} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <StatsCards stats={stats} />
        
        <QuickActions actions={quickActions} onActionPress={handleQuickAction} />
        
        <RecentActivity activities={atividadeRecente} isAdmin={isAdmin} />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;