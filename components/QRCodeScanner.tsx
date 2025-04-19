import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import * as Haptics from 'expo-haptics';

interface QRCodeScannerProps {
  onScan: (data: { idDaArvore: string; idDoLote: string }) => void;
  onCancel: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onCancel }) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async (scanningResult: BarcodeScanningResult) => {
    if (!scanned && scanningResult?.data) {
      setScanned(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        const parsedData = JSON.parse(scanningResult.data);
        const { idDaArvore, idDoLote } = parsedData;

        if (idDaArvore && idDoLote) {
          onScan({ idDaArvore, idDoLote });
        } else {
          console.warn('QR Code não contém os campos esperados.');
        }
      } catch (error) {
        console.warn('QR Code inválido ou mal formatado.');
      }
    }
  };

  if (!permission) {
    return <Text>Solicitando permissão da câmera...</Text>;
  }

  if (!permission.granted) {
    return <Text>Permissão da câmera negada</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default QRCodeScanner;
