import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  error?: any;
  errorType?: string;
  route?: string;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  supportEmail?: string;
  supportPhone?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando na solução.',
  error,
  errorType,
  route,
  showBackButton = true,
  showRetryButton = true,
  onRetry,
  onBack,
  supportEmail = 'suporte@cumaruapp.com',
  supportPhone = '+55 92 99999-9999',
}) => {
  const router = useRouter();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const getTechnicalDetails = () => {
    const timestamp = new Date().toISOString();
    let errorDetails = `Timestamp: ${timestamp}\n`;
    
    // Tipo de erro
    if (errorType) {
      errorDetails += `Error Type: ${errorType}\n`;
    }

    // Rota/URL
    if (route) {
      errorDetails += `Route: ${route}\n`;
    }

    // Detalhes do erro
    if (error) {
      if (error.message) {
        errorDetails += `Message: ${error.message}\n`;
      }

      if (error.code) {
        errorDetails += `Code: ${error.code}\n`;
      }

      if (error.name) {
        errorDetails += `Name: ${error.name}\n`;
      }

      if (error.stack) {
        errorDetails += `\nStack Trace:\n${error.stack}\n`;
      }

      if (typeof error === 'string') {
        errorDetails += `Error: ${error}\n`;
      }

      if (typeof error === 'object' && !error.message && !error.code) {
        errorDetails += `Details: ${JSON.stringify(error, null, 2)}\n`;
      }
    } else {
      // Se não tem erro, mas tem informações
      if (!errorType && !route) {
        errorDetails += `Status: No error object provided\n`;
        errorDetails += `Info: Error occurred but no technical details were captured\n`;
      }
    }

    return errorDetails;
  };

  const handleEmailPress = async () => {
    const subject = encodeURIComponent('Suporte - CumaruApp - Erro no Aplicativo');
    const technicalDetails = getTechnicalDetails();
    const body = encodeURIComponent(
      `Olá, equipe de suporte!\n\n` +
      `Estou enfrentando um problema no aplicativo.\n\n` +
      `Descrição do problema:\n${title}\n${message}\n\n` +
      `--- DETALHES TÉCNICOS (NÃO REMOVER) ---\n${technicalDetails}\n` +
      `--- FIM DOS DETALHES TÉCNICOS ---\n\n` +
      `Por favor, me ajudem a resolver este problema.\n\n` +
      `Obrigado!`
    );

    const emailUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível abrir o aplicativo de e-mail. Por favor, envie um e-mail manualmente para: ' + supportEmail
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar abrir o e-mail. Email de suporte: ' + supportEmail
      );
    }
  };

  const handlePhonePress = async () => {
    // Remove caracteres não numéricos exceto o +
    const cleanPhone = supportPhone.replace(/[^\d+]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;

    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        // Abre o discador com o número preenchido
        await Linking.openURL(phoneUrl);
      } else {
        // Se não conseguir abrir, mostra o número para copiar
        Alert.alert(
          'Telefone de Suporte',
          `Não foi possível abrir o discador automaticamente.\n\nLigue para: ${supportPhone}`,
          [
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      // Em caso de erro, mostra o número
      Alert.alert(
        'Telefone de Suporte',
        `Número para contato: ${supportPhone}`,
        [
          { text: 'OK' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      
      {/* Header Verde */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Oops!</Text>
            <Text style={styles.headerSubtitle}>Algo não saiu como esperado</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorContainer}>
          {/* Ícone de erro */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="alert-circle" size={64} color="#ef4444" />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{message}</Text>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            {showRetryButton && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            )}

            {showBackButton && (
              <TouchableOpacity
                style={styles.backButtonSecondary}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Voltar ao Início</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Informações de suporte */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportTitle}>Precisa de ajuda?</Text>
            <Text style={styles.supportText}>
              Se o problema persistir, entre em contato conosco
            </Text>

            <View style={styles.contactButtons}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleEmailPress}
              >
                <Ionicons name="mail" size={18} color="#6b7280" />
                <Text style={styles.contactButtonText}>E-mail</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handlePhonePress}
              >
                <Ionicons name="call" size={18} color="#6b7280" />
                <Text style={styles.contactButtonText}>Telefone</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Detalhes Técnicos - SEMPRE MOSTRA */}
          <View style={styles.technicalContainer}>
            <TouchableOpacity
              style={styles.technicalHeader}
              onPress={() => setShowTechnicalDetails(!showTechnicalDetails)}
            >
              <Text style={styles.technicalTitle}>Detalhes técnicos</Text>
              <Ionicons 
                name={showTechnicalDetails ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </TouchableOpacity>

            {showTechnicalDetails && (
              <View style={styles.technicalContent}>
                <ScrollView 
                  style={styles.technicalScroll}
                  nestedScrollEnabled
                >
                  <Text style={styles.technicalText}>
                    {getTechnicalDetails()}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Espaçamento inferior */}
          <View style={styles.bottomSpacer} />
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
    paddingTop: 16,
    marginTop: 0,
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
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  supportContainer: {
    width: '100%',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  technicalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  technicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  technicalContent: {
    padding: 16,
    backgroundColor: '#1f2937',
  },
  technicalScroll: {
    maxHeight: 200,
  },
  technicalText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#10b981',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ErrorScreen;