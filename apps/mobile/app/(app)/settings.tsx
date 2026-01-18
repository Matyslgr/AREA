import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { getApiUrl, resetApiUrl } from '@/lib/api';
import * as Updates from 'expo-updates';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { signOut, user } = useAuth();
  const [currentUrl, setCurrentUrl] = React.useState('');

  React.useEffect(() => {
    getApiUrl().then(url => setCurrentUrl(url || 'Unknown'));
  }, []);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        }
      },
    ]);
  };

  const handleChangeServer = async () => {
    Alert.alert(
      "Change Server",
      "Are you sure? This will disconnect you and reload the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          style: "destructive",
          onPress: async () => {
            await resetApiUrl();
            try { await signOut(); } catch {}
            await Updates.reloadAsync();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.background }}>
        <View className="px-6 pt-4 pb-6">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()} className="p-2 mr-2 rounded-full active:opacity-70">
              <Text style={{ fontSize: 22, color: colors.foreground }}>←</Text>
            </Pressable>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.foreground }}>Settings</Text>
          </View>

          <View className="gap-6">
            {/* Account Section */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle style={{ color: colors.foreground }}>Account</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Email</Text>
                  <Text style={{ color: colors.foreground, fontSize: 16 }}>{user?.email}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Username</Text>
                  <Text style={{ color: colors.foreground, fontSize: 16 }}>{user?.username}</Text>
                </View>
                <Button
                  variant="outline"
                  onPress={() => router.push('/(app)/account-setup')}
                  style={{ borderColor: colors.border, marginTop: 4 }}
                >
                  <Text style={{ color: colors.foreground }}>Manage Services & Password</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle style={{ color: colors.foreground }}>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>
                  Choose your preferred theme
                </Text>
                <ThemeSwitcher />
              </CardContent>
            </Card>

            {/* Advanced / Developer Section */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle style={{ color: colors.foreground }}>Connection</CardTitle>
              </CardHeader>
              <CardContent>
                 <Text style={{ color: colors.mutedForeground, marginBottom: 8 }}>
                  Current Server URL:
                </Text>
                <View
                  className="p-3 rounded-md mb-4"
                  style={{ backgroundColor: colors.secondary }}
                >
                  <Text style={{ color: colors.foreground, fontFamily: 'monospace' }}>
                    {currentUrl}
                  </Text>
                </View>
                <Button
                  variant="destructive"
                  onPress={handleChangeServer}
                >
                  <Text style={{ color: 'white' }}>Change Server URL</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              variant="destructive"
              size="lg"
              onPress={handleLogout}
              className="mt-4"
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign Out</Text>
            </Button>

             <Text style={{ textAlign: 'center', color: colors.mutedForeground, fontSize: 12, marginTop: 20 }}>
               AREA Mobile v1.0.0
             </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}