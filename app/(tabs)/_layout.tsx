import { Stack } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}>
      <Stack.Screen name="index" />
      {/* Adicione outras telas aqui conforme necessário */}
      <Stack.Screen name="coleta" />
      <Stack.Screen name="lotes" />
      <Stack.Screen name="geolocalizacao" />
      <Stack.Screen name="relatorios" />
      <Stack.Screen name="graficos" />
      <Stack.Screen name="sobre" />
    </Stack>
  );
}