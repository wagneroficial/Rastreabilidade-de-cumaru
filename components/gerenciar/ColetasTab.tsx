import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type ColetaTabType = 'todas' | 'pendentes' | 'aprovadas' | 'rejeitadas';

const ColetasTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ColetaTabType>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { key: 'todas', label: 'Todas', count: 0 },
    { key: 'pendentes', label: 'Pendentes', count: 0 },
    { key: 'aprovadas', label: 'Aprovadas', count: 0 },
    { key: 'rejeitadas', label: 'Rejeitadas', count: 0 },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por lote, árvore ou coletor..."
            placeholderTextColor='#6b7280'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
            <View style={[
              styles.tabBadge,
              activeTab === tab.key && styles.tabBadgeActive,
            ]}>
              <Text style={[
                styles.tabBadgeText,
                activeTab === tab.key && styles.tabBadgeTextActive,
              ]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content - Implementar depois */}
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Gerenciamento de Coletas</Text>
        <Text style={styles.emptyText}>
          Esta funcionalidade será implementada em breve
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  tabsContainer: {
    backgroundColor: 'white',
    height: 56,
    marginBottom: 8,
  },
  tabsContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    minWidth: 110,
    height: 38,
  },
  tabActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#dcfce7',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#166534',
  },
  tabBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#16a34a',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ColetasTab;