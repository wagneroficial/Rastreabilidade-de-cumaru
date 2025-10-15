import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import BiometricLock from '@/components/BiometricLock';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useBiometric } from '@/contexts/BiometricContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const INACTIVITY_TIMEOUT = 30 * 1000; // 30 segundos para teste (use 5 * 60 * 1000 em produção)

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { biometriaAtivada, isAuthenticated, logout } = useBiometric();
  const appState = useRef(AppState.currentState);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // App foi para o background
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        if (biometriaAtivada) {
          console.log('App foi para background - logout');
          logout(); // Desloga quando o app vai para o background
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [biometriaAtivada]);

  // Timer de inatividade
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      if (biometriaAtivada && isAuthenticated) {
        console.log('Timer de inatividade iniciado - 30 segundos');
        inactivityTimer.current = setTimeout(() => {
          console.log('Timeout atingido - logout por inatividade');
          logout(); // Desloga após período de inatividade
        }, INACTIVITY_TIMEOUT);
      }
    };

    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [biometriaAtivada, isAuthenticated]);

  // Se a biometria está ativada e não está autenticado, mostra a tela de bloqueio
  if (biometriaAtivada && !isAuthenticated) {
    return <BiometricLock />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: 'white',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
          },
        }),
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="lotes"
        options={{
          title: 'Lotes',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={20} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="coleta"
        options={{
          title: 'Coleta',
          tabBarIcon: ({ color }) => <Ionicons name="qr-code-outline" size={20} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatorios',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={20} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}