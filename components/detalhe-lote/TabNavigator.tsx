// components/detalhe-lote/TabNavigator.tsx
import { TabType } from '@/types/lote.types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabNavigatorProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    arvoresCount: number;
    historicoCount: number; // Este valor agora vem filtrado de DetalheLoteScreen.tsx
}

const TabNavigator: React.FC<TabNavigatorProps> = ({
    activeTab,
    onTabChange,
    arvoresCount,
    historicoCount,
}) => {
    return (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'visao-geral' && styles.activeTab]}
                onPress={() => onTabChange('visao-geral')}
            >
                <Text style={[styles.tabText, activeTab === 'visao-geral' && styles.activeTabText]}>
                    Visão Geral
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[styles.tab, activeTab === 'arvores' && styles.activeTab]}
                onPress={() => onTabChange('arvores')}
            >
                <Text style={[styles.tabText, activeTab === 'arvores' && styles.activeTabText]}>
                    Árvores ({arvoresCount})
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[styles.tab, activeTab === 'historico' && styles.activeTab]}
                onPress={() => onTabChange('historico')}
            >
                <Text style={[styles.tabText, activeTab === 'historico' && styles.activeTabText]}>
                    Histórico ({historicoCount})
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#059669',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#059669',
    },
});

export default TabNavigator;