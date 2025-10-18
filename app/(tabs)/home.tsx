// screens/HomeScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import HomeHeader from '@/components/home/HomeHeader';
import QuickActions from '@/components/home/QuickActions';
import RecentActivity from '@/components/home/RecentActivity';
import StatsCards from '@/components/home/StatsCards';
import { useHomeData } from '@/hooks/useHomeData';
import NovoLoteModal from '@/components/novo_lote'; // IMPORTAR O MODAL
import ProductionCard from '@/components/home/ProductionCard';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [novoLoteVisible, setNovoLoteVisible] = useState(false);

  const {
    kgHoje,
    lotesAtivos,
    arvoresCount,
    atividadeRecente,
    isAdmin,
    loading,
  } = useHomeData();

  const stats = [
    { label: 'Total Colhido', value: kgHoje.toFixed(1), icon: 'scale-outline' as const },
    { label: 'Total Árvores', value: arvoresCount.toString(), icon: 'leaf-outline' as const },
    { label: 'Lotes Ativos', value: lotesAtivos.toString(), icon: 'checkmark-circle-outline' as const },
    { label: 'Melhor Lote', value: kgHoje.toFixed(1), icon: "logo-buffer" as const },
  ];

  const quickActions = [
    { title: 'Relatórios', subtitle: 'Análise de produção', icon: 'bar-chart-outline' as const, route: 'relatorios', color: '#8b5cf6' },
    { title: 'Localização', subtitle: 'GPS das árvores', icon: 'location-outline' as const, route: 'geolocalizacao', color: '#f97316' }
  ];

  const handleQuickAction = (route: string) => {
    if (route === '') {
      // Abrir modal do novo lote
      setNovoLoteVisible(true);
    } else {
      router.push(`/${route}` as any);
    }
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
        <ProductionCard productionToday={'12.5 kg'} changePercent={'+8% em relação a ontem'} />
        <StatsCards stats={stats} />
        <QuickActions actions={quickActions} onActionPress={handleQuickAction} />
        <RecentActivity activities={atividadeRecente} isAdmin={isAdmin} />
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal do Novo Lote */}
      <NovoLoteModal
        visible={novoLoteVisible}
        onClose={() => setNovoLoteVisible(false)}
        onSuccess={(novoLote) => {
          console.log('Novo lote criado:', novoLote);
          // Aqui você pode recarregar os dados do useHomeData ou atualizar o estado local
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6b7280' },
  scrollView: { flex: 1 },
  bottomSpacing: { height: 20 },
});

export default HomeScreen;
