// components/detalhe-lote/VisaoGeralTab.tsx
import { Lote } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VisaoGeralTabProps {
  loteData: Lote;
  isAdmin: boolean;
  colaboradoresNomes: string[];
  onManageColaboradores?: () => void;
}

const VisaoGeralTab: React.FC<VisaoGeralTabProps> = ({
  loteData,
  isAdmin,
  colaboradoresNomes,
  onManageColaboradores,
}) => {
  return (
    <View style={styles.container}>
      {/* Informações Gerais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Código do Lote</Text>
            <Text style={styles.infoValue}>{loteData.codigo || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{loteData.localizacao || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data Início</Text>
            <Text style={styles.infoValue}>{loteData.dataInicio || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fim do cultivo</Text>
            <Text style={styles.infoValue}>{loteData.dataFim || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última coleta</Text>
            <Text style={styles.infoValue}>{loteData.ultimaColeta || 'Nunca'}</Text>
          </View>
        </View>
      </View>

      {/* Colaboradores Responsáveis */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Colaboradores Responsáveis</Text>
          {isAdmin && onManageColaboradores && (
            <TouchableOpacity style={styles.manageButton} onPress={onManageColaboradores}>
              <Ionicons name="settings-outline" size={16} color="#059669" />
              <Text style={styles.manageButtonText}>Gerenciar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {colaboradoresNomes.length > 0 ? (
          <View style={styles.colaboradoresList}>
            {colaboradoresNomes.map((nome, index) => (
              <View key={index} style={styles.colaboradorItem}>
                <View style={styles.colaboradorAvatar}>
                  <Ionicons name="person" size={16} color="#059669" />
                </View>
                <Text style={styles.colaboradorNome}>{nome}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noColaboradores}>
            {isAdmin 
              ? 'Nenhum colaborador atribuído. Clique em "Gerenciar" para adicionar.' 
              : 'Nenhum colaborador atribuído a este lote.'}
          </Text>
        )}
      </View>

      {/* Localização GPS */}
      {(loteData.latitude || loteData.longitude) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização GPS</Text>
          <View style={styles.gpsContainer}>
            <View style={styles.gpsItem}>
              <Text style={styles.gpsLabel}>Latitude</Text>
              <Text style={styles.gpsValue}>{loteData.latitude || 'N/A'}</Text>
            </View>
            <View style={styles.gpsItem}>
              <Text style={styles.gpsLabel}>Longitude</Text>
              <Text style={styles.gpsValue}>{loteData.longitude || 'N/A'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="location-outline" size={16} color="#059669" />
            <Text style={styles.mapButtonText}>Ver no Mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Observações */}
      {loteData.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoes}>{loteData.observacoes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  manageButtonText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
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
    gap: 8,
  },
  colaboradorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  colaboradorAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colaboradorNome: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  noColaboradores: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  gpsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  gpsItem: {
    flex: 1,
  },
  gpsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  gpsValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  observacoes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default VisaoGeralTab;