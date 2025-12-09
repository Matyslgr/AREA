import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONNECTED_SERVICES = [
  {
    id: 'google',
    name: 'Google',
    icon: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
    connected: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: { uri: 'https://img.clerk.com/static/github.png?width=160' },
    useTint: true,
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: { uri: 'https://img.clerk.com/static/notion.png?width=160' },
    useTint: true,
    connected: true,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: { uri: 'https://img.clerk.com/static/spotify.png?width=160' },
    useTint: false,
    connected: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: { uri: 'https://img.clerk.com/static/linkedin.png?width=160' },
    useTint: false,
    connected: true,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: { uri: 'https://img.clerk.com/static/twitch.png?width=160' },
    useTint: false,
    connected: false,
  },
];

const RECENT_AUTOMATIONS = [
  {
    id: '1',
    name: 'Email to Discord',
    description: 'Forward important emails to Discord',
    active: true,
  },
  {
    id: '2',
    name: 'GitHub to Notion',
    description: 'Sync issues to Notion database',
    active: false,
  },
];

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();

  function toggleTheme() {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }

  async function onLogout() {
    await signOut();
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-muted-foreground text-sm">Welcome back,</Text>
              <Text className="text-foreground text-xl font-bold">
                {user?.username || 'User'}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={toggleTheme}
                className="bg-secondary h-10 w-10 items-center justify-center rounded-full"
              >
                <Text>{colorScheme === 'dark' ? '☀️' : '🌙'}</Text>
              </Pressable>
              <Pressable
                onPress={onLogout}
                className="bg-secondary h-10 w-10 items-center justify-center rounded-full"
              >
                <Text>👋</Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Actions */}
          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <Text className="text-sm">+ New Automation</Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => router.push('/(app)/account-setup')}
              >
                <Text className="text-sm">+ Connect Service</Text>
              </Button>
            </CardContent>
          </Card>

          {/* Connected Services */}
          <View className="mb-6">
            <Text className="text-foreground mb-3 font-semibold">Connected Services</Text>
            <View className="flex-row gap-3">
              {CONNECTED_SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} colorScheme={colorScheme} />
              ))}
              <Pressable
                onPress={() => router.push('/(app)/account-setup')}
                className="border-border bg-muted/50 h-20 w-20 items-center justify-center rounded-2xl border border-dashed"
              >
                <Text className="text-muted-foreground text-2xl">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Automations */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">Recent Automations</Text>
              <Pressable>
                <Text className="text-primary text-sm">View all</Text>
              </Pressable>
            </View>
            <View className="gap-3">
              {RECENT_AUTOMATIONS.map((automation) => (
                <Card key={automation.id} className="border-border">
                  <CardContent className="flex-row items-center justify-between py-4">
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{automation.name}</Text>
                      <Text className="text-muted-foreground text-sm">
                        {automation.description}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'rounded-full px-3 py-1',
                        automation.active ? 'bg-green-500/10' : 'bg-muted'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-medium',
                          automation.active ? 'text-green-500' : 'text-muted-foreground'
                        )}
                      >
                        {automation.active ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">12</Text>
                <Text className="text-muted-foreground text-sm">Automations</Text>
              </CardContent>
            </Card>
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">847</Text>
                <Text className="text-muted-foreground text-sm">Actions today</Text>
              </CardContent>
            </Card>
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">3</Text>
                <Text className="text-muted-foreground text-sm">Services</Text>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceCard({
  service,
  colorScheme,
}: {
  service: (typeof CONNECTED_SERVICES)[0];
  colorScheme: 'light' | 'dark' | undefined;
}) {
  return (
    <Pressable
      className={cn(
        'border-border h-20 w-20 items-center justify-center rounded-2xl border',
        service.connected ? 'bg-card' : 'bg-muted/50 opacity-50'
      )}
    >
      <Image
        source={service.icon}
        className={cn('h-8 w-8', service.useTint && Platform.select({ web: 'dark:invert' }))}
        tintColor={Platform.select({
          native: service.useTint ? (colorScheme === 'dark' ? 'white' : 'black') : undefined,
        })}
      />
      <Text className="text-foreground mt-1 text-xs">{service.name}</Text>
    </Pressable>
  );
}
