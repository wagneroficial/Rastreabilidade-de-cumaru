// src/components/relatorios/PeriodoView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PeriodSelector from '@/components/relatorios/PeriodSelector';

const screenWidth = Dimensions.get('window').width - 32;

type RawItem = any;
type Normalized = { date: Date; producao: number; loteNome?: string };

interface PeriodoViewProps {
  periodoData: RawItem[]; // dados brutos do hook
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PeriodoView: React.FC<PeriodoViewProps> = ({
  periodoData = [],
  periods,
  selectedPeriod,
  onPeriodChange,
}) => {
  const [debugLogPrinted, setDebugLogPrinted] = useState(false);

  // ----- util: parse universal
  const parseDate = (value: any): Date | null => {
    if (!value && value !== 0) return null;

    // Firebase Timestamp object like { seconds, nanoseconds }
    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const s = Number(value.seconds || 0);
      return new Date(s * 1000);
    }

    // If it's a Date instance
    if (value instanceof Date) return value;

    // If it's an object with dataColeta or data
    if (typeof value === 'object' && value !== null) {
      if (value.dataColeta) return parseDate(value.dataColeta);
      if (value.data) return parseDate(value.data);
    }

    // number (timestamp ms or seconds)
    if (typeof value === 'number') {
      // heuristic: if small (<= 1e10) it's seconds -> *1000
      if (value <= 1e10) return new Date(value * 1000);
      return new Date(value);
    }

    // string: try ISO first
    if (typeof value === 'string') {
      const iso = new Date(value);
      if (!isNaN(iso.getTime())) return iso;

      // try YYYY-MM-DD
      const parts = value.split(/[T\s]/)[0]?.split(/[-/]/);
      if (parts && parts.length >= 3) {
        const [y, m, d] = parts;
        const yi = Number(y), mi = Number(m) - 1, di = Number(d);
        if (!Number.isNaN(yi) && !Number.isNaN(mi) && !Number.isNaN(di)) {
          return new Date(yi, mi, di);
        }
      }
    }

    return null;
  };

  // ----- normalize raw periodoData into list of {date:Date, producao:number}
  const normalized: Normalized[] = useMemo(() => {
    const out: Normalized[] = [];
    (periodoData || []).forEach((item: any, idx: number) => {
      // attempt common field names:
      const possibleQtd = item.quantidade ?? item.producao ?? item.producaoKg ?? item.value ?? item.amount;
      const possibleDate = item.data ?? item.dataColeta ?? item.date ?? item.createdAt ?? item.timestamp;
      const pd = parseDate(possibleDate);

      if (pd && typeof possibleQtd === 'number') {
        out.push({ date: pd, producao: possibleQtd, loteNome: item.loteNome || item.lote || undefined });
      } else if (pd && possibleQtd == null && typeof item === 'object') {
        // maybe item itself has nested fields — try to coerce numeric-like strings
        const q = Number(item.quantidade || item.producao || item.value || item.amount);
        if (!Number.isNaN(q)) out.push({ date: pd, producao: q, loteNome: item.loteNome || item.lote || undefined });
      } else {
        // push debug placeholder so we can inspect in console
        // do not push invalid entries as they will pollute aggregates
      }
    });

    return out;
  }, [periodoData]);

  // print debug once so we can see original shape if needed
  useEffect(() => {
    if (!debugLogPrinted) {
      // small, helpful logs
      console.log('--- PeriodoView debug ---');
      console.log('raw periodoData length:', periodoData?.length);
      console.log('normalized entries:', normalized.length);
      if (normalized.length > 0) {
        console.log('sample normalized (first 6):', normalized.slice(0, 6).map(n => ({ date: n.date.toISOString(), producao: n.producao, loteNome: n.loteNome })));
      } else {
        console.log('normalized is empty — check raw data fields and formats (ex: timestamp, dataColeta, data)');
        console.log('sample raw (first 6):', (periodoData || []).slice(0, 6));
      }
      setDebugLogPrinted(true);
    }
  }, [periodoData, normalized, debugLogPrinted]);

