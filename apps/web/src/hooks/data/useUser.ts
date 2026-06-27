import { useState, useEffect } from 'react';
import { useAuth } from '../useAuth';
import { UserService } from '../../services/user.service';
import type { User as DomainUser } from '@blockseblock/shared';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firestore.service';
import { userConverter } from '../../services/converters';

export const useUser = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<DomainUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'users', authUser.uid).withConverter(userConverter),
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data());
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authUser, authLoading]);

  return { user: userProfile, loading: loading || authLoading };
};
