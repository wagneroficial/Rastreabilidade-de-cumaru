import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { Colors } from '@/constants/Colors';
import styles from './ColetaStyles';

const ColetaScreen = () => {
    const [kg, setKg] = useState('');
    const [idArvore, setIdArvore] = useState('');
    const [idLote, setIdLote] = useState('');
    const [date, setDate] = useState(new Date());
    const [dataRegistro, setDataRegistro] = useState(
        date.toLocaleDateString('pt-BR')
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    // Estados para o scanner QR
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanning, setScanning] = useState(false);
    
    // Solicitar permissão da câmera quando o componente carregar
    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleScanQRCode = () => {
        if (hasPermission) {
            setScanning(true);
        } else {
            Alert.alert(
                "Permissão da câmera necessária",
                "Para escanear QR codes, é necessário permitir o acesso à câmera.",
                [
                    {
                        text: "Solicitar permissão",
                        onPress: async () => {
                            const { status } = await BarCodeScanner.requestPermissionsAsync();
                            setHasPermission(status === 'granted');
                            if (status === 'granted') setScanning(true);
                        }
                    },
                    { text: "Cancelar", style: "cancel" }
                ]
            );
        }
    };

    const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
        setScanning(false);
        
        try {
            // Tenta analisar o QR code como JSON
            const scannedData = JSON.parse(data);
            
            if (scannedData.idArvore) {
                setIdArvore(scannedData.idArvore);
            }
            
            if (scannedData.idLote) {
                setIdLote(scannedData.idLote);
            }
            
            Alert.alert("Leitura concluída", "Dados do QR code lidos com sucesso!");
        } catch (error) {
            // Se não for um JSON válido, usa o texto completo do QR code
            Alert.alert(
                "Código lido",
                `O código lido foi: ${data}. Deseja usar como ID da árvore ou ID do lote?`,
                [
                    {
                        text: "ID da Árvore",
                        onPress: () => setIdArvore(data)
                    },
                    {
                        text: "ID do Lote",
                        onPress: () => setIdLote(data)
                    },
                    {
                        text: "Cancelar",
                        style: "cancel"
                    }
                ]
            );
        }
    };

    const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios'); 
        setDate(currentDate);
        setDataRegistro(currentDate.toLocaleDateString('pt-BR'));
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={handleCancelar}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coleta de sementes</Text>
                <View style={{width: 44}} />
            </View>
            
            {/* QR Code button */}
            <View style={styles.qrCodeContainer}>
                <TouchableOpacity style={styles.qrButton} onPress={handleScanQRCode}>
                    <Ionicons name="qr-code" size={32} color={Colors.appColors.primary} />
                </TouchableOpacity>
            </View>
            
            {/* Formulário */}
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
                    <TouchableOpacity onPress={showDatepicker} style={styles.dateInputContainer}>
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
            
            {/* Modal para o scanner QR */}
            {scanning && (
                <Modal
                    visible={scanning}
                    animationType="slide"
                    onRequestClose={() => setScanning(false)}
                >
                    <SafeAreaView style={styles.scannerContainer}>
                        <BarCodeScanner
                            style={styles.scanner}
                            onBarCodeScanned={handleBarCodeScanned}
                            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                        />
                        <View style={styles.scannerOverlay}>
                            <View style={styles.scannerTargetOutline} />
                        </View>
                        <TouchableOpacity 
                            style={styles.closeScannerButton}
                            onPress={() => setScanning(false)}
                        >
                            <Ionicons name="close-circle" size={50} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default ColetaScreen;