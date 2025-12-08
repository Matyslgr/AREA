import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICES = [
  {
    id: 'google',
    name: 'Google',
    description: 'Connect Gmail, Calendar, Drive',
    icon: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and issues',
    icon: { uri: 'https://img.clerk.com/static/github.png?width=160' },
    useTint: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect servers and channels',
    icon: { uri: 'https://img.clerk.com/static/discord.png?width=160' },
    useTint: false,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Connect playlists and music',
    icon: { uri: 'https://img.clerk.com/static/spotify.png?width=160' },
    useTint: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect pages and databases',
    icon: { uri: 'https://img.clerk.com/static/notion.png?width=160' },
    useTint: true,
  },
];

export default function AccountSetupScreen() {
  const { colorScheme } = useColorScheme();
  const [connectedServices, setConnectedServices] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<string | null>(null);

  async function connectService(serviceId: string) {
    setLoading(serviceId);
    // TODO: Implement OAuth connection with API
    setTimeout(() => {
      setConnectedServices((prev) => [...prev, serviceId]);
      setLoading(null);
    }, 1000);
  }

  function onContinue() {
    router.replace('/(app)/dashboard');
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          <View className="mb-8">
            <Text variant="h3" className="text-foreground mb-2 text-center">
              Connect your services
            </Text>
            <Text className="text-muted-foreground text-center">
              Link your favorite services to start creating automations
            </Text>
          </View>

          <View className="gap-3">
            {SERVICES.map((service) => {
              const isConnected = connectedServices.includes(service.id);
              const isLoading = loading === service.id;

              return (
                <Card key={service.id} className="border-border">
                  <Pressable
                    onPress={() => !isConnected && connectService(service.id)}
                    disabled={isConnected || isLoading}
                  >
                    <CardContent className="flex-row items-center gap-4 py-4">
                      <View className="bg-muted h-12 w-12 items-center justify-center rounded-xl">
                        <Image
                          source={service.icon}
                          className={cn(
                            'h-6 w-6',
                            service.useTint && Platform.select({ web: 'dark:invert' })
                          )}
                          tintColor={Platform.select({
                            native: service.useTint
                              ? colorScheme === 'dark'
                                ? 'white'
                                : 'black'
                              : undefined,
                          })}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold">{service.name}</Text>
                        <Text className="text-muted-foreground text-sm">{service.description}</Text>
                      </View>
                      <View>
                        {isConnected ? (
                          <View className="bg-primary/10 rounded-full px-3 py-1">
                            <Text className="text-primary text-xs font-medium">Connected</Text>
                          </View>
                        ) : isLoading ? (
                          <View className="bg-muted rounded-full px-3 py-1">
                            <Text className="text-muted-foreground text-xs font-medium">
                              Connecting...
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-secondary rounded-full px-3 py-1">
                            <Text className="text-secondary-foreground text-xs font-medium">
                              Connect
                            </Text>
                          </View>
                        )}
                      </View>
                    </CardContent>
                  </Pressable>
                </Card>
              );
            })}
          </View>

          <View className="mt-8 gap-4">
            <Button onPress={onContinue} size="lg" className="w-full">
              <Text className="text-primary-foreground font-semibold">
                {connectedServices.length > 0 ? 'Continue to Dashboard' : 'Skip for now'}
              </Text>
            </Button>
            {connectedServices.length === 0 && (
              <Text className="text-muted-foreground text-center text-sm">
                You can always connect services later from your dashboard
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
