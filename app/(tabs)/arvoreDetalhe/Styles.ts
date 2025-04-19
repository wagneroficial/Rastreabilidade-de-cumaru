import { Colors } from '@/constants/Colors';
import { Platform, StatusBar, StyleSheet } from 'react-native';

const stylesArvores = StyleSheet.create({
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

export default stylesArvores;