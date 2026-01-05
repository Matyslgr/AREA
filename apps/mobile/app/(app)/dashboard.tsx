import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Area, areasApi } from '@/lib/api';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- LOGIC PORTED FROM WEB ---

const getServiceFromAction = (actionName: string): string => {
  if (actionName.startsWith("GITHUB_")) return "github";
  if (actionName.startsWith("GOOGLE_")) return "google";
  if (actionName.startsWith("GMAIL_")) return "google";
  if (actionName.startsWith("DISCORD_")) return "discord";
  if (actionName.startsWith("SPOTIFY_")) return "spotify";
  if (actionName.startsWith("TWITCH_")) return "twitch";
  if (actionName.startsWith("NOTION_")) return "notion";
  if (actionName.startsWith("LINKEDIN_")) return "linkedin";
  if (actionName.startsWith("TIMER_")) return "timer";
  return "unknown";
};

// Mapping for local assets instead of string URLs
const serviceIcons: Record<string, ImageSourcePropType> = {
  github: require('../../assets/github.png'),
  google: require('../../assets/google.png'),
  spotify: require('../../assets/spotify.png'),
  twitch: require('../../assets/twitch.png'),
  notion: require('../../assets/notion.png'),
  linkedin: require('../../assets/linkedin.png'),
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();

  // --- STATE ---
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = React.useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // --- FETCH LOGIC (Matches Web fetchAreas) ---
  const fetchAreas = React.useCallback(async () => {
    try {
      const response = await areasApi.list();
      if (response.data) {
        setAreas(response.data);
        if (searchQuery.trim() === "") {
          setFilteredAreas(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    fetchAreas();
  }, []);

  // --- FILTERING EFFECT (Matches Web useEffect) ---
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
    fetchAreas();
  }, [fetchAreas]);

  // --- ACTIONS ---
  function toggleTheme() {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }

  async function onLogout() {
    await signOut();
  }

  // --- CALCULATED STATS (Matches Web Logic) ---
  const activeAreasCount = areas.filter(area => area.is_active).length;
  const totalReactions = areas.reduce((sum, area) => sum + area.reactions.length, 0);
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

          {/* Stats Cards (Matches Web Stats) */}
          <View className="mb-6 flex-row gap-3">
            {/* Total AREAs */}
            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-primary text-2xl font-bold">{areas.length}</Text>
                <Text className="text-muted-foreground text-xs text-center">Total AREAs</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">{activeAreasCount} active</Text>
              </CardContent>
            </Card>

            {/* Active Percentage */}
            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-green-500 text-2xl font-bold">{activePercentage}%</Text>
                <Text className="text-muted-foreground text-xs text-center">Active Rate</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">% of total</Text>
              </CardContent>
            </Card>

            {/* Total Reactions */}
            <Card className="border-border flex-1 bg-card">
              <CardContent className="items-center py-4">
                <Text className="text-orange-500 text-2xl font-bold">{totalReactions}</Text>
                <Text className="text-muted-foreground text-xs text-center">Reactions</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">Total</Text>
              </CardContent>
            </Card>
          </View>

          {/* Search & Create (Matches Web Controls) */}
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

            <Button
              className="bg-primary w-full"
              onPress={() => router.push('/(app)/create-area')}
            >
              <Text className="text-primary-foreground font-semibold">+ Create AREA</Text>
            </Button>
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
                  <AreaCard key={area.id} area={area} colorScheme={colorScheme} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- UPDATED CARD LOGIC ---

function AreaCard({ area, colorScheme }: { area: Area, colorScheme: 'light' | 'dark' | undefined }) {
  // Logic from Web: getUniqueServices
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
    <Pressable onPress={() => { /* Navigate to detail if needed */ }}>
      <Card className="border-border bg-card">
        <CardContent className="py-4 space-y-3">
          {/* Header: Name and Status */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-foreground font-bold text-lg" numberOfLines={1}>
                {area.name}
              </Text>
              <Text className="text-muted-foreground text-xs mt-1" numberOfLines={1}>
                {area.action.name.replace(/_/g, " ")}
              </Text>
            </View>

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
                {area.is_active ? 'Active' : 'Inactive'}
              </Text>
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
                  source={serviceIcons[service] || require('../../assets/google.png')} // Fallback icon
                  className={cn('h-5 w-5',
                    // Optional: tint Logic if needed, similar to Web might not need it for logos
                    // keeping it simple
                  )}
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
    </Pressable>
  );
}