// app/admin/gerenciamento.tsx
import ColetasTab from '@/components/gerenciar/ColetasTab';
import UsuariosTab from '@/components/gerenciar/UsuariosTab';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MainTabType = 'usuarios' | 'coletas';

const GerenciamentoScreen: React.FC = () => {
  const router = useRouter();
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>('usuarios');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Gerenciamento</Text>
            <Text style={styles.headerSubtitle}>
              {activeMainTab === 'usuarios' ? 'Gerencie usuários do sistema' : 'Aprove ou rejeite coletas'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveMainTab('usuarios')}
          style={[
            styles.mainTab,
            activeMainTab === 'usuarios' && styles.mainTabActive,
          ]}
        >
          <Ionicons 
            name={activeMainTab === 'usuarios' ? 'people' : 'people-outline'} 
            size={20} 
            color={activeMainTab === 'usuarios' ? '#16a34a' : '#6b7280'} 
          />
          <Text style={[
            styles.mainTabText,
            activeMainTab === 'usuarios' && styles.mainTabTextActive,
          ]}>
            Usuários
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveMainTab('coletas')}
          style={[
            styles.mainTab,
            activeMainTab === 'coletas' && styles.mainTabActive,
          ]}
        >
          <Ionicons 
            name={activeMainTab === 'coletas' ? 'leaf' : 'leaf-outline'} 
            size={20} 
            color={activeMainTab === 'coletas' ? '#16a34a' : '#6b7280'} 
          />
          <Text style={[
            styles.mainTabText,
            activeMainTab === 'coletas' && styles.mainTabTextActive,
          ]}>
            Coletas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeMainTab === 'usuarios' ? <UsuariosTab /> : <ColetasTab />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingTop: 20,
    paddingBottom: 16,
    marginTop: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
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
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  mainTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  mainTabActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  mainTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  mainTabTextActive: {
    color: '#16a34a',
  },
});

export default GerenciamentoScreen;