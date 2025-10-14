import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecentReport } from '../../types/relatorios.types';

interface RecentReportsListProps {
  reports: RecentReport[];
  onView: (report: RecentReport) => void;
  onDownload: (report: RecentReport) => void;
  onShare: (report: RecentReport) => void;
}

const RecentReportsList: React.FC<RecentReportsListProps> = ({
  reports,
  onView,
  onDownload,
  onShare,
}) => {
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
                      onPress={() => onDownload(report)}
                    >
                      <Ionicons name="download-outline" size={16} color="#6b7280" />
                      <Text style={styles.actionButtonSecondaryText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButtonIcon}
                      onPress={() => onShare(report)}
                    >
                      <Ionicons name="share-outline" size={16} color="#6b7280" />
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  recentReportsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeComplete: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeProcessing: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextComplete: {
    color: '#166534',
  },
  statusTextProcessing: {
    color: '#a16207',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionButtonIcon: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default RecentReportsList;