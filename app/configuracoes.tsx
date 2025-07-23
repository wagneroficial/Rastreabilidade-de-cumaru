import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ConfigItem {
  titulo: string;
  descricao: string;
  tipo: 'toggle' | 'link';
  value?: boolean;
  onChange?: (value: boolean) => void;
  route?: string;
}

interface ConfigSection {
  categoria: string;
  itens: ConfigItem[];
}

const ConfiguracoesScreen: React.FC = () => {
  const router = useRouter();
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [notificacoesEmail, setNotificacoesEmail] = useState(false);
  const [biometria, setBiometria] = useState(false);

  const configuracoes: ConfigSection[] = [
    {
      categoria: 'Notificações',
      itens: [
        {
          titulo: 'Notificações Push',
          descricao: 'Receber alertas no dispositivo',
          tipo: 'toggle',
          value: notificacoesPush,
          onChange: setNotificacoesPush
        },
        {
          titulo: 'Notificações por E-mail',
          descricao: 'Receber relatórios por e-mail',
          tipo: 'toggle',
          value: notificacoesEmail,
          onChange: setNotificacoesEmail
        }
      ]
    },
    {
      categoria: 'Segurança',
      itens: [
        {
          titulo: 'Alterar Senha',
          descricao: 'Modificar senha de acesso',
          tipo: 'link',
          route: '/alterar-senha'
        },
        {
          titulo: 'Autenticação por Biometria',
          descricao: 'Usar impressão digital',
          tipo: 'toggle',
          value: biometria,
          onChange: setBiometria
        }
      ]
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const renderToggleItem = (item: ConfigItem, index: number) => (
    <View key={index} style={styles.configItem}>
      <View style={styles.configContent}>
        <Text style={styles.configTitle}>{item.titulo}</Text>
        <Text style={styles.configDescription}>{item.descricao}</Text>
      </View>
      <Switch
        value={item.value}
        onValueChange={item.onChange}
        trackColor={{ false: '#e5e7eb', true: '#bbf7d0' }}
        thumbColor={item.value ? '#16a34a' : '#f3f4f6'}
        ios_backgroundColor="#e5e7eb"
      />
    </View>
  );

  const renderLinkItem = (item: ConfigItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.configItem}
      onPress={() => item.route && handleNavigation(item.route)}
    >
      <View style={styles.configContent}>
        <Text style={styles.configTitle}>{item.titulo}</Text>
        <Text style={styles.configDescription}>{item.descricao}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderItem = (item: ConfigItem, index: number) => {
    switch (item.tipo) {
      case 'toggle':
        return renderToggleItem(item, index);
      case 'link':
        return renderLinkItem(item, index);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Configurações</Text>
            <Text style={styles.headerSubtitle}>Personalize seu app</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configurações */}
        <View style={styles.configurationsContainer}>
          {configuracoes.map((secao, secaoIndex) => (
            <View key={secaoIndex} style={styles.configSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{secao.categoria}</Text>
              </View>
              <View style={styles.sectionContent}>
                {secao.itens.map((item, itemIndex) => renderItem(item, itemIndex))}
              </View>
            </View>
          ))}
        </View>

        {/* Informações do App */}
        <View style={styles.appInfoContainer}>
          <View style={styles.appInfoCard}>
            <View style={styles.appIconContainer}>
              <Ionicons name="leaf" size={32} color="#16a34a" />
            </View>
            <Text style={styles.appName}>CumaruApp</Text>
            <Text style={styles.appVersion}>Versão 1.0.0</Text>
            <Text style={styles.appCopyright}>
              © 2024 CumaruApp. Todos os direitos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    color: '#bbf7d0',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  configurationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },
  configSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  configContent: {
    flex: 1,
    marginRight: 12,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  configDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  appInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
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
    width: 64,
    height: 64,
    backgroundColor: '#f0fdf4',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ConfiguracoesScreen;