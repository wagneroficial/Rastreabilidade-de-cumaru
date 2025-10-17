// components/home/HomeHeader.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { auth, db } from '@/app/services/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface HomeHeaderProps {
  isAdmin: boolean;
  onNotificationsPress: () => void;
}

interface UserData {
  nome: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ isAdmin, onNotificationsPress }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('📄 Dados do usuário carregados:', data);
            setUserData({
              // Tenta pegar várias opções de campo de nome
              nome: data.nomeCompleto || data.displayName || data.nome || 'Usuário',
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayName = userData?.nome || 'Produtor';

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Olá, {displayName}</Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin
              ? 'Como vai sua colheita hoje?'
              : 'Como vai sua colheita hoje?'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bbf7d0',
    marginTop: 2,
  },
  notificationButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
