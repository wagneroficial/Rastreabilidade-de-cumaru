import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    SafeAreaView,
    Modal,
    StatusBar,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import loteStyles from './Styles';

// Importe a imagem local que está na mesma pasta
const plantacaoImagem = require('./favicon.png');

// Interface para definir a estrutura de um Lote
interface Lote {
    id: string;
    idLote: string;
    totalArvores: number;
    kgColetados: number;
    imagem: ImageSourcePropType;
}

// Dados de exemplo para os lotes
const LOTES_EXEMPLO: Lote[] = [
    { id: '1', idLote: '2320', totalArvores: 100, kgColetados: 200, imagem: plantacaoImagem },
    { id: '2', idLote: '2321', totalArvores: 150, kgColetados: 250, imagem: plantacaoImagem },
];

const LotesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [novoIdLote, setNovoIdLote] = useState('');
    const [searchText, setSearchText] = useState('');

    // Função para navegar para a tela de detalhes do lote (árvores)
    const navigateToArvores = (loteId: string, loteNome: string) => {
        router.push({
            pathname: '/arvores',
            params: { id: loteId, nome: loteNome }
        });
    };

    // Renderiza cada item da lista de lotes
    const renderLoteItem = ({ item }: { item: Lote }) => (
        <TouchableOpacity 
            style={loteStyles.loteItem}
            onPress={() => navigateToArvores(item.id, `Lote ${item.idLote}`)}
        >
            <View style={loteStyles.loteInfo}>
                <Text style={loteStyles.loteInfoText}>
                    <Text style={loteStyles.loteInfoLabel}>ID lote: </Text>
                    <Text style={loteStyles.loteInfoValue}>{item.idLote}</Text>
                </Text>
                <Text style={loteStyles.loteInfoText}>
                    <Text style={loteStyles.loteInfoLabel}>Total de árvores: </Text>
                    <Text style={loteStyles.loteInfoValue}>{item.totalArvores}</Text>
                </Text>
                <Text style={loteStyles.loteInfoText}>
                    <Text style={loteStyles.loteInfoLabel}>KG coletados: </Text>
                    <Text style={loteStyles.loteInfoValue}>{item.kgColetados}kg</Text>
                </Text>
            </View>
            <View style={loteStyles.loteImageContainer}>
                <Image 
                    source={item.imagem}
                    style={loteStyles.loteImage} 
                />
            </View>
        </TouchableOpacity>
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

    // Filtra os lotes com base no texto de pesquisa
    const filteredLotes = LOTES_EXEMPLO.filter(lote => 
        searchText === '' || lote.idLote.includes(searchText)
    );

    return (
        <SafeAreaView style={loteStyles.container}>
            <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
            
            {/* Header */}
            <View style={loteStyles.header}>
                <TouchableOpacity style={loteStyles.menuButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={loteStyles.headerTitle}>Lotes</Text>
                <View style={loteStyles.headerActionContainer}>
                    <View style={loteStyles.headerActionBadge}>
                        <Text style={loteStyles.headerActionBadgeText}>{LOTES_EXEMPLO.length}</Text>
                    </View>
                </View>
            </View>
            
            {/* Busca */}
            <View style={loteStyles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={loteStyles.searchIcon} />
                <TextInput
                    style={loteStyles.searchInput}
                    placeholder="Pesquise por um ID"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>
            
            {/* Lista de Lotes */}
            <FlatList
                data={filteredLotes}
                renderItem={renderLoteItem}
                keyExtractor={item => item.id}
                style={loteStyles.lotesList}
                contentContainerStyle={loteStyles.lotesListContent}
            />
            
            {/* Botão Adicionar */}
            <TouchableOpacity style={loteStyles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="#666" />
            </TouchableOpacity>
            
            {/* Modal para Cadastro de Lote */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={loteStyles.centeredView}>
                    <View style={loteStyles.modalView}>
                        <View style={loteStyles.modalHeader}>
                            <Text style={loteStyles.modalHeaderText}>Cadastrar Lote</Text>
                        </View>
                        
                        <View style={loteStyles.modalBody}>
                            <Text style={loteStyles.modalLabel}>Digite o ID do Lote:</Text>
                            <TextInput
                                style={loteStyles.modalInput}
                                value={novoIdLote}
                                onChangeText={setNovoIdLote}
                                placeholder="Digite o ID do lote"
                                keyboardType="numeric"
                            />
                            
                            <TouchableOpacity style={loteStyles.primaryButton} onPress={handleCadastrar}>
                                <Text style={loteStyles.primaryButtonText}>Cadastrar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={loteStyles.secondaryButton} onPress={handleCancelar}>
                                <Text style={loteStyles.secondaryButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LotesScreen;