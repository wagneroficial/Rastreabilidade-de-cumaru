import HomeHeader from '@/components/home/HomeHeader';
import ProductionCard from '@/components/home/ProductionCard';
import QuickActions from '@/components/home/QuickActions';
import RecentActivity from '@/components/home/RecentActivity';
import StatsCards from '@/components/home/StatsCards';
import { useHomeData } from '@/hooks/useHomeData';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleNotifications = () => {
    router.push('/notificacoes' as any);
  };

  const {
    kgHoje,
    lotesAtivos,
    arvoresCount,
    atividadeRecente,
    isAdmin,
    loading,
    percentualHoje,
    totalColhido,
    melhorLote,
  } = useHomeData();

  const stats = [
    { label: 'Total Colhido', value: totalColhido, icon: 'scale-outline' as const },
    { label: 'Total Árvores', value: arvoresCount.toString(), icon: 'leaf-outline' as const },
    { label: 'Lotes Ativos', value: lotesAtivos.toString(), icon: 'checkmark-circle-outline' as const },
    { label: 'Melhor Lote', value: melhorLote, icon: 'logo-buffer' as const },
  ];

  const quickActions = [
    {
      title: 'Relatórios',
      subtitle: 'Análise de produção',
      icon: 'bar-chart-outline' as const,
      route: '/relatorios',
      color: '#8b5cf6',
    },
    {
      title: 'Geolocalização',
      subtitle: 'Localização via GPS',
      icon: 'location-outline' as const,
      route: '/geolocalizacao',
      color: '#f97316',
    },
  ];

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
        <ProductionCard
          productionToday={kgHoje}  
          changePercent={percentualHoje}
        />
        <StatsCards stats={stats} />
        {isAdmin && <QuickActions actions={quickActions} onActionPress={handleQuickAction} />}
        <RecentActivity activities={atividadeRecente} isAdmin={isAdmin} />
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4f7bd3',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;