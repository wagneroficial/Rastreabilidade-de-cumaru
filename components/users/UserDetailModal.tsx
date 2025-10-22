// components/users/UserDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { User } from '@/hooks/useUsers';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/userHelpers';
import { Ionicons } from '@expo/vector-icons';
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
  onRemoveLote?: (loteId: string) => void;
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
  onRemoveLote,
}) => {
  const [lotes, setLotes] = useState<string[]>([]);

  useEffect(() => {
    if (user?.lotesAtribuidos) {
      setLotes(user.lotesAtribuidos);
    }
  }, [user]);

  const handleRemoveLote = (loteId: string) => {
    // Remove do estado local
    setLotes((prev) => prev.filter((id) => id !== loteId));
    // Chama callback opcional (ex: para atualizar no Firestore)
    onRemoveLote?.(loteId);
  };

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
                <View
                  style={[styles.headerBadge, { backgroundColor: statusColors.bg }]}
                >
                  <Text
                    style={[styles.headerBadgeText, { color: statusColors.text }]}
                  >
                    {getStatusLabel(user.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informações Pessoais */}
          <View>
            <View style={styles.sectionHeader}>
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
          {/* Lotes Atribuídos */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Lotes Atribuídos ({lotes.length})
              </Text>
              <TouchableOpacity onPress={onManageLotes} style={styles.manageButton}>
                <Text style={styles.manageButtonText}>Atribuir Lote</Text>
              </TouchableOpacity>
            </View>

            {lotes && lotes.length > 0 ? (
              lotes.map((loteId) => (
                <View key={loteId} style={styles.loteItem}>
                  <View style={styles.loteIcon}>
                    <Ionicons name="leaf" size={18} color="#16a34a" />
                  </View>
                  <View style={styles.loteInfo}>
                    <Text style={styles.loteNome}>{getLoteNome(loteId)}</Text>
                    <Text style={styles.loteCodigo}>
                      Código: {getLoteCodigo(loteId)}
                    </Text>
                  </View>

                  {/* Botão de Remover */}
                  <TouchableOpacity
                    onPress={() => handleRemoveLote(loteId)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              // Botão Atribuir Lote visível apenas quando não há lotes
              <TouchableOpacity style={styles.emptyCard}>
                <Text style={styles.text}>Nenhum Lote Encontrado</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Histórico */}
          <View>
            <Text style={styles.sectionTitle}>Histórico</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color='#1f2937' />
                <Text style={styles.infoText}>
                  Cadastrado em: {formatDate(user.criadoEm)}
                </Text>
              </View>

              {user.atualizadoEm && (
                <View style={styles.infoRow}>
                  <Ionicons name="refresh-outline" size={18} color='#1f2937' />
                  <Text style={styles.infoText}>
                    Atualizado em: {formatDate(user.atualizadoEm)}
                  </Text>
                </View>
              )}

              {user.aprovadoPor && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#6b7280" />
                  <Text style={styles.infoText}>Aprovado por: {user.aprovadoPor}</Text>
                </View>
              )}

              {user.motivoReprovacao && (
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                  <Ionicons name="close-circle" size={18} color="#dc2626" />
                  <Text style={[styles.infoText, { color: '#dc2626' }]}>
                    {user.motivoReprovacao}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {user.status === 'pendente' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onApprove}
                style={[styles.actionBtn, styles.approveBtn]}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionBtnText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onReject}
                style={[styles.actionBtn, styles.rejectBtn]}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.actionBtnText}>Reprovar</Text>
              </TouchableOpacity>
            </View>
          )}

          {user.status === 'aprovado' && (
            <TouchableOpacity
              onPress={onDeactivate}
              style={[styles.actionBtn, styles.deactivateBtn]}
            >
              <Ionicons name="person-remove" size={20} color="white" />
              <Text style={styles.actionBtnText}>Desativar</Text>
            </TouchableOpacity>
          )}

          {user.status === 'desativado' && (
            <TouchableOpacity
              onPress={onReactivate}
              style={[styles.actionBtn, styles.reactivateBtn]}
            >
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
    backgroundColor: '#fefefe'
  },

  header: {
    backgroundColor: '#16a34a',
    paddingVertical: 16
  },

  headerContent: {
    paddingLeft: 16
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },

  headerInfo: {
    flex: 1
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6
  },

  headerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  headerBadgeText: {
    fontSize: 12,
    fontWeight: '500'
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginBottom: 16,
    marginTop: 32,
  },

  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },

  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a'
  },

  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: '#1f2937',
    flexShrink: 1
  },

  infoItem: {
    marginBottom: 16
  },

  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6
  },

  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  infoValue: {
    fontSize: 14,
    color: '#1f2937'
  },

  loteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8
  },

  loteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  loteInfo: {
    flex: 1
  },

  loteNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937'
  },

  loteCodigo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },

  removeButton: {
    padding: 8,
    borderRadius: 8
  },

  text: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    paddingVertical: 8
  },

  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },

  actionsRow: {

    gap: 12
  },

  actionBtn: {
    flexDirection: 'row', // importante: linha
    alignItems: 'center', // centraliza verticalmente
    justifyContent: 'center', // centraliza horizontalmente
    paddingVertical: 12, // ajuste para não ficar gigante
    paddingHorizontal: 16,
    borderRadius: 8,
    // remove gap
  },

  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8, // substitui o gap entre ícone e texto
  },

  approveBtn: {
    backgroundColor: '#22c55e'
  },

  rejectBtn: {
    backgroundColor: '#ef4444'
  },

  deactivateBtn: {
    backgroundColor: '#6b7280'
  },

  reactivateBtn: {
    backgroundColor: '#16a34a'
  },
});

