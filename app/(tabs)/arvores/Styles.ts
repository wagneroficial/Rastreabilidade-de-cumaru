import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';

const ArvoreStyles = StyleSheet.create({
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        marginTop: 20,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    filterText: {
        fontSize: 14,
        marginRight: 5,
    },
    arvoresList: {
        flex: 1,
    },
    arvoresListContent: {
        padding: 16,
    },
    arvoreItem: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    arvoreInfo: {
        flex: 0.7,
    },
    arvoreInfoText: {
        fontSize: 16,
        marginBottom: 4,
    },
    arvoreInfoLabel: {
        fontWeight: '400',
    },
    arvoreInfoValue: {
        fontWeight: 'bold',
    },
    arvoreStatusContainer: {
        flex: 0.3,
        alignItems: 'center',
    },
    arvoreStatusImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    arvoreStatusText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '500',
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
});

export default ArvoreStyles;