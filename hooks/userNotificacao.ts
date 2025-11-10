// services/notificationService.ts
import { db } from '@/app/services/firebaseConfig';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

export type NotificationType = 
  | 'coleta_pendente'      // Nova coleta aguardando aprovação (para admin)
  | 'coleta_aprovada'      // Coleta aprovada (para coletor)
  | 'coleta_rejeitada'     // Coleta rejeitada (para coletor)
  | 'novo_cadastro';       // Novo usuário aguardando aprovação (para admin)

export interface Notification {
  id: string;
  userId: string;           // ID do usuário que vai receber
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  icon: string;
  color: string;
  backgroundColor: string;
  // Dados extras para navegação
  coletaId?: string;
  loteNome?: string;
  arvoreCodigo?: string;
  quantidade?: number;
  coletorNome?: string;
}

const NOTIFICATIONS_COLLECTION = 'notificacoes';

/**
 * Cria uma notificação para o admin quando há uma nova coleta pendente
 */
export const notifyAdminNewColeta = async (
  adminId: string,
  coletaData: {
    coletaId: string;
    loteNome: string;
    arvoreCodigo: string;
    quantidade: number;
    coletorNome: string;
  }
): Promise<void> => {
  try {
    const notification = {
      userId: adminId,
      type: 'coleta_pendente' as NotificationType,
      title: 'Nova Coleta Pendente',
      message: `${coletaData.coletorNome} registrou uma coleta de ${coletaData.quantidade.toFixed(1)}kg no lote ${coletaData.loteNome}, árvore ${coletaData.arvoreCodigo}`,
      read: false,
      createdAt: serverTimestamp(),
      icon: 'leaf-outline',
      color: '#f59e0b',
      backgroundColor: '#fef3c7',
      // Dados extras
      coletaId: coletaData.coletaId,
      loteNome: coletaData.loteNome,
      arvoreCodigo: coletaData.arvoreCodigo,
      quantidade: coletaData.quantidade,
      coletorNome: coletaData.coletorNome,
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    console.log('✅ Notificação criada para admin:', adminId);
  } catch (error) {
    console.error('❌ Erro ao criar notificação para admin:', error);
    throw error;
  }
};

/**
 * Cria uma notificação para o coletor quando a coleta for aprovada
 */
export const notifyColetorApproved = async (
  coletorId: string,
  coletaData: {
    coletaId: string;
    loteNome: string;
    arvoreCodigo: string;
    quantidade: number;
  }
): Promise<void> => {
  try {
    const notification = {
      userId: coletorId,
      type: 'coleta_aprovada' as NotificationType,
      title: 'Coleta Aprovada! 🎉',
      message: `Sua coleta de ${coletaData.quantidade.toFixed(1)}kg no lote ${coletaData.loteNome}, árvore ${coletaData.arvoreCodigo} foi aprovada`,
      read: false,
      createdAt: serverTimestamp(),
      icon: 'checkmark-circle-outline',
      color: '#16a34a',
      backgroundColor: '#dcfce7',
      // Dados extras
      coletaId: coletaData.coletaId,
      loteNome: coletaData.loteNome,
      arvoreCodigo: coletaData.arvoreCodigo,
      quantidade: coletaData.quantidade,
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    console.log('✅ Notificação de aprovação criada para coletor:', coletorId);
  } catch (error) {
    console.error('❌ Erro ao criar notificação de aprovação:', error);
    throw error;
  }
};

/**
 * Cria uma notificação para o coletor quando a coleta for rejeitada
 */
export const notifyColetorRejected = async (
  coletorId: string,
  coletaData: {
    coletaId: string;
    loteNome: string;
    arvoreCodigo: string;
    quantidade: number;
  }
): Promise<void> => {
  try {
    const notification = {
      userId: coletorId,
      type: 'coleta_rejeitada' as NotificationType,
      title: 'Coleta Rejeitada',
      message: `Sua coleta de ${coletaData.quantidade.toFixed(1)}kg no lote ${coletaData.loteNome}, árvore ${coletaData.arvoreCodigo} foi rejeitada`,
      read: false,
      createdAt: serverTimestamp(),
      icon: 'close-circle-outline',
      color: '#ef4444',
      backgroundColor: '#fee2e2',
      // Dados extras
      coletaId: coletaData.coletaId,
      loteNome: coletaData.loteNome,
      arvoreCodigo: coletaData.arvoreCodigo,
      quantidade: coletaData.quantidade,
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    console.log('✅ Notificação de rejeição criada para coletor:', coletorId);
  } catch (error) {
    console.error('❌ Erro ao criar notificação de rejeição:', error);
    throw error;
  }
};

/**
 * Cria uma notificação para o admin quando há um novo cadastro pendente
 */
export const notifyAdminNewUser = async (
  adminId: string,
  userData: {
    userId: string;
    nome: string;
    email: string;
    propriedade: string;
  }
): Promise<void> => {
  try {
    const notification = {
      userId: adminId,
      type: 'novo_cadastro' as NotificationType,
      title: 'Novo Cadastro Pendente',
      message: `${userData.nome} solicitou acesso ao sistema. Propriedade: ${userData.propriedade}`,
      read: false,
      createdAt: serverTimestamp(),
      icon: 'person-add-outline',
      color: '#2563eb',
      backgroundColor: '#dbeafe',
      // Dados extras
      newUserId: userData.userId,
      newUserName: userData.nome,
      newUserEmail: userData.email,
      newUserPropriedade: userData.propriedade,
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    console.log('✅ Notificação de novo cadastro criada para admin:', adminId);
  } catch (error) {
    console.error('❌ Erro ao criar notificação de novo cadastro:', error);
    throw error;
  }
};

/**
 * Busca todas as notificações de um usuário
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.createdAt?.toDate() || new Date(),
        icon: data.icon,
        color: data.color,
        backgroundColor: data.backgroundColor,
        coletaId: data.coletaId,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
      });
    });

    return notifications;
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para notificações de um usuário
 */
export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.createdAt?.toDate() || new Date(),
        icon: data.icon,
        color: data.color,
        backgroundColor: data.backgroundColor,
        coletaId: data.coletaId,
        loteNome: data.loteNome,
        arvoreCodigo: data.arvoreCodigo,
        quantidade: data.quantidade,
        coletorNome: data.coletorNome,
      });
    });

    callback(notifications);
  });

  return unsubscribe;
};

