import { createContext, useContext, useEffect, useState } from 'react';
import { me, signIn, signOut, signUp } from './api';
import type { AuthUser, SignInPayload, SignUpPayload } from './types';

const AuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  signIn: (p: SignInPayload) => Promise<void>;
  signUp: (p: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me().then(setUser).finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: async (p) => setUser(await signIn(p)),
        signUp: async (p) => setUser(await signUp(p)),
        signOut: async () => { await signOut(); setUser(null);  },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth needs AuthProvider');
  return ctx;
}

