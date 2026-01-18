import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { api, authApi, AccountDetails } from '@/lib/api';
import { useOAuth } from '@/lib/oauth';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICES: { id: string; name: string; icon: ImageSourcePropType; useTint: boolean }[] = [
  { id: 'google', name: 'Google', icon: require('../../assets/google.png'), useTint: false },
  { id: 'github', name: 'GitHub', icon: require('../../assets/github.png'), useTint: true },
  { id: 'spotify', name: 'Spotify', icon: require('../../assets/spotify.png'), useTint: false },
  { id: 'notion', name: 'Notion', icon: require('../../assets/notion.png'), useTint: true },
  { id: 'linkedin', name: 'LinkedIn', icon: require('../../assets/linkedin.png'), useTint: false },
  { id: 'twitch', name: 'Twitch', icon: require('../../assets/twitch.png'), useTint: false },
];

export default function SettingsScreen() {
  const { user, updateAccount, updatePassword } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { startOAuth, loading: oauthLoading } = useOAuth();

  const [loading, setLoading] = React.useState(true);
  const [accountDetails, setAccountDetails] = React.useState<AccountDetails | null>(null);

  const [username, setUsername] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [unlinkingService, setUnlinkingService] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await authApi.getAccount();
      if (data && !error) {
        setAccountDetails(data);
        setUsername(data.username || '');
      }
    } catch (err) {
      console.error('Failed to fetch account details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      const { error } = await updateAccount({ username });
      if (error) {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Success', 'Username updated successfully');
        await fetchAccountDetails();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update username');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setSavingPassword(true);
      const { error } = await updatePassword(newPassword);
      if (error) {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Success', 'Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLinkService = async (serviceId: string) => {
    const result = await startOAuth(serviceId, 'connect');
    if (result.success) {
      Alert.alert('Success', `${serviceId} account connected successfully!`);
      await fetchAccountDetails();
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleUnlinkService = async (accountId: string, serviceName: string) => {
    Alert.alert(
      'Unlink Service',
      `Are you sure you want to unlink ${serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnlinkingService(accountId);
              const { error } = await api.delete<{ message: string }>(`/auth/account/${accountId}`);
              if (error) {
                Alert.alert('Error', error);
              } else {
                Alert.alert('Success', `${serviceName} unlinked successfully`);
                await fetchAccountDetails();
              }
            } catch (err) {
              Alert.alert('Error', `Failed to unlink ${serviceName}`);
            } finally {
              setUnlinkingService(null);
            }
          },
        },
      ]
    );
  };

  const isServiceLinked = (serviceId: string) => {
    return accountDetails?.linkedAccounts?.some(
      (acc) => acc.provider.toLowerCase() === serviceId.toLowerCase()
    );
  };

  const getLinkedAccount = (serviceId: string) => {
    return accountDetails?.linkedAccounts?.find(
      (acc) => acc.provider.toLowerCase() === serviceId.toLowerCase()
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Profile Section */}
        <Card className="mb-4 border-border bg-card">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <Text className="text-sm text-muted-foreground">Manage your account details</Text>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label className="mb-2">Email</Label>
              <Input
                value={accountDetails?.email || ''}
                editable={false}
                className="bg-muted opacity-60"
              />
              <Text className="text-xs text-muted-foreground mt-1">Email cannot be changed</Text>
            </View>

            <View>
              <Label className="mb-2">Username</Label>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
              />
            </View>

            <Button
              onPress={handleUpdateUsername}
              disabled={savingProfile || username === accountDetails?.username}
              className="bg-primary"
            >
              <Text className="text-primary-foreground font-medium">
                {savingProfile ? 'Saving...' : 'Update Username'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="mb-4 border-border bg-card">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <Text className="text-sm text-muted-foreground">Update your password</Text>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label className="mb-2">New Password</Label>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 8 characters"
                secureTextEntry
              />
            </View>

            <View>
              <Label className="mb-2">Confirm Password</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry
              />
            </View>

            <Button
              onPress={handleUpdatePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="bg-primary"
            >
              <Text className="text-primary-foreground font-medium">
                {savingPassword ? 'Saving...' : 'Update Password'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Connected Services Section */}
        <Card className="mb-4 border-border bg-card">
          <CardHeader>
            <CardTitle>Connected Services</CardTitle>
            <Text className="text-sm text-muted-foreground">Link or unlink your OAuth accounts</Text>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              {SERVICES.map((service) => {
                const linked = isServiceLinked(service.id);
                const linkedAccount = getLinkedAccount(service.id);

                return (
                  <View
                    key={service.id}
                    className={cn(
                      'p-4 rounded-lg border-2',
                      linked
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <View className="flex-row items-center mb-3">
                      <Image
                        source={service.icon}
                        className="w-8 h-8 rounded mr-3"
                        tintColor={Platform.select({
                          native: service.useTint
                            ? isDark
                              ? 'white'
                              : 'black'
                            : undefined
                        })}
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{service.name}</Text>
                        {linked && (
                          <Text className="text-xs text-green-500">Connected</Text>
                        )}
                      </View>
                    </View>

                    {linked && linkedAccount ? (
                      <Button
                        variant="outline"
                        onPress={() => handleUnlinkService(linkedAccount.id, service.name)}
                        disabled={unlinkingService === linkedAccount.id || oauthLoading}
                        className="border-red-500/30"
                      >
                        <Text className="text-red-500">
                          {unlinkingService === linkedAccount.id ? 'Unlinking...' : 'Unlink'}
                        </Text>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onPress={() => handleLinkService(service.id)}
                        disabled={oauthLoading}
                        className="border-primary/30"
                      >
                        <Text className="text-primary">
                          {oauthLoading ? 'Linking...' : 'Link Account'}
                        </Text>
                      </Button>
                    )}
                  </View>
                );
              })}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
