// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="notificacoes" 
        options={{ 
          headerShown: false,
          presentation: 'card' 
        }} 
      />
      <Stack.Screen 
        name="relatorios" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="geolocalizacao" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="quem-somos" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="configuracoes" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="alterar-senha"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
       <Stack.Screen 
        name="lotes/detalhe"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
    </Stack>
    
  );
}