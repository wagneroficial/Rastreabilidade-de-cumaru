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
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="egg-outline" size={24} color='#16a34a' />
              </View>
            </View>
            <Text style={styles.stepSubtitle}>Escaneie o QR code abaixo para registrar uma nova coleta</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'white',
  },
    iconContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
    stepSubtitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '600',
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