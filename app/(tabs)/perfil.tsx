import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
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

interface PerfilScreenProps {
  navigation: any;
}

interface UserData {
  nome: string;
  email: string;
  telefone: string;
  propriedade: string;
  localizacao: string;
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
  const userData: UserData = {
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(92) 99999-9999',
    propriedade: 'Fazenda São Francisco',
    localizacao: 'Oriximina, Pará',
    cadastro: '15/01/2024'
  };

  const menuItems: MenuItem[] = [
    { title: 'Relatórios', icon: 'document-text-outline', route: '/relatorios' },
    { title: 'Notificações', icon: 'notifications-outline', route: '/notificacoes' },
    { title: 'Quem Somos', icon: 'information-circle-outline', route: '/quem-somos' },
    { title: 'Configurações', icon: 'settings-outline', route: '/configuracoes' },
    { title: 'Ajuda', icon: 'help-circle-outline', route: '/ajuda' },
    { title: 'Sair', icon: 'log-out-outline', action: 'logout', color: '#dc2626' }
  ];

  const stats: StatItem[] = [
    { label: 'Lotes Cadastrados', value: '12' },
    { label: 'Total Colhido', value: '1.2t' },
    { label: 'Dias Ativos', value: '45' }
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.action === 'logout') {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair do aplicativo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: () => {
              // Implementar logout
              Alert.alert('Logout', 'Logout realizado com sucesso!');
            }
          }
        ]
      );
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  const handleBottomNavigation = (route: string) => {
    navigation.navigate(route);
  };

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
            <Text style={styles.userLocation}>{userData.localizacao}</Text>
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
              <View style={[styles.profileInfoItem, styles.profileInfoItemBorder]}>
                <Text style={styles.profileInfoLabel}>Telefone</Text>
                <Text style={styles.profileInfoValue}>{userData.telefone}</Text>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
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
  userLocation: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  profileInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  profileInfoItemBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  profileInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default PerfilScreen;