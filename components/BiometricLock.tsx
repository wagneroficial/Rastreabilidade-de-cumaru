import { useBiometric } from '@/contexts/BiometricContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const BiometricLock: React.FC = () => {
  const { authenticate } = useBiometric();
  const [isAuthenticating, setIsAuthenticating] = React.useState(true);

  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    const success = await authenticate();
    
    // Se falhar, tenta novamente após 2 segundos
    if (!success) {
      setTimeout(() => {
        handleAuthenticate();
      }, 2000);
    } else {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={80} color="#16a34a" />
        </View>
        
        <Text style={styles.title}>Autenticação Biométrica</Text>
        <Text style={styles.subtitle}>
          Autentique-se para continuar usando o aplicativo
        </Text>

        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
        
        <Text style={styles.instructionText}>
          Aguardando autenticação...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default BiometricLock;