import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { auth, db } from '@/app/services/firebaseConfig.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
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
  adminOnly?: boolean;
}

const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>('#16a34a');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [editVisible, setEditVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editPropriedade, setEditPropriedade] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharingQR, setSharingQR] = useState(false);

  const qrCodeRef = useRef<View>(null);
  const cumaruLink = 'https://rastreamentocumaru.netlify.app/';

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

  // 🔹 Compartilhar QR Code como PNG
  const handleShareQRCode = async () => {
    try {
      setSharingQR(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
        setSharingQR(false);
        return;
      }
      const uri = await captureRef(qrCodeRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar QR Code'
      });
      setSharingQR(false);
    } catch (error) {
      console.error('Erro ao compartilhar QR Code:', error);
      setSharingQR(false);
      Alert.alert('Erro', 'Não foi possível compartilhar o QR Code.');
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
  const allMenuItems: MenuItem[] = [
    { title: 'Notificações', icon: 'notifications-outline', route: '/notificacoes' },
    { title: 'Relatórios', icon: 'document-text-outline', route: '/relatorios', adminOnly: true },
    { title: 'Geolocalização', icon: 'location-outline', route: '/geolocalizacao' },
    { title: 'Sobre Nós', icon: 'information-circle-outline', route: '/quem-somos' },
    { title: 'Segurança e Senha', icon: 'shield-checkmark-outline', route: '/seguranca' },
    { title: 'Ajuda & Suporte', icon: 'help-circle-outline', route: '/ajuda' },
    { title: 'Sair', icon: 'log-out-outline', action: 'logout', color: '#c82929' },
  ];

  // Filtra o menu baseado no tipo de usuário
  const menuItems = allMenuItems.filter(
    item => !item.adminOnly || userData?.tipo === 'admin'
  );

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
      <StatusBar backgroundColor='#16a34a' barStyle="light-content" />
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
                onPress={openEditModal}
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
            {/* Botão QR Code */}
              <TouchableOpacity style={styles.qrcode} onPress={() => setQrVisible(true)}>
                <Ionicons name="qr-code-outline" size={32} color="white" />
              </TouchableOpacity>           
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
                  <Ionicons name={item.icon as any} size={22} color={item.color || "#73777f"} />
                  <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
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

      {/* Modal QR Code */}
      <Modal visible={qrVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContainer}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>QR Code da Propriedade</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <Ionicons name="close" size={28} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <Text style={styles.qrModalSubtitle}>
              Escaneie o QR Code para saber sobre a origem do Cumaru adquirido
            </Text>

            {/* View que será capturada como imagem */}
            <View
              ref={qrCodeRef}
              collapsable={false}
              style={styles.qrCodeCaptureContainer}
            >
              <View style={styles.qrCodeHeader}>
                <View style={styles.qrCodeHeaderIcon}>
                  <Ionicons name="leaf" size={32} color="#16a34a" />
                </View>
                <Text style={styles.qrCodeHeaderTitle}>CumaTrack</Text>
              </View>

              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={cumaruLink}
                  size={220}
                  color="#000000"
                  backgroundColor="white"
                />
              </View>

              <View style={styles.qrCodeFooter}>
                <Text style={styles.qrCodeFooterTitle}>Cumaru</Text>
                <Text style={styles.qrCodeFooterText}>
                  Escaneie para saber mais
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.shareQrButton, sharingQR && styles.shareQrButtonDisabled]}
              onPress={handleShareQRCode}
              disabled={sharingQR}
            >
              {sharingQR ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.shareQrButtonText}>Preparando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="share-social-outline" size={20} color="white" />
                  <Text style={styles.shareQrButtonText}>Compartilhar QR Code</Text>
                </>
              )}
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 32,
    marginBottom: 24,
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
    marginBottom: 20,
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
  qrcode: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#69ce8c',
    borderRadius: 4
  },  
  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 132,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
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

  qrModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },

  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  qrModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  qrModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },

  qrCodeCaptureContainer: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
  },

  qrCodeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  qrCodeHeaderIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#F0FDF4',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  qrCodeHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },

  qrCodeWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },

  qrCodeFooter: {
    alignItems: 'center',
    marginTop: 20,
  },

  qrCodeFooterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  qrCodeFooterText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  shareQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 10,
    marginTop: 24,
  },

  shareQrButtonDisabled: {
    opacity: 0.5,
  },

  shareQrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerfilScreen;