import React from 'react';
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
import { router } from 'expo-router'; // Importe o router
import styles from './Styles'; 
import { Colors } from '@/constants/Colors';

interface MenuItem {
  id: number;
  title: string;
  icon: ImageSourcePropType;
  route: string; // Nome da rota
}

const DashboardScreen = () => {
  const placeholderIcon = { uri: 'https://via.placeholder.com/50' };
  
  const menuItems: MenuItem[] = [
    { id: 1, title: 'Coleta', icon: placeholderIcon, route: 'coleta' },
    { id: 2, title: 'Lotes', icon: placeholderIcon, route: 'lotes' },
    { id: 3, title: 'Geolocalização', icon: placeholderIcon, route: 'geolocalizacao' },
    { id: 4, title: 'Relatórios', icon: placeholderIcon, route: 'relatorios' },
    { id: 5, title: 'Gráficos', icon: placeholderIcon, route: 'graficos' },
    { id: 6, title: 'Quem Somos', icon: placeholderIcon, route: 'sobre' },
  ];

  const handleNavigation = (route: string) => {
    // Navega para a rota especificada
    router.push(route as any);
  };

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
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuBar}></View>
          <View style={styles.menuBar}></View>
          <View style={styles.menuBar}></View>
        </TouchableOpacity>
        
        <Text style={styles.headerText}>Olá, Wagner Sampaio</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source={placeholderIcon} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBarPlaceholder}></View>
      
      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuGrid}>
          {menuItems.map(item => renderMenuItem(item))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;