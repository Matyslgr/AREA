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
    icon: require('../../assets/icon.png'),
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
      } else if (data?.accounts) {
        // Fallback to accounts array if linkedAccounts not present
        const accounts = data.accounts.map((acc) => ({
          id: acc.id,
          service: acc.provider,
          scopes: acc.scope?.split(' ') || [],
        }));
        console.log('[CreateArea] Parsed accounts (fallback):', accounts);
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

    if (service.id !== 'timer' && !account) {
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

    if (selectedActionService!.id !== 'timer' && action.scopes && action.scopes.length > 0) {
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

    if (selectedReactionService!.id !== 'timer' && reaction.scopes && reaction.scopes.length > 0) {
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
    setShowPermissionModal(false);
    const serviceId = services.find((s) => s.name === modalService)?.id;
    if (!serviceId) return;

    SecureStore.setItemAsync('oauth-redirect', '/(app)/create-area');

    const scopeParam = encodeURIComponent(modalScopes.join(' '))

    const response = await api.get<{ url: string }>(
      `/auth/oauth/authorize/${serviceId}?mode=connect&source=mobile&scope=${scopeParam}`
    )

    if (!response.data) {
      console.error('[CreateArea] Failed to get OAuth URL for additional scopes');
      return;
    }

    const url = response.data.url;

    const redirectUri = makeRedirectUri({
      scheme: 'area',
      path: 'oauth-callback'
    });

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

  const renderParameterInput = (
    param: ServiceAction['parameters'][0],
    value: unknown,
    onChange: (key: string, val: string | number | boolean) => void
  ) => {
    return (
      <View key={param.name} className="mb-4">
        <Label className="mb-2">
          {param.description}
          {param.required && <Text className="text-red-500"> *</Text>}
        </Label>
        {param.type === 'boolean' ? (
          <View className="flex-row items-center gap-2">
            <Switch
              value={value === true || value === 'true'}
              onValueChange={(val) => onChange(param.name, val)}
            />
            <Text className="text-muted-foreground">{value ? 'Yes' : 'No'}</Text>
          </View>
        ) : (
          <Input
            placeholder={`Enter ${param.description}`}
            value={String(value || '')}
            onChangeText={(text) => onChange(param.name, param.type === 'number' ? Number(text) : text)}
            keyboardType={param.type === 'number' ? 'numeric' : 'default'}
          />
        )}
        <Text className="text-xs text-muted-foreground mt-1">Type: {param.type}</Text>
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
                'w-10 h-10 rounded-full items-center justify-center',
                currentStep > step.number
                  ? 'bg-green-500'
                  : currentStep === step.number
                    ? 'bg-primary'
                    : 'bg-muted'
              )}
            >
              {currentStep > step.number ? (
                <Text className="text-white font-bold">✓</Text>
              ) : (
                <Text
                  className={cn(
                    'font-semibold',
                    currentStep === step.number ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text className="text-xs text-center mt-1 text-foreground" numberOfLines={1}>
              {step.title}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              className={cn(
                'h-1 flex-1 mx-1',
                currentStep > step.number ? 'bg-green-500' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="gap-6">
      <View>
        <Label className="mb-2">AREA Name</Label>
        <Input
          placeholder="e.g., Send me an email every day"
          value={areaName}
          onChangeText={setAreaName}
        />
      </View>

      <View>
        <Text className="text-base font-semibold mb-3">Action Service (Trigger)</Text>
        <View className="flex-row flex-wrap gap-3">
          {services
            .filter((s) => s.actions.length > 0)
            .map((service) => {
              const isLinked = getServiceAccount(service.id) || service.id === 'timer';
              const isSelected = selectedActionService?.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  onPress={() => handleServiceSelect(service, 'action')}
                  className={cn(
                    'w-[30%] p-3 rounded-lg border-2 items-center',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  )}
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
                  <Text className="text-sm font-medium text-center" numberOfLines={1}>
                    {service.name}
                  </Text>
                  {!isLinked && (
                    <View className="absolute top-1 right-1 bg-orange-100 dark:bg-orange-900 px-1.5 py-0.5 rounded">
                      <Text className="text-xs text-orange-600 dark:text-orange-300">Link</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
        </View>
      </View>

      <View>
        <Text className="text-base font-semibold mb-3">Reaction Service (Response)</Text>
        <View className="flex-row flex-wrap gap-3">
          {services
            .filter((s) => s.reactions.length > 0)
            .map((service) => {
              const isLinked = getServiceAccount(service.id) || service.id === 'timer';
              const isSelected = selectedReactionService?.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  onPress={() => handleServiceSelect(service, 'reaction')}
                  className={cn(
                    'w-[30%] p-3 rounded-lg border-2 items-center',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  )}
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
                  <Text className="text-sm font-medium text-center" numberOfLines={1}>
                    {service.name}
                  </Text>
                  {!isLinked && (
                    <View className="absolute top-1 right-1 bg-orange-100 dark:bg-orange-900 px-1.5 py-0.5 rounded">
                      <Text className="text-xs text-orange-600 dark:text-orange-300">Link</Text>
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
          <View className="flex-row items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
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
              <Text className="font-semibold">{selectedActionService.name} Actions</Text>
              <Text className="text-sm text-muted-foreground">Choose what triggers this automation</Text>
            </View>
          </View>

          <View className="gap-3">
            {selectedActionService.actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleActionSelect(action)}
                className={cn(
                  'p-4 rounded-lg border-2',
                  selectedAction?.id === action.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                )}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold">{action.name}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">{action.description}</Text>
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
            <View className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Text className="font-semibold mb-4">Configure Parameters</Text>
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
          <View className="flex-row items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
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
              <Text className="font-semibold">{selectedReactionService.name} Reactions</Text>
              <Text className="text-sm text-muted-foreground">Choose what happens when triggered</Text>
            </View>
          </View>

          <View className="gap-3">
            {selectedReactionService.reactions.map((reaction) => (
              <Pressable
                key={reaction.id}
                onPress={() => handleReactionSelect(reaction)}
                className={cn(
                  'p-4 rounded-lg border-2',
                  selectedReaction?.id === reaction.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                )}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold">{reaction.name}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">{reaction.description}</Text>
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
            <View className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Text className="font-semibold mb-4">Configure Parameters</Text>
              {selectedReaction.parameters.map((param) =>
                renderParameterInput(
                  param,
                  reactionParams[param.name],
                  (key, val) => setReactionParams({ ...reactionParams, [key]: val })
                )
              )}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="gap-6">
      <View className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <Text className="text-xl font-bold mb-4">{areaName}</Text>

        <View className="gap-3">
          <View className="p-3 bg-card rounded-lg">
            <Text className="text-sm font-semibold text-muted-foreground">WHEN</Text>
            <Text className="font-semibold">{selectedAction?.name}</Text>
            <Text className="text-sm text-muted-foreground">{selectedAction?.description}</Text>
            {Object.keys(actionParams).length > 0 && (
              <View className="mt-2">
                {Object.entries(actionParams).map(([key, value]) => (
                  <Text key={key} className="text-xs text-muted-foreground">
                    <Text className="font-medium">{key}:</Text> {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View className="p-3 bg-card rounded-lg">
            <Text className="text-sm font-semibold text-muted-foreground">THEN</Text>
            <Text className="font-semibold">{selectedReaction?.name}</Text>
            <Text className="text-sm text-muted-foreground">{selectedReaction?.description}</Text>
            {Object.keys(reactionParams).length > 0 && (
              <View className="mt-2">
                {Object.entries(reactionParams).map(([key, value]) => (
                  <Text key={key} className="text-xs text-muted-foreground">
                    <Text className="font-medium">{key}:</Text> {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <Text className="text-2xl">✓</Text>
        <Text className="text-sm text-yellow-800 dark:text-yellow-200 flex-1">
          Your AREA will be created as <Text className="font-bold">active</Text> and will start working immediately.
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
        <View className="bg-card w-full max-w-md rounded-xl p-6">
          <Text className="text-xl font-bold mb-2">Link Your {modalService} Account</Text>
          <Text className="text-muted-foreground mb-4">
            You need to link your {modalService} account to use this service in your AREAs.
          </Text>
          <Text className="text-sm text-muted-foreground mb-6">
            Linking your account allows AREA to perform actions on your behalf using {modalService}.
            You'll be redirected to {modalService} to authorize the connection.
          </Text>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setShowAccountModal(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleLinkAccount} disabled={oauthLoading}>
              <Text className="text-primary-foreground">
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
        <View className="bg-card w-full max-w-md rounded-xl p-6">
          <Text className="text-xl font-bold mb-2">Additional Permissions Required</Text>
          <Text className="text-muted-foreground mb-4">
            This {modalType} requires additional permissions from your {modalService} account.
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">The following permissions are needed:</Text>
          <View className="mb-6">
            {modalScopes.map((scope) => (
              <View key={scope} className="bg-muted p-2 rounded mb-1">
                <Text className="text-xs font-mono text-muted-foreground">{scope}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setShowPermissionModal(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleRequestPermissions} disabled={oauthLoading}>
              <Text className="text-primary-foreground">
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
        <ScrollView className="flex-1" contentContainerClassName="p-4" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
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
                    variant="outline"
                    onPress={() => router.back()}
                    className="border-red-300 dark:border-red-800"
                  >
                    <Text className="text-red-600 dark:text-red-400">Cancel</Text>
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

