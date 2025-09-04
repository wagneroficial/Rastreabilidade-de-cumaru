import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a', // Verde do CumaruApp
        tabBarInactiveTintColor: '#9ca3af', // Cinza claro
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
            backgroundColor: 'white',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
          },
        }),
      }}>
      
      {/* Tela Principal/Home */}
      <Tabs.Screen
        name="home"  // Mudado de "index" para "home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      
      {/* Lotes */}
      <Tabs.Screen
        name="lotes"
        options={{
          title: 'Lotes',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={20} color={color} />,
        }}
      />
      
      {/* Coleta - Ação principal */}
      <Tabs.Screen
        name="coleta"
        options={{
          title: 'Coleta',
          tabBarIcon: ({ color }) => <Ionicons name="qr-code-outline" size={20} color={color} />,
        }}
      />
      
      {/* Gráficos */}
      <Tabs.Screen
        name="graficos"
        options={{
          title: 'Gráficos',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={20} color={color} />,
        }}
      />
      
      {/* Perfil */}
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