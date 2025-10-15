import { auth } from '@/app/services/firebaseConfig';
import Login from '@/components/Login';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'Logado' : 'Não logado'); // DEBUG
      
      if (user) {
        // Usuário está logado, redireciona para home
        setIsAuthenticated(true);
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 100);
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