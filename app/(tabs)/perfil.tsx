import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import randomColor from 'randomcolor';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PerfilScreenProps {
  navigation: any;
}

interface UserData {
  nome: string;
  email: string;
  telefone: string;
  propriedade: string;
  tipo: 'admin' | 'colaborador';
  cadastro: string;
  fotoURL?: string | null;
}

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  action?: string;
  color?: string;
}

interface StatItem {
  label: string;
  value: string;
}

const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>('#16a34a');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Modal de edição
  const [editVisible, setEditVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editPropriedade, setEditPropriedade] = useState('');
  const [saving, setSaving] = useState(false);

  // Abrir galeria
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.length > 0 && result.assets[0].uri) {
        setUserPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao escolher imagem da galeria:', error);
      Alert.alert('Erro', 'Falha ao selecionar imagem.');
    }
  };

  // Abrir câmera
  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false, 
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets?.length > 0 && result.assets[0].uri) {
        setUserPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Falha ao abrir a câmera.');
    }
  };

  // Salvar alterações
  const handleSaveChanges = async () => {
    if (!userData || !auth.currentUser) return;

    setSaving(true);

    try {
      let fotoURL = userData.fotoURL || null;

      if (userPhoto && !userPhoto.startsWith('https://')) {
        const response = await fetch(userPhoto); // URI local
        const blob = await response.blob();      // converte para Blob
        const storageRef = ref(getStorage(), `users/${auth.currentUser.uid}/profile.jpg`);
        await uploadBytes(storageRef, blob);     // upload direto
        fotoURL = await getDownloadURL(storageRef);
      }

      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      await updateDoc(userRef, {
        nome: editNome.trim(),
        telefone: editTelefone.trim(),
        propriedade: editPropriedade.trim(),
        fotoURL,
      });

      setUserData({
        ...userData,
        nome: editNome.trim(),
        telefone: editTelefone.trim(),
        propriedade: editPropriedade.trim(),
        fotoURL,
      });

      setAvatarColor(randomColor({ seed: editNome.trim() }));
      setEditVisible(false);
      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };


  // Buscar dados do usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userDataFormatted: UserData = {
              nome: data.nome || 'Usuário',
              email: data.email || user.email || '',
              telefone: data.telefone || 'Não informado',
              propriedade: data.propriedade || 'Não informado',
              tipo: data.tipo || 'colaborador',
              cadastro: data.criadoEm
                ? data.criadoEm.seconds
                  ? new Date(data.criadoEm.seconds * 1000).toLocaleDateString('pt-BR')
                  : new Date(data.criadoEm).toLocaleDateString('pt-BR')
                : 'Não informado',
              fotoURL: data.fotoURL || null,
            };
            setUserData(userDataFormatted);
            setAvatarColor(randomColor({ seed: userDataFormatted.nome }));
            setUserPhoto(userDataFormatted.fotoURL || null);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated]);

  const menuItems: MenuItem[] = [
    { title: 'Relatórios', icon: 'document-text-outline', route: '/relatorios' },
    { title: 'Notificações', icon: 'notifications-outline', route: '/notificacoes' },
    { title: 'Quem Somos', icon: 'information-circle-outline', route: '/quem-somos' },
    { title: 'Segurança', icon: 'shield-checkmark-outline', route: '/seguranca' },
    { title: 'Ajuda', icon: 'help-circle-outline', route: '/ajuda' },
    { title: 'Sair', icon: 'log-out-outline', action: 'logout', color: '#dc2626' },
  ];

  const stats: StatItem[] = [
    { label: 'Total Lotes', value: '12' },
    { label: 'Total Colhido', value: '1.2t' },
    { label: 'Dias Ativo', value: '45' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro durante logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao sair. Tente novamente.');
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.action === 'logout') {
      Alert.alert('Sair', 'Tem certeza que deseja sair do aplicativo?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: handleLogout },
      ]);
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  // 🟢 Função para abrir modal com dados atuais
  const openEditModal = () => {
    if (userData) {
      setEditNome(userData.nome);
      setEditTelefone(userData.telefone);
      setEditPropriedade(userData.propriedade);
      setEditVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Redirecionando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {userData.nome
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              )}

              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={openEditModal}
                activeOpacity={0.7}
              >
                <Ionicons name="brush" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{userData.nome}</Text>
            <Text style={styles.userProperty}>{userData.propriedade}</Text>

            <View style={styles.userTypeContainer}>
              <Text
                style={[
                  styles.userType,
                  userData.tipo === 'admin' ? styles.userTypeAdmin : styles.userTypeColaborador,
                ]}
              >
                {userData.tipo === 'admin' ? 'Administrador' : 'Colaborador'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileInfoCard}>
            <View style={styles.profileInfoHeader}>
              <Text style={styles.profileInfoTitle}>Informações Pessoais</Text>
            </View>
            <View style={styles.profileInfoList}>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>E-mail</Text>
                <Text style={styles.profileInfoValue}>{userData.email}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Telefone</Text>
                <Text style={styles.profileInfoValue}>{userData.telefone}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Propriedade</Text>
                <Text style={styles.profileInfoValue}>{userData.propriedade}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Cadastro</Text>
                <Text style={styles.profileInfoValue}>{userData.cadastro}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color || '#6b7280'}
                  />
                  <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal de edição */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            {/* Foto do perfil */}
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={() =>
                Alert.alert('Alterar Foto', 'Escolha a forma de alterar a foto', [
                  { text: 'Galeria', onPress: pickImageFromGallery },
                  { text: 'Câmera', onPress: takePhotoWithCamera },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
            >
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={28} color="#9ca3af" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editNome}
              onChangeText={setEditNome}
            />

            <Text style={styles.inputLabel}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={editTelefone}
              onChangeText={setEditTelefone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Propriedade</Text>
            <TextInput
              style={styles.input}
              placeholder="Propriedade"
              value={editPropriedade}
              onChangeText={setEditPropriedade}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fdfdfd' 
  },
  centerContent: { 
    justifyContent: 'center', 
    alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' 

  },
  scrollView: { 
    flex: 1 
  },
  header: { 
    backgroundColor: '#16a34a', 
    paddingHorizontal: 4, 
    paddingVertical: 32, 
    paddingTop: 62 },
  headerContent: { 
    alignItems: 'center' 
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarInitials: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  avatarImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 50 
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#71ca90',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  userName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  userProperty: { 
    fontSize: 14, 
    color: '#bbf7d0', 
    marginTop: 4 
  },
  userTypeContainer: { 
    marginTop: 8, 
    marginBottom: 20 
  },
  userType: { 
    fontSize: 12, 
    fontWeight: '600', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  userTypeAdmin: { 
    backgroundColor: '#fef3c7', 
    color: '#92400e' 
  },
  userTypeColaborador: { 
    backgroundColor: '#e0f2fe', 
    color: '#0277bd' 
  },
  statsContainer: { 
    paddingHorizontal: 16, 
    marginTop: -32 
  },
  statsGrid: { 
    flexDirection: 'row', 
    gap: 12 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    elevation: 1 
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#16a34a' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#1f2937', 
    textAlign: 'center', 
    marginTop: 6 
  },
  profileInfoContainer: { 
    paddingHorizontal: 16, 
    marginTop: 24 
  },
  profileInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  profileInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileInfoList: {
    gap: 12,
  },
  profileInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  appInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 80,
  },
  profileInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#16a34a',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '500',
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PerfilScreen;