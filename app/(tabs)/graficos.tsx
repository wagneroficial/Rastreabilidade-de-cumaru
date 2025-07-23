import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GraficosScreenProps {
  navigation: any;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface StatItem {
  label: string;
  value: string;
  change: string;
}

interface PerformanceIndicator {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  color: string;
  backgroundColor: string;
}

const GraficosScreen: React.FC<GraficosScreenProps> = ({ navigation }) => {
  const [activeChart, setActiveChart] = useState<'volume' | 'lotes'>('volume');
  const [period, setPeriod] = useState('mensal');

  const chartData = {
    volume: [
      { name: 'Jan', value: 125 },
      { name: 'Fev', value: 89 },
      { name: 'Mar', value: 167 },
      { name: 'Abr', value: 134 },
      { name: 'Mai', value: 198 },
      { name: 'Jun', value: 156 }
    ],
    lotes: [
      { name: 'A-12', value: 234 },
      { name: 'B-07', value: 189 },
      { name: 'C-05', value: 456 },
      { name: 'D-15', value: 78 }
    ]
  };

  const stats: StatItem[] = [
    { label: 'Média Diária', value: '8.5 kg', change: '+12%' },
    { label: 'Melhor Dia', value: '24.3 kg', change: 'Esta semana' },
    { label: 'Meta Mensal', value: '89%', change: '445/500 kg' }
  ];

  const performanceIndicators: PerformanceIndicator[] = [
    {
      icon: 'trophy',
      title: 'Lote Mais Produtivo',
      subtitle: 'Lote C-05',
      value: '456 kg',
      color: '#16a34a',
      backgroundColor: '#f0fdf4'
    },
    {
      icon: 'calendar',
      title: 'Melhor Mês',
      subtitle: 'Maio 2024',
      value: '198 kg',
      color: '#2563eb',
      backgroundColor: '#eff6ff'
    },
    {
      icon: 'leaf',
      title: 'Produtividade Média',
      subtitle: 'Por árvore/mês',
      value: '2.1 kg',
      color: '#ea580c',
      backgroundColor: '#fff7ed'
    }
  ];

  const periods = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'trimestral', label: 'Trimestral' }
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };


  const renderBarChart = (data: ChartDataItem[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabel}>
                <Text style={styles.barLabelText}>{item.name}</Text>
              </View>
              <View style={styles.barTrack}>
                <View 
                  style={[styles.barFill, { width: `${percentage}%` }]}
                />
                <View style={styles.barValueContainer}>
                  <Text style={styles.barValue}>{item.value} kg</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gráficos</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Filter */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodFilters}>
              {periods.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setPeriod(filter.key)}
                  style={[
                    styles.periodButton,
                    period === filter.key ? styles.periodButtonActive : styles.periodButtonInactive
                  ]}
                >
                  <Text style={[
                    styles.periodButtonText,
                    period === filter.key ? styles.periodButtonTextActive : styles.periodButtonTextInactive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
                <View style={styles.statChange}>
                  <Text style={styles.statChangeText}>{stat.change}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartSelectorContainer}>
          <View style={styles.chartSelectorButtons}>
            <TouchableOpacity
              onPress={() => setActiveChart('volume')}
              style={[
                styles.chartSelectorButton,
                activeChart === 'volume' ? styles.chartSelectorButtonActive : styles.chartSelectorButtonInactive
              ]}
            >
              <Text style={[
                styles.chartSelectorButtonText,
                activeChart === 'volume' ? styles.chartSelectorButtonTextActive : styles.chartSelectorButtonTextInactive
              ]}>
                Volume por Período
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveChart('lotes')}
              style={[
                styles.chartSelectorButton,
                activeChart === 'lotes' ? styles.chartSelectorButtonActive : styles.chartSelectorButtonInactive
              ]}
            >
              <Text style={[
                styles.chartSelectorButtonText,
                activeChart === 'lotes' ? styles.chartSelectorButtonTextActive : styles.chartSelectorButtonTextInactive
              ]}>
                Volume por Lote
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Container */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {activeChart === 'volume' ? 'Colheita por Período' : 'Colheita por Lote'}
          </Text>
          {renderBarChart(activeChart === 'volume' ? chartData.volume : chartData.lotes)}
        </View>

        {/* Performance Indicators */}
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Indicadores de Performance</Text>
            
            <View style={styles.performanceList}>
              {performanceIndicators.map((indicator, index) => (
                <View 
                  key={index} 
                  style={[styles.performanceItem, { backgroundColor: indicator.backgroundColor }]}
                >
                  <View style={styles.performanceContent}>
                    <Ionicons 
                      name={indicator.icon as any} 
                      size={20} 
                      color={indicator.color} 
                    />
                    <View style={styles.performanceInfo}>
                      <Text style={styles.performanceItemTitle}>{indicator.title}</Text>
                      <Text style={styles.performanceSubtitle}>{indicator.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={[styles.performanceValue, { color: indicator.color }]}>
                    {indicator.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  periodContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  periodFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: '#16a34a',
  },
  periodButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  periodButtonTextInactive: {
    color: '#4b5563',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  statChange: {
    alignItems: 'flex-end',
  },
  statChangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  chartSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartSelectorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartSelectorButtonActive: {
    backgroundColor: '#16a34a',
  },
  chartSelectorButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartSelectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSelectorButtonTextActive: {
    color: 'white',
  },
  chartSelectorButtonTextInactive: {
    color: '#4b5563',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 40,
  },
  barLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  barTrack: {
    flex: 1,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 16,
  },
  barValueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  performanceContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  performanceList: {
    gap: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  performanceSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 80,
  },

  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default GraficosScreen;