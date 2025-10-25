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
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedLote, setSelectedLote] = useState<string | null>(null);

  useEffect(() => {
    if (user?.lotesAtribuidos) {
      setLotes(user.lotesAtribuidos);
    }
  }, [user]);

  const handleRemoveLote = (loteId: string) => {
    setConfirmModalVisible(true);
    setSelectedLote(loteId);
  };

  const confirmRemoveLote = () => {
    if (selectedLote) {
      setLotes((prev) => prev.filter((id) => id !== selectedLote));
      onRemoveLote?.(selectedLote);
      setSelectedLote(null);
    }
    setConfirmModalVisible(false);
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
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Lotes Atribuídos ({lotes.length})
              </Text>
              <TouchableOpacity onPress={onManageLotes}>
                <View style={styles.buttonAdd}>
                  <Ionicons name="add-circle-outline" size={28} color='#16a34a' />
                  <Text >Adicionar</Text>
                </View>

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
              <TouchableOpacity style={styles.emptyCard}>
                <Text style={styles.text}>Nenhum Lote Encontrado.{'\n'}
                  Clique no ícone acima para adicionar.</Text>
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

      {/* Modal de Confirmação */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
            <Text style={styles.confirmTitle}>Remover lote</Text>
            <Text style={styles.confirmMessage}>
              Deseja remover este lote deste colaborador?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.deleteBtn]}
                onPress={confirmRemoveLote}
              >
                <Text style={[styles.confirmBtnText, { color: 'white' }]}>
                  Remover
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },

  header: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
      paddingBottom: 120, 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginTop: 20,
        marginBottom: 12,
  },
  buttonAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoCard: {
    paddingVertical: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 14,
    color: '#1f2937',
  },

  infoItem: {
    marginBottom: 16,

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
    marginBottom: 8,
  },

  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  infoValue: {
    fontSize: 14,
    color: '#1f2937'
  },

  loteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#fff',
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
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
    paddingVertical: 8
  },

  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  actionsRow: {
    gap: 12
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});

