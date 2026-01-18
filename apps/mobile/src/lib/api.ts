import * as SecureStore from 'expo-secure-store';

const API_URL_KEY = 'api-url';
const TOKEN_KEY = 'area-token';
const USER_KEY = 'area-user';

/**
 * Loads the API URL from storage or fallback to auto-detection
 */
export async function getApiUrl(): Promise<string> {
  try {
    const savedUrl = await SecureStore.getItemAsync(API_URL_KEY);
    if (savedUrl)
      return savedUrl;
  } catch {
    console.error('Failed to load API URL from storage');
  }
  return 'http://localhost:8080';
}

export const resetApiUrl = async () => {
  try {
    await SecureStore.deleteItemAsync(API_URL_KEY);
  } catch (error) {
    console.error('Error resetting server URL:', error);
  }
};

/**
 * Saves a new API URL (e.g., your static ngrok URL)
 */
export async function setApiUrl(url: string): Promise<void> {
  try {
    // Ensure URL doesn't end with a slash
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    await SecureStore.setItemAsync(API_URL_KEY, formattedUrl);
  } catch (error) {
    console.error('Failed to save API URL', error);
  }
}

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
    const baseUrl = await getApiUrl();

    if (__DEV__) console.log(`[REQ] ${baseUrl}${endpoint}`);

    const headers: HeadersInit = {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
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

export interface LinkedAccount {
  id: string;
  provider: string;
  provider_account_id: string;
  expires_at?: string;
  scopes?: string[];
}

export interface AccountDetails {
  id: string;
  email: string;
  username: string;
  hasPassword: boolean;
  linkedAccounts: LinkedAccount[];
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

  getOAuthUrl: (provider: string, mode: 'login' | 'connect' | 'signup', redirectUri?: string) => {
    let url = `/auth/oauth/authorize/${provider}?mode=${mode}&source=mobile`;

    if (redirectUri) {
      url += `&redirect=${encodeURIComponent(redirectUri)}`;
    }

    return api.get<{ url: string }>(url);
  },

  oauthLogin: (provider: string, code: string) =>
    api.post<AuthResponse>('/auth/oauth/login', { provider, code }),

  oauthLink: (provider: string, code: string) =>
    api.post<{ message: string }>('/auth/oauth/link', { provider, code }),

  unlinkOAuthAccount: (provider: string) =>
    api.delete<{ message: string }>(`/auth/account/providers/${provider}`),
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

export interface ServiceActionValue {
  name: string;
  description: string;
  example?: string;
}

export interface ServiceAction {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
  scopes?: string[];
  return_values?: ServiceActionValue[];
}

export interface ServiceReaction {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
  scopes?: string[];
}

export interface Service {
  id: string;
  name: string;
  actions: ServiceAction[];
  reactions: ServiceReaction[];
  is_oauth: boolean;
}

export const areasApi = {
  list: () => api.get<Area[]>('/areas'),

  get: (id: string) => api.get<Area>(`/areas/${id}`),

  create: (data: {
    name: string;
    action: { name: string; parameters: Record<string, unknown> };
    reactions: { name: string; parameters: Record<string, unknown> }[];
  }) => api.post<{ message: string; area: Area }>('/areas', data),

  update: (id: string, data: {
    is_active?: boolean;
    name?: string;
    action?: { name: string; parameters: Record<string, unknown> };
    reactions?: { name: string; parameters: Record<string, unknown> }[];
  }) => api.put<{ success: boolean }>(`/areas/${id}`, data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/areas/${id}`),
};

export const servicesApi = {
  list: () => api.get<Service[]>('/services'),
};
