import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/contexts/ThemeContext';
import { Area, areasApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';
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

const getServiceFromAction = (actionName: string): string => {
  if (actionName.startsWith('GITHUB_')) return 'github';
  if (actionName.startsWith('GOOGLE_')) return 'google';
  if (actionName.startsWith('GMAIL_')) return 'google';
  if (actionName.startsWith('DISCORD_')) return 'discord';
  if (actionName.startsWith('SPOTIFY_')) return 'spotify';
  if (actionName.startsWith('TWITCH_')) return 'twitch';
  if (actionName.startsWith('NOTION_')) return 'notion';
  if (actionName.startsWith('LINKEDIN_')) return 'linkedin';
  if (actionName.startsWith('TIMER_')) return 'timer';
  return 'unknown';
};

const serviceIcons: Record<string, ImageSourcePropType> = {
  github: require('../../../../assets/github.png'),
  google: require('../../../../assets/google.png'),
  spotify: require('../../../../assets/spotify.png'),
  twitch: require('../../../../assets/twitch.png'),
  notion: require('../../../../assets/notion.png'),
  linkedin: require('../../../../assets/linkedin.png'),
  timer: require('../../../../assets/icon.png'),
};

const serviceTints: Record<string, boolean> = {
  github: true,
  notion: true,
};

const formatActionName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AreaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();

  const [area, setArea] = React.useState<Area | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchArea();
    }
  }, [id]);

  const fetchArea = async () => {
    try {
      setLoading(true);
      const { data, error } = await areasApi.get(id!);
      if (data && !error) {
        setArea(data);
      } else {
        Alert.alert('Error', 'Failed to load AREA');
        router.back();
      }
    } catch (err) {
      console.error('Failed to fetch area:', err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!area) return;

    try {
      setToggling(true);
      const { error } = await areasApi.update(area.id, { is_active: !area.is_active });
      if (error) {
        Alert.alert('Error', 'Failed to toggle AREA status');
      } else {
        setArea({ ...area, is_active: !area.is_active });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle AREA status');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = () => {
    if (!area) return;

    Alert.alert(
      'Delete AREA',
      `Are you sure you want to delete "${area.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const { error } = await areasApi.delete(area.id);
              if (error) {
                Alert.alert('Error', 'Failed to delete AREA');
              } else {
                router.replace('/(app)/dashboard');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete AREA');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading area details...</Text>
      </SafeAreaView>
    );
  }

  if (!area) {
    return null;
  }

  const actionService = getServiceFromAction(area.action.name);

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-lg text-muted-foreground">Back to Dashboard</Text>
        </View>

        {/* Title and Status */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-2">
            <Text className="text-2xl font-bold text-foreground flex-1" numberOfLines={2}>
              {area.name}
            </Text>
            <View
              className={cn(
                'rounded-full px-3 py-1 border',
                area.is_active
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-zinc-500/10 border-zinc-500/30'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  area.is_active ? 'text-green-500' : 'text-zinc-500'
                )}
              >
                {area.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text className="text-muted-foreground">
            {area.last_executed_at
              ? `Last executed: ${new Date(area.last_executed_at).toLocaleString()}`
              : 'Never executed'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2 mb-6">
          <Button
            variant="outline"
            onPress={() => router.push(`/(app)/area/${id}/edit`)}
            className="flex-1 border-border"
          >
            <Text className="text-foreground">Edit</Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleToggleActive}
            disabled={toggling}
            className="flex-1 border-border"
          >
            <Text className="text-foreground">
              {toggling ? '...' : area.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleDelete}
            disabled={deleting}
            className="flex-1 border-red-500/30"
          >
            <Text className="text-red-500">{deleting ? '...' : 'Delete'}</Text>
          </Button>
        </View>

        {/* Action Card */}
        <Card className="mb-4 border-border bg-card">
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-amber-500/20 items-center justify-center">
                <Text className="text-2xl">⚡</Text>
              </View>
              <View>
                <CardTitle>Action</CardTitle>
                <Text className="text-sm text-muted-foreground">Trigger event</Text>
              </View>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Service */}
            <View className="flex-row items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              {actionService !== 'unknown' && (
                <View className="w-10 h-10 rounded-lg bg-background items-center justify-center border border-border">
                  <Image
                    source={serviceIcons[actionService] || require('../../../../assets/icon.png')}
                    className="w-6 h-6"
                    tintColor={Platform.select({
                      native: serviceTints[actionService]
                        ? isDark
                          ? 'white'
                          : 'black'
                        : undefined,
                    })}
                    resizeMode="contain"
                  />
                </View>
              )}
              <View>
                <Text className="text-xs text-muted-foreground">Service</Text>
                <Text className="font-semibold text-foreground capitalize">{actionService}</Text>
              </View>
            </View>

            {/* Action Type */}
            <View className="p-3 bg-secondary/50 rounded-lg">
              <Text className="text-xs text-muted-foreground mb-1">Action Type</Text>
              <Text className="font-medium text-foreground">{formatActionName(area.action.name)}</Text>
            </View>

            {/* Parameters */}
            {Object.keys(area.action.parameters).length > 0 && (
              <View className="p-3 bg-secondary/50 rounded-lg">
                <Text className="text-xs text-muted-foreground mb-2">Parameters</Text>
                {Object.entries(area.action.parameters).map(([key, value]) => (
                  <View key={key} className="flex-row justify-between py-1">
                    <Text className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</Text>
                    <Text className="text-foreground font-medium">{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Reactions Card */}
        <Card className="mb-4 border-border bg-card">
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-green-500/20 items-center justify-center">
                <Text className="text-2xl">🔄</Text>
              </View>
              <View>
                <CardTitle>
                  Reaction{area.reactions.length > 1 ? 's' : ''}
                </CardTitle>
                <Text className="text-sm text-muted-foreground">
                  {area.reactions.length} response{area.reactions.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {area.reactions.map((reaction, index) => {
              const reactionService = getServiceFromAction(reaction.name);
              return (
                <View
                  key={index}
                  className="p-4 bg-secondary/50 rounded-lg border border-border gap-3"
                >
                  {/* Service */}
                  <View className="flex-row items-center gap-3">
                    {reactionService !== 'unknown' && (
                      <View className="w-10 h-10 rounded-lg bg-background items-center justify-center border border-border">
                        <Image
                          source={serviceIcons[reactionService] || require('../../../../assets/icon.png')}
                          className="w-6 h-6"
                          tintColor={Platform.select({
                            native: serviceTints[reactionService]
                              ? isDark
                                ? 'white'
                                : 'black'
                              : undefined,
                          })}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    <View>
                      <Text className="text-xs text-muted-foreground">Service</Text>
                      <Text className="font-semibold text-foreground capitalize">{reactionService}</Text>
                    </View>
                  </View>

                  {/* Reaction Type */}
                  <View className="pt-3 border-t border-border">
                    <Text className="text-xs text-muted-foreground mb-1">Reaction Type</Text>
                    <Text className="font-medium text-foreground">{formatActionName(reaction.name)}</Text>
                  </View>

                  {/* Parameters */}
                  {Object.keys(reaction.parameters).length > 0 && (
                    <View className="pt-3 border-t border-border">
                      <Text className="text-xs text-muted-foreground mb-2">Parameters</Text>
                      {Object.entries(reaction.parameters).map(([key, value]) => (
                        <View key={key} className="flex-row justify-between py-1">
                          <Text className="text-muted-foreground capitalize flex-1">{key.replace(/_/g, ' ')}:</Text>
                          <Text className="text-foreground font-medium flex-1 text-right" numberOfLines={2}>
                            {String(value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </CardContent>
        </Card>

        {/* Error Log */}
        {area.error_log && (
          <Card className="mb-4 border-red-500/30 bg-red-500/10">
            <CardHeader>
              <CardTitle className="text-red-500">Error Log</CardTitle>
              <Text className="text-sm text-red-400">Last execution error</Text>
            </CardHeader>
            <CardContent>
              <View className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <Text className="text-red-300 text-sm font-mono">{area.error_log}</Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
