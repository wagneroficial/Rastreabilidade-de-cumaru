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
        <Ionicons name="qr-code-outline" size={48} color="#059669" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Escanear QR Code</Text>
          <Text style={styles.subtitle}>Clique aqui para registrar sua coleta</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    backgroundColor: 'white',
  },
  button: {
    borderWidth: 1,
    borderColor:'#16a34a70',
    backgroundColor: '#16a34a13',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {

    fontSize: 18,
    fontWeight: '600',
    color:  '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 4,
  },
});

export default QRScannerButton;