import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Area, areasApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
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

export default function EditAreaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();

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

  const renderParameterInput = (
    paramName: string,
    paramType: string,
    value: unknown,
    onChange: (val: unknown) => void
  ) => {
    if (paramType === 'boolean') {
      return (
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground capitalize">{paramName.replace(/_/g, ' ')}</Text>
          <Switch
            value={value as boolean || false}
            onValueChange={onChange}
          />
        </View>
      );
    }

    if (paramType === 'number') {
      return (
        <View className="gap-2">
          <Label className="capitalize">{paramName.replace(/_/g, ' ')}</Label>
          <Input
            keyboardType="numeric"
            value={String(value || '')}
            onChangeText={(text) => onChange(Number(text) || 0)}
            placeholder={`Enter ${paramName.replace(/_/g, ' ')}`}
          />
        </View>
      );
    }

    return (
      <View className="gap-2">
        <Label className="capitalize">{paramName.replace(/_/g, ' ')}</Label>
        <Input
          value={String(value || '')}
          onChangeText={onChange}
          placeholder={`Enter ${paramName.replace(/_/g, ' ')}`}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!area) {
    return null;
  }

  const actionService = getServiceFromAction(area.action.name);
  const reactionService = area.reactions.length > 0 ? getServiceFromAction(area.reactions[0].name) : 'unknown';

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable onPress={() => router.back()} className="p-2 mr-2">
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-lg text-muted-foreground">Back to Details</Text>
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-1">
              Edit {areaName || 'Untitled AREA'}
            </Text>
            <Text className="text-muted-foreground">Modify your automation settings</Text>
          </View>

          {/* Error */}
          {error ? (
            <View className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <Text className="text-red-500">{error}</Text>
            </View>
          ) : null}

          {/* AREA Name */}
          <Card className="mb-4 border-border bg-card">
            <CardHeader>
              <CardTitle>AREA Name</CardTitle>
              <Text className="text-sm text-muted-foreground">
                Give your automation a descriptive name
              </Text>
            </CardHeader>
            <CardContent>
              <Input
                value={areaName}
                onChangeText={setAreaName}
                placeholder="e.g., GitHub Stars to Discord"
              />
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="mb-4 border-border bg-card">
            <CardHeader>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-lg bg-amber-500/20 items-center justify-center">
                  <Text className="text-2xl">⚡</Text>
                </View>
                <View className="flex-1">
                  <CardTitle>Action</CardTitle>
                  <Text className="text-sm text-muted-foreground">Configure trigger event</Text>
                </View>
              </View>
            </CardHeader>
            <CardContent className="gap-4">
              {/* Service Info */}
              <View className="flex-row items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                {actionService !== 'unknown' && (
                  <View className="w-10 h-10 rounded-lg bg-background items-center justify-center border border-border">
                    <Image
                      source={serviceIcons[actionService] || require('../../../../assets/icon.png')}
                      className="w-6 h-6"
                      tintColor={
                        serviceTints[actionService]
                          ? colorScheme === 'dark'
                            ? 'white'
                            : 'black'
                          : undefined
                      }
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
              <View className="p-3 bg-secondary/30 rounded-lg">
                <Text className="text-xs text-muted-foreground mb-1">Action Type</Text>
                <Text className="font-medium text-foreground">{formatActionName(area.action.name)}</Text>
              </View>

              {/* Parameters */}
              {Object.keys(actionParams).length === 0 ? (
                <Text className="text-sm text-muted-foreground italic">No parameters to configure</Text>
              ) : (
                <View className="gap-3">
                  <Text className="text-sm font-medium text-foreground">Parameters</Text>
                  {Object.entries(actionParams).map(([key, value]) => (
                    <View key={key} className="p-3 bg-secondary/50 rounded-lg border border-border">
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
            <Card className="mb-4 border-border bg-card">
              <CardHeader>
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-lg bg-green-500/20 items-center justify-center">
                    <Text className="text-2xl">🔄</Text>
                  </View>
                  <View className="flex-1">
                    <CardTitle>Reaction</CardTitle>
                    <Text className="text-sm text-muted-foreground">Configure response action</Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent className="gap-4">
                {/* Service Info */}
                <View className="flex-row items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  {reactionService !== 'unknown' && (
                    <View className="w-10 h-10 rounded-lg bg-background items-center justify-center border border-border">
                      <Image
                        source={serviceIcons[reactionService] || require('../../../../assets/icon.png')}
                        className="w-6 h-6"
                        tintColor={
                          serviceTints[reactionService]
                            ? colorScheme === 'dark'
                              ? 'white'
                              : 'black'
                            : undefined
                        }
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
                <View className="p-3 bg-secondary/30 rounded-lg">
                  <Text className="text-xs text-muted-foreground mb-1">Reaction Type</Text>
                  <Text className="font-medium text-foreground">
                    {formatActionName(area.reactions[0].name)}
                  </Text>
                </View>

                {/* Parameters */}
                {Object.keys(reactionParams).length === 0 ? (
                  <Text className="text-sm text-muted-foreground italic">No parameters to configure</Text>
                ) : (
                  <View className="gap-3">
                    <Text className="text-sm font-medium text-foreground">Parameters</Text>
                    {Object.entries(reactionParams).map(([key, value]) => (
                      <View key={key} className="p-3 bg-secondary/50 rounded-lg border border-border">
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
              className="flex-1 border-border"
            >
              <Text className="text-foreground">Cancel</Text>
            </Button>
            <Button
              onPress={handleSave}
              disabled={saving}
              className="flex-1 bg-primary"
            >
              <Text className="text-primary-foreground font-medium">
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
