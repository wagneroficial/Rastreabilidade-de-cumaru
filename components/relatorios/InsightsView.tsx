// import React from 'react';
// import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LineChart } from 'react-native-chart-kit';
// import { RecentReport } from '@/types/relatorios.types';

// const screenWidth = Dimensions.get('window').width - 32;

// interface InsightsViewProps {
//   summaryData?: any;
//   generatingReport: boolean;
//   generateReport: () => void;
//   recentReports: RecentReport[];
//   handleViewReport: (report: RecentReport) => void;
//   handleDownloadReport: (report: RecentReport) => void;
//   handleShareReport: (report: RecentReport) => void;
//   handleExportOption: (option: string) => void;
// }

// const InsightsView: React.FC<InsightsViewProps> = ({
//   summaryData,
//   generatingReport,
//   generateReport,
//   recentReports,
//   handleViewReport,
//   handleDownloadReport,
//   handleShareReport,
//   handleExportOption,
// }) => {
//   const chartConfig = {
//     backgroundColor: '#fdfdfd',
//     backgroundGradientFrom: '#fdfdfd',
//     backgroundGradientTo: '#fdfdfd',
//     decimalPlaces: 0,
//     color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
//     propsForDots: { r: '4', strokeWidth: '1', stroke: '#16a34a' },
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* Cabeçalho */}
//       <View style={styles.header}>
//         <Ionicons name="bulb-outline" size={26} color="#16a34a" />
//         <View>
//           <Text style={styles.title}>Insights e Relatórios</Text>
//           <Text style={styles.subtitle}>
//             Gere relatórios automáticos e veja análises baseadas nos seus dados.
//           </Text>
//         </View>
//       </View>

//       {/* Gráfico de Tendência */}
//       <View style={styles.chartContainer}>
//         <Text style={styles.chartTitle}>Tendência de Crescimento</Text>
//         <LineChart
//           data={{
//             labels: ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
//             datasets: [{ data: [420, 480, 520, 600, 750, 820] }],
//           }}
//           width={screenWidth}
//           height={240}
//           bezier
//           chartConfig={chartConfig}
//           style={styles.chartStyle}
//         />
//         <Text style={styles.chartNote}>
//           A produção mostra crescimento contínuo nos últimos meses, com destaque em outubro e novembro.
//         </Text>
//       </View>

//       {/* Cards de insights rápidos */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Insights Automáticos</Text>
//         <View style={styles.insightsGrid}>
//           <View style={[styles.insightCard, { backgroundColor: '#dcfce7' }]}>
//             <Ionicons name="trending-up-outline" size={22} color="#16a34a" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Crescimento Sustentado</Text>
//               <Text style={styles.insightText}>A produção aumentou 18% nos últimos 3 meses.</Text>
//             </View>
//           </View>

//           <View style={[styles.insightCard, { backgroundColor: '#e0f2fe' }]}>
//             <Ionicons name="leaf-outline" size={22} color="#0ea5e9" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Redução de Descarte</Text>
//               <Text style={styles.insightText}>Os descartes diminuíram 6%, indicando melhor controle operacional.</Text>
//             </View>
//           </View>

//           <View style={[styles.insightCard, { backgroundColor: '#fef9c3' }]}>
//             <Ionicons name="speedometer-outline" size={22} color="#facc15" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Eficiência Elevada</Text>
//               <Text style={styles.insightText}>A taxa de eficiência média subiu para 91% neste período.</Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* Geração de relatórios */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Gerar Relatório</Text>
//         <TouchableOpacity
//           style={styles.generateButton}
//           onPress={generateReport}
//           disabled={generatingReport}
//         >
//           {generatingReport ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Ionicons name="document-text-outline" size={20} color="#fff" />
//               <Text style={styles.generateButtonText}>Gerar Novo Relatório</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Relatórios Recentes */}
//       <View style={[styles.section, { marginBottom: 80 }]}>
//         <Text style={styles.sectionTitle}>Relatórios Recentes</Text>

//         {recentReports.length === 0 ? (
//           <Text style={styles.emptyText}>Nenhum relatório gerado recentemente.</Text>
//         ) : (
//           recentReports.map((report) => (
//             <TouchableOpacity
//               key={report.id}
//               style={styles.reportCard}
//               onPress={() => handleViewReport(report)}
//             >
//               <View style={styles.reportHeader}>
//                 <Ionicons name="document-outline" size={22} color="#16a34a" />
//                 <Text style={styles.reportTitle}>{report.title}</Text>
//               </View>
//               <Text style={styles.reportDate}>{report.date}</Text>
//               <View style={styles.reportActions}>
//                 <TouchableOpacity onPress={() => handleDownloadReport(report)}>
//                   <Ionicons name="download-outline" size={20} color="#4b5563" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleShareReport(report)}>
//                   <Ionicons name="share-social-outline" size={20} color="#4b5563" />
//                 </TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     paddingVertical: 16,
//   },
//   title: { fontSize: 22, fontWeight: '700', color: '#111827' },
//   subtitle: { fontSize: 14, color: '#6b7280' },
//   chartContainer: {
//     backgroundColor: '#f9fafb',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 10,
//     elevation: 1,
//   },
//   chartTitle: { fontSize: 16, fontWeight: '600', color: '#16a34a', marginBottom: 8 },
//   chartStyle: { borderRadius: 12 },
//   chartNote: { fontSize: 13, color: '#6b7280', marginTop: 6 },
//   section: { marginTop: 28 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#16a34a',
//     marginBottom: 10,
//   },
//   insightsGrid: { gap: 10 },
//   insightCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 10,
//     padding: 12,
//     gap: 10,
//   },
//   insightContent: { flex: 1 },
//   insightTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
//   insightText: { fontSize: 13, color: '#4b5563', marginTop: 2 },
//   generateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#16a34a',
//     borderRadius: 10,
//     paddingVertical: 12,
//     gap: 8,
//   },
//   generateButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
//   reportCard: {
//     backgroundColor: '#f9fafb',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//   },
//   reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   reportTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
//   reportDate: { fontSize: 13, color: '#6b7280', marginVertical: 4 },
//   reportActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 14,
//     marginTop: 6,
//   },
//   emptyText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 10 },
// });

// export default InsightsView;
