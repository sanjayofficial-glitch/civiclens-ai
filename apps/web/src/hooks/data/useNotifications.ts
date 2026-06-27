import { useState, useEffect } from 'react';
import { NotificationService } from '../../services/notification.service';
import { useAuth } from '../useAuth';
import type { Notification } from '@blockseblock/shared';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<(Notification & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = NotificationService.listenToUserNotifications(user.uid, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, loading };
};
