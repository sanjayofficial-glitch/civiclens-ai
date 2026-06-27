import { collection, doc, query, where, orderBy, onSnapshot, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import { Notification } from '@blockseblock/shared';
import { notificationConverter } from './converters';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const NotificationService = {
  listenToUserNotifications: (userId: string, callback: (notifications: (Notification & { id: string })[]) => void) => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION).withConverter(notificationConverter),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => doc.data()));
    });
  },

  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    return updateDoc(docRef, { read: true });
  },

  markAllAsRead: async (userId: string) => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map(doc => updateDoc(doc.ref, { read: true }));
    return Promise.all(promises);
  }
};
