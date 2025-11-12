import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Ativar animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AjudaScreen = () => {
  const navigation = useNavigation();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    { question: 'Como cadastrar um novo lote?', answer: 'Vá até "Lotes" → "Clique em Novo Lote" e preencha os dados do lote.' },
    { question: 'Como gerar relatórios?', answer: 'Vá até "Relatórios", escolha o período e clique em "Gerar Relatório".' },
    { question: 'Como alterar meus dados?', answer: 'Vá em "Perfil" → "Clique no ícone de Editar Perfil" e atualize as informações.' },
    { question: 'Esqueci minha senha, o que fazer?', answer: 'Vá em "Perfil" → "Clique em Segurança" → "Clique em Alterar Senha" e atualize as informações.' },
  ];

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor='#16a34a' barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda & Suporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity key={index} style={styles.faqItem} onPress={() => toggleExpand(index)}>
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color='#1f2937'
                />
              </View>
              {expandedIndex === index && <Text style={styles.answer}>{faq.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:cumatrack@gmail.com')}>
            <Ionicons name="mail-outline" size={20} color='#1f2937' />
            <Text style={styles.contactText}>cumatrack@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+5593992099606')}>
            <Ionicons name="call-outline" size={20} color='#1f2937' />
            <Text style={styles.contactText}>+55 (93) 99209-9606</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AjudaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingLeft: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',

  },
  scrollContent: {
    padding: 20
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111'
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  question: {
    fontSize: 16,
    color: '#111'
  },
  answer: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8
  },
  contactText: {
    fontSize: 16,
    color: '#1f2937'
  },
});
