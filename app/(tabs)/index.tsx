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
import { Asset } from 'expo-asset';
import styles from './DashboardStyles'; 
import { Colors } from '@/constants/Colors';

interface MenuItem {
  id: number;
  title: string;
  icon: ImageSourcePropType;
}

const DashboardScreen = () => {
  const placeholderIcon = { uri: 'https://via.placeholder.com/50' };
  
  const menuItems: MenuItem[] = [
    { id: 1, title: 'Coleta', icon: placeholderIcon },
    { id: 2, title: 'Lotes', icon: placeholderIcon },
    { id: 3, title: 'Geolocalização', icon: placeholderIcon },
    { id: 4, title: 'Relatórios', icon: placeholderIcon },
    { id: 5, title: 'Gráficos', icon: placeholderIcon },
    { id: 6, title: 'Quem Somos', icon: placeholderIcon },
  ];

  const renderMenuItem = (item: MenuItem) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.menuItem}
        onPress={() => console.log(`Clicou em ${item.title}`)}
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