import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { authApi } from './api';

// Ensure the browser session is completed when the app comes back to the foreground
WebBrowser.maybeCompleteAuthSession();

export interface OAuthResult {
  success: boolean;
  error?: string;
  token?: string;
  user?: { id: string; email: string; username: string };
  isNewUser?: boolean;
}

// Web callback URL that the OAuth providers redirect to
// This should match the REDIRECT_URI configured in the server's .env
const WEB_CALLBACK_URL = process.env.EXPO_PUBLIC_WEB_CALLBACK_URL || 'http://192.168.1.114:8081/auth/callback';

/**
 * Initiates OAuth flow for login or account linking
 * Uses the same flow as the web client:
 * 1. Get OAuth URL from backend (which includes the web callback URL)
 * 2. Open browser for user to authenticate
 * 3. Browser redirects to web callback URL with code
 * 4. We intercept this URL and extract the code
 * 5. Send code to backend to exchange for token
 */
export async function initiateOAuth(
  provider: string,
  mode: 'login' | 'connect' = 'login'
): Promise<OAuthResult> {
  try {
    // Step 1: Get OAuth authorization URL from backend (same as web)
    const { data: urlData, error: urlError } = await authApi.getOAuthUrl(provider, mode);

    if (urlError || !urlData?.url) {
      return { success: false, error: urlError || 'Failed to get OAuth URL' };
    }

    console.log('OAuth URL from server:', urlData.url);

    // Step 2: Open browser for OAuth
    // We listen for the web callback URL to intercept the redirect
    const result = await WebBrowser.openAuthSessionAsync(
      urlData.url,
      WEB_CALLBACK_URL
    );

    console.log('WebBrowser result:', result);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : 'Authentication failed',
      };
    }

    // Step 3: Extract code and state from callback URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return { success: false, error: `OAuth error: ${error}` };
    }

    if (!code) {
      return { success: false, error: 'No authorization code received' };
    }

    // Parse state to get provider info (same as web)
    let stateData: { provider?: string; mode?: string } = {};
    if (state) {
      try {
        const base64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const jsonString = atob(base64);
        stateData = JSON.parse(jsonString);
      } catch (e) {
        console.warn('Failed to parse state:', e);
      }
    }

    const actualProvider = stateData.provider || provider;
    const actualMode = stateData.mode || mode;

    console.log(`Processing OAuth | Provider: ${actualProvider} | Mode: ${actualMode}`);

    // Step 4: Exchange code for token via backend (same endpoint as web)
    if (actualMode === 'login' || mode === 'login') {
      const { data: authData, error: authError } = await authApi.oauthLogin(actualProvider, code);

      if (authError || !authData) {
        return { success: false, error: authError || 'OAuth login failed' };
      }

      return {
        success: true,
        token: authData.token,
        user: authData.user,
      };
    } else {
      const { data: linkData, error: linkError } = await authApi.oauthLink(actualProvider, code);

      if (linkError) {
        return { success: false, error: linkError };
      }

      return { success: true };
    }
  } catch (error) {
    console.error('OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * React hook for OAuth authentication
 */
export function useOAuth() {
  const [loading, setLoading] = React.useState(false);

  const startOAuth = React.useCallback(
    async (provider: string, mode: 'login' | 'connect' = 'login'): Promise<OAuthResult> => {
      setLoading(true);
      try {
        return await initiateOAuth(provider, mode);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { startOAuth, loading };
}
