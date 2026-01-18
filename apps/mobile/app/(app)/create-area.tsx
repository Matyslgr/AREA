import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { getColors } from '@/lib/theme-colors';
import { api, authApi, areasApi, servicesApi, Service, ServiceAction, ServiceReaction } from '@/lib/api';
import { useOAuth } from '@/lib/oauth';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as React from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  timer: {
    name: 'Timer',
    icon: require('../../assets/timer.png'),
    useTint: false,
  },
  tools: {
    name: 'Tools',
    icon: require('../../assets/tools.png'),
    useTint: false,
  },
};

interface LinkedAccount {
  id: string;
  service: string;
  scopes: string[];
}

const STEPS = [
  { number: 1, title: 'Name & Services', description: 'Choose your AREA name and services' },
  { number: 2, title: 'Action', description: 'Select and configure the trigger' },
  { number: 3, title: 'Reaction', description: 'Select and configure the response' },
  { number: 4, title: 'Review', description: 'Confirm your automation' },
];

const STORAGE_KEY_FORM = 'area-creation-state';

interface SavedState {
  step: number;
  areaName: string;
  actionServiceId?: string;
  reactionServiceId?: string;
  actionId?: string;
  reactionId?: string;
  actionParams: Record<string, unknown>;
  reactionParams: Record<string, unknown>;
}

