import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { Area, areasApi, authApi, OAuthAccount } from '@/lib/api';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const colors = getColors(isDark);

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

  // Toggle AREA active status
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
      } else {
        Alert.alert('Error', 'Failed to toggle AREA status');
      }
    } finally {
      setTogglingArea(null);
    }
  }

  // Delete AREA
  const handleDeleteArea = (id: string, name: string) => {
    Alert.alert(
      'Delete AREA',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await areasApi.delete(id);
              if (error) {
                Alert.alert('Error', 'Failed to delete AREA');
              } else {
                setAreas(prev => prev.filter(a => a.id !== id));
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete AREA');
            }
          },
        },
      ]
    );
  };

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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, marginTop: 16 }}>Loading your areas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View className="flex-1 px-6 py-6" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Welcome back,</Text>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: 'bold' }}>
                {user?.username || 'User'}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.push('/(app)/settings')}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.secondary }}
              >
                <Text>⚙️</Text>
              </Pressable>
              <Pressable
                onPress={onLogout}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.secondary }}
              >
                <Text>👋</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="mb-6 flex-row gap-3">
            <Card className="flex-1" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardContent className="items-center py-4">
                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>{areas.length}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }}>Total AREAs</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}>{activeAreasCount} active</Text>
              </CardContent>
            </Card>

            <Card className="flex-1" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardContent className="items-center py-4">
                <Text style={{ color: '#22c55e', fontSize: 24, fontWeight: 'bold' }}>{activePercentage}%</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }}>Active Rate</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}>% of total</Text>
              </CardContent>
            </Card>

            <Card className="flex-1" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardContent className="items-center py-4">
                <Text style={{ color: '#f97316', fontSize: 24, fontWeight: 'bold' }}>{totalReactions}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }}>Reactions</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}>Total</Text>
              </CardContent>
            </Card>
          </View>

          {/* Search & Quick Actions */}
          <View className="mb-6 gap-3">
            <View
              className="flex-row items-center gap-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: colors.mutedForeground }}>🔍</Text>
              <TextInput
                placeholder="Search areas..."
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1"
                style={{ color: colors.foreground }}
              />
            </View>

            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardContent className="flex-row gap-3 py-4">
                <Button variant="default" className="flex-1" onPress={() => router.push('/(app)/create-area')}>
                  <Text style={{ color: colors.primaryForeground, fontSize: 14 }}>+ New AREA</Text>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => router.push('/(app)/account-setup')}
                  style={{ borderColor: colors.border }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 14 }}>Connect Service</Text>
                </Button>
              </CardContent>
            </Card>
          </View>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Connected Services */}
          <View className="mb-6">
            <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}>Connected Services</Text>
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
                      colors={colors}
                    />
                  );
                })}
                <Pressable
                  onPress={() => router.push('/(app)/account-setup')}
                  className="h-20 w-20 items-center justify-center rounded-2xl border-dashed"
                  style={{ backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 }}
                >
                  <Text style={{ color: colors.mutedForeground, fontSize: 24 }}>+</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>

          {/* Areas List */}
          <View className="mb-6">
            <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}>Your Automation Workflows</Text>

            {filteredAreas.length === 0 ? (
              <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <CardContent className="items-center py-8">
                  <Text style={{ color: colors.mutedForeground, marginBottom: 8, fontSize: 32 }}>⚡</Text>
                  <Text style={{ color: colors.foreground, marginBottom: 4, fontWeight: '500' }}>
                    {searchQuery ? "No matching areas" : "No areas yet"}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, textAlign: 'center', fontSize: 14, paddingHorizontal: 16 }}>
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
                    onDelete={() => handleDeleteArea(area.id, area.name)}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceCard({
  name,
  icon,
  useTint,
  connected,
  isDark,
  colors,
}: {
  name: string;
  icon: ImageSourcePropType;
  useTint: boolean;
  connected: boolean;
  isDark: boolean;
  colors: ReturnType<typeof getColors>;
}) {
  return (
    <Pressable
      onPress={() => router.push('/(app)/account-setup')}
      className="h-20 w-20 items-center justify-center rounded-2xl"
      style={{
        backgroundColor: connected ? colors.card : colors.muted,
        borderColor: connected ? '#22c55e' : colors.border,
        borderWidth: connected ? 2 : 1,
        opacity: connected ? 1 : 0.5,
      }}
    >
      <Image
        source={icon}
        className="h-8 w-8"
        resizeMode="contain"
        tintColor={Platform.select({
          native: useTint ? (isDark ? 'white' : 'black') : undefined,
        })}
      />
      <Text style={{ color: colors.foreground, marginTop: 4, fontSize: 12 }}>{name}</Text>
      {connected && (
        <View
          className="absolute -right-1 -top-1 h-4 w-4 rounded-full items-center justify-center"
          style={{ backgroundColor: '#22c55e', borderWidth: 2, borderColor: colors.background }}
        >
          <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

function AreaCard({
  area,
  toggling,
  onToggle,
  onDelete,
  colors,
  isDark,
}: {
  area: Area;
  toggling: boolean;
  onToggle: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof getColors>;
  isDark: boolean;
}) {
  const getUniqueServices = (area: Area): string[] => {
    const services = new Set<string>();
    services.add(getServiceFromAction(area.action.name));
    area.reactions.forEach((reaction) => {
      services.add(getServiceFromAction(reaction.name));
    });
    return Array.from(services).filter((s) => s !== "unknown");
  };

  const uniqueServices = getUniqueServices(area);

  const handleLongPress = () => {
    Alert.alert(
      area.name,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: area.is_active ? 'Deactivate' : 'Activate',
          onPress: onToggle,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={() => router.push(`/(app)/area/${area.id}`)}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <CardContent className="py-4 space-y-3">
          {/* Header: Name and Status */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text style={{ color: colors.foreground, fontWeight: 'bold', fontSize: 18 }} numberOfLines={1}>
                {area.name}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                {area.action.name.split('.').pop()?.replace(/_/g, " ")}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={onToggle}
                className="rounded-full px-2 py-1"
                style={{
                  backgroundColor: area.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                  borderColor: area.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: area.is_active ? '#22c55e' : '#71717a',
                  }}
                >
                  {area.is_active ? 'Active' : 'Paused'}
                </Text>
              </Pressable>
              {toggling ? (
                <ActivityIndicator size="small" color={colors.primary} />
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
                className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }}
              >
                <Image
                  source={SERVICE_CONFIG[service]?.icon || require('../../assets/google.png')}
                  className="h-5 w-5"
                  resizeMode="contain"
                  tintColor={Platform.select({
                    native: SERVICE_CONFIG[service]?.useTint ? (isDark ? 'white' : 'black') : undefined,
                  })}
                />
              </View>
            ))}
          </View>

          {/* Footer: Reactions count and Date */}
          <View
            className="flex-row justify-between items-center pt-3 mt-1"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '500' }}>
              {area.reactions.length} reaction{area.reactions.length !== 1 ? "s" : ""}
            </Text>
            {area.last_executed_at && (
              <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
                Last run: {new Date(area.last_executed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
