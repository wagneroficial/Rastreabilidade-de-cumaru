import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface BiometricContextData {
  biometriaAtivada: boolean;
  setBiometriaAtivada: (value: boolean) => void;
  isAuthenticated: boolean;
  authenticate: () => Promise<boolean>;
  lockApp: () => void; // MUDOU: de 'logout' para 'lockApp'
}

const BiometricContext = createContext<BiometricContextData>({} as BiometricContextData);

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [biometriaAtivada, setBiometriaAtivadaState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Inicia autenticado

  useEffect(() => {
    loadBiometriaConfig();
  }, []);

  const loadBiometriaConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem('biometria');
      if (saved) {
        setBiometriaAtivadaState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de biometria:', error);
    }
  };

  const setBiometriaAtivada = async (value: boolean) => {
    try {
      setBiometriaAtivadaState(value);
      await AsyncStorage.setItem('biometria', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar configuração de biometria:', error);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.log('Dispositivo não suporta biometria');
        setIsAuthenticated(true);
        return true;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('Nenhuma biometria cadastrada');
        setIsAuthenticated(true);
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para continuar',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      setIsAuthenticated(true);
      return true;
    }
  };

  // MUDOU: agora é 'lockApp' em vez de 'logout'
  // Apenas bloqueia o app, NÃO faz logout do Firebase
  const lockApp = () => {
    console.log('🔒 Bloqueando app (sem fazer logout do Firebase)');
    setIsAuthenticated(false);
  };

  return (
    <BiometricContext.Provider
      value={{
        biometriaAtivada,
        setBiometriaAtivada,
        isAuthenticated,
        authenticate,
        lockApp, // MUDOU: exporta 'lockApp'
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within BiometricProvider');
  }
  return context;
};