// components/detalhe-lote/VisaoGeralTab.tsx
import { HistoricoItem, Lote } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VisaoGeralTabProps {
  loteData: Lote;
  isAdmin: boolean;
  colaboradoresNomes: string[];
  historico: HistoricoItem[];
  onManageColaboradores?: () => void;
  onEditLote?: (lote: Lote) => void;
  onDeleteLote?: (loteId: string) => void;
}

const VisaoGeralTab: React.FC<VisaoGeralTabProps> = ({
  loteData,
  isAdmin,
  colaboradoresNomes,
  historico,
  onManageColaboradores,
  onEditLote,
  onDeleteLote,
}) => {
  // Formatar data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Formatar tipo de solo
  const formatTipoSolo = (tipoSolo: string | undefined) => {
    if (!tipoSolo) return 'Não informado';
    const tiposSoloMap: { [key: string]: string } = {
      arenoso: 'Arenoso',
      argiloso: 'Argiloso',
      humifero: 'Humífero',
      calcario: 'Calcário',
      siltoso: 'Siltoso',
      organico: 'Orgânico',
    };
    return tiposSoloMap[tipoSolo.toLowerCase()] || tipoSolo;
  };

  // Pegar última coleta do histórico
  const getUltimaColeta = () => {
    if (!historico || historico.length === 0) return 'Nunca';
    const coletasAprovadas = historico.filter((item) => item.status === 'aprovada');
    if (coletasAprovadas.length === 0) return 'Nunca';

    const coletasOrdenadas = [...coletasAprovadas].sort((a, b) => {
      const dateA = new Date(a.data.split('/').reverse().join('-'));
      const dateB = new Date(b.data.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });

    const ultimaColeta = coletasOrdenadas[0];
    return `${ultimaColeta.data} às ${ultimaColeta.hora}`;
  };

  // Confirmação antes de deletar
  const handleDeletePress = () => {
    Alert.alert(
      'Excluir Lote',
      'Tem certeza que deseja excluir este lote? Esta ação não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDeleteLote?.(loteData.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Informações Gerais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          {/* Botões editar e excluir (somente admin) */}
          {isAdmin && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => onEditLote?.(loteData)}
                style={[styles.iconButton, { backgroundColor: '#fff' }]}
              >
                <Ionicons name="create-outline" size={20} color="#059669" />
              </TouchableOpacity>


            </View>
          )}
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome do Lote:</Text>
            <Text style={styles.infoValue}>{loteData.nome || 'Não informado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Código do Lote:</Text>
            <Text style={styles.infoValue}>{loteData.codigo || 'Não informado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Área Total:</Text>
            <Text style={styles.infoValue}>
              {loteData.area ? `${loteData.area} ha` : 'Não informado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Solo:</Text>
            <Text style={styles.infoValue}>{formatTipoSolo(loteData.tipoSolo)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantidade de Árvores:</Text>
            <Text style={styles.infoValue}>
              {loteData.arvores ? `${loteData.arvores} árvores` : 'Não informado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última Coleta:</Text>
            <Text style={styles.infoValue}>{getUltimaColeta()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Responsáveis:</Text>
            <Text style={styles.infoValue}>
              {colaboradoresNomes.length > 0
                ? `${colaboradoresNomes.length} colaborador(es)`
                : 'Nenhum'}
            </Text>
          </View>
        </View>
      </View>

      {/* Colaboradores Responsáveis */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Responsáveis</Text>
          {isAdmin && onManageColaboradores && (
            <TouchableOpacity onPress={onManageColaboradores}>
              <View style={styles.buttonAdd}>
                <Ionicons name="add-circle-outline" size={28} color='#16a34a' />
                <Text >Adicionar</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {colaboradoresNomes.length > 0 ? (
          <View style={styles.colaboradoresList}>
            {colaboradoresNomes.map((nome, index) => (
              <View key={index} style={styles.colaboradorItem}>
                <View style={styles.colaboradorAvatar}>
                  <Ionicons name="person" size={16} color='#16a34a' />
                </View>
                <Text style={styles.colaboradorNome}>{nome}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color="#D1D5DB" />
            <Text style={styles.noColaboradores}>
              {isAdmin
                ? 'Nenhum colaborador atribuído.\nClique no ícone acima para adicionar.'
                : 'Nenhum colaborador atribuído a este lote.'}
            </Text>
          </View>
        )}
      </View>

      {/* Localização GPS */}
      {(loteData.latitude || loteData.longitude) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Localização GPS</Text>
          </View>

          <View style={styles.gpsContainer}>
            <View style={styles.gpsItem}>
              <View style={styles.gpsIconContainer}>
                <Ionicons name="navigate" size={14} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.gpsLabel}>Latitude</Text>
                <Text style={styles.gpsValue}>{loteData.latitude || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.gpsDivider} />

            <View style={styles.gpsItem}>
              <View style={styles.gpsIconContainer}>
                <Ionicons name="navigate" size={14} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.gpsLabel}>Longitude</Text>
                <Text style={styles.gpsValue}>{loteData.longitude || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* 🗺️ Ir para o mapa */}
          <TouchableOpacity
            style={styles.mapLinkContainer}
            onPress={() => router.push('/geolocalizacao')}
          >
            <Ionicons name="map-outline" size={16} color="#fff" />
            <Text style={styles.mapLinkText}>Ir para o mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Observações */}
      {loteData.observacoes && loteData.observacoes.trim() !== '' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Observações</Text>
          </View>
          <Text style={styles.observacoes}>{loteData.observacoes}</Text>
        </View>
      )}


      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.deleteButtonText}>Excluir Lote</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  buttonAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },
  manageButton: {
    padding: 4,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  colaboradoresList: {
    gap: 12,
  },
  colaboradorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  colaboradorAvatar: {
    width: 36,
    height: 36,
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colaboradorNome: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  noColaboradores: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  gpsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  gpsItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  gpsLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  gpsValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  mapLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  mapLinkText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  observacoes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    margin: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default VisaoGeralTab;
