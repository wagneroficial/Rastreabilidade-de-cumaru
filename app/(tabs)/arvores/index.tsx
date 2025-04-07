import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    SafeAreaView,
    StatusBar,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import ArvoreStyles from './Styles';

// Imagens locais para os status das árvores
const arvoreHealthyImage = require('./favicon.png');
const arvoreDeadImage = require('./favicon.png');

// Interface para definir a estrutura de uma Árvore
interface Arvore {
    id: string;
    idArvore: string;
    kgColetados: number;
    status: 'Saudável' | 'Morta';
}

// Dados de exemplo para árvores do lote
const ARVORES_EXEMPLO: Arvore[] = [
    { id: '1', idArvore: '2320', kgColetados: 200, status: 'Saudável' },
    { id: '2', idArvore: '2320', kgColetados: 200, status: 'Morta' },
    { id: '3', idArvore: '2320', kgColetados: 200, status: 'Saudável' },
    { id: '4', idArvore: '2320', kgColetados: 200, status: 'Saudável' },
];

const LoteDetailScreen = () => {
    // Obtém os parâmetros da rota
    const params = useLocalSearchParams();
    const loteId = params.id as string;
    const loteName = params.nome as string || 'Lote 1';

    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('Todos');

    // Função para navegar para a tela de detalhes da árvore
    const navigateToArvoreDetalhe = (arvoreId: string, arvoreNome: string) => {
        router.push({
            pathname: '/arvoreDetalhe' as any,
            params: { id: arvoreId, nome: arvoreNome }
        });
    };

    // Filtra as árvores com base no texto de pesquisa e tipo de filtro
    const filteredArvores = ARVORES_EXEMPLO.filter(arvore => {
        const matchesSearch = searchText === '' || 
                            arvore.idArvore.includes(searchText);
        
        const matchesFilter = filterType === 'Todos' || 
                            arvore.status === filterType;
        
        return matchesSearch && matchesFilter;
    });

    // Renderiza cada item da lista de árvores
    const renderArvoreItem = ({ item }: { item: Arvore }) => (
        <TouchableOpacity 
            style={ArvoreStyles.arvoreItem}
            onPress={() => navigateToArvoreDetalhe(item.idArvore, `Árvore ${item.idArvore}`)}
        >
            <View style={ArvoreStyles.arvoreInfo}>
                <Text style={ArvoreStyles.arvoreInfoText}>
                    <Text style={ArvoreStyles.arvoreInfoLabel}>ID árvore: </Text>
                    <Text style={ArvoreStyles.arvoreInfoValue}>{item.idArvore}</Text>
                </Text>
                <Text style={ArvoreStyles.arvoreInfoText}>
                    <Text style={ArvoreStyles.arvoreInfoLabel}>KG coletados: </Text>
                    <Text style={ArvoreStyles.arvoreInfoValue}>{item.kgColetados}kg</Text>
                </Text>
            </View>
            <View style={ArvoreStyles.arvoreStatusContainer}>
                <Image 
                    source={item.status === 'Saudável' ? arvoreHealthyImage : arvoreDeadImage}
                    style={ArvoreStyles.arvoreStatusImage} 
                />
                <Text style={ArvoreStyles.arvoreStatusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    // Toggle do filtro
    const toggleFilter = () => {
        const filters = ['Todos', 'Saudável', 'Morta'];
        const currentIndex = filters.indexOf(filterType);
        const nextIndex = (currentIndex + 1) % filters.length;
        setFilterType(filters[nextIndex]);
    };

    return (
        <SafeAreaView style={ArvoreStyles.container}>
            <StatusBar backgroundColor={Colors.appColors.primary} barStyle="light-content" />
            
            {/* Header */}
            <View style={ArvoreStyles.header}>
                <TouchableOpacity style={ArvoreStyles.menuButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={ArvoreStyles.headerTitle}>{loteName}</Text>
                <View style={{ width: 44 }} />
            </View>
            
            {/* Busca e Filtro */}
            <View style={ArvoreStyles.searchRow}>
                <View style={ArvoreStyles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={ArvoreStyles.searchIcon} />
                    <TextInput
                        style={ArvoreStyles.searchInput}
                        placeholder="Pesquise por um ID"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                
                <TouchableOpacity style={ArvoreStyles.filterButton} onPress={toggleFilter}>
                    <Text style={ArvoreStyles.filterText}>{filterType}</Text>
                    <Ionicons name="chevron-down" size={20} color="#333" />
                </TouchableOpacity>
            </View>
            
            {/* Lista de Árvores */}
            <FlatList
                data={filteredArvores}
                renderItem={renderArvoreItem}
                keyExtractor={item => item.id}
                style={ArvoreStyles.arvoresList}
                contentContainerStyle={ArvoreStyles.arvoresListContent}
            />
            
            {/* Botão Adicionar */}
            <TouchableOpacity style={ArvoreStyles.addButton} onPress={() => console.log('Adicionar árvore')}>
                <Ionicons name="add" size={32} color="#666" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default LoteDetailScreen;