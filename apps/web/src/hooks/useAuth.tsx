import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase/auth';
import type { UserRole } from '@blockseblock/shared';
import { UserService } from '@/services/user.service';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const existingProfile = await UserService.getProfile(currentUser.uid);
          if (!existingProfile) {
            const profile = {
              displayName: currentUser.displayName ?? 'Anonymous Citizen',
              email: currentUser.email ?? '',
              photoURL: currentUser.photoURL ?? null,
              phoneNumber: currentUser.phoneNumber ?? null,
              role: 'citizen' as UserRole,
              reputation: 0,
              issuesReported: 0,
              issuesVerified: 0,
              badges: [],
              streakDays: 0,
              fcmTokens: [],
            };
            await UserService.ensureProfile(currentUser.uid, profile);
            setRole('citizen');
          } else {
            setRole(existingProfile.role || 'citizen');
          }
        } catch {
          setRole('citizen');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
