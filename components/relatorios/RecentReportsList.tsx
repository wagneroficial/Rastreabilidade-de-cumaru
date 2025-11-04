import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecentReport } from '../../types/relatorios.types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface RecentReportsListProps {
  reports: RecentReport[];
  onView: (report: RecentReport) => void;
  onDownload?: (report: RecentReport) => void;
}

const RecentReportsList: React.FC<RecentReportsListProps> = ({
  reports,
  onView,
}) => {

 const generatePDFContent = (report: RecentReport) => {
  if (!report.data) return `<p style="font-size:14px;color:#555;">Nenhum dado disponível</p>`;

  const {
    coletas = [],
    chartData = { volume: [], lotes: [] },
    periodo,
    dataGeracao,
    resumoExecutivo,
    analisePorLote,
  } = report.data as any;

  // Estilos globais do PDF
  const style = `
    <style>
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        padding: 30px;
        color: #333;
        background-color: #f9fafb;
      }
      h1 {
        text-align: center;
        color: #166534;
        border-bottom: 2px solid #16a34a;
        padding-bottom: 8px;
      }
      h2 {
        color: #15803d;
        margin-top: 24px;
        font-size: 18px;
      }
      p {
        font-size: 14px;
        line-height: 1.6;
        color: #444;
      }
      .section {
        background: #fff;
        padding: 16px 20px;
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      th {
        background-color: #dcfce7;
        color: #14532d;
        text-align: left;
        padding: 8px;
        font-size: 13px;
        border: 1px solid #c7e7d1;
      }
      td {
        padding: 8px;
        border: 1px solid #e5e7eb;
        font-size: 13px;
      }
      .meta {
        margin-top: 12px;
        padding: 10px;
        background: #ecfdf5;
        border-left: 4px solid #16a34a;
      }
      .highlight {
        font-weight: 600;
        color: #166534;
      }
    </style>
  `;

  // Detalhamento da Coleta
  const coletasHtml = coletas.length
    ? `
      <div class="section">
        <h2>Detalhamento da Coleta</h2>
        <table>
          <tr>${Object.keys(coletas[0])
            .map(k => `<th>${k}</th>`)
            .join('')}</tr>
          ${coletas
            .map(
              (c: any) =>
                `<tr>${Object.values(c)
                  .map(v => `<td>${v}</td>`)
                  .join('')}</tr>`
            )
            .join('')}
        </table>
      </div>
    `
    : '';

  // Análise por Lote
  const analiseHtml = analisePorLote
    ? `
      <div class="section">
        <h2>Análise por Lote</h2>
        <table>
          <tr>${Object.keys(analisePorLote[0] || {})
            .map(k => `<th>${k}</th>`)
            .join('')}</tr>
          ${analisePorLote
            .map(
              (a: any) =>
                `<tr>${Object.values(a)
                  .map(v => `<td>${v}</td>`)
                  .join('')}</tr>`
            )
            .join('')}
        </table>
      </div>
    `
    : '';

  // Resumo Executivo
  const resumoHtml = resumoExecutivo
    ? `
      <div class="section">
        <h2>Resumo Executivo</h2>
        <p>${resumoExecutivo}</p>
      </div>
    `
    : '';

  // Dados de gráficos
  const chartHtml =
    chartData.volume.length || chartData.lotes.length
      ? `
        <div class="section">
          <h2>Dados dos Gráficos</h2>
          ${
            chartData.volume.length
              ? `<p><span class="highlight">Volume:</span> ${chartData.volume
                  .map((d: any) => `${d.label}: ${d.value}`)
                  .join(', ')}</p>`
              : ''
          }
          ${
            chartData.lotes.length
              ? `<p><span class="highlight">Lotes:</span> ${chartData.lotes
                  .map((d: any) => `${d.label}: ${d.value}`)
                  .join(', ')}</p>`
              : ''
          }
        </div>
      `
      : '';

  // Retorno do HTML completo
  return `
    <html>
      <head>${style}</head>
      <body>
        <h1>Relatório de Rastreabilidade</h1>

        <div class="section">
          <h2>Informações Gerais</h2>
          <p><span class="highlight">Título:</span> ${report.title}</p>
          <p><span class="highlight">Tipo:</span> ${report.type}</p>
          <p><span class="highlight">Período:</span> ${periodo || '-'}</p>
          <p><span class="highlight">Data de Geração:</span> ${dataGeracao || report.date}</p>
          <p><span class="highlight">Status:</span> ${
            report.status === 'completo' ? '✅ Completo' : '⏳ Processando'
          }</p>
        </div>

        ${resumoHtml}
        ${analiseHtml}
        ${coletasHtml}
        ${chartHtml}

        <p style="text-align:center;margin-top:30px;font-size:12px;color:#9ca3af;">
          Relatório gerado automaticamente pelo sistema Cumaru 🌿
        </p>
      </body>
    </html>
  `;
  };

  // Download PDF
  const downloadPDF = async (report: RecentReport) => {
    try {
      const html = generatePDFContent(report);
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
      Alert.alert('Download concluído', `PDF salvo em: ${uri}`);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível fazer o download do PDF.');
    }
  };

  // Compartilhar PDF
  const sharePDF = async (report: RecentReport) => {
    try {
      const html = generatePDFContent(report);
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', `Compartilhamento não disponível. PDF salvo em: ${uri}`);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível compartilhar o PDF.');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Relatórios Recentes</Text>
      <View style={styles.recentReportsList}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>Nenhum relatório gerado ainda</Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportCardHeader}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <View style={styles.reportMeta}>
                    <Text style={styles.reportMetaText}>{report.type}</Text>
                    <Text style={styles.reportMetaText}>{report.date}</Text>
                    <Text style={styles.reportMetaText}>{report.size}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    report.status === 'completo'
                      ? styles.statusBadgeComplete
                      : styles.statusBadgeProcessing,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      report.status === 'completo'
                        ? styles.statusTextComplete
                        : styles.statusTextProcessing,
                    ]}
                  >
                    {report.status === 'completo' ? 'Completo' : 'Processando'}
                  </Text>
                </View>
              </View>

              <View style={styles.reportActions}>
                {report.status === 'completo' ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButtonPrimary}
                      onPress={() => onView(report)}
                    >
                      <Ionicons name="eye-outline" size={16} color="#16a34a" />
                      <Text style={styles.actionButtonPrimaryText}>Visualizar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButtonSecondary}
                      onPress={() => downloadPDF(report)}
                    >
                      <Ionicons name="download-outline" size={16} color="#1f2937" />
                      <Text style={styles.actionButtonSecondaryText}>Download</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButtonSecondary}
                      onPress={() => sharePDF(report)}
                    >
                      <Ionicons name="share-outline" size={16} color="#1f2937" />
                      <Text style={styles.actionButtonSecondaryText}>Compartilhar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.processingIndicator}>
                    <Ionicons name="hourglass-outline" size={16} color="#6b7280" />
                    <Text style={styles.processingText}>Processando...</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  recentReportsList: { gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateText: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 12 },
  reportCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 1 },
  reportCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4 },
  reportMeta: { flexDirection: 'row', gap: 16 },
  reportMetaText: { fontSize: 14, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeComplete: { backgroundColor: '#dcfce7' },
  statusBadgeProcessing: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 12, fontWeight: '500' },
  statusTextComplete: { color: '#166534' },
  statusTextProcessing: { color: '#a16207' },
  reportActions: { flexDirection: 'row', gap: 8 },
  actionButtonPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, backgroundColor: '#f0fdf4', borderRadius: 8 },
  actionButtonPrimaryText: { fontSize: 14, fontWeight: '500', color: '#16a34a' },
  actionButtonSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, backgroundColor: '#f9fafb', borderRadius: 8 },
  actionButtonSecondaryText: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  processingIndicator: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 8 },
  processingText: { fontSize: 14, color: '#6b7280' },
});

export default RecentReportsList;
