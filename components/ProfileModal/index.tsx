import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    profileImage?: any;
  };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  visible, 
  onClose, 
  userData
}) => {
  
  const handleOptionSelect = (option: string) => {
    onClose(); // Fecha o modal
    
    switch(option) {
      case 'profile':
        router.push('perfil' as any);
        break;
      case 'password':
        router.push('novaSenha' as any);
        break;
      case 'notifications':
        router.push('notifications' as any);
        break;
      case 'logout':
        // Lógica de logout
        Alert.alert(
          'Sair',
          'Tem certeza que deseja sair do aplicativo?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Sim, sair',
              onPress: () => {
                console.log('Usuário fez logout');
                router.replace('login' as any);
              }
            }
          ]
        );
        break;
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={userData.profileImage || require('@/assets/images/favicon.png')}
                style={styles.profileImage} 
              />
              <TouchableOpacity style={styles.editImageButton}>
                <Text style={styles.editImageText}>Editar</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
          
          <ScrollView style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleOptionSelect('profile')}
            >
              <Text style={styles.menuItemText}>Meu perfil</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleOptionSelect('password')}
            >
              <Text style={styles.menuItemText}>Alterar senha</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleOptionSelect('notifications')}
            >
              <Text style={styles.menuItemText}>Notificações</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => handleOptionSelect('logout')}
          >
            <Ionicons name="log-out-outline" size={20} color="#333" />
            <Text style={styles.logoutText}>Sair do aplicativo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Estilos permanecem iguais...
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    marginTop: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%'
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: -15,
    backgroundColor: Colors.appColors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15
  },
  editImageText: {
    color: 'white',
    fontSize: 12
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  userEmail: {
    fontSize: 16,
    color: '#666'
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 20
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  menuItemText: {
    fontSize: 16,
    color: '#333'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    padding: 15,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#f2f2f2'
  },
  logoutText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10
  }
});

export default ProfileModal;