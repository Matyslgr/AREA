import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/contexts/ThemeContext';
import { Area, areasApi } from '@/lib/api';
// 👇 Import des couleurs
import { getColors } from '@/lib/theme-colors';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- CONFIGURATION ---

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

// --- COMPOSANTS HELPERS ---

const ServiceIcon = ({ service, isDark, colors }: { service: string; isDark: boolean, colors: any }) => {
  const iconSource = serviceIcons[service] || require('../../../../assets/icon.png');
  const shouldTint = serviceTints[service] || false;

  return (
    <View
      className="w-10 h-10 rounded-lg items-center justify-center border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
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

export default function EditAreaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  // 👇 Récupération des couleurs du thème
  const colors = getColors(isDark);

  const [area, setArea] = React.useState<Area | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const [areaName, setAreaName] = React.useState('');
  const [actionParams, setActionParams] = React.useState<Record<string, unknown>>({});
  const [reactionParams, setReactionParams] = React.useState<Record<string, unknown>>({});

  React.useEffect(() => {
    if (id) {
      fetchArea();
    }
  }, [id]);

  const fetchArea = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await areasApi.get(id!);
      if (data && !fetchError) {
        setArea(data);
        setAreaName(data.name);
        setActionParams(data.action.parameters || {});
        setReactionParams(data.reactions[0]?.parameters || {});
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

  const handleSave = async () => {
    if (!area || !id) return;

    if (!areaName.trim()) {
      setError('Please enter an AREA name');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const { error: updateError } = await areasApi.update(id, {
        name: areaName,
        action: {
          name: area.action.name,
          parameters: actionParams,
        },
        reactions: area.reactions.map((reaction, index) => ({
          name: reaction.name,
          parameters: index === 0 ? reactionParams : reaction.parameters,
        })),
      });

      if (updateError) {
        setError('Failed to update AREA');
      } else {
        Alert.alert('Success', 'AREA updated successfully', [
          { text: 'OK', onPress: () => router.replace(`/(app)/area/${id}`) },
        ]);
      }
    } catch (err) {
      console.error('Failed to update area:', err);
      setError('Failed to update AREA');
    } finally {
      setSaving(false);
    }
  };

  // Fonction Helper pour les inputs stylisés
  const renderParameterInput = (
    paramName: string,
    paramType: string,
    value: unknown,
    onChange: (val: unknown) => void
  ) => {
    if (paramType === 'boolean') {
      return (
        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground, textTransform: 'capitalize' }}>
            {paramName.replace(/_/g, ' ')}
          </Text>
          <Switch
            value={value as boolean || false}
            onValueChange={onChange}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#fff'}
          />
        </View>
      );
    }

    // Gestion commune pour string et number
    return (
      <View className="gap-2">
        <Label style={{ color: colors.foreground, textTransform: 'capitalize' }}>
          {paramName.replace(/_/g, ' ')}
        </Label>
        <Input
          keyboardType={paramType === 'number' ? 'numeric' : 'default'}
          value={String(value || '')}
          onChangeText={(text) => onChange(paramType === 'number' ? (Number(text) || 0) : text)}
          placeholder={`Enter ${paramName.replace(/_/g, ' ')}`}
          placeholderTextColor={colors.mutedForeground}
          style={{
            color: colors.foreground,
            borderColor: colors.border,
            backgroundColor: colors.background
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, marginTop: 16 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!area) {
    return null;
  }

  const actionService = getServiceFromAction(area.action.name);
  const reactionService = area.reactions.length > 0 ? getServiceFromAction(area.reactions[0].name) : 'unknown';

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable onPress={() => router.back()} className="p-2 mr-2 rounded-full active:opacity-70">
              <Text style={{ fontSize: 24, color: colors.foreground }}>←</Text>
            </Pressable>
            <Text style={{ fontSize: 18, color: colors.mutedForeground }}>Back to Details</Text>
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
              Edit {areaName || 'Untitled AREA'}
            </Text>
            <Text style={{ color: colors.mutedForeground }}>Modify your automation settings</Text>
          </View>

          {/* Error */}
          {error ? (
            <View className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <Text className="text-red-500">{error}</Text>
            </View>
          ) : null}

          {/* AREA Name */}
          <Card className="mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: colors.foreground }}>AREA Name</CardTitle>
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                Give your automation a descriptive name
              </Text>
            </CardHeader>
            <CardContent>
              <Input
                value={areaName}
                onChangeText={setAreaName}
                placeholder="e.g., GitHub Stars to Discord"
                placeholderTextColor={colors.mutedForeground}
                style={{
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.background
                }}
              />
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <CardHeader>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-lg bg-amber-500/20 items-center justify-center">
                  <Text className="text-2xl">⚡</Text>
                </View>
                <View className="flex-1">
                  <CardTitle style={{ color: colors.foreground }}>Action</CardTitle>
                  <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Configure trigger event</Text>
                </View>
              </View>
            </CardHeader>
            <CardContent className="gap-4">
              {/* Service Info */}
              <View
                className="flex-row items-center gap-3 p-3 rounded-lg border"
                style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
              >
                {actionService !== 'unknown' && (
                  <ServiceIcon service={actionService} isDark={isDark} colors={colors} />
                )}
                <View>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Service</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600', textTransform: 'capitalize' }}>{actionService}</Text>
                </View>
              </View>

              {/* Action Type */}
              <View
                className="p-3 rounded-lg border"
                style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Action Type</Text>
                <Text style={{ color: colors.foreground, fontWeight: '500' }}>{formatActionName(area.action.name)}</Text>
              </View>

              {/* Parameters */}
              {Object.keys(actionParams).length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', fontSize: 14 }}>No parameters to configure</Text>
              ) : (
                <View className="gap-3">
                  <Text style={{ color: colors.foreground, fontWeight: '500', fontSize: 14 }}>Parameters</Text>
                  {Object.entries(actionParams).map(([key, value]) => (
                    <View
                      key={key}
                      className="p-3 rounded-lg border"
                      style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
                    >
                      {renderParameterInput(
                        key,
                        typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
                        value,
                        (newVal) => setActionParams({ ...actionParams, [key]: newVal })
                      )}
                    </View>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>

          {/* Reaction Card */}
          {area.reactions.length > 0 && (
            <Card className="mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-lg bg-green-500/20 items-center justify-center">
                    <Text className="text-2xl">🔄</Text>
                  </View>
                  <View className="flex-1">
                    <CardTitle style={{ color: colors.foreground }}>Reaction</CardTitle>
                    <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Configure response action</Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent className="gap-4">
                {/* Service Info */}
                <View
                  className="flex-row items-center gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
                >
                  {reactionService !== 'unknown' && (
                    <ServiceIcon service={reactionService} isDark={isDark} colors={colors} />
                  )}
                  <View>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Service</Text>
                    <Text style={{ color: colors.foreground, fontWeight: '600', textTransform: 'capitalize' }}>{reactionService}</Text>
                  </View>
                </View>

                {/* Reaction Type */}
                <View
                  className="p-3 rounded-lg border"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Reaction Type</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '500' }}>
                    {formatActionName(area.reactions[0].name)}
                  </Text>
                </View>

                {/* Parameters */}
                {Object.keys(reactionParams).length === 0 ? (
                  <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', fontSize: 14 }}>No parameters to configure</Text>
                ) : (
                  <View className="gap-3">
                    <Text style={{ color: colors.foreground, fontWeight: '500', fontSize: 14 }}>Parameters</Text>
                    {Object.entries(reactionParams).map(([key, value]) => (
                      <View
                        key={key}
                        className="p-3 rounded-lg border"
                        style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
                      >
                        {renderParameterInput(
                          key,
                          typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
                          value,
                          (newVal) => setReactionParams({ ...reactionParams, [key]: newVal })
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2 mb-8">
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.foreground }}>Cancel</Text>
            </Button>
            <Button
              onPress={handleSave}
              disabled={saving}
              className="flex-1"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: colors.primaryForeground, fontWeight: '500' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}