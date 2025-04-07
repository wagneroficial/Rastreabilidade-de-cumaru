import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';

const loteStyles = StyleSheet.create({
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
        flex: 0.65, // Reduzimos para dar mais espaço à imagem
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
        flex: 0.35, // Aumentamos o espaço para a imagem
        marginLeft: 10,
        alignItems: 'center', // Centraliza a imagem horizontalmente
        justifyContent: 'center', // Centraliza a imagem verticalmente
    },
    loteImage: {
        width: 90, // Aumentamos a largura
        height: 90, // Aumentamos a altura
        resizeMode: 'contain', // Mantém a proporção da imagem
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
        backgroundColor: 'rgba(131, 129, 129, 0.34)',
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

export default loteStyles;