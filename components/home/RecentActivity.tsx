// components/home/RecentActivity.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Activity {
  action: string;
  lote: string;
  amount: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
  isAdmin: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isAdmin }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Últimas Atividades</Text>
      <View style={styles.container}>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.content}>
                <View style={styles.info}>
                  <Text style={styles.action}>{activity.action}</Text>
                  <Text style={styles.details}>
                    {activity.lote} • {activity.amount}
                  </Text>
                </View>
                <Text style={styles.time}>{activity.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isAdmin ? 'Nenhuma atividade recente' : 'Você ainda não tem coletas registradas'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    paddingBottom: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
   
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  action: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  details: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default RecentActivity;