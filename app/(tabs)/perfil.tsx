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

import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Tipagens
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [editVisible, setEditVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editPropriedade, setEditPropriedade] = useState('');
  const [saving, setSaving] = useState(false);

  function randomColor({ seed }: { seed: string }): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 45%)`;
  }

  // Carregar avatar salvo
  useEffect(() => {
    const loadAvatar = async () => {
      const savedUri = await AsyncStorage.getItem('userAvatar');
      if (savedUri) setAvatarUri(savedUri);
    };
    loadAvatar();
  }, []);

  // Buscar dados do usuário
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
            };
            setUserData(userDataFormatted);
            setAvatarColor(randomColor({ seed: userDataFormatted.nome }));
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

  // 🔹 Função para abrir modal preenchendo os inputs
  const openEditModal = () => {
    if (!userData) return;

    setEditNome(userData.nome);
    setEditTelefone(userData.telefone);
    setEditPropriedade(userData.propriedade);

    // Abrir modal após preencher os estados
    setTimeout(() => setEditVisible(true), 0);
  };

  // 🔹 Escolher imagem
  const pickImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem('userAvatar', uri);
        Alert.alert('Sucesso!', 'Foto atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
    }
  };

  // 🔹 Salvar alterações
  const handleSaveChanges = async () => {
    if (!userData || !auth.currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      await updateDoc(userRef, {
        nome: editNome.trim(),
        telefone: editTelefone.trim(),
        propriedade: editPropriedade.trim(),
      });

      setUserData({
        ...userData,
        nome: editNome.trim(),
        telefone: editTelefone.trim(),
        propriedade: editPropriedade.trim(),
      });

      setAvatarColor(randomColor({ seed: editNome.trim() }));
      setEditVisible(false);
      Alert.alert('Sucesso', 'Informações salvas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro durante logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao sair. Tente novamente.');
    }
  };

  // 🔹 Menu
  const menuItems: MenuItem[] = [
    { title: 'Relatórios', icon: 'document-text-outline', route: '/relatorios' },
    { title: 'Notificações', icon: 'notifications-outline', route: '/notificacoes' },
    { title: 'Sobre Nós', icon: 'information-circle-outline', route: '/quem-somos' },
    { title: 'Segurança', icon: 'shield-checkmark-outline', route: '/seguranca' },
    { title: 'Ajuda', icon: 'help-circle-outline', route: '/ajuda' },
    { title: 'Sair', icon: 'log-out-outline', action: 'logout', color: '#dc2626' },
  ];

  // 🔹 Estatísticas (exemplo)
  const stats: StatItem[] = [
    { label: 'Total Lotes', value: '12' },
    { label: 'Total Colhido', value: '1.2t' },
    { label: 'Dias Ativo', value: '45' },
  ];

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated]);

  if (loading)
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text>Carregando perfil...</Text>
      </SafeAreaView>
    );

  if (!isAuthenticated || !userData)
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text>Redirecionando...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarInitials}>
                    {userData.nome
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={openEditModal} // <- função corrigida
              >
                <Ionicons name="brush" size={18} color="white" />
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

        {/* Estatísticas */}
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

        {/* Menu */}
        <View style={styles.menuContainer}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => {
                  if (item.action === 'logout') {
                    Alert.alert('Sair', 'Tem certeza que deseja sair do aplicativo?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Sair', style: 'destructive', onPress: handleLogout },
                    ]);
                  } else if (item.route) {
                    router.push(item.route as any);
                  }
                }}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons name={item.icon as any} size={20} color={item.color || '#6b7280'} />
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
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <View style={styles.avatarEditContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImageModal} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarInitials}>
                    {editNome
                      ? editNome
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                      : 'U'}
                  </Text>
                </View>
              )}

              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={styles.avatarActionButton}
                  onPress={() =>
                    Alert.alert('Foto de Perfil', 'Escolha uma opção:', [
                      { text: 'Galeria', onPress: () => pickImage(false) },
                      { text: 'Câmera', onPress: () => pickImage(true) },
                      { text: 'Cancelar', style: 'cancel' },
                    ])
                  }
                >
                  <Ionicons name="camera-outline" size={22} color="white" />
                </TouchableOpacity>

                {avatarUri && (
                  <TouchableOpacity
                    style={[styles.avatarActionButton, { backgroundColor: '#eaeaea' }]}
                    onPress={async () => {
                      setAvatarUri(null);
                      await AsyncStorage.removeItem('userAvatar');
                    }}
                  >
                    <Ionicons name="trash-outline" size={22} color="#1f2937" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Formulário */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput style={styles.input} value={editNome} onChangeText={setEditNome} />

              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={editTelefone}
                onChangeText={setEditTelefone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Propriedade</Text>
              <TextInput style={styles.input} value={editPropriedade} onChangeText={setEditPropriedade} />
            </View>

            {/* Botões */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd'
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#6b7280'
  },

  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 4,
    paddingVertical: 32,
    paddingTop: 62
  },

  headerContent: {
    alignItems: 'center'
  },

  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },

  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },

  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 50,
    resizeMode: 'cover'
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#71ca90',
    width: 34,
    height: 34,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a'
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },

  userProperty: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 4
  },

  avatarInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: "center",
  },
  removePhotoButton: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8
  },

  removePhotoText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
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
    borderRadius: 12,
    overflow: 'hidden'
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
    padding: 16
  },

  profileInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },

  profileInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },

  profileInfoList: {
    gap: 12
  },

  profileInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },

  profileInfoLabel: {
    fontSize: 14,
    color: '#6b7280'
  },

  profileInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16
  },

  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 24
  },

  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },

  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  avatarEditContainer: {
    alignItems: 'center',
    position: 'relative',
  },

  avatarImageModal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  avatarActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  avatarActionButton: {
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 50,
  },
  inputLabel: {
    marginBottom: 12
  },

  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827'
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8
  },

  cancelButton: {
    backgroundColor: '#f3f4f6'
  },

  saveButton: {
    backgroundColor: '#16a34a'
  },

  cancelText: {
    color: '#374151',
    fontWeight: '500'
  },

  saveText: {
    color: 'white',
    fontWeight: '600'
  },
});

export default PerfilScreen;
