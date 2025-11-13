import {
  getAllColetas,
  updateColetaStatus as updateColetaStatusService,
  type Coleta,
  type ColetaStatus
} from '@/hooks/useColeta';


import {
  notifyColetorApproved,
  notifyColetorRejected
} from '@/hooks/userNotificacao';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ColetaTabType = 'todas' | 'pendentes' | 'aprovadas' | 'rejeitadas';

interface ConfirmationModalData {
  coletaId: string;
  action: 'aprovar' | 'rejeitar';
  coletaInfo: {
    lote: string;
    arvore: string;
    quantidade: number;
    coletor: string;
  };
}

// Mapeamento de Tab para Status
const TAB_TO_STATUS_MAP: Record<ColetaTabType, ColetaStatus | null> = {
  todas: null,
  pendentes: 'pendente',
  aprovadas: 'aprovada',
  rejeitadas: 'rejeitada',
};

// --- Componente Modal de Detalhes ---

interface DetailsModalProps {
  visible: boolean;
  coleta: Coleta | null;
  onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ visible, coleta, onClose }) => {
  if (!coleta) return null;

  const statusConfig = {
    pendente: { color: '#f59e0b', bg: '#fef3c7', icon: 'time-outline', label: 'Pendente' },
    aprovada: { color: '#16a34a', bg: '#dcfce7', icon: 'checkmark-circle-outline', label: 'Aprovada' },
    rejeitada: { color: '#ef4444', bg: '#fee2e2', icon: 'close-circle-outline', label: 'Rejeitada' },
  };

  const config = statusConfig[coleta.status];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={detailsStyles.overlay}>
        <View style={detailsStyles.container}>
          {/* Header */}
          <View style={detailsStyles.header}>
            <Text style={detailsStyles.headerTitle}>Detalhes da Coleta</Text>
            <TouchableOpacity onPress={onClose} style={detailsStyles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={[detailsStyles.statusBadge, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon as any} size={20} color={config.color} />
              <Text style={[detailsStyles.statusText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>

            {/* Informações Principais */}
            <View style={detailsStyles.section}>
              <Text style={detailsStyles.sectionTitle}>Informações Principais</Text>

              <View style={detailsStyles.infoRow}>
                <View style={detailsStyles.infoIconContainer}>
                  <Ionicons name="layers-outline" size={20} color="#16a34a" />
                </View>
                <View style={detailsStyles.infoContent}>
                  <Text style={detailsStyles.infoLabel}>Lote</Text>
                  <Text style={detailsStyles.infoValue}>{coleta.loteNome}</Text>
                </View>
              </View>

              <View style={detailsStyles.infoRow}>
                <View style={detailsStyles.infoIconContainer}>
                  <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                </View>
                <View style={detailsStyles.infoContent}>
                  <Text style={detailsStyles.infoLabel}>Árvore</Text>
                  <Text style={detailsStyles.infoValue}>{coleta.arvoreCodigo}</Text>
                </View>
              </View>

              <View style={detailsStyles.infoRow}>
                <View style={detailsStyles.infoIconContainer}>
                  <Ionicons name="scale-outline" size={20} color="#16a34a" />
                </View>
                <View style={detailsStyles.infoContent}>
                  <Text style={detailsStyles.infoLabel}>Quantidade</Text>
                  <Text style={detailsStyles.infoValue}>{coleta.quantidade.toFixed(1)} kg</Text>
                </View>
              </View>

              <View style={detailsStyles.infoRow}>
                <View style={detailsStyles.infoIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#16a34a" />
                </View>
                <View style={detailsStyles.infoContent}>
                  <Text style={detailsStyles.infoLabel}>Coletor</Text>
                  <Text style={detailsStyles.infoValue}>{coleta.coletorNome}</Text>
                </View>
              </View>

              <View style={detailsStyles.infoRow}>
                <View style={detailsStyles.infoIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#16a34a" />
                </View>
                <View style={detailsStyles.infoContent}>
                  <Text style={detailsStyles.infoLabel}>Data da Coleta</Text>
                  <Text style={detailsStyles.infoValue}>{coleta.data}</Text>
                </View>
              </View>
            </View>

            {/* Observações */}
            {coleta.observacoes && (
              <View style={detailsStyles.section}>
                <Text style={detailsStyles.sectionTitle}>Observações</Text>
                <View style={detailsStyles.observacoesContainer}>
                  <Text style={detailsStyles.observacoesText}>{coleta.observacoes}</Text>
                </View>
              </View>
            )}

            {/* Informações Adicionais */}
            <View style={detailsStyles.section}>
              <Text style={detailsStyles.sectionTitle}>Informações Adicionais</Text>

              <View style={detailsStyles.additionalInfo}>
                <Text style={detailsStyles.additionalLabel}>ID da Coleta:</Text>
                <Text style={detailsStyles.additionalValue}>{coleta.id}</Text>
              </View>

              <View style={detailsStyles.additionalInfo}>
                <Text style={detailsStyles.additionalLabel}>Criado em:</Text>
                <Text style={detailsStyles.additionalValue}>
                  {new Date(coleta.createdAt).toLocaleString('pt-BR')}
                </Text>
              </View>

              <View style={detailsStyles.additionalInfo}>
                <Text style={detailsStyles.additionalLabel}>Última atualização:</Text>
                <Text style={detailsStyles.additionalValue}>
                  {new Date(coleta.updatedAt).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer com botão */}
          <TouchableOpacity style={detailsStyles.closeFooterButton} onPress={onClose}>
            <Text style={detailsStyles.closeFooterButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const detailsStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
       flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
        width: 500,

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  observacoesContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  observacoesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  additionalInfo: {
    marginBottom: 12,
  },
  additionalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  additionalValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  closeFooterButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

// --- Componente Modal de Confirmação ---

interface ConfirmationModalProps {
  visible: boolean;
  data: ConfirmationModalData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  data,
  onConfirm,
  onCancel
}) => {
  if (!data) return null;

  const isApproval = data.action === 'aprovar';
  const actionColor = isApproval ? '#16a34a' : '#ef4444';
  const actionText = isApproval ? 'Aprovar' : 'Rejeitar';
  const actionIcon = isApproval ? 'checkmark-circle' : 'close-circle';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={[modalStyles.iconContainer, { backgroundColor: isApproval ? '#dcfce7' : '#fee2e2' }]}>
            <Ionicons name={actionIcon} size={48} color={actionColor} />
          </View>

          <Text style={modalStyles.title}>
            Confirmar {actionText}?
          </Text>

          <Text style={modalStyles.description}>
            Você está prestes a {actionText.toLowerCase()} esta coleta:
          </Text>

          <View style={modalStyles.infoContainer}>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Lote:</Text>
              <Text style={modalStyles.infoValue}>{data.coletaInfo.lote}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Árvore:</Text>
              <Text style={modalStyles.infoValue}>{data.coletaInfo.arvore}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Quantidade:</Text>
              <Text style={modalStyles.infoValue}>{data.coletaInfo.quantidade.toFixed(1)} kg</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Coletor:</Text>
              <Text style={modalStyles.infoValue}>{data.coletaInfo.coletor}</Text>
            </View>
          </View>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton, { backgroundColor: actionColor }]}
              onPress={onConfirm}
            >
              <Text style={modalStyles.confirmButtonText}>{actionText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
       flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

// --- Componente Coleta Card ---

interface ColetaCardProps {
  coleta: Coleta;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (coleta: Coleta) => void;
}

const ColetaCard: React.FC<ColetaCardProps> = ({
  coleta,
  onApprove,
  onReject,
  onViewDetails
}) => {
  const statusConfig = {
    pendente: { color: '#f59e0b', bg: '#fef3c7', icon: 'time-outline', label: 'Pendente' },
    aprovada: { color: '#16a34a', bg: '#dcfce7', icon: 'checkmark-circle-outline', label: 'Aprovada' },
    rejeitada: { color: '#ef4444', bg: '#fee2e2', icon: 'close-circle-outline', label: 'Rejeitada' },
  };

  const config = statusConfig[coleta.status];

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={[cardStyles.statusBadge, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon as any} size={14} color={config.color} />
          <Text style={[cardStyles.statusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={cardStyles.dateText}>{coleta.data}</Text>
      </View>

      <View style={cardStyles.content}>
        <Text style={cardStyles.title}>{coleta.loteNome}</Text>
        <Text style={cardStyles.subtitle}>
          Árvore: <Text style={cardStyles.highlight}>{coleta.arvoreCodigo}</Text>
        </Text>
        <Text style={cardStyles.detail}>
          <Text style={cardStyles.label}>Coletor:</Text> {coleta.coletorNome}
        </Text>
        <Text style={cardStyles.detail}>
          <Text style={cardStyles.label}>Quantidade:</Text> {coleta.quantidade.toFixed(1)} kg
        </Text>
        {coleta.observacoes && (
          <Text style={cardStyles.detail} numberOfLines={2}>
            <Text style={cardStyles.label}>Obs:</Text> {coleta.observacoes}
          </Text>
        )}
      </View>

      <View style={cardStyles.actionRow}>
        <TouchableOpacity
          style={cardStyles.actionButton}
          onPress={() => onViewDetails(coleta)}
        >
          <Text style={cardStyles.actionText}>Ver Detalhes</Text>
        </TouchableOpacity>

        {coleta.status === 'pendente' && (
          <>
            <TouchableOpacity
              style={[cardStyles.actionButton, cardStyles.actionApprove]}
              onPress={() => onApprove(coleta.id)}
            >
              <Text style={[cardStyles.actionText, cardStyles.actionApproveText]}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cardStyles.actionButton, cardStyles.actionReject]}
              onPress={() => onReject(coleta.id)}
            >
              <Text style={[cardStyles.actionText, cardStyles.actionRejectText]}>Rejeitar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '600',
    color: '#374151',
  },
  detail: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  actionApprove: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  actionApproveText: {
    color: 'white',
    fontWeight: '600',
  },
  actionReject: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  actionRejectText: {
    color: 'white',
    fontWeight: '600',
  }
});

// --- Componente Principal: ColetasTab ---

const ColetasTab: React.FC = () => {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ColetaTabType>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedColeta, setSelectedColeta] = useState<Coleta | null>(null);
  const [confirmationData, setConfirmationData] = useState<ConfirmationModalData | null>(null);

  useEffect(() => {
    loadColetas();
  }, []);

  const loadColetas = async () => {
    try {
      setLoading(true);
      const data = await getAllColetas();
      setColetas(data);
    } catch (error) {
      console.error('Erro ao carregar coletas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as coletas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadColetas();
    setRefreshing(false);
  };

  const handleViewDetails = useCallback((coleta: Coleta) => {
    setSelectedColeta(coleta);
    setDetailsModalVisible(true);
  }, []);

  const handleApprove = useCallback((id: string) => {
    const coleta = coletas.find(c => c.id === id);
    if (!coleta) return;

    setConfirmationData({
      coletaId: id,
      action: 'aprovar',
      coletaInfo: {
        lote: coleta.loteNome,
        arvore: coleta.arvoreCodigo,
        quantidade: coleta.quantidade,
        coletor: coleta.coletorNome,
      }
    });
    setModalVisible(true);
  }, [coletas]);

  const handleReject = useCallback((id: string) => {
    const coleta = coletas.find(c => c.id === id);
    if (!coleta) return;

    setConfirmationData({
      coletaId: id,
      action: 'rejeitar',
      coletaInfo: {
        lote: coleta.loteNome,
        arvore: coleta.arvoreCodigo,
        quantidade: coleta.quantidade,
        coletor: coleta.coletorNome,
      }
    });
    setModalVisible(true);
  }, [coletas]);

  const handleConfirm = useCallback(async () => {
    if (!confirmationData) return;

    const newStatus: ColetaStatus = confirmationData.action === 'aprovar' ? 'aprovada' : 'rejeitada';

    try {
      // Buscar dados completos da coleta para enviar notificação
      const coleta = coletas.find(c => c.id === confirmationData.coletaId);

      console.log('🔍 DEBUG - Coleta encontrada:', coleta);
      console.log('🔍 DEBUG - Status novo:', newStatus);
      console.log('🔍 DEBUG - Coletor ID:', coleta?.coletorId);

      await updateColetaStatusService(confirmationData.coletaId, newStatus);

      setColetas(prevColetas =>
        prevColetas.map(coleta =>
          coleta.id === confirmationData.coletaId
            ? { ...coleta, status: newStatus }
            : coleta
        )
      );

      // ✅ ENVIAR NOTIFICAÇÃO PARA O COLETOR
      if (coleta) {
        console.log('📬 Tentando enviar notificação...');
        try {
          if (newStatus === 'aprovada') {
            console.log('✅ Enviando notificação de APROVAÇÃO para:', coleta.coletorId);
            await notifyColetorApproved(coleta.coletorId, {
              coletaId: coleta.id,
              loteNome: coleta.loteNome,
              arvoreCodigo: coleta.arvoreCodigo,
              quantidade: coleta.quantidade,
            });
            console.log('✅ Notificação de aprovação enviada com sucesso para:', coleta.coletorNome);
          } else {
            console.log('❌ Enviando notificação de REJEIÇÃO para:', coleta.coletorId);
            await notifyColetorRejected(coleta.coletorId, {
              coletaId: coleta.id,
              loteNome: coleta.loteNome,
              arvoreCodigo: coleta.arvoreCodigo,
              quantidade: coleta.quantidade,
            });
            console.log('✅ Notificação de rejeição enviada com sucesso para:', coleta.coletorNome);
          }
        } catch (notifError: any) {
          console.error('❌ ERRO DETALHADO ao enviar notificação:', notifError);
          console.error('❌ Stack:', notifError.stack);
          console.error('❌ Mensagem:', notifError.message);
          // Mostrar alert para debug
          Alert.alert('Debug Notificação', `Erro: ${notifError.message}`);
        }
      } else {
        console.error('❌ COLETA NÃO ENCONTRADA! ID:', confirmationData.coletaId);
        Alert.alert('Erro', 'Coleta não encontrada para enviar notificação');
      }

      Alert.alert('Sucesso', `Coleta ${newStatus} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status da coleta');
    } finally {
      setModalVisible(false);
      setConfirmationData(null);
    }
  }, [confirmationData, coletas]);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setConfirmationData(null);
  }, []);

  const allColetas = useMemo(() =>
    coletas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [coletas]
  );

  const filteredColetas = useMemo(() => {
    let list = allColetas;

    const statusToFilter = TAB_TO_STATUS_MAP[activeTab];
    if (statusToFilter) {
      list = list.filter(coleta => coleta.status === statusToFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(coleta => {
        const loteNome = coleta.loteNome.toLowerCase();
        const arvoreCode = coleta.arvoreCodigo.toLowerCase();
        const coletorNome = coleta.coletorNome.toLowerCase();

        return (
          loteNome.includes(query) ||
          arvoreCode.includes(query) ||
          coletorNome.includes(query)
        );
      });
    }

    return list;
  }, [activeTab, searchQuery, allColetas]);

  const counts = useMemo(() => {
    const baseCounts = {
      todas: allColetas.length,
      pendentes: allColetas.filter(c => c.status === 'pendente').length,
      aprovadas: allColetas.filter(c => c.status === 'aprovada').length,
      rejeitadas: allColetas.filter(c => c.status === 'rejeitada').length,
    };

    if (searchQuery) {
      return {
        ...baseCounts,
        [activeTab]: filteredColetas.length
      }
    }
    return baseCounts;
  }, [allColetas, filteredColetas, activeTab, searchQuery]);

  const tabs = [
    { key: 'todas', label: 'Todas', count: counts.todas },
    { key: 'pendentes', label: 'Pendentes', count: counts.pendentes },
    { key: 'aprovadas', label: 'Aprovadas', count: counts.aprovadas },
    { key: 'rejeitadas', label: 'Rejeitadas', count: counts.rejeitadas },
  ] as const;

  const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Nenhuma Coleta Encontrada</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando coletas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DetailsModal
        visible={detailsModalVisible}
        coleta={selectedColeta}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedColeta(null);
        }}
      />

      <ConfirmationModal
        visible={modalVisible}
        data={confirmationData}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

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
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as ColetaTabType)}
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

      <FlatList
        data={filteredColetas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ColetaCard
            coleta={item}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        )}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={() => (
          <EmptyState
            message={searchQuery
              ? `Nenhuma coleta encontrada para "${searchQuery}" em "${tabs.find(t => t.key === activeTab)?.label}"`
              : `Não há coletas ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`
            }
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefefe',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },

  clearButton: {
    padding: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 20,
    marginRight: 8,
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
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    height: 38,
  },
  tabActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  listContentContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: Dimensions.get('window').height * 0.5,
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