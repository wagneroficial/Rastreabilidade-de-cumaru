import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
  StatusBar
} from 'react-native';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar?: string;
  photo?: ImageSourcePropType;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const handleLocationPress = () => {
  const latitude = -1.74813;
  const longitude = -55.85179;
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  Linking.openURL(url).catch(() => {
    Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
  });
};

const QuemSomosScreen: React.FC = () => {
  const router = useRouter();

  const teamMembers: TeamMember[] = [
    {
      name: 'Prof. esp. Raimundo Junior',
      role: 'Orientador do Projeto',
      description: 'Orientador especializado em gestão de projetos sustentáveis e tecnologia aplicada à agricultura amazônica.',
      photo: require('../assets/images/raimundo.png'),
    },
    {
      name: 'Wagner Sampaio',
      role: 'Desenvolvedor Mobile, Web e QA',
      description: 'Desenvolvedor mobile, QA e responsável pela integração de funcionalidades com backend e APIs.',
      photo: require('../assets/images/wagner.jpg'),
    },
    {
      name: 'Ellen Viana',
      role: 'UI/UX Designer, Desenvolvedora Mobile e Web',
      description: 'UI/UX Designer e Desenvolvedora Mobile e Web, garantindo usabilidade e interfaces intuitivas.',
      photo: require('../assets/images/ellen.jpg'),
    },
  ];

  const features: Feature[] = [
    {
      icon: 'qr-code-outline',
      title: 'Rastreabilidade por QR Code',
      description: 'Cada produto derivado do cumaru possui um QR code permitindo rastrear sua origem de produção.',
    },
    {
      icon: 'location-outline',
      title: 'Geolocalização Precisa',
      description: 'Registra a localização exata de cada árvore, ajudando a monitorar e validar as áreas de colheita.',
    },
    {
      icon: 'bar-chart-outline',
      title: 'Análises e Relatórios',
      description: 'Permite gerar relatórios detalhados sobre produção, produtividade e sustentabilidade do manejo.',
    },
    {
      icon: 'cloud-outline',
      title: 'Dados na Nuvem',
      description: 'Todas as informações ficam sincronizadas na nuvem, garantindo backup seguro e acesso remoto aos dados.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Segurança e Compliance',
      description: 'O sistema garante conformidade com normas ambientais e facilita certificações para o mercado.',
    },
  ];

  const handleBack = () => router.back();

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:cumatrack@gmail.com').catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email');
      });
    } else {
      Linking.openURL('tel:+5593992099606').catch(() => {
        Alert.alert('Erro', 'Não foi possível fazer a ligação');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor='#16a34a' barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nós</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Intro */}
        <View style={styles.appIntro}>
          <View style={styles.appIconContainer}>
            <Ionicons name="leaf" size={64} color="white" />
          </View>
          <Text style={styles.appTitle}>CumaTrack</Text>
          <Text style={styles.appSubtitle}>
            Digitalizando o manejo do Cumaru na Amazônia
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nossa Missão</Text>
            <Text style={styles.missionText}>
              Transformar a gestão de produção de cumaru através da tecnologia,
              oferecendo ferramentas digitais que aumentam a eficiência, transparência
              e sustentabilidade, ajudando produtores a tomar decisões baseadas em dados reais.
            </Text>
          </View>
        </View>

        {/* About Project */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre o Projeto</Text>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutParagraph}>
                O CumaTrack nasceu da necessidade de modernizar e digitalizar
                o processo de colheita do cumaru, oferecendo rastreabilidade completa
                desde o plantio até o consumidor final.
              </Text>
              <Text style={styles.aboutParagraph}>
                Desenvolvido em parceria com produtores locais,
                o aplicativo permite registrar, monitorar e analisar a produção de forma prática e eficiente.
              </Text>
              <Text style={styles.aboutParagraph}>
                Nosso objetivo é apoiar a sustentabilidade da floresta amazônica,
                otimizar a gestão das colheitas e fornecer informações confiáveis para o mercado.
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principais Recursos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
            {features.map((feature, index) => (
              <TouchableOpacity key={index} style={styles.featureCard} activeOpacity={0.8}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={28} color="white" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossa Equipe</Text>
          <View style={styles.teamList}>
            {teamMembers.map((member, index) => (
              <View key={index} style={styles.teamCard}>
                <View style={styles.teamAvatar}>
                  {member.photo ? (
                    <Image
                      source={member.photo}
                      style={styles.teamAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.teamAvatarText}>{member.avatar}</Text>
                  )}
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

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato e Suporte</Text>
          <View style={styles.contactList}>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('email')}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <Ionicons name="mail-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>E-mail</Text>
                  <Text style={styles.contactValue}>cumatrack@gmail.com</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('phone')}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <Ionicons name="call-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Telefone</Text>
                  <Text style={styles.contactValue}>+55 (93) 99209-9606</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleLocationPress}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <Ionicons name="location-outline" size={24} color="#16a34a" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Localização</Text>
                  <Text style={styles.contactValue}>Oriximiná, Pará - Brasil</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>

          </View>
        </View>


        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <Text style={styles.appInfoTitle}>Versão do Aplicativo</Text>
            <Text style={styles.appInfoVersion}>CumaTrack v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingLeft: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appIntro: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 12,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#bbf7d0',
    textAlign: 'center',
    lineHeight: 22,
  },

  scrollView: {
    flex: 1,
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  aboutContent: {
    gap: 16,
  },
  aboutParagraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  featuresScroll: {
    gap: 16,
    paddingVertical: 8,
  },
  featureCard: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 16,
    width: 220,
    marginRight: 16,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  teamList: {
    gap: 16,
  },
  teamCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  teamAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  teamInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
    marginVertical: 2,
  },
  teamDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 16,
  },

  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  contactValue: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  appInfoCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
});

export default QuemSomosScreen;
