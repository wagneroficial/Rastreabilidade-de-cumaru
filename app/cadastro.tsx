import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./services/firebaseConfig";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  propriedade: string;
  senha: string;
  confirmarSenha: string;
}

export default function Cadastro() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    propriedade: "",
    senha: "",
    confirmarSenha: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatPhoneNumber = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange("telefone", formatted);
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      Alert.alert("Erro", "Por favor, digite seu nome completo");
      return false;
    }
    
    if (formData.nome.trim().split(' ').length < 2) {
      Alert.alert("Erro", "Por favor, digite seu nome completo (nome e sobrenome)");
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, digite seu e-mail");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Erro", "Por favor, digite um e-mail válido");
      return false;
    }
    
    if (!formData.telefone.trim()) {
      Alert.alert("Erro", "Por favor, digite seu telefone");
      return false;
    }
    
    // Verifica se o telefone tem pelo menos 10 dígitos
    const phoneNumbers = formData.telefone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      Alert.alert("Erro", "Por favor, digite um telefone válido");
      return false;
    }
    
    if (!formData.propriedade.trim()) {
      Alert.alert("Erro", "Por favor, digite o nome da propriedade");
      return false;
    }
    
    if (formData.senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres");
      return false;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

      const uid = userCredential.user.uid;

      // Salva dados extras no Firestore (coleção 'usuarios')
      await setDoc(doc(db, "usuarios", uid), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        propriedade: formData.propriedade,
        criadoEm: new Date(),
        status: 'pendente', // Para aprovação do admin
      });

      Alert.alert("Sucesso!", "Conta criada com sucesso! Aguarde aprovação do administrador.", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      let mensagemErro = "Erro ao criar conta.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "Senha muito fraca. Mínimo 6 caracteres.";
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header Fixo */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Criar Conta</Text>
              <Text style={styles.headerSubtitle}>Cadastre-se no CumaruApp</Text>
            </View>
          </View>
        </View>

        {/* Área Scrollável */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
              <Text style={styles.welcomeSubtitle}>
                Para usar o CumaruApp, você precisa de aprovação do administrador.
                Preencha os dados abaixo para solicitar acesso.
              </Text>
            </View>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChangeText={(value) => handleInputChange("nome", value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  maxLength={15}
                />
              </View>
            </View>

            {/* Propriedade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Propriedade</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Fazenda São João"
                  value={formData.propriedade}
                  onChangeText={(value) => handleInputChange("propriedade", value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Digite sua senha (mín. 6 caracteres)"
                  value={formData.senha}
                  onChangeText={(value) => handleInputChange("senha", value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirme sua senha"
                  value={formData.confirmarSenha}
                  onChangeText={(value) => handleInputChange("confirmarSenha", value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.submitButtonText}>Criando conta...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            {/* Link Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FDF7" 
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#16A34A",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 16 
  },
  backButton: { 
    width: 32, 
    height: 32, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerInfo: { 
    flex: 1 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "white" 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#BBF7D0", 
    marginTop: 2 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espaço extra para o último elemento
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  welcomeSection: { 
    alignItems: "center", 
    marginBottom: 32 
  },
  welcomeTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginBottom: 8 
  },
  welcomeSubtitle: { 
    fontSize: 16, 
    color: "#6B7280", 
    textAlign: "center" 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#374151", 
    marginBottom: 8 
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "white",
    minHeight: 48,
  },
  inputIcon: { 
    paddingLeft: 12, 
    paddingRight: 8 
  },
  textInput: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingRight: 8,
    fontSize: 14, 
    color: "#1F2937" 
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  submitButtonDisabled: { 
    opacity: 0.5 
  },
  submitButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  loadingContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  loginContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center",
    paddingBottom: 20,
  },
  loginText: { 
    fontSize: 16, 
    color: "#6B7280" 
  },
  loginLink: { 
    fontSize: 16, 
    color: "#16A34A", 
    fontWeight: "600" 
  },
});