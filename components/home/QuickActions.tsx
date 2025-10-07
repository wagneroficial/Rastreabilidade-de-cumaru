// components/home/QuickActions.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionPress: (route: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionPress }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => onActionPress(action.route)}
          >
            <View style={[styles.icon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.title}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default QuickActions;