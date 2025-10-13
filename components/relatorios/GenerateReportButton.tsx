import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GenerateReportButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ onGenerate, isGenerating }) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={onGenerate}
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator size={20} color="white" />
            <Text style={styles.generateButtonText}>Gerando Relatório...</Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-download-outline" size={20} color="white" />
            <Text style={styles.generateButtonText}>Gerar Relatório Completo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenerateReportButton;