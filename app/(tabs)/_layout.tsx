import { auth, db } from '@/app/services/firebaseConfig';
import AddModal from '@/components/AddModal';
import BiometricLock from '@/components/BiometricLock';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useBiometric } from '@/contexts/BiometricContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, TouchableOpacity } from 'react-native';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export default function TabLayout() {
  const { biometriaAtivada, isAuthenticated, lockApp } = useBiometric();
  const appState = useRef(AppState.currentState);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verifica se o usuário é admin
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'usuarios', auth.currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsAdmin(userData.tipo === 'admin');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (biometriaAtivada) {
          console.log('🔒 App foi para background - bloqueando (SEM logout do Firebase)');
          lockApp();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [biometriaAtivada, lockApp]);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

      if (biometriaAtivada && isAuthenticated) {
        console.log('⏱️ Timer de inatividade iniciado - 5 minutos');
        inactivityTimer.current = setTimeout(() => {
          console.log('⏰ Timeout atingido - bloqueando por inatividade');
          lockApp();
        }, INACTIVITY_TIMEOUT);
      }
    };

    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [biometriaAtivada, isAuthenticated, lockApp]);

  if (biometriaAtivada && !isAuthenticated) {
    return <BiometricLock />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: '#797d85',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute' },
            default: { backgroundColor: 'white', borderTopColor: '#e5e7eb', borderTopWidth: 1 },
          }),
        }}
      >
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
            tabBarIcon: ({ color }) => <Ionicons name="logo-buffer" size={20} color={color} />,
          }}
        />

        <Tabs.Screen
          name="coleta"
          options={{
            title: 'Adicionar',
            tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={20} color={color} />,
            tabBarButton: (props: any) => (
              <TouchableOpacity
                {...props}
                activeOpacity={0.7}
                onPress={() => setShowAddModal(true)}
              >
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="gerenciamento"
          options={{
            title: 'Gerenciar',
            tabBarIcon: ({ color }) => <Ionicons name="person-add" size={20} color={color} />,
            href: isAdmin ? undefined : null, // ← ESCONDE A ABA SE NÃO FOR ADMIN
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
          }}
        />
      </Tabs>

      {/* Modal de Adicionar */}
      <AddModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}