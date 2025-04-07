// coleta.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import styles from './Styles';
import QRCodeScanner from '@/components/QRCodeScanner'; 

const ColetaScreen = () => {
  const [kg, setKg] = useState('');
  const [idArvore, setIdArvore] = useState('');
  const [idLote, setIdLote] = useState('');
  const [date, setDate] = useState(new Date());
  const [dataRegistro, setDataRegistro] = useState(
    date.toLocaleDateString('pt-BR')
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false); // <- controlar QRCode

  const handleScanQRCode = () => {
    setShowScanner(true);
  };

  const handleQRCodeScanned = (data: string) => {
    // Supondo que o QRCode contenha "ARV2330,LOT145"
    const [arvore, lote] = data.split(',');
    setIdArvore(arvore);
    setIdLote(lote);
    setShowScanner(false);
  };

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setDataRegistro(currentDate.toLocaleDateString('pt-BR'));
  };

  const handleCadastrar = () => {
    if (!kg || !idArvore || !idLote || !dataRegistro) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos");
      return;
    }

    console.log({ kg, idArvore, idLote, dataRegistro });

    Alert.alert(
      "Sucesso",
      "Coleta registrada com sucesso!",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleCancelar = () => {
    router.back();
  };

  if (showScanner) {
    return (
      <QRCodeScanner
        onScan={handleQRCodeScanned}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleCancelar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coleta de sementes</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <View style={styles.qrCodeContainer}>
        <TouchableOpacity style={styles.qrButton} onPress={handleScanQRCode}>
          <Ionicons name="qr-code" size={32} color={Colors.appColors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kg:</Text>
          <TextInput
            style={styles.input}
            value={kg}
            onChangeText={setKg}
            keyboardType="numeric"
            placeholder="Informe o peso em kg"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Digite o ID da árvore:</Text>
          <TextInput
            style={styles.input}
            value={idArvore}
            onChangeText={setIdArvore}
            placeholder="Ex: 1234"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Digite o ID do lote:</Text>
          <TextInput
            style={styles.input}
            value={idLote}
            onChangeText={setIdLote}
            placeholder="Ex: L001"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de cadastro:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              value={dataRegistro}
              editable={false}
              placeholder="DD/MM/AAAA"
            />
            <Ionicons name="calendar" size={24} color={Colors.appColors.primary} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleCadastrar}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelar}>
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ColetaScreen;
