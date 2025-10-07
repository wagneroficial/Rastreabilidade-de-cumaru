// components/coleta/QRScannerButton.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QRScannerButtonProps {
  onPress: () => void;
}

const QRScannerButton: React.FC<QRScannerButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Ionicons name="qr-code-outline" size={48} color="white" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Escanear QR Code</Text>
          <Text style={styles.subtitle}>Aponte para o QR da árvore</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 4,
  },
});

export default QRScannerButton;