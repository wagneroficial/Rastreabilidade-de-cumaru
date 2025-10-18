// components/users/ConfirmActionModal.tsx
import { User } from '@/hooks/useUsers';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ConfirmActionModalProps {
  visible: boolean;
  user: User | null;
  action: 'aprovar' | 'reprovar' | 'desativar' | 'reativar' | null;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  visible,
  user,
  action,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState('');

  if (!user || !action) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'aprovar':
        return {
          title: 'Aprovar Usuário',
          message: `Tem certeza que deseja aprovar ${user.nome}? Ele poderá acessar o sistema.`,
          icon: 'checkmark-circle' as const,
          iconColor: '#22c55e',
          bgColor: '#dcfce7',
          btnColor: '#22c55e',
        };
      case 'reativar':
        return {
          title: 'Reativar Usuário',
          message: `Tem certeza que deseja reativar ${user.nome}? Ele voltará a ter acesso ao sistema.`,
          icon: 'person-add-outline' as const,
          iconColor: '#16a34a',
          bgColor: '#dcfce7',
          btnColor: '#16a34a',
        };
      case 'reprovar':
        return {
          title: 'Reprovar Usuário',
          message: `Tem certeza que deseja reprovar ${user.nome}?`,
          icon: 'close-circle' as const,
          iconColor: '#ef4444',
          bgColor: '#fee2e2',
          btnColor: '#ef4444',
        };
      case 'desativar':
        return {
          title: 'Desativar Usuário',
          message: `Tem certeza que deseja desativar ${user.nome}? Ele perderá acesso ao sistema.`,
          icon: 'person-remove-outline' as const,
          iconColor: '#6b7280',
          bgColor: '#f3f4f6',
          btnColor: '#6b7280',
        };
    }
  };

  const config = getActionConfig();
  const needsReason = action === 'reprovar';

  const handleConfirm = () => {
    if (needsReason && !motivo.trim()) return;
    onConfirm(motivo);
    setMotivo('');
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={48} color={config.iconColor} />
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>

          {needsReason && (
            <TextInput
              style={styles.textArea}
              value={motivo}
              onChangeText={setMotivo}
              placeholder="Digite o motivo da reprovação..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={needsReason && !motivo.trim()}
              style={[
                styles.confirmButton,
                { backgroundColor: config.btnColor },
                needsReason && !motivo.trim() && styles.disabledButton,
              ]}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  textArea: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.5,
  },
});