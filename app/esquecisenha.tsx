import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./services/firebaseConfig.js";

export default function EsqueciSenha() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        if (!email.trim()) return "O e-mail é obrigatório.";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return "Digite um e-mail válido.";
        return "";
    };

const handleResetPassword = async () => {
  const validationError = validateEmail(email);
  if (validationError) {
    setError(validationError);
    return;
  }

  setIsLoading(true);
  try {
    // Tenta enviar e-mail de redefinição
    await sendPasswordResetEmail(auth, email);
    
    Alert.alert(
      "E-mail enviado!",
      "Se esse e-mail estiver cadastrado, um link de redefinição de senha foi enviado.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  } catch (err: any) {
    let msg = "Erro ao enviar e-mail.";
    
    // Mensagens específicas de Firebase
    if (err.code === "auth/invalid-email") msg = "E-mail inválido.";
    else if (err.code === "auth/too-many-requests")
      msg = "Muitas tentativas. Tente novamente mais tarde.";

    Alert.alert("Erro", msg);
  } finally {
    setIsLoading(false);
  }
};


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        {/* Instruções */}
                        <Text style={styles.title}>Esqueci minha senha</Text>
                        <Text style={styles.subtitle}>
                            Digite seu e-mail abaixo para receber o link de redefinição de senha.
                        </Text>

                        {/* Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail</Text>
                            <View style={[styles.inputContainer, error && { borderColor: "#dc2626" }]}>
                                <Ionicons name="mail-outline" size={20} color="#1F2937" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="seu@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setError("");
                                    }}
                                    onBlur={() => setError(validateEmail(email))}
                                />
                            </View>
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        </View>

                        {/* Botão */}
                        <TouchableOpacity
                            style={[styles.button, isLoading && { opacity: 0.5 }]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Enviar link de redefinição</Text>
                            )}
                        </TouchableOpacity>

                        {/* Voltar ao login */}
                        <TouchableOpacity onPress={() => router.back()} style={styles.backToLogin}>
                            <Text style={styles.backToLoginText}>Voltar ao login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fefefe",
        paddingTop: 20,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    formContainer: {
        maxWidth: 400,
        alignSelf: "center",
        width: "100%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 76,
        gap: 12,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        backgroundColor: "white",
        minHeight: 48,
        paddingVertical: 4,
    },
    inputIcon: {
        paddingLeft: 12,
        paddingRight: 8,
    },
    textInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1F2937",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        backgroundColor: "#16A34A",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    backToLogin: {
        alignItems: "center",
        marginTop: 24,
    },
    backToLoginText: {
        fontSize: 16,
        color: "#16A34A",
        fontWeight: "600",
    },
    optionsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 32,
    },
});

