import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { authApi } from './api';

// Ensure the browser session is completed when the app comes back to the foreground
WebBrowser.maybeCompleteAuthSession();

export interface OAuthResult {
  success: boolean;
  error?: string;
  token?: string;
  isNewUser?: boolean;
}

export async function initiateOAuth(
  provider: string,
  mode: 'login' | 'connect' = 'login'
): Promise<OAuthResult> {
  try {
    const redirectUri = makeRedirectUri({
      scheme: 'area',
      path: 'oauth-callback'
    });

    console.log('Mobile expects redirect to:', redirectUri);

    const { data: urlData, error: urlError } = await authApi.getOAuthUrl(provider, mode, redirectUri);

    if (urlError || !urlData?.url) {
      return { success: false, error: urlError || 'Failed to get OAuth URL' };
    }

    console.log('OAuth URL from server:', urlData.url);

    const result = await WebBrowser.openAuthSessionAsync(
      urlData.url,
      redirectUri
    );

    console.log('WebBrowser result:', result);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : 'Authentication failed',
      };
    }

    const url = new URL(result.url);
    const token = url.searchParams.get('token');
    const isNewUser = url.searchParams.get('isNewUser') === 'true';
    const error = url.searchParams.get('error');
    const linked = url.searchParams.get('linked') === 'true';

    if (error) {
      return { success: false, error: `OAuth error: ${error}` };
    }

    if (mode === 'login') {
      if (token) {
        return { success: true, token, isNewUser };
      } else {
        return { success: false, error: 'No token received from OAuth provider' };
      }
    } else if (mode === 'connect') {
      if (linked) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to link OAuth account' };
      }
    } else {
      return { success: false, error: 'Invalid OAuth mode' };
    }
  } catch (err: any) {
    console.error('OAuth initiation error:', err);
    return { success: false, error: 'An unexpected error occurred during OAuth' };
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
