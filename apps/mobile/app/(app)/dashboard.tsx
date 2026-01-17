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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- SERVICE UTILS ---

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

const getServiceFromAction = (actionName: string): string => {
  const name = actionName.toLowerCase();
  if (name.includes("github")) return "github";
  if (name.includes("google") || name.includes("gmail")) return "google";
  if (name.includes("discord")) return "discord";
  if (name.includes("spotify")) return "spotify";
  if (name.includes("twitch")) return "twitch";
  if (name.includes("notion")) return "notion";
  if (name.includes("linkedin")) return "linkedin";
  if (name.includes("timer")) return "timer";
  return "unknown";
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();

  // --- STATE ---
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [connectedAccounts, setConnectedAccounts] = React.useState<OAuthAccount[]>([]);
  const [filteredAreas, setFilteredAreas] = React.useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [togglingArea, setTogglingArea] = React.useState<string | null>(null);

  // --- FETCH LOGIC ---
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

  // --- FILTERING EFFECT ---
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(
        areas.filter((area) =>
          area.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, areas]);

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

  // --- CALCULATED STATS ---
  const connectedProviders = new Set(connectedAccounts.map((a) => a.provider));
  const activeAreasCount = areas.filter(area => area.is_active).length;
  const totalReactions = areas.reduce((sum, area) => sum + (area.reactions?.length || 0), 0);
  const activePercentage = areas.length > 0 ? Math.round((activeAreasCount / areas.length) * 100) : 0;

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading your areas...</Text>
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
            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">{areas.length}</Text>
                <Text className="text-muted-foreground text-xs text-center">Total AREAs</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">{activeAreasCount} active</Text>
              </CardContent>
            </Card>

            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-green-500 text-2xl font-bold">{activePercentage}%</Text>
                <Text className="text-muted-foreground text-xs text-center">Active Rate</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">% of total</Text>
              </CardContent>
            </Card>

            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-orange-500 text-2xl font-bold">{totalReactions}</Text>
                <Text className="text-muted-foreground text-xs text-center">Reactions</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">Total</Text>
              </CardContent>
            </Card>
          </View>

          {/* Search & Quick Actions */}
          <View className="mb-6 gap-3">
            <View className="flex-row items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3 border border-border">
              <Text className="text-muted-foreground">🔍</Text>
              <TextInput
                placeholder="Search areas..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-foreground"
              />
            </View>

            <Card className="border-border">
              <CardContent className="flex-row gap-3 py-4">
                <Button variant="default" className="flex-1" onPress={() => router.push('/(app)/create-area')}>
                  <Text className="text-primary-foreground text-sm">+ New AREA</Text>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => router.push('/(app)/account-setup')}
                >
                  <Text className="text-sm">Connect Service</Text>
                </Button>
              </CardContent>
            </Card>
          </View>

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

          {/* Areas List */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-3">Your Automation Workflows</Text>

            {filteredAreas.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="items-center py-8">
                  <Text className="text-muted-foreground mb-2 text-4xl">⚡</Text>
                  <Text className="text-foreground mb-1 font-medium">
                    {searchQuery ? "No matching areas" : "No areas yet"}
                  </Text>
                  <Text className="text-muted-foreground text-center text-sm px-4">
                    {searchQuery
                      ? `No areas matching "${searchQuery}"`
                      : "Create your first automation to get started with AREA"
                    }
                  </Text>
                </CardContent>
              </Card>
            ) : (
              <View className="gap-3">
                {filteredAreas.map((area) => (
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
  // Get unique services for iconography
  const getUniqueServices = (area: Area): string[] => {
    const services = new Set<string>();
    services.add(getServiceFromAction(area.action.name));
    area.reactions.forEach((reaction) => {
      services.add(getServiceFromAction(reaction.name));
    });
    return Array.from(services).filter((s) => s !== "unknown");
  };

  const uniqueServices = getUniqueServices(area);

  return (
    <Card className="border-border bg-card">
      <CardContent className="py-4 space-y-3">
        {/* Header: Name and Status */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-foreground font-bold text-lg" numberOfLines={1}>
              {area.name}
            </Text>
            <Text className="text-muted-foreground text-xs mt-1" numberOfLines={1}>
              {area.action.name.split('.').pop()?.replace(/_/g, " ")}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View
              className={cn(
                'rounded-full px-2 py-1 border',
                area.is_active
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-zinc-500/10 border-zinc-500/20'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  area.is_active ? 'text-green-500' : 'text-zinc-500'
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
        </View>

        {/* Icons Row */}
        <View className="flex-row flex-wrap gap-2">
          {uniqueServices.map((service) => (
            <View
              key={service}
              className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border"
            >
              <Image
                source={SERVICE_CONFIG[service]?.icon || require('../../assets/google.png')}
                className="h-5 w-5"
                resizeMode="contain"
              />
            </View>
          ))}
        </View>

        {/* Footer: Reactions count and Date */}
        <View className="flex-row justify-between items-center border-t border-border pt-3 mt-1">
          <Text className="text-muted-foreground text-xs font-medium">
            {area.reactions.length} reaction{area.reactions.length !== 1 ? "s" : ""}
          </Text>
          {area.last_executed_at && (
            <Text className="text-muted-foreground text-[10px]">
              Last run: {new Date(area.last_executed_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </CardContent>
    </Card>
  );
}