import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

/**
 * Auto-detect the API URL based on the environment.
 * In development, extracts the IP from Expo's dev server.
 * Falls back to EXPO_PUBLIC_API_URL or localhost.
 */
function getApiUrl(): string {
  // If explicitly set in env, use it (useful for production builds)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In development, try to get IP from Expo's debugger host
  const debuggerHost =
    Constants.expoConfig?.hostUri || // Expo SDK 49+
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } })?.extra?.expoGo
      ?.debuggerHost ||
    (Constants.manifest as { debuggerHost?: string })?.debuggerHost;

  if (debuggerHost) {
    // debuggerHost is "IP:PORT" (e.g., "192.168.1.114:8081")
    // Extract just the IP and use port 8080 for the API server
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8080`;
  }

  // Fallback for web or when debuggerHost is not available
  return 'http://localhost:8080';
}

const API_URL = getApiUrl();

// Log the API URL in development for debugging
if (__DEV__) {
  console.log('[API] Using API URL:', API_URL);
}

const TOKEN_KEY = 'area-token';
const USER_KEY = 'area-user';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    console.error('Failed to save token');
  }
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    console.error('Failed to remove token');
  }
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    console.error('Failed to save user');
  }
}

export async function removeStoredUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    console.error('Failed to remove user');
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Something went wrong' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export interface AuthResponse {
  token: string;
  user: User;
}

export interface OAuthAccount {
  id: string;
  provider: string;
  provider_account_id: string;
  email?: string;
  scope?: string;
  created_at: string;
}

export interface AccountDetails extends User {
  accounts: OAuthAccount[];
  hasPassword: boolean;
}

export const authApi = {
  signIn: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signin', { email, password }),

  signUp: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),

  getAccount: () => api.get<AccountDetails>('/auth/account'),

  updateAccount: (data: { email?: string; username?: string; password?: string; currentPassword?: string }) =>
    api.put<{ message: string; user: User }>('/auth/account', data),

  updatePassword: (password: string, currentPassword?: string) =>
    api.post<{ message: string; user: User }>('/auth/account/password', { password, currentPassword }),

  getOAuthUrl: (provider: string, mode: 'login' | 'connect' | 'signup') =>
    api.get<{ url: string }>(`/auth/oauth/authorize/${provider}?mode=${mode}`),

  oauthLogin: (provider: string, code: string) =>
    api.post<AuthResponse>('/auth/oauth/login', { provider, code }),

  oauthLink: (provider: string, code: string) =>
    api.post<{ message: string }>('/auth/oauth/link', { provider, code }),

  getOAuthAccounts: () =>
    api.get<{ accounts: OAuthAccount[] }>('/auth/oauth/accounts'),

  unlinkOAuthAccount: (provider: string) =>
    api.delete<{ message: string }>(`/auth/oauth/accounts/${provider}`),
};

// Area types
export interface Area {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  last_executed_at: string | null;
  error_log: string | null;
  action: {
    name: string;
    parameters: Record<string, unknown>;
  };
  reactions: {
    name: string;
    parameters: Record<string, unknown>;
  }[];
}

export interface ServiceAction {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
}

export interface ServiceReaction {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
}

export interface Service {
  id: string;
  name: string;
  actions: ServiceAction[];
  reactions: ServiceReaction[];
}

export const areasApi = {
  list: () => api.get<Area[]>('/areas'),

  create: (data: {
    name: string;
    action: { name: string; parameters: Record<string, unknown> };
    reactions: { name: string; parameters: Record<string, unknown> }[];
  }) => api.post<{ message: string; area: Area }>('/areas', data),

  update: (id: string, data: { is_active?: boolean; name?: string }) =>
    api.put<{ success: boolean }>(`/areas/${id}`, data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/areas/${id}`),
};

export const servicesApi = {
  list: () => api.get<Service[]>('/services'),
};
