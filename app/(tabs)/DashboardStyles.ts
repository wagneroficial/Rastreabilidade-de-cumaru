import { Colors } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appColors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    menuButton: {
        padding: 5,
    },
    menuBar: {
        width: 25,
        height: 3,
        backgroundColor: Colors.appColors.white,
        marginVertical: 3,
        borderRadius: 2,
    },
    headerText: {
        fontSize: 18,
        color: Colors.appColors.white,
        fontWeight: '500',
        paddingHorizontal: 30,
        paddingVertical: 50,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.appColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
    },
    searchBarPlaceholder: {
        height: 50,
        marginHorizontal: 20,
        backgroundColor: Colors.appColors.white,
        borderRadius: 25,
        marginBottom: 15,
    },
    menuContainer: {
        flex: 1,
        backgroundColor: Colors.appColors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    menuItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: 25,
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: Colors.appColors.secondary,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    menuItemText: {
        fontSize: 14,
        color: Colors.appColors.textDark,
        textAlign: 'center',
    },
});

export default styles;