// components/coleta/ColetaForm.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Lote {
  id: string;
  codigo: string;
  nome: string;
}

interface Arvore {
  id: string;
  codigo: string;
  loteId: string;
}

interface ColetaFormProps {
  lotes: Lote[];
  selectedLote: string;
  selectedArvore: string;
  arvoresDoLote: Arvore[];
  quantidade: string;
  observacoes: string;
  isSubmitting: boolean;
  isAdmin: boolean;
  onLotePress: () => void;
  onArvorePress: () => void;
  onQuantidadeChange: (value: string) => void;
  onObservacoesChange: (value: string) => void;
  onSubmit: () => void;
}

const ColetaForm: React.FC<ColetaFormProps> = ({
  lotes,
  selectedLote,
  selectedArvore,
  arvoresDoLote,
  quantidade,
  observacoes,
  isSubmitting,
  isAdmin,
  onLotePress,
  onArvorePress,
  onQuantidadeChange,
  onObservacoesChange,
  onSubmit,
}) => {
  const getLoteNome = (id: string) => {
    const lote = lotes.find(l => l.id === id);
    return lote ? `${lote.codigo} - ${lote.nome}` : 'Selecione um lote';
  };

  const getArvoreNome = (id: string) => {
    const arvore = arvoresDoLote.find(a => a.id === id);
    return arvore ? arvore.codigo : 'Selecione uma árvore';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro Manual</Text>
        
        {lotes.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
            <Text style={styles.noDataTitle}>Nenhum lote disponível</Text>
            <Text style={styles.noDataText}>
              {isAdmin 
                ? 'Não há lotes ativos no sistema'
                : 'Você não foi atribuído a nenhum lote ativo'
              }
            </Text>
          </View>
        ) : (
          <>
            {/* Lote Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lote</Text>
              <TouchableOpacity style={styles.selectButton} onPress={onLotePress}>
                <Text style={[
                  styles.selectButtonText,
                  !selectedLote && styles.placeholder
                ]}>
                  {getLoteNome(selectedLote)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Árvore Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Árvore</Text>
              <TouchableOpacity
                style={[styles.selectButton, !selectedLote && styles.disabled]}
                onPress={onArvorePress}
                disabled={!selectedLote}
              >
                <Text style={[
                  styles.selectButtonText,
                  !selectedArvore && styles.placeholder,
                  !selectedLote && styles.disabledText
                ]}>
                  {selectedLote && arvoresDoLote.length === 0 
                    ? 'Nenhuma árvore neste lote' 
                    : getArvoreNome(selectedArvore)
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
              {selectedLote && arvoresDoLote.length === 0 && (
                <Text style={styles.helperText}>
                  Nenhuma árvore cadastrada neste lote
                </Text>
              )}
            </View>

            {/* Quantidade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantidade (kg)</Text>
              <TextInput
                style={styles.input}
                value={quantidade}
                onChangeText={onQuantidadeChange}
                placeholder="0.0"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observacoes}
                onChangeText={onObservacoesChange}
                placeholder="Condições da colheita, qualidade dos frutos..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              <Text style={styles.charCount}>{observacoes.length}/500</Text>
            </View>

            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting || !selectedLote || !selectedArvore || !quantidade || arvoresDoLote.length === 0}
              style={[
                styles.submitButton, 
                (isSubmitting || !selectedLote || !selectedArvore || !quantidade || arvoresDoLote.length === 0) && styles.submitButtonDisabled
              ]}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.submitButtonText}>Registrando...</Text>
                </>
              ) : (
                <Text style={styles.submitButtonText}>Registrar Coleta</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholder: {
    color: '#9ca3af',
  },
  disabledText: {
    color: '#d1d5db',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ColetaForm;