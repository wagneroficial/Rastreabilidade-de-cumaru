import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    SafeAreaView,
    StatusBar,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import stylesArvores from './Styles';

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
        <View key={coleta.id} style={stylesArvores.tableRow}>
            <Text style={stylesArvores.tableCell}>{coleta.data}</Text>
            <Text style={stylesArvores.tableCell}>{coleta.kg}kg</Text>
        </View>
    );

    return (
        <SafeAreaView style={stylesArvores.container}>
            <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
            
            {/* Header */}
            <View style={stylesArvores.header}>
                <TouchableOpacity style={stylesArvores.menuButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={stylesArvores.headerTitle}>Árvore {arvoreId}</Text>
                <View style={{ width: 44 }} />
            </View>
            
            <ScrollView style={stylesArvores.scrollView}>
                {/* Dados da árvore */}
                <View style={stylesArvores.section}>
                    <Text style={stylesArvores.sectionTitle}>Dados da árvore</Text>
                    
                    <View style={stylesArvores.infoRow}>
                        <Text style={stylesArvores.infoLabel}>ID árvore: </Text>
                        <Text style={stylesArvores.infoValue}>{arvoreData.id}</Text>
                        
                        <View style={stylesArvores.qrContainer}>
                            <Image 
                                source={require('./favicon.png')}
                                style={stylesArvores.qrCode}
                            />
                        </View>
                    </View>
                    
                    <View style={stylesArvores.infoRow}>
                        <Text style={stylesArvores.infoLabel}>ID lote: </Text>
                        <Text style={stylesArvores.infoValue}>{arvoreData.idLote}</Text>
                    </View>
                    
                    <View style={stylesArvores.infoRow}>
                        <Text style={stylesArvores.infoLabel}>KG coletados: </Text>
                        <Text style={stylesArvores.infoValue}>{arvoreData.kgColetados}kg</Text>
                    </View>
                </View>
                
                {/* Status da árvore */}
                <View style={stylesArvores.section}>
                    <Text style={stylesArvores.sectionTitle}>Status da árvore</Text>
                    
                    <View style={stylesArvores.statusContainer}>
                        <TouchableOpacity 
                            style={[
                                stylesArvores.statusOption, 
                                arvoreData.status === 'saudavel' && stylesArvores.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('saudavel')}
                        >
                            <Image source={statusIcons.saudavel} style={stylesArvores.statusIcon} />
                            <Text style={stylesArvores.statusText}>Saudável</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                stylesArvores.statusOption,
                                arvoreData.status === 'infectada' && stylesArvores.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('infectada')}
                        >
                            <Image source={statusIcons.infectada} style={stylesArvores.statusIcon} />
                            <Text style={stylesArvores.statusText}>Infectada</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                stylesArvores.statusOption,
                                arvoreData.status === 'morta' && stylesArvores.statusSelected
                            ]}
                            onPress={() => handleStatusSelect('morta')}
                        >
                            <Image source={statusIcons.morta} style={stylesArvores.statusIcon} />
                            <Text style={stylesArvores.statusText}>Morta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Coletas feitas */}
                <View style={stylesArvores.section}>
                    <Text style={stylesArvores.sectionTitle}>Coletas feitas</Text>
                    
                    <View style={stylesArvores.dataInputContainer}>
                        <Text style={stylesArvores.dataInputLabel}>Data:</Text>
                        <View style={stylesArvores.dataInput}>
                            <TextInput
                                style={stylesArvores.dataInputText}
                                placeholder="DD/MM/AAAA"
                                value={novaColetaData}
                                onChangeText={setNovaColetaData}
                            />
                            <TouchableOpacity style={stylesArvores.calendarButton}>
                                <Ionicons name="calendar" size={24} color={Colors.appColors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* Tabela de coletas */}
                    <View style={stylesArvores.tableContainer}>
                        {/* Cabeçalho da tabela */}
                        <View style={stylesArvores.tableHeader}>
                            <Text style={stylesArvores.tableHeaderCell}>Data</Text>
                            <Text style={stylesArvores.tableHeaderCell}>KG</Text>
                        </View>
                        
                        {/* Linhas da tabela */}
                        {arvoreData.coletas.map(renderColetaItem)}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};



export default ArvoreDetailScreen;