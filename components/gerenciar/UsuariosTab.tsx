import { ConfirmActionModal } from '@/components/users/ConfirmActionModal';
import { ManageLotesModal } from '@/components/users/ManageLotesModal';
import { UserCard } from '@/components/users/UserCard';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { useLotesManagement } from '@/hooks/useLotesManagement';
import { User, useUsers } from '@/hooks/useUsers';
import { filterUsers } from '@/utils/userHelpers';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type TabType = 'todos' | 'pendentes' | 'aprovados' | 'reprovados' | 'desativados';

const UsuariosTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [managingLotes, setManagingLotes] = useState<User | null>(null);
  const [actioningUser, setActioningUser] = useState<{
    user: User;
    action: 'aprovar' | 'reprovar' | 'desativar' | 'reativar';
  } | null>(null);

  const { users, loading, updateUserStatus, updateUserLotes } = useUsers();
  const { lotes, loading: loadingLotes, fetchLotes, getLoteNome, getLoteCodigo } = useLotesManagement();

  const filteredUsers = useMemo(() => {
    return filterUsers(users, activeTab, searchQuery);
  }, [users, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      todos: users.length,
      pendentes: users.filter(u => u.status === 'pendente').length,
      aprovados: users.filter(u => u.status === 'aprovado').length,
      reprovados: users.filter(u => u.status === 'reprovado').length,
      desativados: users.filter(u => u.status === 'desativado').length,
    };
  }, [users]);

  const handleOpenManageLotes = (user: User) => {
    setManagingLotes(user);
    fetchLotes();
  };

  const handleToggleLote = async (loteId: string) => {
    if (!managingLotes) return;

    const currentLotes = managingLotes.lotesAtribuidos || [];
    const isSelected = currentLotes.includes(loteId);
    const newLotes = isSelected
      ? currentLotes.filter(id => id !== loteId)
      : [...currentLotes, loteId];

    const success = await updateUserLotes(managingLotes.id, newLotes);
    if (success) {
      setManagingLotes(prev => prev ? { ...prev, lotesAtribuidos: newLotes } : null);
    }
  };

  const handleConfirmAction = async (motivo?: string) => {
    if (!actioningUser) return;

    const { user, action } = actioningUser;
    let newStatus: 'aprovado' | 'reprovado' | 'desativado';

    switch (action) {
      case 'aprovar':
      case 'reativar':
        newStatus = 'aprovado';
        break;
      case 'reprovar':
        newStatus = 'reprovado';
        break;
      case 'desativar':
        newStatus = 'desativado';
        break;
    }

    const success = await updateUserStatus(user.id, newStatus, motivo);
    if (success) {
      setActioningUser(null);
    }
  };

  const tabs = [
    { key: 'todos', label: 'Todos', count: counts.todos },
    { key: 'pendentes', label: 'Pendentes', count: counts.pendentes },
    { key: 'aprovados', label: 'Aprovados', count: counts.aprovados },
    { key: 'reprovados', label: 'Reprovados', count: counts.reprovados },
    { key: 'desativados', label: 'Desativados', count: counts.desativados },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email ou propriedade..."
            placeholderTextColor="#9ca3af"
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
        contentContainerStyle={styles.tabsWrapper}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === tab.key && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === tab.key && styles.tabBadgeTextActive,
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário neste filtro'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Tente ajustar sua busca ou verificar a ortografia.'
              : 'Não há usuários com este status no momento.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              getLoteNome={getLoteNome}
              onView={() => setViewingUser(user)}
              onManageLotes={() => handleOpenManageLotes(user)}
              onApprove={user.status === 'pendente' ? () => setActioningUser({ user, action: 'aprovar' }) : undefined}
              onReject={user.status === 'pendente' ? () => setActioningUser({ user, action: 'reprovar' }) : undefined}
              onDeactivate={user.status === 'aprovado' ? () => setActioningUser({ user, action: 'desativar' }) : undefined}
              onReactivate={user.status === 'desativado' ? () => setActioningUser({ user, action: 'reativar' }) : undefined}
            />
          ))}
        </ScrollView>
      )}

  {/* Modals */}
      <UserDetailModal
        visible={!!viewingUser}
        user={viewingUser}
        getLoteNome={getLoteNome}
        getLoteCodigo={getLoteCodigo}
        onClose={() => setViewingUser(null)}
        onManageLotes={() => {
          if (viewingUser) {
            setViewingUser(null);
            handleOpenManageLotes(viewingUser);
          }
        }}
        onApprove={viewingUser?.status === 'pendente' ? () => {
          if (viewingUser) {
            setViewingUser(null);
            setActioningUser({ user: viewingUser, action: 'aprovar' });
          }
        } : undefined}
        onReject={viewingUser?.status === 'pendente' ? () => {
          if (viewingUser) {
            setViewingUser(null);
            setActioningUser({ user: viewingUser, action: 'reprovar' });
          }
        } : undefined}
        onDeactivate={viewingUser?.status === 'aprovado' ? () => {
          if (viewingUser) {
            setViewingUser(null);
            setActioningUser({ user: viewingUser, action: 'desativar' });
          }
        } : undefined}
        onReactivate={viewingUser?.status === 'desativado' ? () => {
          if (viewingUser) {
            setViewingUser(null);
            setActioningUser({ user: viewingUser, action: 'reativar' });
          }
        } : undefined}
      />

      <ManageLotesModal
        visible={!!managingLotes}
        user={managingLotes}
        lotes={lotes}
        loading={loadingLotes}
        onClose={() => {
          if (managingLotes) setViewingUser(managingLotes);
          setManagingLotes(null);
        }}
        onToggleLote={handleToggleLote}
      />

      <ConfirmActionModal
        visible={!!actioningUser}
        user={actioningUser?.user || null}
        action={actioningUser?.action || null}
        onClose={() => setActioningUser(null)}
        onConfirm={handleConfirmAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdfdfd',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  tabsWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabItemActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  tabText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#166534',
  },
  tabBadge: {
    backgroundColor: '#e5e7eb',
    marginLeft: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#16a34a',
  },
  tabBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default UsuariosTab;