export default function CreateAreaScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { startOAuth, loading: oauthLoading } = useOAuth();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [services, setServices] = React.useState<Service[]>([]);
  const [linkedAccounts, setLinkedAccounts] = React.useState<LinkedAccount[]>([]);

  const [areaName, setAreaName] = React.useState('');
  const [selectedActionService, setSelectedActionService] = React.useState<Service | null>(null);
  const [selectedReactionService, setSelectedReactionService] = React.useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = React.useState<ServiceAction | null>(null);
  const [selectedReaction, setSelectedReaction] = React.useState<ServiceReaction | null>(null);
  const [actionParams, setActionParams] = React.useState<Record<string, unknown>>({});
  const [reactionParams, setReactionParams] = React.useState<Record<string, unknown>>({});

  const [showAccountModal, setShowAccountModal] = React.useState(false);
  const [showPermissionModal, setShowPermissionModal] = React.useState(false);
  const [modalService, setModalService] = React.useState('');
  const [modalScopes, setModalScopes] = React.useState<string[]>([]);
  const [modalType, setModalType] = React.useState<'action' | 'reaction'>('action');

  React.useEffect(() => {
    fetchServices();
    fetchLinkedAccounts();
  }, []);

  // Effect to restore saved form state
  React.useEffect(() => {
    const restoreState = async () => {
      // Only restore if services are loaded
      if (services.length === 0) return;

      try {
        const savedJson = await AsyncStorage.getItem(STORAGE_KEY_FORM);
        if (!savedJson) return;

        const saved: SavedState = JSON.parse(savedJson);
        console.log('[CreateArea] Restoring state:', saved);

        // Restore simple fields
        setAreaName(saved.areaName);
        setCurrentStep(saved.step);
        setActionParams(saved.actionParams || {});
        setReactionParams(saved.reactionParams || {});

        // Restore complex objects (mapping ID -> Object)
        if (saved.actionServiceId) {
          const s = services.find((x) => x.id === saved.actionServiceId);
          if (s) {
            setSelectedActionService(s);
            if (saved.actionId) {
              const a = s.actions.find((x) => x.id === saved.actionId);
              setSelectedAction(a || null);
            }
          }
        }

        if (saved.reactionServiceId) {
          const s = services.find((x) => x.id === saved.reactionServiceId);
          if (s) {
            setSelectedReactionService(s);
            if (saved.reactionId) {
              const r = s.reactions.find((x) => x.id === saved.reactionId);
              setSelectedReaction(r || null);
            }
          }
        }
      } catch (e) {
        console.error('[CreateArea] Failed to parse saved form state', e);
      }
    };

    restoreState();
  }, [services]); // Depend on services so we can map IDs to objects

  const saveFormState = async () => {
    try {
      const state: SavedState = {
        step: currentStep,
        areaName,
        actionServiceId: selectedActionService?.id,
        reactionServiceId: selectedReactionService?.id,
        actionId: selectedAction?.id,
        reactionId: selectedReaction?.id,
        actionParams,
        reactionParams,
      };
      await AsyncStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(state));
      console.log('[CreateArea] State saved to AsyncStorage');
    } catch (e) {
      console.error('[CreateArea] Failed to save state', e);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await servicesApi.list();
      if (data) {
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchLinkedAccounts = async () => {
    try {
      const { data } = await authApi.getAccount();
      console.log('[CreateArea] Account data received:', JSON.stringify(data, null, 2));

      if (data?.linkedAccounts) {
        // Use linkedAccounts from /auth/account endpoint (same as web)
        const accounts = data.linkedAccounts.map((acc) => ({
          id: acc.id,
          service: acc.provider,
          scopes: acc.scopes || [],
        }));
        console.log('[CreateArea] Parsed linkedAccounts:', accounts);
        setLinkedAccounts(accounts);
      }
    } catch (err) {
      console.error('Failed to fetch linked accounts:', err);
      setLinkedAccounts([]);
    }
  };

  const getServiceAccount = (serviceId: string) => {
    const account = linkedAccounts.find((acc) => acc.service.toLowerCase() === serviceId.toLowerCase());
    // console.log(`[CreateArea] getServiceAccount(${serviceId}):`, account ? `Found: ${account.service}` : 'Not found', 'Available:', linkedAccounts.map(a => a.service));
    return account;
  };

  const hasRequiredScopes = (serviceId: string, requiredScopes: string[]) => {
    if (!requiredScopes || requiredScopes.length === 0) return true;
    const account = getServiceAccount(serviceId);
    if (!account) return false;
    return requiredScopes.every((scope) => account.scopes.includes(scope));
  };

  const handleServiceSelect = (service: Service, type: 'action' | 'reaction') => {
    const account = getServiceAccount(service.id);

    if (service.is_oauth && !account) {
      setModalService(service.name);
      setModalType(type);
      setShowAccountModal(true);
      return;
    }

    if (type === 'action') {
      setSelectedActionService(service);
      setSelectedAction(null);
      setActionParams({});
    } else {
      setSelectedReactionService(service);
      setSelectedReaction(null);
      setReactionParams({});
    }
  };

  const handleActionSelect = (action: ServiceAction) => {
    const account = getServiceAccount(selectedActionService!.id);

    if (selectedActionService!.is_oauth && action.scopes && action.scopes.length > 0) {
      if (!account || !hasRequiredScopes(selectedActionService!.id, action.scopes)) {
        setModalService(selectedActionService!.name);
        setModalScopes(action.scopes);
        setModalType('action');
        setShowPermissionModal(true);
        return;
      }
    }

    setSelectedAction(action);
    setActionParams({});
  };

  const handleReactionSelect = (reaction: ServiceReaction) => {
    const account = getServiceAccount(selectedReactionService!.id);

    if (selectedReactionService!.is_oauth && reaction.scopes && reaction.scopes.length > 0) {
      if (!account || !hasRequiredScopes(selectedReactionService!.id, reaction.scopes)) {
        setModalService(selectedReactionService!.name);
        setModalScopes(reaction.scopes);
        setModalType('reaction');
        setShowPermissionModal(true);
        return;
      }
    }

    setSelectedReaction(reaction);
    setReactionParams({});
  };

  const handleLinkAccount = async () => {
    await saveFormState();
    setShowAccountModal(false);
    const serviceId = services.find((s) => s.name === modalService)?.id;
    if (!serviceId) return;

    const result = await startOAuth(serviceId, 'connect');
    if (result.success) {
      Alert.alert('Success', `${modalService} account connected successfully!`);
      await fetchLinkedAccounts();
    } else {
      Alert.alert('Error', result.error || 'Failed to link account');
    }
  };

  const handleRequestPermissions = async () => {
    await saveFormState();
    setShowPermissionModal(false);
    const serviceId = services.find((s) => s.name === modalService)?.id;
    if (!serviceId) return;

    SecureStore.setItemAsync('oauth-redirect', '/(app)/create-area');

    const scopeParam = encodeURIComponent(modalScopes.join(' '));

    const redirectUri = makeRedirectUri({
      scheme: 'area',
      path: 'oauth-callback'
    });

    const response = await api.get<{ url: string }>(
      `/auth/oauth/authorize/${serviceId}?mode=connect&source=mobile&scope=${scopeParam}&redirect=${encodeURIComponent(redirectUri)}`
    );

    if (!response.data) {
      console.error('[CreateArea] Failed to get OAuth URL for additional scopes');
      return;
    }

    const url = response.data.url;

    console.log('[CreateArea] Redirecting to OAuth URL for additional scopes:', url);
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      redirectUri
    );

    console.log('WebBrowser result:', result);

    if (result.type === 'success') {
      Alert.alert('Success', `Additional permissions granted for ${modalService}!`);
      await fetchLinkedAccounts();
    } else {
      Alert.alert('Error', result.type || 'Failed to get permissions');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && (!areaName || !selectedActionService || !selectedReactionService)) {
      setError('Please fill in all fields');
      return;
    }
    if (currentStep === 2) {
      if (!selectedAction) {
        setError('Please select an action');
        return;
      }
      if (selectedAction.parameters && selectedAction.parameters.length > 0) {
        for (const param of selectedAction.parameters) {
          if (param.required && (!actionParams[param.name] || String(actionParams[param.name]).trim() === '')) {
            setError(`Please fill in the required parameter: ${param.description}`);
            return;
          }
        }
      }
    }
    if (currentStep === 3) {
      if (!selectedReaction) {
        setError('Please select a reaction');
        return;
      }
      if (selectedReaction.parameters && selectedReaction.parameters.length > 0) {
        for (const param of selectedReaction.parameters) {
          if (param.required && (!reactionParams[param.name] || String(reactionParams[param.name]).trim() === '')) {
            setError(`Please fill in the required parameter: ${param.description}`);
            return;
          }
        }
      }
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const actionAccount = getServiceAccount(selectedActionService!.id);
      const reactionAccount = getServiceAccount(selectedReactionService!.id);

      const payload = {
        name: areaName,
        action: {
          name: selectedAction!.id,
          parameters: actionParams,
          ...(actionAccount && { accountId: actionAccount.id }),
        },
        reactions: [
          {
            name: selectedReaction!.id,
            parameters: reactionParams,
            ...(reactionAccount && { accountId: reactionAccount.id }),
          },
        ],
      };

      const { error: createError } = await areasApi.create(payload);

      if (createError) {
        setError(createError);
        return;
      }

      await AsyncStorage.removeItem(STORAGE_KEY_FORM);

      Alert.alert('Success', 'Your AREA has been created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(app)/dashboard') },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create AREA');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceId: string): ImageSourcePropType => {
    return SERVICE_CONFIG[serviceId]?.icon || require('../../assets/icon.png');
  };

  const getServiceTint = (serviceId: string): boolean => {
    return SERVICE_CONFIG[serviceId]?.useTint || false;
  };

  // Helper to insert a variable tag into a parameter
  const insertVariable = (paramName: string, tag: string, isAction: boolean) => {
    const currentParams = isAction ? actionParams : reactionParams;
    const currentValue = String(currentParams[paramName] || '');
    const newValue = currentValue ? currentValue + ' ' + tag : tag;

    if (isAction) {
      setActionParams({ ...actionParams, [paramName]: newValue });
    } else {
      setReactionParams({ ...reactionParams, [paramName]: newValue });
    }
  };

  // Variable pills component for ingredients
  const VariablePills = ({
    variables,
    paramName,
  }: {
    variables: { name: string; description: string }[];
    paramName: string;
  }) => {
    if (!variables || variables.length === 0) return null;

    return (
      <View className="mb-3 p-3 bg-indigo-500/10 dark:bg-indigo-900/20 rounded-lg border border-indigo-500/20">
        <Text className="text-xs font-semibold text-indigo-400 mb-2 uppercase">
          Available Ingredients (Tap to insert)
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {variables.map((v) => (
            <Pressable
              key={v.name}
              onPress={() => insertVariable(paramName, `{{${v.name}}}`, false)}
              className="bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-500/30"
            >
              <Text className="text-xs text-indigo-300">{v.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderParameterInput = (
    param: ServiceAction['parameters'][0],
    value: unknown,
    onChange: (key: string, val: string | number | boolean) => void,
    availableVariables?: { name: string; description: string }[]
  ) => {
    return (
      <View key={param.name} className="mb-4">
        <Label className="mb-2" style={{ color: colors.foreground }}>
          <Text style={{ color: colors.foreground }}>
            {param.description}
            {param.required && <Text className="text-red-500"> *</Text>}
          </Text>
        </Label>

        {/* Show variable pills for string parameters in reactions */}
        {availableVariables && param.type === 'string' && (
          <VariablePills variables={availableVariables} paramName={param.name} />
        )}

        {param.type === 'boolean' ? (
          <View className="flex-row items-center gap-2">
            <Switch
              value={value === true || value === 'true'}
              onValueChange={(val) => onChange(param.name, val)}
              trackColor={{ false: colors.muted, true: colors.primary }}
            />
            <Text style={{ color: colors.mutedForeground }}>{value ? 'Yes' : 'No'}</Text>
          </View>
        ) : (
          <Input
            placeholder={`Enter ${param.description}`}
            value={String(value || '')}
            onChangeText={(text) => onChange(param.name, param.type === 'number' ? Number(text) : text)}
            keyboardType={param.type === 'number' ? 'numeric' : 'default'}
          />
        )}
        <Text className="text-xs mt-1" style={{ color: colors.mutedForeground }}>Type: {param.type}</Text>
      </View>
    );
  };

  const renderStepper = () => (
    <View className="flex-row items-center justify-between mb-6 px-2">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.number}>
          <View className="items-center flex-1">
            <View
              className={cn(
                'w-10 h-10 rounded-full items-center justify-center'
              )}
              style={{
                backgroundColor: currentStep > step.number
                  ? '#22c55e'
                  : currentStep === step.number
                    ? colors.primary
                    : colors.muted
              }}
            >
              {currentStep > step.number ? (
                <Text className="text-white font-bold">✓</Text>
              ) : (
                <Text
                  className={cn(
                    'font-semibold'
                  )}
                  style={{
                    color: currentStep === step.number ? colors.primaryForeground : colors.mutedForeground
                  }}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text className="text-xs text-center mt-1" style={{ color: colors.foreground }} numberOfLines={1}>
              {step.title}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              className={cn(
                'h-1 flex-1 mx-1'
              )}
              style={{
                backgroundColor: currentStep > step.number ? '#22c55e' : colors.muted
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="gap-6">
      <View>
        <Label className="mb-2" style={{ color: colors.foreground }}>AREA Name</Label>
        <Input
          placeholder="e.g., Send me an email every day"
          value={areaName}
          onChangeText={setAreaName}
        />
      </View>

      <View>
        <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>Action Service (Trigger)</Text>
        <View className="flex-row flex-wrap gap-3">
          {services
            .filter((s) => s.actions.length > 0)
            .map((service) => {
              const isLinked = getServiceAccount(service.id) || !service.is_oauth;
              const isSelected = selectedActionService?.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  onPress={() => handleServiceSelect(service, 'action')}
                  className={cn(
                    'w-[30%] p-3 rounded-lg border-2 items-center'
                  )}
                  style={{
                    backgroundColor: isSelected ? (isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)') : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border
                  }}
                >
                  <Image
                    source={getServiceIcon(service.id)}
                    className="w-10 h-10 mb-2"
                    tintColor={
                      getServiceTint(service.id)
                        ? isDark
                          ? 'white'
                          : 'black'
                        : undefined
                    }
                  />
                  <Text className="text-sm font-medium text-center" style={{ color: colors.foreground }} numberOfLines={1}>
                    {service.name}
                  </Text>
                  {!isLinked && (
                    <View
                      className="absolute top-1 right-1 px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255, 237, 213, 1)' }}
                    >
                      <Text style={{ fontSize: 10, color: isDark ? '#fb923c' : '#ea580c' }}>Link</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
        </View>
      </View>

      <View>
        <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>Reaction Service (Response)</Text>
        <View className="flex-row flex-wrap gap-3">
          {services
            .filter((s) => s.reactions.length > 0)
            .map((service) => {
              const isLinked = getServiceAccount(service.id) || !service.is_oauth;
              const isSelected = selectedReactionService?.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  onPress={() => handleServiceSelect(service, 'reaction')}
                  className={cn(
                    'w-[30%] p-3 rounded-lg border-2 items-center'
                  )}
                  style={{
                    backgroundColor: isSelected ? (isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)') : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border
                  }}
                >
                  <Image
                    source={getServiceIcon(service.id)}
                    className="w-10 h-10 mb-2"
                    tintColor={
                      getServiceTint(service.id)
                        ? isDark
                          ? 'white'
                          : 'black'
                        : undefined
                    }
                  />
                  <Text className="text-sm font-medium text-center" style={{ color: colors.foreground }} numberOfLines={1}>
                    {service.name}
                  </Text>
                  {!isLinked && (
                    <View
                      className="absolute top-1 right-1 px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255, 237, 213, 1)' }}
                    >
                      <Text style={{ fontSize: 10, color: isDark ? '#fb923c' : '#ea580c' }}>Link</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="gap-4">
      {selectedActionService && (
        <>
          <View
            className="flex-row items-center gap-3 p-4 rounded-lg"
            style={{ backgroundColor: isDark ? 'rgba(30, 64, 175, 0.2)' : 'rgba(239, 246, 255, 1)' }}
          >
            <Image
              source={getServiceIcon(selectedActionService.id)}
              className="w-10 h-10"
              tintColor={
                getServiceTint(selectedActionService.id)
                  ? isDark
                    ? 'white'
                    : 'black'
                  : undefined
              }
            />
            <View>
              <Text className="font-semibold" style={{ color: colors.foreground }}>{selectedActionService.name} Actions</Text>
              <Text className="text-sm" style={{ color: colors.mutedForeground }}>Choose what triggers this automation</Text>
            </View>
          </View>

          <View className="gap-3">
            {selectedActionService.actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleActionSelect(action)}
                className={cn('p-4 rounded-lg border-2')}
                style={{
                  backgroundColor: selectedAction?.id === action.id ? (isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)') : colors.card,
                  borderColor: selectedAction?.id === action.id ? colors.primary : colors.border
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>{action.name}</Text>
                    <Text className="text-sm mt-1" style={{ color: colors.mutedForeground }}>{action.description}</Text>
                  </View>
                  {selectedAction?.id === action.id && (
                    <View className="bg-green-500 px-2 py-1 rounded">
                      <Text className="text-xs text-white font-medium">Selected</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {selectedAction && selectedAction.parameters.length > 0 && (
            <View
              className="mt-4 p-4 rounded-lg border"
              style={{
                backgroundColor: isDark ? 'rgba(30, 64, 175, 0.1)' : 'rgba(239, 246, 255, 1)',
                borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(191, 219, 254, 1)'
              }}
            >
              <Text className="font-semibold mb-4" style={{ color: colors.foreground }}>Configure Parameters</Text>
              {selectedAction.parameters.map((param) =>
                renderParameterInput(
                  param,
                  actionParams[param.name],
                  (key, val) => setActionParams({ ...actionParams, [key]: val })
                )
              )}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View className="gap-4">
      {selectedReactionService && (
        <>
          <View
            className="flex-row items-center gap-3 p-4 rounded-lg"
            style={{ backgroundColor: isDark ? 'rgba(154, 52, 18, 0.2)' : 'rgba(255, 247, 237, 1)' }}
          >
            <Image
              source={getServiceIcon(selectedReactionService.id)}
              className="w-10 h-10"
              tintColor={
                getServiceTint(selectedReactionService.id)
                  ? isDark
                    ? 'white'
                    : 'black'
                  : undefined
              }
            />
            <View>
              <Text className="font-semibold" style={{ color: colors.foreground }}>{selectedReactionService.name} Reactions</Text>
              <Text className="text-sm" style={{ color: colors.mutedForeground }}>Choose what happens when triggered</Text>
            </View>
          </View>

          <View className="gap-3">
            {selectedReactionService.reactions.map((reaction) => (
              <Pressable
                key={reaction.id}
                onPress={() => handleReactionSelect(reaction)}
                className={cn('p-4 rounded-lg border-2')}
                style={{
                  backgroundColor: selectedReaction?.id === reaction.id ? (isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)') : colors.card,
                  borderColor: selectedReaction?.id === reaction.id ? colors.primary : colors.border
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>{reaction.name}</Text>
                    <Text className="text-sm mt-1" style={{ color: colors.mutedForeground }}>{reaction.description}</Text>
                  </View>
                  {selectedReaction?.id === reaction.id && (
                    <View className="bg-green-500 px-2 py-1 rounded">
                      <Text className="text-xs text-white font-medium">Selected</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {selectedReaction && selectedReaction.parameters.length > 0 && (
            <View
              className="mt-4 p-4 rounded-lg border"
              style={{
                backgroundColor: isDark ? 'rgba(154, 52, 18, 0.1)' : 'rgba(255, 247, 237, 1)',
                borderColor: isDark ? 'rgba(154, 52, 18, 0.3)' : 'rgba(255, 187, 153, 1)'
              }}
            >
              <Text className="font-semibold mb-4" style={{ color: colors.foreground }}>Configure Parameters</Text>
              {(() => {
                // Get available variables from the selected action's return values
                const actionVariables = selectedAction?.return_values || [];
                return selectedReaction.parameters.map((param) =>
                  renderParameterInput(
                    param,
                    reactionParams[param.name],
                    (key, val) => setReactionParams({ ...reactionParams, [key]: val }),
                    actionVariables
                  )
                );
              })()}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="gap-6">
      <View
        className="p-6 rounded-lg"
        style={{ backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(245, 243, 255, 1)' }}
      >
        <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>{areaName}</Text>

        <View className="gap-3">
          <View className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }}>
            <Text className="text-sm font-semibold" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>WHEN</Text>
            <Text className="font-semibold" style={{ color: isDark ? '#fafafa' : '#000000' }}>{selectedAction?.name}</Text>
            <Text className="text-sm" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>{selectedAction?.description}</Text>
            {Object.keys(actionParams).length > 0 && (
              <View className="mt-2">
                {Object.entries(actionParams).map(([key, value]) => (
                  <Text key={key} className="text-xs" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>
                    <Text className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>{key}:</Text> {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: isDark ? '#27272a' : '#e4e4e7', borderWidth: 1 }}>
            <Text className="text-sm font-semibold" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>THEN</Text>
            <Text className="font-semibold" style={{ color: isDark ? '#fafafa' : '#000000' }}>{selectedReaction?.name}</Text>
            <Text className="text-sm" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>{selectedReaction?.description}</Text>
            {Object.keys(reactionParams).length > 0 && (
              <View className="mt-2">
                {Object.entries(reactionParams).map(([key, value]) => (
                  <Text key={key} className="text-xs" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>
                    <Text className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#52525b' }}>{key}:</Text> {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View
        className="flex-row items-center gap-2 p-4 border rounded-lg"
        style={{
          backgroundColor: isDark ? 'rgba(71, 65, 12, 0.2)' : 'rgba(254, 252, 232, 1)',
          borderColor: isDark ? 'rgba(71, 65, 12, 0.5)' : 'rgba(254, 240, 138, 1)'
        }}
      >
        <Text className="text-2xl" style={{ color: isDark ? '#fef08a' : '#854d0e' }}>✓</Text>
        <Text className="text-sm flex-1" style={{ color: isDark ? '#fef08a' : '#854d0e' }}>
          Your AREA will be created as <Text className="font-bold" style={{ color: isDark ? '#fef08a' : '#854d0e' }}>active</Text> and will start working immediately.
        </Text>
      </View>
    </View>
  );

  const renderAccountModal = () => (
    <Modal
      visible={showAccountModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAccountModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-xl font-bold mb-2" style={{ color: colors.foreground }}>Link Your {modalService} Account</Text>
          <Text className="text-muted-foreground mb-4" style={{ color: colors.mutedForeground }}>
            You need to link your {modalService} account to use this service in your AREAs.
          </Text>
          <Text className="text-sm mb-6" style={{ color: colors.mutedForeground }}>
            Linking your account allows AREA to perform actions on your behalf using {modalService}.
            You'll be redirected to {modalService} to authorize the connection.
          </Text>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setShowAccountModal(false)}
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: colors.foreground }}>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleLinkAccount} disabled={oauthLoading}>
              <Text style={{ color: colors.primaryForeground }}>
                {oauthLoading ? 'Linking...' : 'Link Account'}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPermissionModal = () => (
    <Modal
      visible={showPermissionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-xl font-bold mb-2" style={{ color: colors.foreground }}>Additional Permissions Required</Text>
          <Text className="text-muted-foreground mb-4" style={{ color: colors.mutedForeground }}>
            This {modalType} requires additional permissions from your {modalService} account.
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.mutedForeground }}>The following permissions are needed:</Text>
          <View className="mb-6">
            {modalScopes.map((scope) => (
              <View key={scope} className="p-2 rounded mb-1" style={{ backgroundColor: isDark ? '#27272a' : '#e4e4e7' }}>
                <Text className="text-xs font-mono" style={{ color: isDark ? '#fafafa' : '#000000' }}>{scope}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setShowPermissionModal(false)}
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: colors.foreground }}>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleRequestPermissions} disabled={oauthLoading}>
              <Text style={{ color: colors.primaryForeground }}>
                {oauthLoading ? 'Requesting...' : 'Grant Permissions'}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="p-4 pt-2" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => router.back()} className="p-2">
              <Text style={{ fontSize: 24, color: colors.foreground }}>←</Text>
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>Create AREA</Text>
            <View className="w-10" />
          </View>

          {/* Stepper */}
          {renderStepper()}

          {/* Main Card */}
          <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: colors.foreground }}>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription style={{ color: colors.mutedForeground }}>{STEPS[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Message */}
              {error ? (
                <View
                  className="flex-row items-center gap-2 p-3 rounded-lg mb-4"
                  style={{ backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 226, 226, 1)', borderColor: isDark ? 'rgba(220, 38, 38, 0.5)' : 'rgba(254, 202, 202, 1)', borderWidth: 1 }}
                >
                  <Text style={{ color: isDark ? '#f87171' : '#dc2626' }}>⚠</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#fecaca' : '#991b1b', flex: 1 }}>{error}</Text>
                </View>
              ) : null}

              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Navigation */}
              <View
                className="flex-row items-center justify-between pt-6 mt-6"
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
              >
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    onPress={handleBack}
                    disabled={currentStep === 1}
                    style={{ borderColor: colors.border }}
                  >
                    <Text style={{ color: currentStep === 1 ? colors.mutedForeground : colors.foreground }}>← Back</Text>
                  </Button>
                  <Button
                    variant="destructive"
                    onPress={async () => {
                      await AsyncStorage.removeItem(STORAGE_KEY_FORM);
                      router.back();
                    }}
                  >
                    <Text className="text-white">Cancel</Text>
                  </Button>
                </View>

                {currentStep < 4 ? (
                  <Button onPress={handleNext}>
                    <Text className="text-primary-foreground">Next →</Text>
                  </Button>
                ) : (
                  <Button
                    onPress={handleSubmit}
                    disabled={loading}
                    className="bg-green-600"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white">Create ✓</Text>
                    )}
                  </Button>
                )}
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      {renderAccountModal()}
      {renderPermissionModal()}
    </SafeAreaView>
  );
}

