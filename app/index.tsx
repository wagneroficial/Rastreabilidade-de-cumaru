import { auth, db } from '@/app/services/firebaseConfig.js';
import Login from '@/components/Login';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'Logado' : 'Não logado');
      
      if (user) {
        // Usuário está logado - AGORA vamos verificar o status
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const status = userData.status || 'pendente';
            
            console.log('Status do usuário:', status); // DEBUG
            
            if (status === 'aprovado') {
              // Status aprovado - pode acessar
              setIsAuthenticated(true);
              setTimeout(() => {
                router.replace('/(tabs)/home');
              }, 100);
            } else if (status === 'pendente') {
              // Status pendente - desloga silenciosamente
              await auth.signOut();
              setIsAuthenticated(false);
              setIsChecking(false);
            } else if (status === 'recusado') {
              // Status recusado - mostra alerta e desloga
              Alert.alert(
                'Acesso Negado',
                'Sua solicitação de acesso foi recusada. Entre em contato com o administrador.',
                [
                  { 
                    text: 'OK', 
                    onPress: async () => {
                      await auth.signOut();
                      setIsAuthenticated(false);
                      setIsChecking(false);
                    }
                  }
                ]
              );
            }
          } else {
            // Documento do usuário não existe
            console.error('Documento do usuário não encontrado');
            await auth.signOut();
            setIsAuthenticated(false);
            setIsChecking(false);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          Alert.alert('Erro', 'Não foi possível verificar o status da sua conta.');
          await auth.signOut();
          setIsAuthenticated(false);
          setIsChecking(false);
        }
      } else {
        // Usuário não está logado, mostra tela de login
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Enquanto verifica autenticação, mostra splash
  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={64} color="#16a34a" />
          </View>
          <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  // Se não está autenticado, mostra o componente de Login
  return <Login />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});