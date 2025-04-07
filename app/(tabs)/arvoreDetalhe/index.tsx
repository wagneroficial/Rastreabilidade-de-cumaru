import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    SafeAreaView,
    StatusBar,
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Imagens para os status das árvores
const statusIcons = {
    saudavel: require('./favicon.png'),
    infectada: require('./favicon.png'),
    morta: require('./favicon.png'),
};

// Interface para uma coleta
interface Coleta {
    id: string;
    data: string;
    kg: number;
}

// Dados mockados da árvore
const arvoreData = {
    id: '2320',
    idLote: '2098',
    kgColetados: 200,
    status: 'saudavel',
    coletas: [
        { id: '1', data: '23/03/2025', kg: 3 },
        { id: '2', data: '17/03/2025', kg: 7 },
        { id: '3', data: '23/02/2025', kg: 3 },
        { id: '4', data: '17/01/2025', kg: 7 },
    ]
};

const ArvoreDetailScreen = () => {
    const params = useLocalSearchParams();
    const arvoreId = params.id as string || '2320';
    
    // Estado para a data de nova coleta
    const [novaColetaData, setNovaColetaData] = useState('');
    
    // Função para selecionar status
    const handleStatusSelect = (status: string) => {
        console.log('Status selecionado:', status);
        // Aqui você implementaria a lógica para atualizar o status da árvore
    };
    
    // Renderiza cada coleta na tabela de histórico
    const renderColetaItem = (coleta: Coleta) => (
        <View key={coleta.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{coleta.data}</Text>
            <Text style={styles.tableCell}>{coleta.kg}kg</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Árvore {arvoreId}</Text>
                <View style={{ width: 44 }} />
            </View>
            
            <ScrollView style={styles.scrollView}>
                {/* Dados da árvore */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados da árvore</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID árvore: </Text>
                        <Text style={styles.infoValue}>{arvoreData.id}</Text>
                        
                        <View style={styles.qrContainer}>
                            <Image 
                                source={require('./favicon.png')}
                                style={styles.qrCode}
                            />
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID lote: </Text>
                        <Text style={styles.infoValue}>{arvoreData.idLote}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>KG coletados: </Text>
                        <Text style={styles.infoValue}>{arvoreData.kgColetados}kg</Text>
                    </View>
                </View>
                
                {/* Status da árvore */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status da árvore</Text>
                    
                    <View style={styles.statusContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.statusOption, 
                                arvoreData.status === 'saudavel' && styles.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('saudavel')}
                        >
                            <Image source={statusIcons.saudavel} style={styles.statusIcon} />
                            <Text style={styles.statusText}>Saudável</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.statusOption,
                                arvoreData.status === 'infectada' && styles.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('infectada')}
                        >
                            <Image source={statusIcons.infectada} style={styles.statusIcon} />
                            <Text style={styles.statusText}>Infectada</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.statusOption,
                                arvoreData.status === 'morta' && styles.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('morta')}
                        >
                            <Image source={statusIcons.morta} style={styles.statusIcon} />
                            <Text style={styles.statusText}>Morta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Coletas feitas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coletas feitas</Text>
                    
                    <View style={styles.dataInputContainer}>
                        <Text style={styles.dataInputLabel}>Data:</Text>
                        <View style={styles.dataInput}>
                            <TextInput
                                style={styles.dataInputText}
                                placeholder="DD/MM/AAAA"
                                value={novaColetaData}
                                onChangeText={setNovaColetaData}
                            />
                            <TouchableOpacity style={styles.calendarButton}>
                                <Ionicons name="calendar" size={24} color={Colors.appColors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* Tabela de coletas */}
                    <View style={styles.tableContainer}>
                        {/* Cabeçalho da tabela */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>Data</Text>
                            <Text style={styles.tableHeaderCell}>KG</Text>
                        </View>
                        
                        {/* Linhas da tabela */}
                        {arvoreData.coletas.map(renderColetaItem)}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: Colors.appColors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    menuButton: {
        padding: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: '#333',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    qrContainer: {
        marginLeft: 'auto',
    },
    qrCode: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    statusOption: {
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        width: '30%',
    },
    statusSelected: {
        borderColor: Colors.appColors.primary,
        borderWidth: 2,
    },
    statusIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#333',
    },
    dataInputContainer: {
        marginBottom: 16,
    },
    dataInputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    dataInput: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },
    dataInputText: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    calendarButton: {
        padding: 12,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.appColors.primary,
        padding: 12,
    },
    tableHeaderCell: {
        flex: 1,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    tableCell: {
        flex: 1,
        padding: 12,
        textAlign: 'center',
    },
});

export default ArvoreDetailScreen;