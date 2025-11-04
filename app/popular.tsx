import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '@/app/services/firebaseConfig.js';


const SeedDatabaseScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const generateRandomDate = (startDate: Date, endDate: Date): Date => {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
  };

  // Coordenadas base de Oriximiná-PA
  const ORIXIMINA_BASE = {
    lat: -1.7650,
    lng: -55.8650,
  };

  // Gera coordenadas aleatórias dentro do município de Oriximiná
  const gerarCoordenadaOriximina = (offset: number = 0.05) => {
    return {
      latitude: (ORIXIMINA_BASE.lat + (Math.random() - 0.5) * offset).toFixed(6),
      longitude: (ORIXIMINA_BASE.lng + (Math.random() - 0.5) * offset).toFixed(6),
    };
  };

  const limparBanco = async () => {
    Alert.alert(
      '⚠️ Confirmar Limpeza',
      'Isso irá deletar:\n\n• Todas as coletas\n• Todas as árvores\n• Todos os lotes\n• Todos os usuários (exceto você)\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Banco',
          style: 'destructive',
          onPress: () => executarLimpeza(),
        },
      ]
    );
  };

  const executarLimpeza = async () => {
    setLoading(true);
    setProgress('Limpando banco de dados...');

    try {
      const currentUser = auth.currentUser;
      let adminId = '';

      if (currentUser) {
        adminId = currentUser.uid;
        setProgress('Identificando usuário admin...');
      }

      // 1. Deletar COLETAS
      setProgress('Deletando coletas...');
      const coletasSnapshot = await getDocs(collection(db, 'coletas'));
      let deletedColetas = 0;
      for (const docSnapshot of coletasSnapshot.docs) {
        await deleteDoc(doc(db, 'coletas', docSnapshot.id));
        deletedColetas++;
      }
      console.log(`✅ ${deletedColetas} coletas deletadas`);

      // 2. Deletar ÁRVORES
      setProgress('Deletando árvores...');
      const arvoresSnapshot = await getDocs(collection(db, 'arvores'));
      let deletedArvores = 0;
      for (const docSnapshot of arvoresSnapshot.docs) {
        await deleteDoc(doc(db, 'arvores', docSnapshot.id));
        deletedArvores++;
      }
      console.log(`✅ ${deletedArvores} árvores deletadas`);

      // 3. Deletar LOTES
      setProgress('Deletando lotes...');
      const lotesSnapshot = await getDocs(collection(db, 'lotes'));
      let deletedLotes = 0;
      for (const docSnapshot of lotesSnapshot.docs) {
        await deleteDoc(doc(db, 'lotes', docSnapshot.id));
        deletedLotes++;
      }
      console.log(`✅ ${deletedLotes} lotes deletados`);

      // 4. Deletar USUÁRIOS (exceto o admin atual)
      setProgress('Deletando usuários (preservando você)...');
      const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
      let deletedUsuarios = 0;
      let preservedCount = 0;
      for (const docSnapshot of usuariosSnapshot.docs) {
        if (docSnapshot.id === adminId) {
          preservedCount++;
          console.log(`✅ Admin preservado: ${docSnapshot.data().nome}`);
          continue;
        }
        await deleteDoc(doc(db, 'usuarios', docSnapshot.id));
        deletedUsuarios++;
      }
      console.log(`✅ ${deletedUsuarios} usuários deletados`);
      console.log(`✅ ${preservedCount} usuário(s) preservado(s)`);

      setProgress('Limpeza concluída!');
      Alert.alert(
        '✅ Banco Limpo!',
        `Dados removidos com sucesso:\n\n` +
          `• ${deletedColetas} coletas\n` +
          `• ${deletedArvores} árvores\n` +
          `• ${deletedLotes} lotes\n` +
          `• ${deletedUsuarios} usuários\n` +
          `• ${preservedCount} admin(s) preservado(s)\n\n` +
          `Você pode agora popular o banco novamente.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao limpar banco:', error);
      Alert.alert('Erro', 'Falha ao limpar banco de dados');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const popularBanco = async () => {
    setLoading(true);
    try {
      // ==================== USUÁRIOS ====================
      setProgress('Criando usuários...');

      const usuarios = [
        // PROPRIEDADE 1 - Fazenda São José
        {
          nome: 'João Silva',
          email: 'joao.silva@fazenda.com',
          telefone: '(93) 99999-0001',
          propriedade: 'Fazenda São José',
          tipo: 'admin',
          status: 'aprovado',
          criadoEm: Timestamp.fromDate(new Date('2024-01-15')),
        },
        {
          nome: 'Maria Santos',
          email: 'maria.santos@fazenda.com',
          telefone: '(93) 99999-0002',
          propriedade: 'Fazenda São José',
          tipo: 'colaborador',
          status: 'aprovado',
          criadoEm: Timestamp.fromDate(new Date('2024-02-01')),
        },
        {
          nome: 'Pedro Costa',
          email: 'pedro.costa@fazenda.com',
          telefone: '(93) 99999-0003',
          propriedade: 'Fazenda São José',
          tipo: 'colaborador',
          status: 'aprovado',
          criadoEm: Timestamp.fromDate(new Date('2024-02-15')),
        },
        {
          nome: 'Ana Oliveira',
          email: 'ana.oliveira@fazenda.com',
          telefone: '(93) 99999-0004',
          propriedade: 'Fazenda São José',
          tipo: 'colaborador',
          status: 'pendente',
          criadoEm: Timestamp.fromDate(new Date('2024-10-01')),
        },

        // PROPRIEDADE 2 - Sítio Boa Vista
        {
          nome: 'Carlos Mendes',
          email: 'carlos.mendes@sitio.com',
          telefone: '(93) 99999-0005',
          propriedade: 'Sítio Boa Vista',
          tipo: 'admin',
          status: 'aprovado',
          criadoEm: Timestamp.fromDate(new Date('2024-01-20')),
        },
        {
          nome: 'Juliana Lima',
          email: 'juliana.lima@sitio.com',
          telefone: '(93) 99999-0006',
          propriedade: 'Sítio Boa Vista',
          tipo: 'colaborador',
          status: 'aprovado',
          criadoEm: Timestamp.fromDate(new Date('2024-03-01')),
        },
        {
          nome: 'Roberto Alves',
          email: 'roberto.alves@sitio.com',
          telefone: '(93) 99999-0007',
          propriedade: 'Sítio Boa Vista',
          tipo: 'colaborador',
          status: 'rejeitado',
          criadoEm: Timestamp.fromDate(new Date('2024-09-15')),
        },
      ];

      const usuariosIds: { [key: string]: string } = {};
      for (const usuario of usuarios) {
        const docRef = await addDoc(collection(db, 'usuarios'), usuario);
        usuariosIds[usuario.nome] = docRef.id;
      }
      console.log('✅ Usuários criados:', Object.keys(usuariosIds).length);

      // ==================== LOTES ====================
      setProgress('Criando lotes...');

      const coordLote1 = gerarCoordenadaOriximina(0.03);
      const coordLote2 = gerarCoordenadaOriximina(0.03);
      const coordLote3 = gerarCoordenadaOriximina(0.03);
      const coordLote4 = gerarCoordenadaOriximina(0.03);
      const coordLote5 = gerarCoordenadaOriximina(0.03);

      const lotes = [
        // PROPRIEDADE 1 - Fazenda São José
        {
          codigo: 'L-001',
          nome: 'Lote Norte',
          area: '5.2 hectares',
          arvores: 45,
          status: 'ativo',
          dataInicio: '2024-01-10',
          dataFim: '2024-12-31',
          latitude: coordLote1.latitude,
          longitude: coordLote1.longitude,
          observacoes: 'Lote com melhor produtividade',
          responsavel: 'João Silva',
          colaboradoresResponsaveis: [
            usuariosIds['João Silva'],
            usuariosIds['Maria Santos'],
            usuariosIds['Pedro Costa'],
          ],
          createdAt: Timestamp.fromDate(new Date('2024-01-10')),
        },
        {
          codigo: 'L-002',
          nome: 'Lote Sul',
          area: '3.8 hectares',
          arvores: 32,
          status: 'ativo',
          dataInicio: '2024-02-01',
          dataFim: '2024-12-31',
          latitude: coordLote2.latitude,
          longitude: coordLote2.longitude,
          observacoes: 'Lote em desenvolvimento',
          responsavel: 'Maria Santos',
          colaboradoresResponsaveis: [usuariosIds['Maria Santos'], usuariosIds['Pedro Costa']],
          createdAt: Timestamp.fromDate(new Date('2024-02-01')),
        },
        {
          codigo: 'L-003',
          nome: 'Lote Leste',
          area: '4.5 hectares',
          arvores: 38,
          status: 'planejado',
          dataInicio: '2024-11-01',
          dataFim: '2025-12-31',
          latitude: coordLote3.latitude,
          longitude: coordLote3.longitude,
          observacoes: 'Novo lote para próxima safra',
          responsavel: 'João Silva',
          colaboradoresResponsaveis: [usuariosIds['João Silva']],
          createdAt: Timestamp.fromDate(new Date('2024-10-01')),
        },

        // PROPRIEDADE 2 - Sítio Boa Vista
        {
          codigo: 'L-004',
          nome: 'Lote Principal',
          area: '6.0 hectares',
          arvores: 52,
          status: 'ativo',
          dataInicio: '2024-01-15',
          dataFim: '2024-12-31',
          latitude: coordLote4.latitude,
          longitude: coordLote4.longitude,
          observacoes: 'Maior lote do sítio',
          responsavel: 'Carlos Mendes',
          colaboradoresResponsaveis: [usuariosIds['Carlos Mendes'], usuariosIds['Juliana Lima']],
          createdAt: Timestamp.fromDate(new Date('2024-01-15')),
        },
        {
          codigo: 'L-005',
          nome: 'Lote Experimental',
          area: '2.5 hectares',
          arvores: 20,
          status: 'ativo',
          dataInicio: '2024-03-01',
          dataFim: '2024-12-31',
          latitude: coordLote5.latitude,
          longitude: coordLote5.longitude,
          observacoes: 'Área para testes de novas técnicas',
          responsavel: 'Juliana Lima',
          colaboradoresResponsaveis: [usuariosIds['Juliana Lima']],
          createdAt: Timestamp.fromDate(new Date('2024-03-01')),
        },
      ];

      const lotesIds: { [key: string]: string } = {};
      for (const lote of lotes) {
        const docRef = await addDoc(collection(db, 'lotes'), lote);
        lotesIds[lote.codigo] = docRef.id;
      }
      console.log('✅ Lotes criados:', lotesIds);

      // ==================== ÁRVORES ====================
      setProgress('Criando árvores...');

      const estadosSaude = ['Excelente', 'Saudável', 'Bom', 'Ruim', 'Doente'];
      const arvoresData: any[] = [];

      let arvoreCounter = 1;
      for (const lote of lotes) {
        const loteId = lotesIds[lote.codigo];
        const numArvores = lote.arvores;

        for (let i = 0; i < numArvores; i++) {
          const estadoSaude = estadosSaude[Math.floor(Math.random() * estadosSaude.length)];
          const baseDate = new Date('2023-01-01');
          const randomMonths = Math.floor(Math.random() * 18);
          const dataPlantio = new Date(baseDate);
          dataPlantio.setMonth(baseDate.getMonth() + randomMonths);

          // Gerar coordenadas próximas ao lote
          const arvoreCoord = {
            latitude: (parseFloat(lote.latitude) + (Math.random() - 0.5) * 0.005).toFixed(6),
            longitude: (parseFloat(lote.longitude) + (Math.random() - 0.5) * 0.005).toFixed(6),
          };

          arvoresData.push({
            codigo: `ARV-${String(arvoreCounter).padStart(3, '0')}`,
            loteId,
            especie: 'Cumaru',
            estadoSaude,
            dataPlantio: dataPlantio.toISOString().split('T')[0],
            latitude: arvoreCoord.latitude,
            longitude: arvoreCoord.longitude,
            notasAdicionais: estadoSaude === 'Doente' ? 'Requer atenção especial' : '',
            createdAt: Timestamp.fromDate(dataPlantio),
          });
          arvoreCounter++;
        }
      }

      const arvoresIds: string[] = [];
      for (const arvore of arvoresData) {
        const docRef = await addDoc(collection(db, 'arvores'), arvore);
        arvoresIds.push(docRef.id);
      }
      console.log('✅ Árvores criadas:', arvoresIds.length);

      // ==================== COLETAS ====================
      setProgress('Criando coletas (isso pode demorar um pouco)...');

      const hoje = new Date();
      const dozesMesesAtras = new Date();
      dozesMesesAtras.setMonth(hoje.getMonth() - 12);

      const coletasData: any[] = [];
      const lotesAtivos = lotes.filter((l) => l.status === 'ativo');

      // Padrões sazonais mais realistas
      const mesesProducao = [
        { mes: 0, peso: 0.3 }, // Jan
        { mes: 1, peso: 0.5 }, // Fev
        { mes: 2, peso: 0.8 }, // Mar
        { mes: 3, peso: 1.0 }, // Abr - Pico
        { mes: 4, peso: 1.0 }, // Mai - Pico
        { mes: 5, peso: 0.9 }, // Jun
        { mes: 6, peso: 0.7 }, // Jul
        { mes: 7, peso: 0.5 }, // Ago
        { mes: 8, peso: 0.4 }, // Set
        { mes: 9, peso: 0.3 }, // Out
        { mes: 10, peso: 0.5 }, // Nov
        { mes: 11, peso: 0.6 }, // Dez
      ];

      for (const lote of lotesAtivos) {
        const loteId = lotesIds[lote.codigo];
        const arvoresDoLote = arvoresData.filter((a) => a.loteId === loteId);
        const colaboradores = lote.colaboradoresResponsaveis;
        
        // Mais coletas ao longo do ano
        const numColetasPorMes = Math.floor(Math.random() * 5) + 8; // 8-12 coletas por mês

        // Gerar coletas para cada mês
        for (let mesOffset = 0; mesOffset < 12; mesOffset++) {
          const mesAtual = new Date(dozesMesesAtras);
          mesAtual.setMonth(mesAtual.getMonth() + mesOffset);
          
          const pesoMes = mesesProducao[mesAtual.getMonth()].peso;
          const coletasNoMes = Math.floor(numColetasPorMes * pesoMes);

          for (let i = 0; i < coletasNoMes; i++) {
            const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
            const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
            const dataColeta = generateRandomDate(inicioMes, fimMes);

            // Não gerar coletas futuras
            if (dataColeta > hoje) continue;

            const arvoreAleatoria = arvoresDoLote[Math.floor(Math.random() * arvoresDoLote.length)];
            const arvoreIndex = arvoresData.findIndex((a) => a.codigo === arvoreAleatoria.codigo);
            const arvoreId = arvoresIds[arvoreIndex];
            const coletorId = colaboradores[Math.floor(Math.random() * colaboradores.length)];
            const coletorNome =
              usuarios.find((u) => usuariosIds[u.nome] === coletorId)?.nome || 'Desconhecido';
            
            // Quantidade mais realista baseada na saúde da árvore
            let quantidadeBase = 10;
            if (arvoreAleatoria.estadoSaude === 'Excelente') quantidadeBase = 18;
            else if (arvoreAleatoria.estadoSaude === 'Saudável') quantidadeBase = 15;
            else if (arvoreAleatoria.estadoSaude === 'Bom') quantidadeBase = 12;
            else if (arvoreAleatoria.estadoSaude === 'Ruim') quantidadeBase = 7;
            else if (arvoreAleatoria.estadoSaude === 'Doente') quantidadeBase = 3;

            const quantidade = parseFloat((quantidadeBase + (Math.random() - 0.5) * 5).toFixed(1));

            const rand = Math.random();
            let status: string;
            let aprovadoPor: string | undefined;
            let aprovadoEm: Timestamp | undefined;
            let rejeitadoPor: string | undefined;
            let rejeitadoEm: Timestamp | undefined;

            if (rand < 0.75) {
              // 75% aprovadas
              status = 'aprovada';
              const adminId = lote.codigo.startsWith('L-00')
                ? usuariosIds['João Silva']
                : usuariosIds['Carlos Mendes'];
              aprovadoPor = adminId;
              const dataAprovacao = new Date(dataColeta);
              dataAprovacao.setHours(dataAprovacao.getHours() + Math.random() * 72); // Até 3 dias
              aprovadoEm = Timestamp.fromDate(dataAprovacao);
            } else if (rand < 0.92) {
              // 17% pendentes
              status = 'pendente';
            } else {
              // 8% rejeitadas
              status = 'rejeitada';
              const adminId = lote.codigo.startsWith('L-00')
                ? usuariosIds['João Silva']
                : usuariosIds['Carlos Mendes'];
              rejeitadoPor = adminId;
              const dataRejeicao = new Date(dataColeta);
              dataRejeicao.setHours(dataRejeicao.getHours() + Math.random() * 72);
              rejeitadoEm = Timestamp.fromDate(dataRejeicao);
            }

            const observacoes = status === 'rejeitada' 
              ? ['Quantidade divergente', 'Qualidade inferior', 'Data incorreta'][Math.floor(Math.random() * 3)]
              : arvoreAleatoria.estadoSaude === 'Excelente'
              ? 'Excelente produtividade'
              : '';

            coletasData.push({
              loteId,
              arvoreId,
              coletorId,
              coletorNome,
              quantidade: Math.max(0.5, quantidade), // Mínimo 0.5kg
              observacoes,
              status,
              dataColeta: Timestamp.fromDate(dataColeta),
              createdAt: Timestamp.fromDate(dataColeta),
              ...(aprovadoPor && { aprovadoPor }),
              ...(aprovadoEm && { aprovadoEm }),
              ...(rejeitadoPor && { rejeitadoPor }),
              ...(rejeitadoEm && { rejeitadoEm }),
            });
          }
        }
      }

      // Salvar coletas
      let coletasCount = 0;
      for (const coleta of coletasData) {
        await addDoc(collection(db, 'coletas'), coleta);
        coletasCount++;
        if (coletasCount % 50 === 0) {
          setProgress(`Criando coletas... ${coletasCount}/${coletasData.length}`);
        }
      }
      console.log('✅ Coletas criadas:', coletasCount);

      setProgress('Concluído!');
      Alert.alert(
        'Sucesso! 🎉',
        `Banco populado com sucesso!\n\n` +
          `✅ ${usuarios.length} usuários\n` +
          `✅ ${lotes.length} lotes\n` +
          `✅ ${arvoresData.length} árvores\n` +
          `✅ ${coletasData.length} coletas (12 meses)\n\n` +
          `📍 Localização: Oriximiná-PA\n\n` +
          `Propriedades:\n` +
          `• Fazenda São José (3 lotes)\n` +
          `• Sítio Boa Vista (2 lotes)\n\n` +
          `Padrão de coletas realista:\n` +
          `• Pico: Abril e Maio\n` +
          `• Baixa: Janeiro e Outubro\n\n` +
          `Agora vá em "Lotes" e abra:\n` +
          `• L-001 - Lote Norte\n` +
          `Depois vá na aba "Histórico"`,
        [{ text: 'Ver Lotes', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao popular banco:', error);
      Alert.alert('Erro', 'Falha ao popular o banco de dados');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular Banco de Dados</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={48} color="#f59e0b" />
          <Text style={styles.warningTitle}>⚠️ ATENÇÃO - Tela Temporária</Text>
          <Text style={styles.warningText}>
            Esta tela irá criar dados fictícios no banco de dados para testes.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>O que será criado:</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• 7 usuários (2 propriedades)</Text>
            <Text style={styles.infoItem}>• 5 lotes (4 ativos, 1 planejado)</Text>
            <Text style={styles.infoItem}>• ~187 árvores distribuídas nos lotes</Text>
            <Text style={styles.infoItem}>• ~400-500 coletas (últimos 12 meses)</Text>
            <Text style={styles.infoItem}>• Padrão sazonal: Pico em Abr/Mai, baixa em Jan/Out</Text>
            <Text style={styles.infoItem}>• Status: 75% aprovadas, 17% pendentes, 8% rejeitadas</Text>
            <Text style={styles.infoItem}>• 📍 Coordenadas: Oriximiná-PA</Text>
          </View>
        </View>

        <View style={styles.propertiesCard}>
          <Text style={styles.propertiesTitle}>🏞️ Propriedades em Oriximiná-PA:</Text>
          <View style={styles.propertyItem}>
            <Text style={styles.propertyName}>Fazenda São José</Text>
            <Text style={styles.propertyDetails}>Admin: João Silva | 3 Colaboradores</Text>
            <Text style={styles.propertyDetails}>3 Lotes | ~115 Árvores</Text>
          </View>
          <View style={styles.propertyItem}>
            <Text style={styles.propertyName}>Sítio Boa Vista</Text>
            <Text style={styles.propertyDetails}>Admin: Carlos Mendes | 1 Colaborador</Text>
            <Text style={styles.propertyDetails}>2 Lotes | ~72 Árvores</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>{progress}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.dangerButton} onPress={limparBanco}>
              <Ionicons name="trash-bin" size={24} color="white" />
              <Text style={styles.dangerButtonText}>Limpar Banco de Dados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={popularBanco}>
              <Ionicons name="cloud-upload" size={24} color="white" />
              <Text style={styles.buttonText}>Popular Banco de Dados</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#6b7280" />
          <Text style={styles.noteText}>
            {/* Nota: Após popular, vá em "Lotes" → "L-001 - Lote Norte" → aba "Histórico" para ver
            dados dos últimos 12 meses */}
          </Text>
        </View>
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
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
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
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#78350f',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  propertiesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  propertiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  propertyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 4,
  },
  propertyDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SeedDatabaseScreen;