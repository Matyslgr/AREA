import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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
  name: string;
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

export const authApi = {
  signIn: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signin', { email, password }),

  signUp: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { name, email, password }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),

  getAccount: () => api.get<User>('/auth/account'),

  getOAuthUrl: (provider: string, mode: 'login' | 'connect' | 'signup') =>
    api.get<{ url: string }>(`/auth/oauth/authorize/${provider}?mode=${mode}`),

  oauthLogin: (provider: string, code: string, state: string) =>
    api.post<AuthResponse>('/auth/oauth/login', { provider, code, state }),

  oauthLink: (provider: string, code: string) =>
    api.post<{ message: string }>('/auth/oauth/link', { provider, code }),
};
