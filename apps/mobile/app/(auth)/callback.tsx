import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

/**
 * OAuth callback route
 * Handles the redirect from OAuth providers via deep link (area://auth/callback)
 * The actual OAuth processing happens in oauth.ts via WebBrowser.openAuthSessionAsync
 * This component is mainly for displaying a loading state if the user lands here directly
 */
export default function OAuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    // If the user somehow lands on this screen directly, redirect to sign-in
    const timer = setTimeout(() => {
      router.replace('/(auth)/sign-in');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="bg-background flex-1 items-center justify-center p-6">
      <Text className="text-foreground text-center text-lg">
        Processing authentication...
      </Text>
      {params.error && (
        <Text className="text-destructive mt-4 text-center">
          Error: {params.error}
        </Text>
      )}
    </View>
  );
}
