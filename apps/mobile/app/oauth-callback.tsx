import { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api, setToken, setStoredUser } from '@/lib/api';

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;

    async function handleAuth() {
      // 1. Extract parameters
      // params values can be string or string[], we force cast to string for simplicity
      const error = Array.isArray(params.error) ? params.error[0] : params.error;
      const token = Array.isArray(params.token) ? params.token[0] : params.token;

      const isNewUser = params.isNewUser === 'true';
      const isLinked = params.linked === 'true';

      console.log('[Mobile OAuth] Callback Params:', { token, isNewUser, isLinked, error });

      if (!token && !error && !isLinked) return;
      called.current = true;

      // 2. Handle Errors
      if (error) {
        console.error('[Mobile OAuth] Error:', error);
        // Redirect to Sign In with the error message
        router.replace({
          pathname: '/(auth)/sign-in',
          params: { error }
        });
        return;
      }

      // 3. Case: LOGIN
      if (token) {
        try {
          // A. Store the JWT Token securely
          await setToken(token);

          const response = await api.get<{ id: string, username: string, email: string }>('/auth/me');

          if (response.data) {
            const user = response.data;
            console.log("User logged in:", user.username);

            // 3. Stockage User
            await setStoredUser(user);

            // 4. Redirection conditionnelle exacte
            if (isNewUser) {
              router.replace('/(app)/account-setup');
            } else {
              router.replace('/(app)/dashboard');
            }
          } else {
            // Cas où l'API répond mais avec une erreur
            throw new Error(response.error || "Failed to fetch user data");
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          router.replace({
            pathname: '/(auth)/sign-in',
            params: { error: 'user_fetch_failed' }
          });
        }
        return;
      }

      // 4. Case: LINK ACCOUNT (User was already logged in)
      if (isLinked) {
        const redirectTo = await SecureStore.getItemAsync('oauth-redirect');

        console.log('[Mobile OAuth] Account linked successfully');
        if (redirectTo) {
          await SecureStore.deleteItemAsync('oauth-redirect');
          router.replace(redirectTo as any);
        } else {
          router.replace('/(app)/account-setup');
        }
        return;
      }

      // 5. Fallback: No token, no error, nothing useful? Go back to login.
      router.replace({
        pathname: '/(auth)/sign-in',
        params: { error: 'invalid_callback' }
      });
    }

    handleAuth();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={{ marginTop: 20, color: 'gray' }}>Authenticating...</Text>
    </View>
  );
}