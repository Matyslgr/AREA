import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { authApi, AccountDetails } from '@/lib/api';
import { useOAuth } from '@/lib/oauth';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICES = [
  {
    id: 'google',
    name: 'Google',
    description: 'Connect Gmail, Calendar, Drive',
    icon: require('../../assets/google.png'),
    useTint: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and issues',
    icon: require('../../assets/github.png'),
    useTint: true,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Connect playlists and music',
    icon: require('../../assets/spotify.png'),
    useTint: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect pages and databases',
    icon: require('../../assets/notion.png'),
    useTint: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect your professional profile',
    icon: require('../../assets/linkedin.png'),
    useTint: false,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Connect your streaming account',
    icon: require('../../assets/twitch.png'),
    useTint: false,
  },
];

export default function AccountSetupScreen() {
  const { isDark } = useTheme();
  const { updatePassword } = useAuth();
  const { startOAuth, loading: oauthLoading } = useOAuth();

  const [accountDetails, setAccountDetails] = React.useState<AccountDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [connectingService, setConnectingService] = React.useState<string | null>(null);

  // Password form state
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const confirmPasswordRef = React.useRef<TextInput>(null);

  // Fetch account details on mount
  React.useEffect(() => {
    fetchAccountDetails();
  }, []);

  async function fetchAccountDetails() {
    try {
      const { data, error } = await authApi.getAccount();
      if (data && !error) {
        setAccountDetails(data);
      }
    } catch (err) {
      console.error('Failed to fetch account details:', err);
    } finally {
      setLoading(false);
    }
  }

  function isServiceLinked(provider: string): boolean {
    if (!accountDetails?.accounts) return false;
    return accountDetails.accounts.some(
      (account) => account.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  async function handleLinkService(provider: string) {
    setConnectingService(provider);

    const result = await startOAuth(provider, 'connect');

    if (result.success) {
      Alert.alert('Success', `${provider} account connected successfully!`);
      // Refresh account details to show the new linked service
      await fetchAccountDetails();
    } else {
      Alert.alert('Connection Failed', result.error || 'An error occurred');
    }

    setConnectingService(null);
  }

  async function handleSetPassword() {
    setPasswordError('');

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    const result = await updatePassword(password);

    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPassword('');
      setConfirmPassword('');
      // Refresh account details
      await fetchAccountDetails();
      Alert.alert('Success', 'Password has been set successfully!');
    }

    setPasswordLoading(false);
  }

  function onContinue() {
    router.replace('/(app)/dashboard');
  }

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading account details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-6">
            <Text variant="h3" className="text-foreground mb-2 text-center">
              Set up your account
            </Text>
            <Text className="text-muted-foreground text-center">
              {accountDetails?.hasPassword
                ? 'Connect your favorite services to start creating automations'
                : 'Create a password and connect your services'
              }
            </Text>
          </View>

          {/* Password Setup Section (if no password) */}
          {!accountDetails?.hasPassword && (
            <Card className="border-border mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Set up your password</CardTitle>
                <CardDescription>
                  Create a password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    secureTextEntry
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                </View>
                <View className="gap-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    ref={confirmPasswordRef}
                    id="confirmPassword"
                    secureTextEntry
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSetPassword}
                  />
                </View>
                {passwordError ? (
                  <Text className="text-destructive text-sm">{passwordError}</Text>
                ) : null}
                <Button
                  onPress={handleSetPassword}
                  disabled={passwordLoading || !password || !confirmPassword}
                >
                  <Text className="text-primary-foreground font-semibold">
                    {passwordLoading ? 'Setting Password...' : 'Set Password'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Services Section */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-3">Link your services</Text>
            <View className="gap-3">
              {SERVICES.map((service) => {
                const isLinked = isServiceLinked(service.id);
                const isConnecting = connectingService === service.id;

                return (
                  <Card key={service.id} className="border-border">
                    <Pressable
                      onPress={() => !isLinked && !isConnecting && handleLinkService(service.id)}
                      disabled={isLinked || isConnecting || oauthLoading}
                    >
                      <CardContent className="flex-row items-center gap-4 py-4">
                        <View className="bg-muted h-12 w-12 items-center justify-center rounded-xl">
                          <Image
                            source={service.icon}
                            className={cn(
                              'h-6 w-6',
                              service.useTint && Platform.select({ web: 'dark:invert' })
                            )}
                            resizeMode="contain"
                            tintColor={Platform.select({
                              native: service.useTint
                                ? isDark
                                  ? 'white'
                                  : 'black'
                                : undefined,
                            })}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-semibold">{service.name}</Text>
                          <Text className="text-muted-foreground text-sm">{service.description}</Text>
                        </View>
                        <View>
                          {isLinked ? (
                            <View className="bg-green-500/10 rounded-full px-3 py-1">
                              <Text className="text-green-500 text-xs font-medium">Connected</Text>
                            </View>
                          ) : isConnecting ? (
                            <View className="bg-muted rounded-full px-3 py-1 flex-row items-center">
                              <ActivityIndicator size="small" className="mr-1" />
                              <Text className="text-muted-foreground text-xs font-medium">
                                Connecting...
                              </Text>
                            </View>
                          ) : (
                            <View className="bg-secondary rounded-full px-3 py-1">
                              <Text className="text-secondary-foreground text-xs font-medium">
                                Connect
                              </Text>
                            </View>
                          )}
                        </View>
                      </CardContent>
                    </Pressable>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <View className="mt-auto gap-4">
            <Text className="text-muted-foreground text-center text-sm">
              You can link your accounts later at any time in your account settings
            </Text>
            <Button onPress={onContinue} size="lg" className="w-full">
              <Text className="text-primary-foreground font-semibold">
                Continue to Dashboard
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
