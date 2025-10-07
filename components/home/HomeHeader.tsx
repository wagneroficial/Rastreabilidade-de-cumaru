// components/home/HomeHeader.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  isAdmin: boolean;
  onNotificationsPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ isAdmin, onNotificationsPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>CumaruApp</Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin ? 'Gestão de Colheitas' : 'Minhas Colheitas'}
          </Text>
        </View>
        <TouchableOpacity onPress={onNotificationsPress} style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bbf7d0',
  },
  notificationButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;