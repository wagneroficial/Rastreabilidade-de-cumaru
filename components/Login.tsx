import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (!userDoc.exists()) {
        await signOut(auth);
        Alert.alert(
          'Conta não encontrada',
          'Sua conta não foi encontrada no sistema. Entre em contato com o administrador.',
          [{ text: 'OK' }]
        );
        return;
      }

      const userData = userDoc.data();
      const userStatus = userData.status;

      if (userStatus === 'pendente') {
        await signOut(auth);
        Alert.alert(
          'Aguardando Aprovação',
          'Sua conta foi criada com sucesso, mas ainda precisa ser aprovada pelo administrador. Você receberá um e-mail quando sua conta for ativada.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (userStatus === 'rejeitado') {
        await signOut(auth);
        Alert.alert(
          'Acesso Negado',
          'Sua solicitação de conta foi rejeitada pelo administrador. Entre em contato para mais informações.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (userStatus === 'aprovado') {
        // Usuário aprovado, navega para home
        router.replace('/(tabs)/home');
      } else {
        await signOut(auth);
        Alert.alert(
          'Erro de Autorização',
          'Status da conta não reconhecido. Entre em contato com o administrador.',
          [{ text: 'OK' }]
        );
      }

    } catch (error: any) {
      let message = 'Erro ao fazer login.';

      if (error.code === 'auth/user-not-found') {
        message = 'Usuário não encontrado. Verifique seu e-mail ou cadastre-se.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'E-mail inválido. Verifique o formato do e-mail.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'Esta conta foi desabilitada. Entre em contato com o administrador.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas de login. Tente novamente mais tarde.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Verifique se seu e-mail e senha estão corretos e tente novamente.';
      }

      Alert.alert('Não foi possível entrar', message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToForgotPassword = () => {
    router.push('/esquecisenha');
  };

  const navigateToRegister = () => {
    router.push('/cadastro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.welcomeSection}>
            <View style={styles.appIconContainer}>
              <Ionicons name="leaf" size={24} color="#16a34a" />
            </View>
            <Text style={styles.welcomeTitle}>Bem-vindo(a)!</Text>
            <Text style={styles.welcomeSubtitle}>Entre na sua conta para continuar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#1F2937" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="seu.email@email.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}

              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#1F2937" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite sua senha"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}

              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity onPress={navigateToForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.loginButtonText}>Verificando...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Solicitar Acesso</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe' },
  scrollContent: { flexGrow: 1 },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 120,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
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
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden', // <- impede o texto sair do limite visual
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    minWidth: 0, // <- essencial no Android
  },
  eyeButton: {
    marginLeft: 8,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
  },
});