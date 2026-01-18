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
  signUp: (email: string, password: string) => Promise<{ error?: string }>; // Backend only needs email & password
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error?: string }>;
  updateAccount: (data: { email?: string; username?: string; password?: string; currentPassword?: string }) => Promise<{ error?: string }>;
  updatePassword: (password: string, currentPassword?: string) => Promise<{ error?: string }>;
  setAuthState: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const segments = useSegments();

  React.useEffect(() => {
    loadUser();
  }, []);

  // Auth protection: redirect based on auth state
  React.useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === '(app)';

    // If user is not logged in and tries to access protected (app) routes, redirect to sign-in
    if (!user && inAppGroup) {
      router.replace('/(auth)/sign-in');
    }
    // Note: We don't auto-redirect logged-in users from (auth) pages
    // This allows them to view sign-in/sign-up pages if they want
    // The redirect to dashboard happens after successful sign-in/sign-up
  }, [user, segments, loading]);

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

  async function signUp(email: string, password: string) {
    const { data, error } = await authApi.signUp(email, password);
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

  async function updateAccount(data: { email?: string; username?: string; password?: string; currentPassword?: string }) {
    const { data: response, error } = await authApi.updateAccount(data);
    if (error) {
      return { error };
    }
    if (response?.user) {
      await setStoredUser(response.user);
      setUser(response.user);
    }
    return {};
  }

  async function updatePassword(password: string, currentPassword?: string) {
    const { error } = await authApi.updatePassword(password, currentPassword);
    return { error: error || undefined };
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

  const setAuthState = (userData: User) => {
    setUser(userData);
  };

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
        updateAccount,
        updatePassword,
        setAuthState,
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
