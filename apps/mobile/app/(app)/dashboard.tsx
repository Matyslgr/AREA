import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Area, areasApi, authApi, OAuthAccount } from '@/lib/api';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Service configuration with local assets
const SERVICE_CONFIG: Record<
  string,
  { name: string; icon: ImageSourcePropType; useTint: boolean }
> = {
  google: {
    name: 'Google',
    icon: require('../../assets/google.png'),
    useTint: false,
  },
  github: {
    name: 'GitHub',
    icon: require('../../assets/github.png'),
    useTint: true,
  },
  spotify: {
    name: 'Spotify',
    icon: require('../../assets/spotify.png'),
    useTint: false,
  },
  notion: {
    name: 'Notion',
    icon: require('../../assets/notion.png'),
    useTint: true,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: require('../../assets/linkedin.png'),
    useTint: false,
  },
  twitch: {
    name: 'Twitch',
    icon: require('../../assets/twitch.png'),
    useTint: false,
  },
};

const ALL_PROVIDERS = ['google', 'github', 'spotify', 'notion', 'linkedin', 'twitch'];

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();

  const [connectedAccounts, setConnectedAccounts] = React.useState<OAuthAccount[]>([]);
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [togglingArea, setTogglingArea] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const [accountsRes, areasRes] = await Promise.all([
        authApi.getOAuthAccounts(),
        areasApi.list(),
      ]);

      if (accountsRes.data?.accounts) {
        setConnectedAccounts(accountsRes.data.accounts);
      }
      if (areasRes.data) {
        setAreas(areasRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  async function toggleArea(areaId: string, currentStatus: boolean) {
    setTogglingArea(areaId);
    try {
      const { error } = await areasApi.update(areaId, { is_active: !currentStatus });
      if (!error) {
        setAreas((prev) =>
          prev.map((area) =>
            area.id === areaId ? { ...area, is_active: !currentStatus } : area
          )
        );
      }
    } finally {
      setTogglingArea(null);
    }
  }

  async function onLogout() {
    await signOut();
  }

  const connectedProviders = new Set(connectedAccounts.map((a) => a.provider));
  const activeAreas = areas.filter((a) => a.is_active).length;

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                onPress={onLogout}
                className="bg-secondary h-10 w-10 items-center justify-center rounded-full"
              >
                <Text>👋</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="mb-6 flex-row gap-3">
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">{areas.length}</Text>
                <Text className="text-muted-foreground text-xs">Total AREAs</Text>
              </CardContent>
            </Card>
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-green-500 text-2xl font-bold">{activeAreas}</Text>
                <Text className="text-muted-foreground text-xs">Active</Text>
              </CardContent>
            </Card>
            <Card className="border-border flex-1">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">
                  {connectedAccounts.length}
                </Text>
                <Text className="text-muted-foreground text-xs">Services</Text>
              </CardContent>
            </Card>
          </View>

          {/* Quick Actions */}
          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex-row gap-3">
              <Button variant="default" className="flex-1" onPress={() => router.push('/(app)/create-area')}>
                <Text className="text-primary-foreground text-sm">+ New AREA</Text>
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

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Connected Services */}
          <View className="mb-6">
            <Text className="text-foreground mb-3 font-semibold">Connected Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {ALL_PROVIDERS.map((provider) => {
                  const config = SERVICE_CONFIG[provider];
                  const isConnected = connectedProviders.has(provider);
                  return (
                    <ServiceCard
                      key={provider}
                      name={config.name}
                      icon={config.icon}
                      useTint={config.useTint}
                      connected={isConnected}
                      isDark={isDark}
                    />
                  );
                })}
                <Pressable
                  onPress={() => router.push('/(app)/account-setup')}
                  className="border-border bg-muted/50 h-20 w-20 items-center justify-center rounded-2xl border border-dashed"
                >
                  <Text className="text-muted-foreground text-2xl">+</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>

          {/* AREAs List */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">Your AREAs</Text>
              {areas.length > 0 && (
                <Pressable>
                  <Text className="text-primary text-sm">View all</Text>
                </Pressable>
              )}
            </View>

            {areas.length === 0 ? (
              <Card className="border-border">
                <CardContent className="items-center py-8">
                  <Text className="text-muted-foreground mb-2 text-4xl">🔗</Text>
                  <Text className="text-foreground mb-1 font-medium">No AREAs yet</Text>
                  <Text className="text-muted-foreground text-center text-sm">
                    Create your first automation to connect your services
                  </Text>
                  <Button variant="default" className="mt-4" onPress={() => router.push('/(app)/create-area')}>
                    <Text className="text-primary-foreground text-sm">Create AREA</Text>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <View className="gap-3">
                {areas.slice(0, 5).map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    toggling={togglingArea === area.id}
                    onToggle={() => toggleArea(area.id, area.is_active)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Recent Activity */}
          {areas.some((a) => a.last_executed_at) && (
            <View>
              <Text className="text-foreground mb-3 font-semibold">Recent Activity</Text>
              <Card className="border-border">
                <CardContent className="py-4">
                  {areas
                    .filter((a) => a.last_executed_at)
                    .sort(
                      (a, b) =>
                        new Date(b.last_executed_at!).getTime() -
                        new Date(a.last_executed_at!).getTime()
                    )
                    .slice(0, 3)
                    .map((area) => (
                      <View
                        key={area.id}
                        className="border-border flex-row items-center justify-between border-b py-2 last:border-b-0"
                      >
                        <View className="flex-1">
                          <Text className="text-foreground text-sm font-medium">
                            {area.name}
                          </Text>
                          <Text className="text-muted-foreground text-xs">
                            {formatRelativeTime(area.last_executed_at!)}
                          </Text>
                        </View>
                        <View
                          className={cn(
                            'h-2 w-2 rounded-full',
                            area.error_log ? 'bg-red-500' : 'bg-green-500'
                          )}
                        />
                      </View>
                    ))}
                </CardContent>
              </Card>
            </View>
          )}
        </View>
      </ScrollView >
    </SafeAreaView >
  );
}

function ServiceCard({
  name,
  icon,
  useTint,
  connected,
  isDark,
}: {
  name: string;
  icon: ImageSourcePropType;
  useTint: boolean;
  connected: boolean;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.push('/(app)/account-setup')}
      className={cn(
        'border-border h-20 w-20 items-center justify-center rounded-2xl border',
        connected ? 'bg-card' : 'bg-muted/50 opacity-50'
      )}
    >
      <Image
        source={icon}
        className={cn('h-8 w-8', useTint && Platform.select({ web: 'dark:invert' }))}
        tintColor={Platform.select({
          native: useTint ? (isDark ? 'white' : 'black') : undefined,
        })}
      />
      <Text className="text-foreground mt-1 text-xs">{name}</Text>
      {connected && (
        <View className="bg-green-500 absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900" />
      )}
    </Pressable>
  );
}

function AreaCard({
  area,
  toggling,
  onToggle,
}: {
  area: Area;
  toggling: boolean;
  onToggle: () => void;
}) {
  const actionService = area.action.name.split('.')[0];
  const reactionServices = area.reactions.map((r) => r.name.split('.')[0]);

  return (
    <Card className="border-border">
      <CardContent className="flex-row items-center justify-between py-4">
        <View className="flex-1 pr-4">
          <Text className="text-foreground font-medium">{area.name}</Text>
          <Text className="text-muted-foreground text-xs">
            {actionService} → {reactionServices.join(', ')}
          </Text>
          {area.error_log && (
            <Text className="text-red-500 mt-1 text-xs" numberOfLines={1}>
              Error: {area.error_log}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-3">
          <View
            className={cn(
              'rounded-full px-2 py-1',
              area.is_active ? 'bg-green-500/10' : 'bg-muted'
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                area.is_active ? 'text-green-500' : 'text-muted-foreground'
              )}
            >
              {area.is_active ? 'Active' : 'Paused'}
            </Text>
          </View>
          {toggling ? (
            <ActivityIndicator size="small" />
          ) : (
            <Switch
              value={area.is_active}
              onValueChange={onToggle}
              trackColor={{ false: '#767577', true: '#22c55e' }}
              thumbColor={area.is_active ? '#fff' : '#f4f3f4'}
            />
          )}
        </View>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