/**
 * Marca uma notificação como lida
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    console.log('✅ Notificação marcada como lida:', notificationId);
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    throw error;
  }
};

/**
 * Marca todas as notificações de um usuário como lidas
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((document) =>
      updateDoc(doc(db, NOTIFICATIONS_COLLECTION, document.id), { read: true })
    );

    await Promise.all(updatePromises);
    console.log(`✅ ${updatePromises.length} notificações marcadas como lidas`);
  } catch (error) {
    console.error('❌ Erro ao marcar todas notificações como lidas:', error);
    throw error;
  }
};

/**
 * Deleta uma notificação
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    console.log('✅ Notificação deletada:', notificationId);
  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    throw error;
  }
};

/**
 * Conta notificações não lidas de um usuário
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('❌ Erro ao contar notificações não lidas:', error);
    return 0;
  }
};

/**
 * Busca todos os admins do sistema
 */
export const getAllAdminIds = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'usuarios'),
      where('tipo', '==', 'admin')
    );

    const querySnapshot = await getDocs(q);
    const adminIds: string[] = [];

    querySnapshot.forEach((doc) => {
      adminIds.push(doc.id);
    });

    console.log(`📋 ${adminIds.length} admins encontrados`);
    return adminIds;
  } catch (error) {
    console.error('❌ Erro ao buscar admins:', error);
    return [];
  }
};