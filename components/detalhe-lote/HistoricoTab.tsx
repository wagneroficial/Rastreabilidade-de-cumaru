// components/detalhe-lote/HistoricoTab.tsx
import { HistoricoItem } from '@/types/lote.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HistoricoTabProps {
    historico: HistoricoItem[];
    isAdmin: boolean;
    currentUserId: string; // 👈 ID do usuário para filtragem
}

const HistoricoTab: React.FC<HistoricoTabProps> = ({ historico, isAdmin, currentUserId }) => {
    // Filtrar histórico baseado no tipo de usuário
    const historicoFiltrado = useMemo(() => {
        if (isAdmin) {
            // Admin vê todo o histórico
            return historico;
        } else {
            // Colaborador vê apenas suas próprias coletas (filtrando pelo coletorId)
            return historico.filter(item => item.coletorId === currentUserId);
        }
    }, [historico, isAdmin, currentUserId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprovada': return '#10B981'; // verde
            case 'pendente': return '#F59E0B'; // amarelo/laranja
            case 'rejeitada': return '#EF4444'; // vermelho
            default: return '#6B7280'; // cinza
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'aprovada': return 'Aprovada';
            case 'pendente': return 'Pendente';
            case 'rejeitada': return 'Rejeitada';
            default: return 'Desconhecido';
        }
    };

    if (historicoFiltrado.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>Nenhum histórico encontrado</Text>
                <Text style={styles.emptyStateText}>
                    {isAdmin 
                        ? 'Quando houver coletas neste lote, elas aparecerão aqui.'
                        : 'Você ainda não realizou coletas neste lote.'}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {historicoFiltrado.map((item) => (
                <View key={item.id} style={styles.historicoCard}>
                    <View style={styles.historicoHeader}>
                        <View style={styles.historicoData}>
                            <View style={styles.dateRow}>
                                <Text style={styles.historicoDate}>{item.data}</Text>
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: `${getStatusColor(item.status)}20` }
                                ]}>
                                    <Text style={[
                                        styles.statusText, 
                                        { color: getStatusColor(item.status) }
                                    ]}>
                                        {getStatusText(item.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.historicoResponsavel}>por {item.responsavel}</Text>
                            <Text style={styles.historicoHora}>às {item.hora}</Text>
                        </View>
                        <Text style={styles.historicoProducao}>{item.quantidade}</Text>
                    </View>
                    {item.observacoes && (
                        <View style={styles.historicoObservacoesContainer}>
                            <Text style={styles.historicoObservacoes}>{`"${item.observacoes}"`}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    historicoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    historicoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    historicoData: {
        flex: 1,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    historicoDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    historicoResponsavel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    historicoHora: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    historicoProducao: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    historicoObservacoesContainer: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    historicoObservacoes: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        lineHeight: 16,
    },
});

export default HistoricoTab;