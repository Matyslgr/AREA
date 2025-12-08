import {
  api,
  authApi,
  getStoredUser,
  getToken,
  removeStoredUser,
  removeToken,
  setStoredUser,
  setToken,
  type User,
} from '@/lib/api';
import { router, useSegments } from 'expo-router';
import * as React from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error?: string }>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const segments = useSegments();

  React.useEffect(() => {
    loadUser();
  }, []);

  // DEV: Auth protection disabled for testing
  // React.useEffect(() => {
  //   if (loading) return;

  //   const inAuthGroup = segments[0] === '(auth)';
  //   const inAppGroup = segments[0] === '(app)';

  //   if (!user && inAppGroup) {
  //     router.replace('/(auth)/sign-in');
  //   } else if (user && inAuthGroup) {
  //     router.replace('/(app)/dashboard');
  //   }
  // }, [user, segments, loading]);

  async function loadUser() {
    try {
      const token = await getToken();
      if (token) {
        const storedUser = await getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          const { data, error } = await authApi.getAccount();
          if (data && !error) {
            setUser(data);
            await setStoredUser(data);
          } else {
            await removeToken();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await authApi.signIn(email, password);
    if (error) {
      return { error };
    }
    if (data) {
      await setToken(data.token);
      await setStoredUser(data.user);
      setUser(data.user);
    }
    return {};
  }

  async function signUp(name: string, email: string, password: string) {
    const { data, error } = await authApi.signUp(name, email, password);
    if (error) {
      return { error };
    }
    if (data) {
      await setToken(data.token);
      await setStoredUser(data.user);
      setUser(data.user);
    }
    return {};
  }

  async function signOut() {
    await removeToken();
    await removeStoredUser();
    setUser(null);
    router.replace('/');
  }

  async function forgotPassword(email: string) {
    const { error } = await authApi.forgotPassword(email);
    return { error };
  }

  async function resetPassword(token: string, password: string) {
    const { error } = await authApi.resetPassword(token, password);
    return { error };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
