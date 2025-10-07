// components/detalhe-lote/ColaboradoresModal.tsx
import { Colaborador } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ColaboradoresModalProps {
  visible: boolean;
  colaboradores: Colaborador[];
  selectedIds: string[];
  isLoading: boolean;
  onClose: () => void;
  onToggle: (colaboradorId: string) => void;
}

const ColaboradoresModal: React.FC<ColaboradoresModalProps> = ({
  visible,
  colaboradores,
  selectedIds,
  isLoading,
  onClose,
  onToggle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Gerenciar Colaboradores</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando colaboradores...</Text>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {colaboradores.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>
                    Nenhum colaborador aprovado encontrado
                  </Text>
                </View>
              ) : (
                colaboradores.map((colaborador) => {
                  const isSelected = selectedIds.includes(colaborador.id);
                  return (
                    <TouchableOpacity
                      key={colaborador.id}
                      style={[
                        styles.option,
                        isSelected && styles.optionSelected
                      ]}
                      onPress={() => onToggle(colaborador.id)}
                    >
                      <View style={styles.info}>
                        <Text style={[
                          styles.nome,
                          isSelected && styles.nomeSelected
                        ]}>
                          {colaborador.nome}
                        </Text>
                        <Text style={styles.email}>
                          {colaborador.email}
                        </Text>
                        {colaborador.propriedade && (
                          <Text style={styles.propriedade}>
                            {colaborador.propriedade}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#059669" />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>
                Confirmar ({selectedIds.length} selecionados)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  optionSelected: {
    backgroundColor: '#f0fdf4',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  nomeSelected: {
    color: '#059669',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  propriedade: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  footerButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ColaboradoresModal;