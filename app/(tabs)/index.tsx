import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  ImageSourcePropType
} from 'react-native';
import { router } from 'expo-router';
import styles from './Styles'; 
import { Colors } from '@/constants/Colors';
import ProfileModal from '@/components/ProfileModal';

interface MenuItem {
  id: number;
  title: string;
  icon: ImageSourcePropType;
  route: string;
}

const DashboardScreen = () => {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const placeholderIcon = require('@/assets/images/react-logo.png');
  const coletaIcon = require('@/assets/images/coleta.png');
  
  // Dados do usuário
  const userData = {
    name: 'Wagner Sampaio',
    email: 'wagnersampaio@gmail.com',
    profileImage: placeholderIcon
  };
  
  // Itens do menu principal
  const menuItems: MenuItem[] = [
    { id: 1, title: 'Coleta', icon: coletaIcon, route: 'coleta' },
    { id: 2, title: 'Lotes', icon: placeholderIcon, route: 'lotes' },
    { id: 3, title: 'Geolocalização', icon: placeholderIcon, route: 'geolocalizacao' },
    { id: 4, title: 'Relatórios', icon: placeholderIcon, route: 'relatorios' },
    { id: 5, title: 'Gráficos', icon: placeholderIcon, route: 'graficos' },
    { id: 6, title: 'Quem Somos', icon: placeholderIcon, route: 'sobre' },
  ];

  // Função para navegação entre telas
  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  // Função para abrir o modal de perfil
  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  // Renderiza cada item do menu grid
  const renderMenuItem = (item: MenuItem) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.menuItem}
        onPress={() => handleNavigation(item.route)}
      >
        <View style={styles.iconContainer}>
          <Image source={item.icon} style={styles.icon} />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
      
      {/* Header com menu hamburger, título e foto de perfil */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuBar}></View>
          <View style={styles.menuBar}></View>
          <View style={styles.menuBar}></View>
        </TouchableOpacity>
        
        <Text style={styles.headerText}>Olá, {userData.name}</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Image 
            source={userData.profileImage} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Placeholder para barra de pesquisa */}
      <View style={styles.searchBarPlaceholder}></View>
      
      {/* Grid de menu com os itens */}
      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuGrid}>
          {menuItems.map(item => renderMenuItem(item))}
        </View>
      </ScrollView>

      {/* Modal de perfil */}
      <ProfileModal 
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userData={userData}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;