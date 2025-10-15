// app/arvore/[id].tsx
import { db } from '@/app/services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

interface ArvoreData {
  id: string;
  codigo: string;
  tipo: string;
  loteId: string;
  loteNome?: string;
  estadoSaude: string;
  observacoes?: string;
  criadoEm: any;
  dataPlantio?: any;
  latitude?: number;
  longitude?: number;
}

interface ColetaHistorico {
  id: string;
  quantidade: number;
  dataColeta: any;
  coletorNome: string;
  qualidade?: string;
}

export default function DetalheArvoreScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [arvoreData, setArvoreData] = useState<ArvoreData | null>(null);
  const [coletas, setColetas] = useState<ColetaHistorico[]>([]);
  const [totalProducao, setTotalProducao] = useState(0);
  const [activeTab, setActiveTab] = useState<'dados' | 'producao'>('dados');
  const [showQRModal, setShowQRModal] = useState(false);
  const [sharingQR, setSharingQR] = useState(false);
  const qrCodeRef = useRef<View>(null);

  useEffect(() => {
    loadArvoreData();
  }, [id]);

  const loadArvoreData = async () => {
    try {
      setLoading(true);

      // Buscar dados da árvore
      const arvoreDoc = await getDoc(doc(db, 'arvores', id as string));
      
      if (!arvoreDoc.exists()) {
        console.log('Árvore não encontrada');
        return;
      }

      const arvore = arvoreDoc.data();

      // Buscar nome do lote
      let loteNome = 'Lote não encontrado';
      if (arvore.loteId) {
        const loteDoc = await getDoc(doc(db, 'lotes', arvore.loteId));
        if (loteDoc.exists()) {
          const loteData = loteDoc.data();
          loteNome = loteData.codigo || loteData.nome || 'Lote sem nome';
        }
      }

      setArvoreData({
        id: arvoreDoc.id,
        codigo: arvore.codigo || 'Sem código',
        tipo: arvore.tipo || 'Dipteryx odorata',
        loteId: arvore.loteId,
        loteNome,
        estadoSaude: arvore.estadoSaude || 'Saudável',
        observacoes: arvore.observacoes,
        criadoEm: arvore.criadoEm,
        dataPlantio: arvore.dataPlantio,
        latitude: arvore.latitude,
        longitude: arvore.longitude,
      });

      // Buscar histórico de coletas (SEM orderBy para evitar necessidade de índice)
      const coletasQuery = query(
        collection(db, 'coletas'),
        where('arvoreId', '==', id),
        where('status', '==', 'aprovada')
      );

      const coletasSnapshot = await getDocs(coletasQuery);
      const coletasData: ColetaHistorico[] = [];
      let total = 0;

      for (const docSnap of coletasSnapshot.docs) {
        const coleta = docSnap.data();
        total += coleta.quantidade || 0;

        coletasData.push({
          id: docSnap.id,
          quantidade: coleta.quantidade || 0,
          dataColeta: coleta.dataColeta,
          coletorNome: coleta.coletorNome || 'Desconhecido',
          qualidade: coleta.qualidade,
        });
      }

      // Ordenar manualmente por data (mais recente primeiro)
      coletasData.sort((a, b) => {
        const dateA = a.dataColeta?.seconds || 0;
        const dateB = b.dataColeta?.seconds || 0;
        return dateB - dateA;
      });

      setColetas(coletasData);
      setTotalProducao(total);

    } catch (error) {
      console.error('Erro ao carregar dados da árvore:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualidadeColor = (qualidade: string) => {
    switch (qualidade?.toLowerCase()) {
      case 'saudavel':
      case 'saudável': 
      case 'excelente': return '#059669';
      case 'bom': return '#F59E0B';
      case 'ruim':
      case 'doente': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getQualidadeLabel = (qualidade?: string) => {
    if (!qualidade) return '-';
    const labels: { [key: string]: string } = {
      'premium': 'Premium',
      'boa': 'Boa',
      'media': 'Média',
      'baixa': 'Baixa',
    };
    return labels[qualidade.toLowerCase()] || qualidade;
  };

  const generateQRData = () => {
    if (!arvoreData) return '';
    
    // Buscar código do lote
    const codigoLote = arvoreData.loteNome?.split(' - ')[0] || arvoreData.loteNome || 'LOTE';
    const codigoArvore = arvoreData.codigo;

    // Gerar no formato JSON
    const qrData = {
      codigoLote: codigoLote,
      codigoArvore: codigoArvore
    };

    return JSON.stringify(qrData);
  };

  const handleShareQR = async () => {
    try {
      setSharingQR(true);

      // Verificar se o dispositivo suporta compartilhamento
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
        setSharingQR(false);
        return;
      }

      // Capturar a view do QR Code como imagem
      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 1,
      });

      // Compartilhar diretamente a URI capturada (sem precisar copiar para cache)
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `QR Code - ${arvoreData?.codigo}`,
      });

      setSharingQR(false);
    } catch (error) {
      console.error('Erro ao compartilhar QR Code:', error);
      setSharingQR(false);
      Alert.alert('Erro', 'Não foi possível compartilhar o QR Code.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!arvoreData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Árvore não encontrada</Text>
        <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{arvoreData.codigo}</Text>
          <Text style={styles.headerSubtitle}>{arvoreData.tipo}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getQualidadeColor(arvoreData.estadoSaude) }
        ]}>
          <Text style={styles.statusText}>{arvoreData.estadoSaude}</Text>
        </View>
      </View>

      {/* Botão Gerar QR Code */}
      <View style={styles.qrButtonContainer}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQRModal(true)}
        >
          <Ionicons name="qr-code-outline" size={20} color="white" />
          <Text style={styles.qrButtonText}>Gerar QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dados' && styles.tabActive]}
          onPress={() => setActiveTab('dados')}
        >
          <Text style={[styles.tabText, activeTab === 'dados' && styles.tabTextActive]}>
            Dados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'producao' && styles.tabActive]}
          onPress={() => setActiveTab('producao')}
        >
          <Text style={[styles.tabText, activeTab === 'producao' && styles.tabTextActive]}>
            Produção
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'dados' ? (
          <>
            {/* Informações Gerais */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Gerais</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lote:</Text>
                  <Text style={styles.infoValue}>{arvoreData.loteNome}</Text>
                </View>
                <View style={[styles.infoRow, styles.infoRowBorder]}>
                  <Text style={styles.infoLabel}>Espécie:</Text>
                  <Text style={styles.infoValue}>{arvoreData.tipo}</Text>
                </View>
                {arvoreData.dataPlantio && (
                  <View style={[styles.infoRow, styles.infoRowBorder]}>
                    <Text style={styles.infoLabel}>Data Plantio:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(arvoreData.dataPlantio.seconds * 1000).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Última Coleta:</Text>
                  <Text style={styles.infoValue}>
                    {coletas.length > 0
                      ? new Date(coletas[0].dataColeta.seconds * 1000).toLocaleDateString('pt-BR')
                      : 'Nunca coletada'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Localização GPS */}
            {(arvoreData.latitude && arvoreData.longitude) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Localização GPS</Text>
                <View style={styles.card}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Latitude:</Text>
                    <Text style={styles.infoValue}>{arvoreData.latitude}</Text>
                  </View>
                  <View style={[styles.infoRow, styles.infoRowBorder]}>
                    <Text style={styles.infoLabel}>Longitude:</Text>
                    <Text style={styles.infoValue}>{arvoreData.longitude}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Observações */}
            {arvoreData.observacoes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <View style={styles.card}>
                  <Text style={styles.observacoes}>{arvoreData.observacoes}</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Resumo de Produção */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo de Produção</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{totalProducao.toFixed(1)} kg</Text>
                  <Text style={styles.statLabel}>Total Produção</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{coletas.length}</Text>
                  <Text style={styles.statLabel}>Coletas Realizadas</Text>
                </View>
              </View>
            </View>

            {/* Histórico de Coletas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histórico de Coletas</Text>
              {coletas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>Nenhuma coleta realizada</Text>
                </View>
              ) : (
                coletas.map((coleta) => (
                  <View key={coleta.id} style={styles.coletaCard}>
                    <View style={styles.coletaHeader}>
                      <Text style={styles.coletaData}>
                        {new Date(coleta.dataColeta.seconds * 1000).toLocaleDateString('pt-BR')}
                      </Text>
                      <Text style={styles.coletaQuantidade}>{coleta.quantidade.toFixed(1)} kg</Text>
                    </View>
                    <Text style={styles.coletaColetor}>por {coleta.coletorNome}</Text>
                    {coleta.qualidade && (
                      <View style={styles.coletaQualidade}>
                        <Text style={styles.coletaQualidadeLabel}>Qualidade:</Text>
                        <Text style={styles.coletaQualidadeValue}>
                          {getQualidadeLabel(coleta.qualidade)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal QR Code */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>QR Code da Árvore</Text>
              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                style={styles.qrModalClose}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* View que será capturada como imagem */}
            <View 
              ref={qrCodeRef} 
              collapsable={false}
              style={styles.qrCodeCaptureContainer}
            >
              <View style={styles.qrCodeHeader}>
                <View style={styles.qrCodeHeaderIcon}>
                  <Ionicons name="leaf" size={32} color="#059669" />
                </View>
                <Text style={styles.qrCodeHeaderTitle}>CumaruApp</Text>
              </View>

              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={generateQRData()}
                  size={220}
                  backgroundColor="white"
                  color="black"
                />
              </View>

              <View style={styles.qrCodeFooter}>
                <Text style={styles.qrCodeFooterTitle}>{arvoreData?.codigo}</Text>
                <Text style={styles.qrCodeFooterSubtitle}>{arvoreData?.loteNome}</Text>
                <Text style={styles.qrCodeFooterText}>
                  Escaneie para registrar coleta
                </Text>
              </View>
            </View>

            <View style={styles.qrInfoContainer}>
              <Text style={styles.qrInfoText}>
                Compartilhe este QR Code e cole na árvore para facilitar o registro de coletas.
              </Text>
            </View>

            <View style={styles.qrModalButtons}>
              <TouchableOpacity
                style={[styles.qrShareButton, sharingQR && styles.qrShareButtonDisabled]}
                onPress={handleShareQR}
                disabled={sharingQR}
              >
                {sharingQR ? (
                  <>
                    <ActivityIndicator size="small" color="#059669" />
                    <Text style={styles.qrShareButtonText}>Preparando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color="#059669" />
                    <Text style={styles.qrShareButtonText}>Compartilhar Imagem</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qrCloseButton}
                onPress={() => setShowQRModal(false)}
              >
                <Text style={styles.qrCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  backButtonError: {
    marginTop: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
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
    color: '#BBF7D0',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  qrButtonContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  observacoes: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  coletaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  coletaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coletaData: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  coletaQuantidade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  coletaColetor: {
    fontSize: 14,
    color: '#6B7280',
  },
  coletaQualidade: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  coletaQualidadeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  coletaQualidadeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  qrModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  qrModalClose: {
    padding: 4,
  },
  qrCodeCaptureContainer: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
  },
  qrCodeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeHeaderIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#F0FDF4',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrCodeHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrCodeFooterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  qrCodeFooterSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  qrCodeFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  qrInfoContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  qrInfoText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  qrModalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  qrShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  qrShareButtonDisabled: {
    opacity: 0.5,
  },
  qrShareButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  qrCloseButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  qrCloseButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});