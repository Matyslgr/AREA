import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { getColors } from '@/lib/theme-colors';
import { authApi, AccountDetails } from '@/lib/api';
import { useOAuth } from '@/lib/oauth';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICES = [
  { id: 'google', name: 'Google', description: 'Connect Gmail, Calendar, Drive', icon: require('../../assets/google.png'), useTint: false },
  { id: 'github', name: 'GitHub', description: 'Connect repositories and issues', icon: require('../../assets/github.png'), useTint: true },
  { id: 'spotify', name: 'Spotify', description: 'Connect playlists and music', icon: require('../../assets/spotify.png'), useTint: false },
  { id: 'notion', name: 'Notion', description: 'Connect pages and databases', icon: require('../../assets/notion.png'), useTint: true },
  { id: 'linkedin', name: 'LinkedIn', description: 'Connect your professional profile', icon: require('../../assets/linkedin.png'), useTint: false },
  { id: 'twitch', name: 'Twitch', description: 'Connect your streaming account', icon: require('../../assets/twitch.png'), useTint: false },
];

export default function AccountSetupScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { updatePassword } = useAuth();
  const { startOAuth, loading: oauthLoading } = useOAuth();

  const [accountDetails, setAccountDetails] = React.useState<AccountDetails | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [connectingService, setConnectingService] = React.useState<string | null>(null);
  const [disconnectingService, setDisconnectingService] = React.useState<string | null>(null);

  // Password states
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordLoading, setPasswordLoading] = React.useState(false);

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
    if (!accountDetails?.linkedAccounts) return false;

    return accountDetails.linkedAccounts.some(
      (acc) => acc.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  async function handleLinkService(provider: string) {
    setConnectingService(provider);
    const result = await startOAuth(provider, 'connect');
    if (result.success) {
      Alert.alert('Success', `${provider} account connected successfully!`);
      await fetchAccountDetails();
    } else {
      Alert.alert('Connection Failed', result.error || 'An error occurred');
    }
    setConnectingService(null);
  }

  async function handleUnlinkService(provider: string, serviceName: string) {
    Alert.alert(
      `Disconnect ${serviceName}`,
      `Are you sure you want to disconnect your ${serviceName} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setDisconnectingService(provider);
              const { error } = await authApi.unlinkOAuthAccount(provider);

              if (error) {
                Alert.alert('Cannot Disconnect', typeof error === 'string' ? error : 'Failed to unlink account');
              } else {
                await fetchAccountDetails();
              }
            } catch (err) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setDisconnectingService(null);
            }
          }
        }
      ]
    );
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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, marginTop: 16 }}>Loading account details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.background }}>
        <View className="flex-1 px-6 py-8">

          {/* Header */}
          <View className="mb-6">
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
              Set up your account
            </Text>
            <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
              {accountDetails?.hasPassword
                ? 'Connect your favorite services to start creating automations'
                : 'Create a password and connect your services'
              }
            </Text>
          </View>

          {/* Password Setup (Affiché uniquement si pas de mdp) */}
          {!accountDetails?.hasPassword && (
            <Card className="mb-6" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle style={{ color: colors.foreground }}>Set up your password</CardTitle>
                <CardDescription style={{ color: colors.mutedForeground }}>
                  Create a password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="gap-1.5">
                  <Label htmlFor="password" style={{ color: colors.foreground }}>Password</Label>
                  <Input
                    id="password"
                    secureTextEntry
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    style={{ color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View className="gap-1.5">
                  <Label htmlFor="confirmPassword" style={{ color: colors.foreground }}>Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    secureTextEntry
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={{ color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                {passwordError ? (
                  <Text style={{ color: colors.destructive, fontSize: 14 }}>{passwordError}</Text>
                ) : null}
                <Button
                  onPress={handleSetPassword}
                  disabled={passwordLoading || !password || !confirmPassword}
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>
                    {passwordLoading ? 'Setting Password...' : 'Set Password'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Services Section */}
          <View className="mb-6">
            <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}>Link your services</Text>
            <View className="gap-3">
              {SERVICES.map((service) => {
                const isLinked = isServiceLinked(service.id);
                const isConnecting = connectingService === service.id;
                const isDisconnecting = disconnectingService === service.id;

                return (
                  <Card
                    key={service.id}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: isLinked ? '#22c55e' : colors.border,
                      borderWidth: isLinked ? 2 : 1
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        if (isConnecting || isDisconnecting || oauthLoading) return;
                        if (isLinked) {
                          handleUnlinkService(service.id, service.name);
                        } else {
                          handleLinkService(service.id);
                        }
                      }}
                      disabled={isConnecting || isDisconnecting || oauthLoading}
                    >
                      <CardContent className="flex-row items-center gap-4 py-4">
                        <View
                          className="h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          <Image
                            source={service.icon}
                            className="h-6 w-6"
                            resizeMode="contain"
                            tintColor={Platform.select({
                              native: service.useTint ? (isDark ? 'white' : 'black') : undefined,
                            })}
                          />
                        </View>
                        <View className="flex-1">
                          <Text style={{ color: colors.foreground, fontWeight: '600' }}>{service.name}</Text>
                          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{service.description}</Text>
                        </View>
                        <View>
                          {isDisconnecting ? (
                             <ActivityIndicator size="small" color={colors.destructive} />
                          ) : isConnecting ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : isLinked ? (
                            <View
                              style={{
                                backgroundColor: '#22c55e',
                                borderRadius: 9999,
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                            </View>
                          ) : (
                            <View style={{ backgroundColor: colors.primary, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6 }}>
                              <Text style={{ color: colors.primaryForeground, fontSize: 12, fontWeight: '500' }}>
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
            <Button onPress={onContinue} size="lg" className="w-full" style={{ backgroundColor: colors.primary }}>
              <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>
                Continue to Dashboard
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}