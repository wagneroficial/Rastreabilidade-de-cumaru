import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const ChangeEmailScreen = () => {
  // Estado para o campo de email
  const [email, setEmail] = useState('');
  
  // Função para validar e alterar email
  const handleChangeEmail = () => {
    // Validação básica
    if (!email) {
      Alert.alert('Erro', 'O campo de email é obrigatório');
      return;
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }
    
    // Aqui você implementaria a lógica para atualizar o email no backend
    
    // Simulação de sucesso
    Alert.alert(
      'Sucesso',
      'Seu email foi alterado com sucesso',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };
  
  // Função para cancelar e voltar
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Cabeçalho personalizado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar email</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Novo email:</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Digite seu novo email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* Botões de ação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.changeButton} onPress={handleChangeEmail}>
            <Text style={styles.changeButtonText}>Alterar email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: Colors.appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  content: {
    flex: 1,
    padding: 20
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  buttonsContainer: {
    marginTop: 40
  },
  changeButton: {
    backgroundColor: '#6c33d9', // Roxo como na imagem
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16
  }
});

export default ChangeEmailScreen;