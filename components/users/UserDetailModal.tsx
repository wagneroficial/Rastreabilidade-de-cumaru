// components/users/UserDetailModal.tsx
import { User } from '@/hooks/useUsers';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/userHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserDetailModalProps {
  visible: boolean;
  user: User | null;
  getLoteNome: (id: string) => string;
  getLoteCodigo: (id: string) => string;
  onClose: () => void;
  onManageLotes: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  user,
  getLoteNome,
  getLoteCodigo,
  onClose,
  onManageLotes,
  onApprove,
  onReject,
  onDeactivate,
  onReactivate,
}) => {
  if (!user) return null;

  const statusColors = getStatusColor(user.status);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.nome}</Text>
                <View style={[styles.headerBadge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.headerBadgeText, { color: statusColors.text }]}>
                    {getStatusLabel(user.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informações Pessoais */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <View style={styles.infoValueRow}>
                  <Ionicons name="mail" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <View style={styles.infoValueRow}>
                  <Ionicons name="call" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{user.telefone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Propriedade</Text>
                <View style={styles.infoValueRow}>
                  <Ionicons name="business" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{user.propriedade}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tipo</Text>
                <View style={styles.infoValueRow}>
                  <Ionicons name="settings" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{user.tipo}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lotes Atribuídos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Lotes Atribuídos</Text>
              <TouchableOpacity onPress={onManageLotes} style={styles.manageButton}>
                <Ionicons name="settings" size={16} color="#16a34a" />
                <Text style={styles.manageButtonText}>Gerenciar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              {user.lotesAtribuidos && user.lotesAtribuidos.length > 0 ? (
                user.lotesAtribuidos.map((loteId) => (
                  <View key={loteId} style={styles.loteItem}>
                    <View style={styles.loteIcon}>
                      <Ionicons name="leaf" size={16} color="#16a34a" />
                    </View>
                    <View style={styles.loteInfo}>
                      <Text style={styles.loteNome}>{getLoteNome(loteId)}</Text>
                      <Text style={styles.loteCodigo}>Código: {getLoteCodigo(loteId)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum lote atribuído</Text>
              )}
            </View>
          </View>

          {/* Histórico */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Histórico</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Data de Cadastro</Text>
                <View style={styles.infoValueRow}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{formatDate(user.criadoEm)}</Text>
                </View>
              </View>

              {user.atualizadoEm && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Última Atualização</Text>
                  <View style={styles.infoValueRow}>
                    <Ionicons name="refresh" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{formatDate(user.atualizadoEm)}</Text>
                  </View>
                </View>
              )}

              {user.aprovadoPor && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Aprovado Por</Text>
                  <View style={styles.infoValueRow}>
                    <Ionicons name="person-circle" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{user.aprovadoPor}</Text>
                  </View>
                </View>
              )}

              {user.motivoReprovacao && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Motivo da Reprovação</Text>
                  <View style={styles.infoValueRow}>
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text style={[styles.infoValue, { color: '#dc2626' }]}>
                      {user.motivoReprovacao}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Actions Footer */}
        <View style={styles.footer}>
          {user.status === 'pendente' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={onApprove} style={[styles.actionBtn, styles.approveBtn]}>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionBtnText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onReject} style={[styles.actionBtn, styles.rejectBtn]}>
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.actionBtnText}>Reprovar</Text>
              </TouchableOpacity>
            </View>
          )}

          {user.status === 'aprovado' && (
            <TouchableOpacity onPress={onDeactivate} style={[styles.actionBtn, styles.deactivateBtn]}>
              <Ionicons name="person-remove" size={20} color="white" />
              <Text style={styles.actionBtnText}>Desativar</Text>
            </TouchableOpacity>
          )}

          {user.status === 'desativado' && (
            <TouchableOpacity onPress={onReactivate} style={[styles.actionBtn, styles.reactivateBtn]}>
              <Ionicons name="person-add" size={20} color="white" />
              <Text style={styles.actionBtnText}>Reativar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  loteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  loteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loteInfo: {
    flex: 1,
  },
  loteNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  loteCodigo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  approveBtn: {
    backgroundColor: '#22c55e',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  deactivateBtn: {
    backgroundColor: '#6b7280',
  },
  reactivateBtn: {
    backgroundColor: '#16a34a',
  },
});