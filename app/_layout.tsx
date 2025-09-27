// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela inicial do app - será exibida primeiro */}
      <Stack.Screen 
        name="index"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      
      {/* Tabs - será navegado após o index inicial */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
      
      {/* Outras telas */}
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
      <Stack.Screen 
        name="cadastro"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
    </Stack>
  );
}