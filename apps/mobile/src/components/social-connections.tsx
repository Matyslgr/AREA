import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useOAuth } from '@/lib/oauth';
import { setToken, setStoredUser } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, Image, Platform, View } from 'react-native';

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    id: 'google',
    type: 'oauth_google',
    source: require('../../assets/google.png'),
    useTint: false,
  },
  {
    id: 'github',
    type: 'oauth_github',
    source: require('../../assets/github.png'),
    useTint: true,
  },
  {
    id: 'spotify',
    type: 'oauth_spotify',
    source: require('../../assets/spotify.png'),
    useTint: false,
  },
  {
    id: 'notion',
    type: 'oauth_notion',
    source: require('../../assets/notion.png'),
    useTint: true,
  },
  {
    id: 'linkedin',
    type: 'oauth_linkedin',
    source: require('../../assets/linkedin.png'),
    useTint: false,
  },
  {
    id: 'twitch',
    type: 'oauth_twitch',
    source: require('../../assets/twitch.png'),
    useTint: false,
  },
];

interface SocialConnectionsProps {
  mode?: 'login' | 'connect';
}

export function SocialConnections({ mode = 'login' }: SocialConnectionsProps) {
  const { isDark } = useTheme();
  const { startOAuth, loading } = useOAuth();

  async function handleOAuthPress(provider: string) {
    const result = await startOAuth(provider, mode);

    if (result.success) {
      if (mode === 'login' && result.token && result.user) {
        // Save token and user, then navigate to dashboard
        await setToken(result.token);
        await setStoredUser(result.user);
        router.replace('/(app)/dashboard');
      } else if (mode === 'connect') {
        // OAuth account linked successfully
        Alert.alert('Success', `${provider} account connected successfully!`);
      }
    } else {
      Alert.alert('Authentication Failed', result.error || 'An error occurred');
    }
  }

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.type}
            variant="outline"
            size="sm"
            className="sm:flex-1"
            disabled={loading}
            onPress={() => handleOAuthPress(strategy.id)}>
            <Image
              className={cn('size-4', strategy.useTint && Platform.select({ web: 'dark:invert' }))}
              tintColor={Platform.select({
                native: strategy.useTint ? (isDark ? 'white' : 'black') : undefined,
              })}
              source={strategy.source}
            />
          </Button>
        );
      })}
    </View>
  );
}
