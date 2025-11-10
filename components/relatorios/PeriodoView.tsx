// src/components/relatorios/PeriodoView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PeriodSelector from '@/components/relatorios/PeriodSelector';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');
const screenWidth = Dimensions.get('window').width - 32;

type RawItem = any;
type Normalized = { date: Date; producao: number; loteNome?: string };

interface PeriodoViewProps {
  periodoData: RawItem[];
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const normalizePeriod = (p: string): 'week' | 'month' | 'quarter' => {
  if (!p) return 'month';
  const s = p.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (s.includes('semana') || s.includes('ultima semana') || s.includes('ultima_semana')) return 'week';
  if (s.includes('trimestre') || s.includes('trimestral')) return 'quarter';
  if (s.includes('mes') || s.includes('mês') || s.includes('ultimo mes') || s.includes('ultimo_mês')) return 'month';
  if (s.includes('month') || s.includes('week') || s.includes('quarter')) {
    if (s.includes('week')) return 'week';
    if (s.includes('quarter')) return 'quarter';
    return 'month';
  }
  return 'month';
};

const PeriodoView: React.FC<PeriodoViewProps> = ({
  periodoData = [],
  periods,
  selectedPeriod,
  onPeriodChange,
}) => {
  const [debugLogPrinted, setDebugLogPrinted] = useState(false);

  const parseDate = (value: any): Date | null => {
    if (!value && value !== 0) return null;
    if (typeof value === 'object' && value !== null && 'seconds' in value)
      return new Date(value.seconds * 1000);
    if (value instanceof Date) return value;
    if (typeof value === 'object' && value !== null) {
      if (value.dataColeta) return parseDate(value.dataColeta);
      if (value.data) return parseDate(value.data);
    }
    if (typeof value === 'number') return new Date(value <= 1e10 ? value * 1000 : value);
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
      const parts = value.split(/[T\s]/)[0]?.split(/[-/]/);
      if (parts?.length >= 3) {
        const [y, m, d] = parts;
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
    }
    return null;
  };

  const normalized: Normalized[] = useMemo(() => {
    return (periodoData || [])
      .map((item: any) => {
        const qtd = item.quantidade ?? item.producao ?? item.producaoKg ?? item.value ?? item.amount;
        const date = parseDate(item.data ?? item.dataColeta ?? item.date ?? item.createdAt ?? item.timestamp);
        if (date && typeof qtd === 'number') return { date, producao: qtd, loteNome: item.loteNome };
        return null;
      })
      .filter(Boolean) as Normalized[];
  }, [periodoData]);

  useEffect(() => {
    if (!debugLogPrinted) {
      console.log('PeriodoView normalized entries:', normalized.length);
      setDebugLogPrinted(true);
    }
  }, [normalized, debugLogPrinted]);

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;

  // normaliza a chave de período vindo do selector
  const periodKey = normalizePeriod(selectedPeriod);
  useEffect(() => {
    console.log('PeriodoView selectedPeriod raw:', selectedPeriod, 'normalized key:', periodKey);
  }, [selectedPeriod]);

  const { labels, values, total, media, periodRange } = useMemo(() => {
    const now = new Date();
    const sorted = [...normalized].sort((a, b) => a.date.getTime() - b.date.getTime());
    let labels: string[] = [];
    let values: number[] = [];
    let filtered: Normalized[] = [];
    let periodRange = '';

    if (periodKey === 'week') {
      // last 7 days
      const start = moment(now).subtract(6, 'days').startOf('day').toDate();
      filtered = sorted.filter(it => it.date >= start && it.date <= now);
      const days = Array.from({ length: 7 }, (_, i) => moment(start).add(i, 'days').startOf('day').toDate());
      const map: Record<string, number> = {};
      filtered.forEach(it => { map[dayKey(it.date)] = (map[dayKey(it.date)] || 0) + it.producao; });
      labels = days.map(d => moment(d).format('ddd').toUpperCase());
      values = days.map(d => map[dayKey(d)] || 0);
      periodRange = `${moment(start).format('DD MMM')} – ${moment(now).format('DD MMM YYYY')}`;
    } else if (periodKey === 'month') {
      // Último mês: 4 semanas terminando hoje
      const end = moment(now).endOf('day').toDate();
      const start = moment(now).subtract(27, 'days').startOf('day').toDate(); // 4 semanas (28 dias)

      filtered = sorted.filter(it => it.date >= start && it.date <= end);

      const weeks: { start: Date; end: Date }[] = [];
      for (let i = 0; i < 4; i++) {
        const wEnd = moment(end).subtract((3 - i) * 7, 'days').endOf('day').toDate();
        const wStart = moment(wEnd).subtract(6, 'days').startOf('day').toDate();
        weeks.push({ start: wStart, end: wEnd });
      }

      values = weeks.map(({ start, end }) =>
        sorted.reduce(
          (acc, it) => (it.date >= start && it.date <= end ? acc + it.producao : acc),
          0
        )
      );
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      periodRange = `${moment(start).format('DD MMM')} – ${moment(end).format('DD MMM YYYY')}`;
    } // === ÚLTIMO TRIMESTRE ===
    else if (selectedPeriod.toLowerCase().includes('trimestre')) {
      const end = moment(now).endOf('day').toDate();
      const start = moment(now).subtract(2, 'months').startOf('month').toDate(); // início de 3 meses atrás
      filtered = sorted.filter(it => it.date >= start && it.date <= end);

      // divide por mês dentro do trimestre
      const months = Array.from({ length: 3 }, (_, i) => {
        const mStart = moment(start).add(i, 'months').startOf('month').toDate();
        const mEnd = moment(mStart).endOf('month').toDate();
        return { start: mStart, end: mEnd };
      });

      labels = months.map(m => moment(m.start).format('MMM').toUpperCase());
      values = months.map(({ start, end }) =>
        filtered.reduce(
          (acc, it) => (it.date >= start && it.date <= end ? acc + it.producao : acc),
          0
        )
      );

      periodRange = `${moment(start).format('DD MMM')} – ${moment(end).format('DD MMM YYYY')}`;
    }
    const total = filtered.reduce((acc, it) => acc + it.producao, 0);
    const media = filtered.length > 0 ? total / filtered.length : 0;
    return { labels, values, total, media, periodRange };
  }, [normalized, periodKey, selectedPeriod]);

  // últimas coletas
  const ultimasColetas = [...normalized].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Relatório por Período</Text>

      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
      />

      <View style={styles.summaryCard}>
        <Ionicons name="calendar-outline" size={20} color="#16a34a" />
        <Text style={styles.periodText}>{periodRange}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Coletado</Text>
          <Text style={styles.cardValue}>{total.toFixed(2)} kg</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Média por Coleta</Text>
          <Text style={styles.cardValue}>{media.toFixed(2)} kg</Text>
        </View>
      </View>

      {labels.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          <LineChart
            data={{ labels, datasets: [{ data: values }] }}
            width={Math.max(screenWidth, labels.length * 80)}
            height={320}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundColor: '#fdfdfd',
              backgroundGradientFrom: '#fdfdfd',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: { r: '3', strokeWidth: '2', stroke: '#16a34a' },
              propsForLabels: { fontSize: 11 },
            }}
            bezier
            style={styles.chart}
            fromZero
            withHorizontalLabels
            withVerticalLabels
          />
        </ScrollView>
      ) : (
        <Text style={styles.noData}>Nenhum dado disponível para o período selecionado</Text>
      )}

      <Text style={styles.subTitle}>Últimas coletas registradas</Text>

      {ultimasColetas.length > 0 ? (
        ultimasColetas.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View>
              <Text style={styles.itemTitle}>{item.loteNome}</Text>
              <Text style={styles.itemDate}>{moment(item.date).format('DD/MM/YYYY')}</Text>
            </View>
            <Text style={styles.itemValue}>{item.producao} kg</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataSmall}>Nenhuma coleta recente</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827'
  },

  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12
  },

  card: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  cardLabel: {
    fontSize: 13,
    color: '#065f46',
    marginBottom: 4,
    fontWeight: '500'
  },

  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534'
  },

  chart: {
    marginVertical: 8,
    borderRadius: 12,
    paddingTop: 20
  },

  noData: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6b7280'
  },

  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#111827'
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8
  },

  periodText: {
    color: '#065f46',
    fontWeight: '500'
  },

  noDataSmall: {
    textAlign: 'center',
    color: '#9ca3af'
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6
  },

  itemTitle: {
    fontWeight: '600',
    color: '#111827'
  },

  itemDate: {
    color: '#6b7280',
    fontSize: 13
  },

  itemValue: {
    color: '#16a34a',
    fontWeight: '600'
  },
});

export default PeriodoView;

