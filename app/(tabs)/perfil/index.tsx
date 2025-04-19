import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const EditProfileScreen = () => {
  // Dados iniciais do usuário
  const [userData, setUserData] = useState({
    name: 'Wagner Sampaio',
    email: 'wagnersampaio@gmail.com',
    phone: '(93) 98426-2125',
    birthdate: '11/12/2000',
    profileImage: null
  });
  
  // Estado para armazenar as edições antes de salvar
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  const [birthdate, setBirthdate] = useState(userData.birthdate);
  
  // Função para salvar as alterações
  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar no backend
    setUserData({
      ...userData,
      name,
      email,
      phone,
      birthdate
    });
    
    // Simulação de salvamento bem-sucedido
    alert('Perfil atualizado com sucesso!');
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Cabeçalho personalizado no estilo que você já usa */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={userData.profileImage || require('@/assets/images/favicon.png')} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="pencil" size={16} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Seu nome:</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Digite seu nome"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Seu e-mail:</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Celular:</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="Digite seu número"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de nascimento:</Text>
          <TextInput
            value={birthdate}
            onChangeText={setBirthdate}
            style={styles.input}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1'
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd'
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
  saveButton: {
    backgroundColor: Colors.appColors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default EditProfileScreen;