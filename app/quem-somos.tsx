import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const QuemSomosScreen: React.FC = () => {
  const router = useRouter();

  const teamMembers: TeamMember[] = [
    {
      name: 'Prof. esp. Raimundo Junior',
      role: 'Orientador do Projeto',
      description: 'Especialista ',
      avatar: 'RJ'
    },
    {
      name: 'Graduando Wagner Sampaio',
      role: 'Desenvolvedora Mobile',
      description: 'Desenvolvedor mobile e QA',
      avatar: 'WS'
    },
    {
      name: 'Graduanda Ellen Viana',
      role: 'UI/UX Designer',
      description: 'Designer UI/UX',
      avatar: 'EV'
    },
  ];

  const features: Feature[] = [
    {
      icon: 'qr-code-outline',
      title: 'QR Code Integrado',
      description: 'Tecnologia avançada para identificação rápida de árvores'
    },
    {
      icon: 'location-outline',
      title: 'Geolocalização Precisa',
      description: 'GPS de alta precisão para validação de localização'
    },
    {
      icon: 'bar-chart-outline',
      title: 'Análise Inteligente',
      description: 'Gráficos e relatórios detalhados sobre produção'
    },
    {
      icon: 'cloud-outline',
      title: 'Dados na Nuvem',
      description: 'Sincronização automática e backup seguro'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:contato@cumaruapp.com.br').catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email');
      });
    } else if (type === 'phone') {
      Linking.openURL('tel:+5592333344444').catch(() => {
        Alert.alert('Erro', 'Não foi possível fazer a ligação');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quem Somos</Text>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.appIconContainer}>
            <Ionicons name="leaf" size={48} color="white" />
          </View>
          <Text style={styles.appTitle}>CumaruApp</Text>
          <Text style={styles.appSubtitle}>Tecnologia para o Futuro do Cumaru</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Mission */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nossa Missão</Text>
            <Text style={styles.missionText}>
              Transformar a gestão de colheitas de cumaru através da tecnologia, 
              proporcionando ferramentas digitais que aumentam a eficiência, 
              organização e sustentabilidade da produção para pequenos, médios 
              e grandes produtores da região amazônica.
            </Text>
          </View>
        </View>

        {/* About Project */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre o Projeto</Text>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutParagraph}>
                O CumaruApp nasceu da necessidade de modernizar e digitalizar 
                o processo de colheita do cumaru, uma das especiarias mais 
                valiosas da floresta amazônica.
              </Text>
              <Text style={styles.aboutParagraph}>
                Desenvolvido em parceria com produtores locais e especialistas 
                em agricultura sustentável, nosso aplicativo oferece uma solução 
                completa para o registro, monitoramento e análise da produção.
              </Text>
              <Text style={styles.aboutParagraph}>
                Com tecnologias como QR Code, GPS e análise de dados, facilitamos 
                o trabalho dos produtores e contribuímos para o desenvolvimento 
                sustentável da região.
              </Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Principais Recursos</Text>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={24} color="white" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nossa Equipe</Text>
            <View style={styles.teamList}>
              {teamMembers.map((member, index) => (
                <View key={index} style={styles.teamMember}>
                  <View style={styles.teamAvatar}>
                    <Text style={styles.teamAvatarText}>{member.avatar}</Text>
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{member.name}</Text>
                    <Text style={styles.teamRole}>{member.role}</Text>
                    <Text style={styles.teamDescription}>{member.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contato e Suporte</Text>
            <View style={styles.contactList}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContact('email')}
              >
                <Ionicons name="mail-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>E-mail</Text>
                  <Text style={styles.contactValue}>contato@cumaruapp.com.br</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContact('phone')}
              >
                <Ionicons name="call-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Telefone</Text>
                  <Text style={styles.contactValue}>(92) 3333-4444</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Localização</Text>
                  <Text style={styles.contactValue}>Oriximiná, Pará - Brasil</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <Text style={styles.appInfoTitle}>Versão do Aplicativo</Text>
            <Text style={styles.appInfoVersion}>CumaruApp v100.0.0</Text>
      
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
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerContent: {
    alignItems: 'center',
  },
  appIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#bbf7d0',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  aboutContent: {
    gap: 16,
  },
  aboutParagraph: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  teamList: {
    gap: 16,
  },
  teamMember: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 8,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
    marginTop: 2,
  },
  teamDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  contactValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  appInfoCard: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 16,
    color: '#bbf7d0',
    marginBottom: 16,
  },
  appInfoDescription: {
    fontSize: 14,
    color: '#bbf7d0',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default QuemSomosScreen;