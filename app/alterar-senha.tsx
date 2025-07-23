import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AlterarSenhaScreen() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const validarFormulario = () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return false;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleAlterarSenha = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      // Simular processo de alteração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const requisitos = [
    { texto: 'Pelo menos 6 caracteres', atendido: novaSenha.length >= 6 },
    { texto: 'Pelo menos uma letra maiúscula', atendido: /[A-Z]/.test(novaSenha) },
    { texto: 'Pelo menos um número', atendido: /\d/.test(novaSenha) },
    { texto: 'Senhas coincidem', atendido: novaSenha === confirmarSenha && confirmarSenha !== '' }
  ];

  const renderPasswordField = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    placeholder: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Alterar Senha</Text>
              <Text style={styles.headerSubtitle}>Defina uma nova senha segura</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulário */}
        <View style={styles.formContainer}>
          {renderPasswordField(
            'Senha Atual',
            senhaAtual,
            setSenhaAtual,
            mostrarSenhaAtual,
            setMostrarSenhaAtual,
            'Digite sua senha atual'
          )}
          
          {renderPasswordField(
            'Nova Senha',
            novaSenha,
            setNovaSenha,
            mostrarNovaSenha,
            setMostrarNovaSenha,
            'Digite sua nova senha'
          )}
          
          {renderPasswordField(
            'Confirmar Nova Senha',
            confirmarSenha,
            setConfirmarSenha,
            mostrarConfirmarSenha,
            setMostrarConfirmarSenha,
            'Confirme sua nova senha'
          )}
        </View>

        {/* Requisitos da Senha */}
        {novaSenha ? (
          <View style={styles.requirementsContainer}>
            <View style={styles.requirementsHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
              <Text style={styles.requirementsTitle}>Requisitos da Senha</Text>
            </View>
            {requisitos.map((requisito, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons
                  name={requisito.atendido ? "checkmark" : "close"}
                  size={16}
                  color={requisito.atendido ? "#059669" : "#EF4444"}
                />
                <Text style={[
                  styles.requirementText,
                  { color: requisito.atendido ? "#059669" : "#6B7280" }
                ]}>
                  {requisito.texto}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Dicas de Segurança */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle" size={20} color="#1D4ED8" />
            <Text style={styles.tipsTitle}>Dicas de Segurança</Text>
          </View>
          <Text style={styles.tipText}>• Use uma combinação de letras, números e símbolos</Text>
          <Text style={styles.tipText}>• Evite informações pessoais óbvias</Text>
          <Text style={styles.tipText}>• Não compartilhe sua senha com ninguém</Text>
          <Text style={styles.tipText}>• Altere sua senha regularmente</Text>
        </View>

        {/* Botão de Alteração */}
        <TouchableOpacity
          onPress={handleAlterarSenha}
          disabled={isLoading || !senhaAtual || !novaSenha || !confirmarSenha}
          style={[
            styles.submitButton,
            (isLoading || !senhaAtual || !novaSenha || !confirmarSenha) && styles.submitButtonDisabled
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.loadingText}>Alterando...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Alterar Senha</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Sucesso */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="#059669" />
            </View>
            <Text style={styles.modalTitle}>Senha Alterada!</Text>
            <Text style={styles.modalMessage}>
              Sua senha foi alterada com sucesso. Use a nova senha no próximo login.
            </Text>
            <TouchableOpacity
              onPress={() => setShowSuccess(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 32,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    color: '#BBF7D0',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  requirementsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1D4ED8',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#D1FAE5',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center' as const,
  },
});