  // ----- helper to aggregate by day key
  const dayKey = (d: Date) => {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  // ----- prepare chart buckets depending on selectedPeriod
  const { labels, values } = useMemo(() => {
    const now = new Date();
    // ensure normalized sorted by date ascending
    const sorted = [...normalized].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (selectedPeriod.toLowerCase().includes('semana')) {
      // last 7 days including today, oldest first
      const days: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
      }
      // aggregate sums per day
      const map: Record<string, number> = {};
      sorted.forEach((it) => {
        const k = dayKey(it.date);
        map[k] = (map[k] || 0) + (it.producao || 0);
      });
      const labs = days.map(d => d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase());
      const vals = days.map(d => map[dayKey(d)] || 0);
      return { labels: labs, values: vals };
    }

    if (selectedPeriod.toLowerCase().includes('mês') || selectedPeriod.toLowerCase().includes('mes')) {
      // last 4 weeks: compute 4 weekly buckets: weekStart..weekEnd
      // We'll label: Sem 4 (oldest), Sem 3, Sem 2, Sem 1 (most recent)
      const weeks: { start: Date; end: Date }[] = [];
      for (let w = 4; w >= 1; w--) {
        const end = new Date(now);
        end.setDate(now.getDate() - (w - 1) * 7);
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        weeks.push({ start, end });
      }
      // aggregate
      const weeklySums = weeks.map(({ start, end }) => {
        return sorted.reduce((acc, it) => (it.date >= start && it.date <= end ? acc + it.producao : acc), 0);
      });
      const labels = ['Sem 4', 'Sem 3', 'Sem 2', 'Sem 1']; // oldest -> newest
      return { labels, values: weeklySums };
    }

    // trimestre: last 3 months totals, label T1 (oldest) .. T3 (most recent)
    if (selectedPeriod.toLowerCase().includes('trimestre') || selectedPeriod.toLowerCase().includes('trimestral')) {
      const months: { start: Date; end: Date; label: string }[] = [];
      // build for last 3 months: oldest first
      for (let i = 3; i >= 1; i--) {
        const ref = new Date(now);
        ref.setMonth(now.getMonth() - (i - 1));
        const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999); // end of month
        months.push({ start, end, label: `T${4 - i}` }); // i=3 -> T1, i=2 -> T2, i=1 -> T3
      }
      const totals = months.map(({ start, end }) =>
        sorted.reduce((acc, it) => (it.date >= start && it.date <= end ? acc + it.producao : acc), 0)
      );
      const labels = ['T1', 'T2', 'T3'];
      return { labels, values: totals };
    }

    // fallback: show aggregated by day for last 7 entries
    if (sorted.length === 0) return { labels: [], values: [] };
    const last = sorted.slice(-7);
    const labs = last.map(it => it.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const vals = last.map(it => it.producao);
    return { labels: labs, values: vals };
  }, [normalized, selectedPeriod]);

  // debug: if labels empty but normalized has items -> print info
  useEffect(() => {
    if ((labels.length === 0 || values.reduce((s, v) => s + v, 0) === 0) && normalized.length > 0) {
      console.log('PeriodoView: labels/values result might be empty/zero despite normalized data. selectedPeriod=', selectedPeriod);
      console.log('normalized sample:', normalized.slice(0, 6).map(n => ({ date: n.date.toISOString(), producao: n.producao })));
      console.log('computed labels:', labels, 'computed values:', values);
    }
  }, [labels, values, normalized, selectedPeriod]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatório por Período</Text>

      <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} onPeriodChange={onPeriodChange} />

      {labels.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{ labels, datasets: [{ data: values }] }}
            width={Math.max(screenWidth, labels.length * 60)}
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
          />
        </ScrollView>
      ) : (
        <Text style={styles.noData}>Nenhum dado disponível para o período selecionado</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#111827' },
  chart: { marginVertical: 8, borderRadius: 12, paddingRight: 48, paddingTop: 20 },
  noData: { marginTop: 20, textAlign: 'center', color: '#6b7280' },
});

export default PeriodoView;
