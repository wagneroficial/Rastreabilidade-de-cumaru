// components/users/ManageLotesModal.tsx
import { Lote } from '@/hooks/useLotesManagement';
import { User } from '@/hooks/useUsers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ManageLotesModalProps {
  visible: boolean;
  user: User | null;
  lotes: Lote[];
  loading: boolean;
  onClose: () => void;
  onToggleLote: (loteId: string) => void;
}

export const ManageLotesModal: React.FC<ManageLotesModalProps> = ({
  visible,
  user,
  lotes,
  loading,
  onClose,
  onToggleLote,
}) => {
  if (!user) return null;

  const selectedCount = user.lotesAtribuidos?.length || 0;

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
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Adicionar Lotes</Text>
              <Text style={styles.headerSubtitle}>{user.nome}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Carregando lotes...</Text>
          </View>
        ) : lotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Nenhum lote encontrado</Text>
            <Text style={styles.emptyText}>Cadastre lotes para atribuí-los aos usuários</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.instruction}>
              Selecione os lotes que este usuário poderá acessar:
            </Text>

            <View style={styles.lotesList}>
              {lotes.map((lote) => {
                const isSelected = user.lotesAtribuidos?.includes(lote.id) || false;
                return (
                  <TouchableOpacity
                    key={lote.id}
                    onPress={() => onToggleLote(lote.id)}
                    style={[
                      styles.loteCard,
                      isSelected && styles.loteCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>

                    <View style={styles.loteInfo}>
                      <Text style={styles.loteNome}>{lote.nome}</Text>
                      <Text style={styles.loteDetails}>
                        Código: {lote.codigo} • Área: {lote.area} ha • Status: {lote.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedCount} lote(s) selecionado(s)
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
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
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  lotesList: {
    gap: 12,
  },
  loteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  loteCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  loteInfo: {
    flex: 1,
  },
  loteNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  loteDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});