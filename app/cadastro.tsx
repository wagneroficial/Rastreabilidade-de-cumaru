import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./services/firebaseConfig.js";

interface FormData {
  nome: string;
  email: string;
  propriedade: string;
  senha: string;
  confirmarSenha: string;
}

export default function Cadastro() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    propriedade: "",
    senha: "",
    confirmarSenha: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------- HANDLERS -------------------- //
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // -------------------- VALIDAÇÕES -------------------- //
  const validateField = (name: keyof FormData, value: string) => {
    let message = "";

    switch (name) {
      case "nome":
        if (!value.trim()) message = "Por favor, informe seu nome completo.";
        else if (value.trim().split(" ").length < 2)
          message = "Digite nome e sobrenome.";
        break;
      case "email":
        if (!value.trim()) message = "O e-mail é obrigatório.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          message = "Digite um e-mail válido.";
        break;
      case "propriedade":
        if (!value.trim()) message = "Digite o nome da propriedade.";
        break;
      case "senha":
        if (!value) message = "Crie uma senha.";
        else if (value.length < 6) message = "Senha deve ter mínimo 6 caracteres.";
        else if (!/[A-Z]/.test(value)) message = "Inclua pelo menos uma letra maiúscula.";
        else if (!/[0-9]/.test(value)) message = "Inclua pelo menos um número.";
        break;
      case "confirmarSenha":
        if (!value) message = "Confirme sua senha.";
        else if (value !== formData.senha) message = "Senhas não coincidem.";
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateForm = () => {
    let valid = true;
    (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
      validateField(key, formData[key]);
      if (!formData[key]) valid = false;
    });
    return valid && Object.values(errors).every((msg) => !msg);
  };

  // -------------------- SUBMIT -------------------- //
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        nome: formData.nome,
        email: formData.email,
        propriedade: formData.propriedade,
        tipo: "colaborador",
        criadoEm: new Date(),
        status: "pendente",
      });

      Alert.alert(
        "Solicitação enviada!",
        "Sua conta foi criada com sucesso! Aguarde aprovação do administrador.",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error: any) {
      let msg = "Erro ao criar conta.";
      if (error.code === "auth/email-already-in-use") msg = "Este e-mail já está em uso.";
      else if (error.code === "auth/invalid-email") msg = "E-mail inválido.";
      else if (error.code === "auth/weak-password") msg = "Senha muito fraca.";
      Alert.alert("Erro", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => router.back();

  // -------------------- RENDER -------------------- //
  const renderTextInput = (
    key: keyof FormData,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    keyboardType?: any,
    onChangeText?: (text: string) => void
  ) => (
    <View style={styles.inputGroup} key={key}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, errors[key] && { borderColor: "#dc2626" }]}>
        <Ionicons name={icon} size={20} color="#1F2937" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={formData[key]}
          onChangeText={(v) => (onChangeText ? onChangeText(v) : handleInputChange(key, v))}
          onBlur={() => validateField(key, formData[key])}
          keyboardType={keyboardType || "default"}
          autoCapitalize="words"
        />
      </View>
      {errors[key] && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" style={styles.errorIcon} />
          <Text style={styles.errorText}>{errors[key]}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <View style={styles.appIconContainer}>
                <Ionicons name="leaf" size={24} color="#16a34a" />
              </View>
              <Text style={styles.welcomeTitle}>Solicite seu acesso</Text>
              <Text style={styles.welcomeSubtitle}>
                Preencha os dados abaixo para solicitar acesso. Aguarde aprovação do administrador.
              </Text>
            </View>

            {/* Campos */}
            {renderTextInput("nome", "Nome Completo", "person-outline", "John Smith")}
            {renderTextInput("email", "E-mail", "mail-outline", "johnsmith@email.com", "email-address")}
            {renderTextInput("propriedade", "Nome da Propriedade", "home-outline", "Ex: Fazenda São João")}

            {/* Senhas */}
            <View>
              <View style={[styles.inputGroup]}>
                <Text style={styles.label}>Senha</Text>
                <View style={[styles.inputContainer, errors.senha && { borderColor: "#dc2626" }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#1F2937" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mín. 6 caracteres"
                    value={formData.senha}
                    onChangeText={(v) => handleInputChange("senha", v)}
                    onBlur={() => validateField("senha", formData.senha)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#1F2937" />
                  </TouchableOpacity>
                </View>
                {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
              </View>

              <View style={[styles.inputGroup]}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={[styles.inputContainer, errors.confirmarSenha && { borderColor: "#dc2626" }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#1F2937" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirmar senha"
                    value={formData.confirmarSenha}
                    onChangeText={(v) => handleInputChange("confirmarSenha", v)}
                    onBlur={() => validateField("confirmarSenha", formData.confirmarSenha)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#1F2937" />
                  </TouchableOpacity>
                </View>
                {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
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
                <Text style={styles.submitButtonText}>Solicitar Acesso</Text>
              )}
            </TouchableOpacity>

            {/* Login */}
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
    flex: 1, backgroundColor: "#fefefe"
  },
  keyboardContainer: {
    flex: 1
  },
  header: {
    flexDirection: "row", 
    paddingTop: 20, 
    paddingHorizontal: 16
  },
  backButton: {
    width: 32, 
    height: 32, 
    justifyContent: "center", 
    alignItems: "center"
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1, 
    paddingBottom: 100
  },
  formContainer: {
    paddingHorizontal: 16, 
    maxWidth: 400, 
    alignSelf: "center", 
    width: "100%"
  },
  welcomeSection: {
    alignItems: "center", 
    marginBottom: 32
  },
  appIconContainer: {
    width: 48, 
    height: 48, 
    backgroundColor: "#f0fdf4", 
    borderRadius: 24, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12
  },
  welcomeTitle: {
    fontSize: 26, 
    fontWeight: "600", 
    color: "#1F2937", 
    marginBottom: 8
  },
  welcomeSubtitle: {
    fontSize: 14, 
    color: "#1F2937", textAlign: "center"
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
    minHeight: 48
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
    paddingVertical: 12
  },
  submitButton: {
    backgroundColor: "#16A34A", 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 24, 
    marginTop: 8
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
    paddingBottom: 20
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
  errorContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4
  },
  errorIcon: {
    marginRight: 4
  },
  errorText: {
    color: "#dc2626", 
    fontSize: 12
  },
});
