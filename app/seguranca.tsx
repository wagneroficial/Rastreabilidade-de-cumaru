import { useBiometric } from '@/contexts/BiometricContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
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

const SegurancaScreen: React.FC = () => {
  const router = useRouter();
  const { biometriaAtivada, setBiometriaAtivada } = useBiometric();

  const handleBiometriaToggle = async (value: boolean) => {
    if (value) {
      // Verificar se o dispositivo suporta biometria antes de ativar
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        Alert.alert(
          'Biometria não disponível',
          'Seu dispositivo não possui suporte para autenticação biométrica.'
        );
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!isEnrolled) {
        Alert.alert(
          'Biometria não configurada',
          'Você precisa configurar a biometria (impressão digital ou Face ID) nas configurações do seu dispositivo primeiro.'
        );
        return;
      }

      // Testar a biometria antes de ativar
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para ativar a biometria',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        setBiometriaAtivada(true);
        Alert.alert(
          'Biometria Ativada',
          'A autenticação biométrica foi ativada com sucesso. Agora você precisará autenticar quando o app for reaberto ou após 5 minutos de inatividade.'
        );
      } else {
        Alert.alert(
          'Falha na Autenticação',
          'Não foi possível ativar a biometria. Tente novamente.'
        );
      }
    } else {
      // Desativar biometria
      Alert.alert(
        'Desativar Biometria',
        'Tem certeza que deseja desativar a autenticação biométrica?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: () => {
              setBiometriaAtivada(false);
              Alert.alert('Biometria Desativada', 'A autenticação biométrica foi desativada.');
            }
          }
        ]
      );
    }
  };

  const configuracoes: ConfigSection[] = [
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
          descricao: 'Usar impressão digital ou Face ID',
          tipo: 'toggle',
          value: biometriaAtivada,
          onChange: handleBiometriaToggle
        },
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
            <Text style={styles.headerTitle}>Segurança</Text>
            <Text style={styles.headerSubtitle}>Proteja sua conta</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configurações de Segurança */}
        <View style={styles.configurationsContainer}>
          {configuracoes.map((secao, secaoIndex) => (
            <View key={secaoIndex} style={styles.configSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                <Text style={styles.sectionTitle}>{secao.categoria}</Text>
              </View>
              <View style={styles.sectionContent}>
                {secao.itens.map((item, itemIndex) => renderItem(item, itemIndex))}
              </View>
            </View>
          ))}
        </View>

        {/* Info sobre Biometria */}
        {biometriaAtivada && (
          <View style={styles.biometricInfoContainer}>
            <View style={styles.biometricInfoCard}>
              <View style={styles.biometricInfoHeader}>
                <Ionicons name="information-circle" size={24} color="#059669" />
                <Text style={styles.biometricInfoTitle}>Biometria Ativada</Text>
              </View>
              <Text style={styles.biometricInfoText}>
                A autenticação biométrica será solicitada quando:
              </Text>
              <View style={styles.biometricInfoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.biometricInfoItemText}>
                  O aplicativo for fechado e reaberto
                </Text>
              </View>
              <View style={styles.biometricInfoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.biometricInfoItemText}>
                  Após 5 minutos de inatividade
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Dicas de Segurança */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#3b82f6" />
              <Text style={styles.tipsTitle}>Dicas de Segurança</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.tipText}>Use senhas fortes e únicas</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.tipText}>Ative a autenticação biométrica</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.tipText}>Não compartilhe suas credenciais</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.tipText}>Faça logout em dispositivos compartilhados</Text>
            </View>
          </View>
        </View>

        {/* Espaçamento inferior */}
        <View style={styles.bottomSpacer} />
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
    paddingLeft: 16,
    paddingVertical: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  biometricInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  biometricInfoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  biometricInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  biometricInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  biometricInfoText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 8,
  },
  biometricInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  biometricInfoItemText: {
    fontSize: 14,
    color: '#047857',
    flex: 1,
  },
  tipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  tipsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default SegurancaScreen;