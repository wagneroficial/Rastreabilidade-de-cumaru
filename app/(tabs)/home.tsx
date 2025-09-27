import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../services/firebaseConfig';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const [lotesCount, setLotesCount] = useState(0);
  const [arvoresCount, setArvoresCount] = useState(0);
  const [kgHoje, setKgHoje] = useState(0);
  const [lotesAtivos, setLotesAtivos] = useState(0);
  const [atividadeRecente, setAtividadeRecente] = useState<any[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // --- LOTES ---
        const lotesSnap = await getDocs(collection(db, "lotes"));
        setLotesCount(lotesSnap.size);

        // cria mapa de ID -> código
        const lotesMap: Record<string, string> = {};
        lotesSnap.forEach(doc => {
          const data = doc.data();
          lotesMap[doc.id] = data.codigo || "Sem código";
        });

        // --- ÁRVORES ---
        const arvoresSnap = await getDocs(collection(db, "arvores"));
        setArvoresCount(arvoresSnap.size);

        // --- COLETAS ---
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const coletasSnap = await getDocs(collection(db, "coletas"));
        let totalHoje = 0;
        let recentes: any[] = [];

        coletasSnap.forEach(doc => {
          const data = doc.data();
          const dataColeta = data.data?.toDate?.() || null;

          if (dataColeta && dataColeta >= hoje) {
            totalHoje += data.quantidade || 0;
          }

          // pega o código do lote usando o map
          const loteCodigo = data.loteId ? lotesMap[data.loteId] : "Sem lote";

          recentes.push({
            action: "Coleta realizada",
            lote: loteCodigo,
            amount: `${data.quantidade || 0} kg`,
            time: dataColeta
              ? dataColeta.toLocaleDateString("pt-BR")
              : "Sem data"
          });
        });

        setKgHoje(totalHoje);
        setAtividadeRecente(recentes.slice(0, 5));

        // --- LOTES ATIVOS ---
        const ativos = lotesSnap.docs.filter(doc => doc.data().status === "ativo");
        setLotesAtivos(ativos.length);
      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      }
    };

    carregarDados();
  }, []);

  const stats = [
    { label: 'Lotes Cadastrados', value: lotesCount.toString(), icon: 'map-outline' as const },
    { label: 'Árvores Registradas', value: arvoresCount.toString(), icon: 'leaf-outline' as const },
    { label: 'Kg Colhidos Hoje', value: kgHoje.toFixed(1), icon: 'scale-outline' as const },
    { label: 'Lotes Ativos', value: lotesAtivos.toString(), icon: 'checkmark-circle-outline' as const }
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>CumaruApp</Text>
            <Text style={styles.headerSubtitle}>Gestão de Colheitas</Text>
          </View>
          <TouchableOpacity onPress={handleNotifications} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon} size={20} color="#16a34a" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action.route)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityContainer}>
            {atividadeRecente.length > 0 ? (
              atividadeRecente.map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityContent}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityAction}>{activity.action}</Text>
                      <Text style={styles.activityDetails}>
                        {activity.lote} • {activity.amount}
                      </Text>
                    </View>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: '#6b7280' }}>Nenhuma atividade recente</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 14, color: '#bbf7d0' },
  notificationButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  statsContainer: { paddingHorizontal: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statTextContainer: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: { fontSize: 14, fontWeight: '500', color: '#1f2937', textAlign: 'center' },
  activityContainer: { gap: 12 },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activityInfo: { flex: 1 },
  activityAction: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  activityDetails: { fontSize: 14, color: '#4b5563', marginTop: 2 },
  activityTime: { fontSize: 12, color: '#9ca3af' },
  bottomSpacing: { height: 20 },
});

export default HomeScreen;
