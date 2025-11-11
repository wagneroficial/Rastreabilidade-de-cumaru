// src/components/relatorios/VisaoGeral.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface VisaoGeralProps {
  dadosHome: {
    lotesCount: number;
    arvoresCount: number;
    totalColhido: string;
    melhorLote: string;
    lotesAtivos: number;
  };
  lotesData: {
    codigo: string;
    nome: string;
    area: number | string;
    arvores: number;
    colhidoTotal: string;
    status: string;
    ultimaColeta: string;
  }[];
}

const VisaoGeral: React.FC<VisaoGeralProps> = ({ dadosHome, lotesData }) => {
  const [modalVisible, setModalVisible] = useState(false);

// Gera o HTML do PDF
  const generateHTML = () => {
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório Geral</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
              font-size: 16px;
              line-height: 1.6;
            }
            h1 {
              color:#1f2937;
              text-align: center;
              font-size: 28px;
              margin-bottom: 24px;
            }
            h2 {
              color: #111827;
              border-bottom: 2px solid #1f2937;
              padding-bottom: 6px;
              font-size: 22px;
              margin-top: 28px;
            }
            .card {
              background: #f3f4f6;
              border-radius: 10px;
              padding: 16px;
              margin-bottom: 12px;
              border: 1px solid #e5e7eb;
              font-size: 17px;
            }
            .lote {
              background: #fff;
              border-radius: 10px;
              padding: 14px;
              margin-bottom: 12px;
              border: 1px solid #e5e7eb;
              font-size: 16px;
            }
            strong {
              color: #111827;
            }
          </style>
        </head>
        <body>
          <h1>Relatório Geral do Sistema</h1>

          <h2>Resumo</h2>
          <div class="card">
            <p><strong>Total de Lotes:</strong> ${dadosHome.lotesCount}</p>
            <p><strong>Total de Árvores:</strong> ${dadosHome.arvoresCount}</p>
            <p><strong>Total Colhido:</strong> ${dadosHome.totalColhido}</p>
            <p><strong>Lote com Maior Produção:</strong> ${dadosHome.melhorLote}</p>
            <p><strong>Lotes Ativos:</strong> ${dadosHome.lotesAtivos}</p>
          </div>

          <h2>Detalhes dos Lotes</h2>
          ${lotesData
            .map(
              (lote) => `
                <div class="lote">
                  <p><strong>Código:</strong> ${lote.codigo}</p>
                  <p><strong>Nome:</strong> ${lote.nome}</p>
                  <p><strong>Área:</strong> ${lote.area} ha</p>
                  <p><strong>Árvores:</strong> ${lote.arvores}</p>
                  <p><strong>Total Colhido:</strong> ${lote.colhidoTotal}</p>
                  <p><strong>Status:</strong> ${lote.status}</p>
                  <p><strong>Última Coleta:</strong> ${lote.ultimaColeta}</p>
                </div>
              `
            )
            .join('')}
        </body>
      </html>
    `;
  };

  // Função para exportar PDF
  const exportarPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateHTML(),
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF gerado com sucesso!', `Arquivo salvo em: ${uri}`);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Visão Geral do Sistema</Text>

      {/* 🔹 Cards de resumo geral */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total de Lotes</Text>
          <Text style={styles.cardValue}>{dadosHome.lotesCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total de Árvores</Text>
          <Text style={styles.cardValue}>{dadosHome.arvoresCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Colhido</Text>
          <Text style={styles.cardValue}>{dadosHome.totalColhido}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lote com Maior Produção</Text>
          <Text style={styles.cardValue}>{dadosHome.melhorLote}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lotes Ativos</Text>
          <Text style={styles.cardValue}>{dadosHome.lotesAtivos}</Text>
        </View>
      </View>

      {/* 🔹 Botões de PDF */}
      <View style={styles.buttonsContainer}>
        {/* Secundário (outline) */}
        <TouchableOpacity style={styles.buttonOutline} onPress={() => setModalVisible(true)}>
          <Ionicons name="eye-outline" size={20} color="#16a34a" />
          <Text style={styles.buttonOutlineText}>Visualizar PDF</Text>
        </TouchableOpacity>

        {/* Primário (solid) */}
        <TouchableOpacity style={styles.buttonSolid} onPress={exportarPDF}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.buttonSolidText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Lista detalhada dos lotes */}
      {lotesData && lotesData.length > 0 ? (
        lotesData.map((lote) => (
          <View key={String(lote.codigo)} style={styles.loteCard}>
            <Text style={styles.loteTitle}>{lote.nome || 'Sem nome'}</Text>
            <Text style={styles.loteText}>Área: {lote.area || '0'} ha</Text>
            <Text style={styles.loteText}>Árvores: {lote.arvores || 0}</Text>
            <Text style={styles.loteText}>Total Colhido: {lote.colhidoTotal || '0 kg'}</Text>
            <Text style={styles.loteText}>Status: {lote.status || 'Inativo'}</Text>
            <Text style={styles.loteText}>Última Coleta: {lote.ultimaColeta || 'Nunca'}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum lote encontrado.</Text>
      )}

  {/* 🔹 Modal com preview do PDF */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {/* Cabeçalho do modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pré-visualização do PDF</Text>

            <View style={{ flexDirection: 'row',  gap: 20 }}>
              <TouchableOpacity style={styles.modalButtonExport} onPress={exportarPDF}>
                <Ionicons name="download-outline" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Conteúdo em WebView */}
          <WebView originWhitelist={['*']} source={{ html: generateHTML() }} style={{ flex: 1 }} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginVertical: 24, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#111827' },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { backgroundColor: '#fdfdfd', borderRadius: 12, padding: 16, width: '48%', marginBottom: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, gap: 16},
   // 🔹 Outline (secundário)
  buttonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#16a34a',
    backgroundColor: '#37d16fd',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  buttonOutlineText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 15,
  },

  // 🔹 Solid (primário)
  buttonSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  buttonSolidText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  loteCard: { backgroundColor: '#fdfdfd', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  loteTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#111827' },
  loteText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 15, marginTop: 16 },
   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 14 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  modalButtonExport: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15803d', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 6, gap: 4 },
  backButton: { justifyContent: 'center', alignItems: 'center' },
});

export default VisaoGeral;
