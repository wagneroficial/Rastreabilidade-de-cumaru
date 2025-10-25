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
}) => {
  const statusColors = getStatusColor(user.status);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onView}>
        {/* Cabeçalho: Avatar + Nome à esquerda / Status à direita */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#16a34a" />
            </View>
            <Text style={styles.name}>{user.nome}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {getStatusLabel(user.status)}
            </Text>
          </View>
        </View>

        {/* Informações do usuário */}
        <View style={styles.info}>
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

        {/* Lotes atribuídos */}
        {user.lotesAtribuidos && user.lotesAtribuidos.length > 0 && (
          <View style={styles.lotesSection}>
            <View style={styles.lotesSectionHeader}>
              <Text style={styles.lotesLabel}>Lotes Atribuídos:</Text>
              <Text style={styles.lotesCount}>{user.lotesAtribuidos.length} lote(s)</Text>
            </View>
            <View style={styles.lotesChips}>
              {user.lotesAtribuidos.slice(0, 3).map((loteId) => (
                <View key={loteId} style={styles.loteChip}>
                  <Ionicons name="leaf" size={12} color="#16a34a" />
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

        {/* Data (alinhada à direita) */}
        <View style={styles.footer}>
          <Text style={styles.dateText}>Cadastrado: {formatDate(user.criadoEm)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 25,
    backgroundColor: '#effff5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  info: {
    marginTop: 6,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  lotesSection: {
    paddingTop: 12,
    marginTop: 16,
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
    backgroundColor: '#effff5',
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
   
    marginTop: 12,
    alignItems: 'flex-end', // <-- alinhamento à direita
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

export default UserCard;
