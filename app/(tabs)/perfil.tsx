import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface PerfilScreenProps {
  navigation: any;
}

interface UserData {
  nome: string;
  email: string;
  telefone: string;
  propriedade: string;
  tipo: 'admin' | 'colaborador';
  cadastro: string;
}

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  action?: string;
  color?: string;
}

interface StatItem {
  label: string;
  value: string;
}

const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Buscar dados do usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              nome: data.nome || 'Usuário',
              email: data.email || user.email || '',
              telefone: data.telefone || 'Não informado',
              propriedade: data.propriedade || 'Não informado',
              tipo: data.tipo || 'colaborador',
              cadastro: data.criadoEm ? 
                (data.criadoEm.seconds ? 
                  new Date(data.criadoEm.seconds * 1000).toLocaleDateString('pt-BR') : 
                  new Date(data.criadoEm).toLocaleDateString('pt-BR')
                ) : 'Não informado'
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirecionar para login se não estiver autenticado (usando useEffect)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated]);

  const menuItems: MenuItem[] = [
    { title: 'Relatórios', icon: 'document-text-outline', route: '/relatorios'},
    { title: 'Notificações', icon: 'notifications-outline', route: '/notificacoes' },
    { title: 'Quem Somos', icon: 'information-circle-outline', route: '/quem-somos' },
    { title: 'Segurança', icon: 'shield-checkmark-outline', route: '/seguranca' },
    { title: 'Ajuda', icon: 'help-circle-outline', route: '/ajuda' },
    { title: 'Sair', icon: 'log-out-outline', action: 'logout', color: '#dc2626' }
  ];

  const stats: StatItem[] = [
    { label: 'Total Lotes', value: '12' },
    { label: 'Total Colhido', value: '1.2t' },
    { label: 'Dias Ativo', value: '45' }
  ];

  const handleLogout = async () => {
    try {
      console.log('Iniciando processo de logout...');
      
      // Fazer logout do Firebase Auth
      await signOut(auth);
      console.log('Logout do Firebase realizado com sucesso');
      
      // O redirecionamento será feito automaticamente pelo useEffect
      // quando onAuthStateChanged detectar que o usuário não está mais logado
      
    } catch (error) {
      console.error('Erro durante logout:', error);
      
      // Mostrar erro para o usuário
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao sair. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    console.log('Menu pressionado:', item.title);
    
    if (item.action === 'logout') {
      console.log('Ação de logout detectada');
      
      // Mostrar confirmação antes do logout
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair do aplicativo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: () => {
              console.log('Usuário confirmou logout');
              handleLogout();
            }
          }
        ]
      );
    } else if (item.route) {
      console.log('Navegando para:', item.route);
      router.push(item.route as any);
    }
  };

  // Mostrar loading enquanto carrega dados do usuário
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  // Se não há usuário logado, mostrar tela vazia (redirecionamento será feito pelo useEffect)
  if (!isAuthenticated || !userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Redirecionando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text style={styles.userName}>{userData.nome}</Text>
            <Text style={styles.userProperty}>{userData.propriedade}</Text>
            <View style={styles.userTypeContainer}>
              <Text style={[
                styles.userType, 
                userData.tipo === 'admin' ? styles.userTypeAdmin : styles.userTypeColaborador
              ]}>
                {userData.tipo === 'admin' ? 'Administrador' : 'Colaborador'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileInfoCard}>
            <Text style={styles.profileInfoTitle}>Informações Pessoais</Text>
            <View style={styles.profileInfoList}>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>E-mail</Text>
                <Text style={styles.profileInfoValue}>{userData.email}</Text>
              </View>
              <View style={[styles.profileInfoItem]}>
                <Text style={styles.profileInfoLabel}>Telefone</Text>
                <Text style={styles.profileInfoValue}>{userData.telefone}</Text>
              </View>
              <View style={[styles.profileInfoItem]}>
                <Text style={styles.profileInfoLabel}>Tipo de Usuário</Text>
                <Text style={styles.profileInfoValue}>
                  {userData.tipo === 'admin' ? 'Administrador' : 'Colaborador'}
                </Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Cadastro</Text>
                <Text style={styles.profileInfoValue}>{userData.cadastro}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.color || '#6b7280'} 
                  />
                  <Text style={[
                    styles.menuItemText,
                    item.color && { color: item.color }
                  ]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <View style={styles.appInfoCard}>
            <View style={styles.appIconContainer}>
              <Ionicons name="leaf" size={24} color="#16a34a" />
            </View>
            <Text style={styles.appName}>CumaruApp</Text>
            <Text style={styles.appDescription}>Gestão de Colheitas de Cumaru</Text>
            <Text style={styles.appVersion}>Versão 1.0.0</Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 4,
    paddingVertical: 32,
    paddingTop: 48,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userProperty: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 4,
  },
  userTypeContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  userType: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userTypeAdmin: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  userTypeColaborador: {
    backgroundColor: '#e0f2fe',
    color: '#0277bd',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 12,
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 6,
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  profileInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  profileInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileInfoList: {
    gap: 12,
  },
  profileInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  profileInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
   borderBottomWidth: 1,
   borderBottomColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  appInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  appIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default PerfilScreen;