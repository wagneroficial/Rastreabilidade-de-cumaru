import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Modal,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Interface para definir a estrutura de um Lote
interface Lote {
    id: string;
    idLote: string;
    totalArvores: number;
    kgColetados: number;
    }

    // Dados de exemplo para os lotes
const LOTES_EXEMPLO: Lote[] = [
    { id: '1', idLote: '2320', totalArvores: 100, kgColetados: 200 },
    { id: '2', idLote: '2320', totalArvores: 100, kgColetados: 200 },
    ];

const LotesScreen = () => {
const [modalVisible, setModalVisible] = useState(false);
const [novoIdLote, setNovoIdLote] = useState('');
const [searchText, setSearchText] = useState('');

    // Renderiza cada item da lista de lotes
const renderLoteItem = ({ item }: { item: Lote }) => (
    <View style={styles.loteItem}>
    <View style={styles.loteInfo}>
        <Text style={styles.loteInfoText}>
        <Text style={styles.loteInfoLabel}>ID lote: </Text>
        <Text style={styles.loteInfoValue}>{item.idLote}</Text>
        </Text>
        <Text style={styles.loteInfoText}>
        <Text style={styles.loteInfoLabel}>Total de árvores: </Text>
        <Text style={styles.loteInfoValue}>{item.totalArvores}</Text>
        </Text>
        <Text style={styles.loteInfoText}>
        <Text style={styles.loteInfoLabel}>KG coletados: </Text>
        <Text style={styles.loteInfoValue}>{item.kgColetados}kg</Text>
        </Text>
    </View>
    <View style={styles.loteImageContainer}>
        <Image 
        source={{ uri: 'https://via.placeholder.com/100x100/008000/FFFFFF?text=Lote' }}
        style={styles.loteImage} 
        />
    </View>
    </View>
);

const handleCadastrar = () => {
    if (!novoIdLote.trim()) {
    return;
    }
    
    // Aqui você implementaria a lógica para salvar o novo lote
    console.log('Cadastrando lote com ID:', novoIdLote);
    
    // Fechar o modal e limpar o campo
    setModalVisible(false);
    setNovoIdLote('');
};

const handleCancelar = () => {
    setModalVisible(false);
    setNovoIdLote('');
};

return (
    <SafeAreaView style={styles.container}>
    <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
    
    {/* Header */}
    <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
        <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lotes</Text>
        <View style={styles.headerActionContainer}>
        <View style={styles.headerActionBadge}>
            <Text style={styles.headerActionBadgeText}>2</Text>
        </View>
        </View>
    </View>
    
    {/* Busca */}
    <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
        style={styles.searchInput}
        placeholder="Pesquise por um ID"
        value={searchText}
        onChangeText={setSearchText}
        />
    </View>
    
    {/* Lista de Lotes */}
    <FlatList
        data={LOTES_EXEMPLO}
        renderItem={renderLoteItem}
        keyExtractor={item => item.id}
        style={styles.lotesList}
        contentContainerStyle={styles.lotesListContent}
    />
    
    {/* Botão Adicionar */}
    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#666" />
    </TouchableOpacity>
    
    {/* Modal para Cadastro de Lote */}
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
    >
        <View style={styles.centeredView}>
        <View style={styles.modalView}>
            <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Cadastrar Lote</Text>
            </View>
            
            <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Digite o ID do Lote:</Text>
            <TextInput
                style={styles.modalInput}
                value={novoIdLote}
                onChangeText={setNovoIdLote}
                placeholder="Digite o ID do lote"
                keyboardType="numeric"
            />
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleCadastrar}>
                <Text style={styles.primaryButtonText}>Cadastrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelar}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    </Modal>
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
    headerActionContainer: {
        width: 40,
        alignItems: 'center',
    },
    headerActionBadge: {
        backgroundColor: '#FF66CC',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActionBadgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        margin: 16,
        marginTop: 20,
        borderRadius: 25,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    lotesList: {
        flex: 1,
    },
    lotesListContent: {
        padding: 16,
    },
    loteItem: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loteInfo: {
        flex: 1,
    },
    loteInfoText: {
        fontSize: 16,
        marginBottom: 4,
    },
    loteInfoLabel: {
        fontWeight: '400',
    },
    loteInfoValue: {
        fontWeight: 'bold',
    },
    loteImageContainer: {
        marginLeft: 10,
    },
    loteImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    addButton: {
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        backgroundColor: 'white',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: -3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalBody: {
        padding: 20,
    },
    modalLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: Colors.appColors.primary,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#333',
        fontSize: 16,
    },
    });

export default LotesScreen;