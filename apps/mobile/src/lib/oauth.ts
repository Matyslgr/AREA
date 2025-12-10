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

// Mobile OAuth callback uses deep link scheme, not HTTP URL
const MOBILE_REDIRECT_URI = 'area://auth/callback';

export async function initiateOAuth(
  provider: string,
  mode: 'login' | 'connect' = 'login'
): Promise<OAuthResult> {
  try {
    const { data: urlData, error: urlError } = await authApi.getOAuthUrl(provider, mode);

    if (urlError || !urlData?.url) {
      return { success: false, error: urlError || 'Failed to get OAuth URL' };
    }

    console.log('OAuth URL from server:', urlData.url);

    const result = await WebBrowser.openAuthSessionAsync(
      urlData.url,
      MOBILE_REDIRECT_URI
    );

    console.log('WebBrowser result:', result);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : 'Authentication failed',
      };
    }

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
