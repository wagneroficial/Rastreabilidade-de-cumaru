import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TabType } from '../../types/relatorios.types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
        onPress={() => onTabChange('analytics')}
      >
        <Ionicons name="bar-chart" size={16} color={activeTab === 'analytics' ? '#16a34a' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'relatorios' && styles.activeTab]}
        onPress={() => onTabChange('relatorios')}
      >
        <Ionicons name="document-text" size={16} color={activeTab === 'relatorios' ? '#16a34a' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'relatorios' && styles.activeTabText]}>Relatórios</Text>
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#16a34a',
  },
});

export default TabNavigation;