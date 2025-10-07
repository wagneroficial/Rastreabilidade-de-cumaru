// components/coleta/RecentCollections.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecentCollection {
  id: string;
  lote: string;
  arvore: string;
  quantidade: string;
  hora: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

interface RecentCollectionsProps {
  collections: RecentCollection[];
}

const RecentCollections: React.FC<RecentCollectionsProps> = ({ collections }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada':
        return '#16a34a'; // verde
      case 'pendente':
        return '#f59e0b'; // amarelo/laranja
      case 'rejeitada':
        return '#ef4444'; // vermelho
      default:
        return '#6b7280'; // cinza
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'Aprovada';
      case 'pendente':
        return 'Pendente';
      case 'rejeitada':
        return 'Rejeitada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coletas de Hoje</Text>
      <View style={styles.list}>
        {collections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhuma coleta registrada hoje
            </Text>
          </View>
        ) : (
          collections.map((coleta) => (
            <View key={coleta.id} style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.lote}>
                  {coleta.lote} - {coleta.arvore}
                </Text>
                <Text style={styles.quantidade}>{coleta.quantidade}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(coleta.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(coleta.status) }]}>
                    {getStatusText(coleta.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.hora}>{coleta.hora}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  empty: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  lote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  quantidade: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  hora: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecentCollections;