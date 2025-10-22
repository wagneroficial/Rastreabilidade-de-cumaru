import { BiometricProvider } from '@/contexts/BiometricContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <BiometricProvider>
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
          name="elatorios"
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
          name="seguranca"
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
        <Stack.Screen
          name="arvore/[id]"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="esquecisenha"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="relatorio"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="@components/novo_lote"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
      </Stack>
    </BiometricProvider>
  );
}