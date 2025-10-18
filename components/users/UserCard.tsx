// components/users/UserCard.tsx
import { User } from '@/hooks/useUsers';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/userHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserCardProps {
  user: User;
  getLoteNome: (id: string) => string;
  onView: () => void;
  onManageLotes: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  getLoteNome,
  onView,
  onManageLotes,
  onApprove,
  onReject,
  onDeactivate,
  onReactivate,
}) => {
  const statusColors = getStatusColor(user.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#16a34a" />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.nome}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {getStatusLabel(user.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={14} color="#6b7280" />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="call" size={14} color="#6b7280" />
              <Text style={styles.infoText}>{user.telefone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="business" size={14} color="#6b7280" />
              <Text style={styles.infoText}>{user.propriedade}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Lotes Atribuídos */}
      {user.lotesAtribuidos && user.lotesAtribuidos.length > 0 && (
        <View style={styles.lotesSection}>
          <View style={styles.lotesSectionHeader}>
            <Text style={styles.lotesLabel}>Lotes Atribuídos:</Text>
            <Text style={styles.lotesCount}>{user.lotesAtribuidos.length} lote(s)</Text>
          </View>
          <View style={styles.lotesChips}>
            {user.lotesAtribuidos.slice(0, 3).map((loteId) => (
              <View key={loteId} style={styles.loteChip}>
                <Ionicons name="leaf" size={12} color="#166534" />
                <Text style={styles.loteChipText}>{getLoteNome(loteId)}</Text>
              </View>
            ))}
            {user.lotesAtribuidos.length > 3 && (
              <View style={[styles.loteChip, styles.loteChipMore]}>
                <Text style={styles.loteChipMoreText}>
                  +{user.lotesAtribuidos.length - 3} mais
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Data de cadastro */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Cadastrado: {formatDate(user.criadoEm)}
        </Text>
      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onView} style={styles.actionButton}>
          <Ionicons name="eye" size={20} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onManageLotes} style={styles.actionButton}>
          <Ionicons name="map" size={20} color="#16a34a" />
        </TouchableOpacity>

        {user.status === 'pendente' && (
          <>
            <TouchableOpacity onPress={onApprove} style={styles.actionButton}>
              <Ionicons name="checkmark" size={20} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onReject} style={styles.actionButton}>
              <Ionicons name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}

        {user.status === 'aprovado' && (
          <TouchableOpacity onPress={onDeactivate} style={styles.actionButton}>
            <Ionicons name="person-remove" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}

        {user.status === 'desativado' && (
          <TouchableOpacity onPress={onReactivate} style={styles.actionButton}>
            <Ionicons name="person-add" size={20} color="#16a34a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  lotesSection: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  lotesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotesLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  lotesCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
  lotesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  loteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loteChipText: {
    fontSize: 11,
    color: '#166534',
  },
  loteChipMore: {
    backgroundColor: '#f3f4f6',
  },
  loteChipMoreText: {
    fontSize: 11,
    color: '#6b7280',
  },
  footer: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
});