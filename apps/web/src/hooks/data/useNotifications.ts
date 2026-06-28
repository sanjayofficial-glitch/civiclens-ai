import type { Notification } from '@blockseblock/shared';

import { useState, useEffect, useCallback } from 'react';

import { NotificationService } from '../../services/notification.service';
import { useAuth } from '../useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<
    (Notification & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const unsub = NotificationService.listenToUserNotifications(
      user.uid,
      (fetchedNotifications) => {
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [user, retryKey]);

  const refresh = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, error, refresh };
};
