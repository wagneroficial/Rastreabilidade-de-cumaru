import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar nova colheita</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
   header: {
    backgroundColor: '#16a34a',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingLeft: 16,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default Header;
