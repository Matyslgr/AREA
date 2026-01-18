import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/contexts/ThemeContext';
import { Area, areasApi } from '@/lib/api';
import { getColors } from '@/lib/theme-colors';
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
  if (!actionName) return 'unknown';
  const name = actionName.toUpperCase();
  if (name.startsWith('GITHUB_')) return 'github';
  if (name.startsWith('GOOGLE_') || name.startsWith('GMAIL_')) return 'google';
  if (name.startsWith('DISCORD_')) return 'discord';
  if (name.startsWith('SPOTIFY_')) return 'spotify';
  if (name.startsWith('TWITCH_')) return 'twitch';
  if (name.startsWith('NOTION_')) return 'notion';
  if (name.startsWith('LINKEDIN_')) return 'linkedin';
  if (name.startsWith('TIMER_')) return 'timer';
  return 'tools';
};

const serviceIcons: Record<string, ImageSourcePropType> = {
  github: require('../../../../assets/github.png'),
  google: require('../../../../assets/google.png'),
  spotify: require('../../../../assets/spotify.png'),
  twitch: require('../../../../assets/twitch.png'),
  notion: require('../../../../assets/notion.png'),
  linkedin: require('../../../../assets/linkedin.png'),
  timer: require('../../../../assets/timer.png'),
  tools: require('../../../../assets/tools.png'),
};

const serviceTints: Record<string, boolean> = {
  github: true,
  notion: true,
  timer: true,
  tools: true,
};

const formatActionName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- COMPOSANT HELPER POUR L'ICON ---
const ServiceIcon = ({ service, isDark, colors }: { service: string; isDark: boolean, colors: any }) => {
  const iconSource = serviceIcons[service] || require('../../../../assets/icon.png');
  const shouldTint = serviceTints[service] || false;

  return (
    <View
      className="w-10 h-10 rounded-lg items-center justify-center border"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border
      }}
    >
      <Image
        source={iconSource}
        className="w-6 h-6"
        resizeMode="contain"
        tintColor={
          Platform.OS !== 'web' && shouldTint
            ? isDark
              ? 'white'
              : 'black'
            : undefined
        }
      />
    </View>
  );
};

// --- ECRAN PRINCIPAL ---

export default function AreaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, marginTop: 16 }}>Loading area details...</Text>
      </SafeAreaView>
    );
  }

  if (!area) {
    return null;
  }

  const actionService = getServiceFromAction(area.action.name);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 mr-2 rounded-full active:opacity-70">
            <Text style={{ fontSize: 24, color: colors.foreground }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 18, color: colors.mutedForeground }}>Back to Dashboard</Text>
        </View>

        {/* Title and Status */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-2">
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: 'bold', flex: 1 }} numberOfLines={2}>
              {area.name}
            </Text>
            <View
              className="rounded-full px-3 py-1 border"
              style={{
                backgroundColor: area.is_active ? 'rgba(34, 197, 94, 0.1)' : colors.muted,
                borderColor: area.is_active ? 'rgba(34, 197, 94, 0.3)' : colors.border
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: area.is_active ? '#22c55e' : colors.mutedForeground
                }}
              >
                {area.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.mutedForeground }}>
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
            className="flex-1"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.foreground }}>Edit</Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleToggleActive}
            disabled={toggling}
            className="flex-1"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.foreground }}>
              {toggling ? '...' : area.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleDelete}
            disabled={deleting}
            className="flex-1 border-red-500/30 bg-red-500/5"
          >
            <Text className="text-red-500">{deleting ? '...' : 'Delete'}</Text>
          </Button>
        </View>

        {/* Action Card */}
        <Card className="mb-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-amber-500/20 items-center justify-center">
                <Text className="text-2xl">⚡</Text>
              </View>
              <View>
                <CardTitle style={{ color: colors.foreground }}>Action</CardTitle>
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Trigger event</Text>
              </View>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Service */}
            <View className="flex-row items-center gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
              {actionService !== 'unknown' && (
                <ServiceIcon service={actionService} isDark={isDark} colors={colors} />
              )}
              <View>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Service</Text>
                <Text style={{ color: colors.foreground, fontWeight: '600', textTransform: 'capitalize' }}>{actionService}</Text>
              </View>
            </View>

            {/* Action Type */}
            <View className="p-3 rounded-lg border" style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Action Type</Text>
              <Text style={{ color: colors.foreground, fontWeight: '500' }}>{formatActionName(area.action.name)}</Text>
            </View>

            {/* Parameters */}
            {Object.keys(area.action.parameters).length > 0 && (
              <View className="p-3 rounded-lg border" style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 8 }}>Parameters</Text>
                {Object.entries(area.action.parameters).map(([key, value]) => (
                  <View key={key} className="flex-row justify-between py-1">
                    <Text style={{ color: colors.mutedForeground, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</Text>
                    <Text style={{ color: colors.foreground, fontWeight: '500' }}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Reactions Card */}
        <Card className="mb-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-green-500/20 items-center justify-center">
                <Text className="text-2xl">🔄</Text>
              </View>
              <View>
                <CardTitle style={{ color: colors.foreground }}>
                  Reaction{area.reactions.length > 1 ? 's' : ''}
                </CardTitle>
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
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
                  className="p-4 rounded-lg border gap-3"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
                >
                  {/* Service */}
                  <View className="flex-row items-center gap-3">
                    {reactionService !== 'unknown' && (
                      <ServiceIcon service={reactionService} isDark={isDark} colors={colors} />
                    )}
                    <View>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Service</Text>
                      <Text style={{ color: colors.foreground, fontWeight: '600', textTransform: 'capitalize' }}>{reactionService}</Text>
                    </View>
                  </View>

                  {/* Reaction Type */}
                  <View className="pt-3 border-t" style={{ borderColor: colors.border }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Reaction Type</Text>
                    <Text style={{ color: colors.foreground, fontWeight: '500' }}>{formatActionName(reaction.name)}</Text>
                  </View>

                  {/* Parameters */}
                  {Object.keys(reaction.parameters).length > 0 && (
                    <View className="pt-3 border-t" style={{ borderColor: colors.border }}>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 8 }}>Parameters</Text>
                      {Object.entries(reaction.parameters).map(([key, value]) => (
                        <View key={key} className="flex-row justify-between py-1">
                          <Text style={{ color: colors.mutedForeground, textTransform: 'capitalize', flex: 1 }}>{key.replace(/_/g, ' ')}:</Text>
                          <Text style={{ color: colors.foreground, fontWeight: '500', flex: 1, textAlign: 'right' }} numberOfLines={2}>
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
              <View className="p-3 rounded-lg border border-red-500/20" style={{ backgroundColor: colors.background }}>
                <Text className="text-red-300 text-sm font-mono">{area.error_log}</Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}