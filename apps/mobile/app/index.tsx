import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { Link } from 'expo-router';
import * as React from 'react';
import { ServerConfigModal } from '@/components/server-config-modal';
import { ServerInfoModal } from '@/components/server-info-modal';
import { resetApiUrl, getApiUrl } from '@/lib/api';
import * as Updates from 'expo-updates';
import {
  Image,
  Platform,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const heroDiscord = require('../assets/yt_discord_hero.png');
const heroYoutube = require('../assets/yt_gmail_hero.png');

const SERVICES = [
  { id: 'google', name: 'Google', icon: require('../assets/google.png'), useTint: false },
  { id: 'github', name: 'GitHub', icon: require('../assets/github.png'), useTint: true },
  { id: 'spotify', name: 'Spotify', icon: require('../assets/spotify.png'), useTint: false },
  { id: 'notion', name: 'Notion', icon: require('../assets/notion.png'), useTint: true },
  { id: 'linkedin', name: 'LinkedIn', icon: require('../assets/linkedin.png'), useTint: false },
  { id: 'twitch', name: 'Twitch', icon: require('../assets/twitch.png'), useTint: false },
];

export default function HomePage() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const [isConfiguring, setIsConfiguring] = React.useState(false);
  const [showServerInfo, setShowServerInfo] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [currentUrl, setCurrentUrl] = React.useState<string>('');

  React.useEffect(() => {
    async function checkServerConfig() {
      try {
        const url = await getApiUrl();
        setCurrentUrl(url || '');
        console.log('[HomePage] Current Server URL:', url);

        if (!url || (url.includes('localhost') && Platform.OS !== 'web')) {
          setIsConfiguring(true);
        }
      } catch (error) {
        console.error('Failed to check server config', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkServerConfig();
  }, []);

  const handleReset = async () => {
    setShowServerInfo(false);
    await resetApiUrl();
    setIsConfiguring(true);
    await Updates.reloadAsync();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ServerConfigModal
        visible={isConfiguring}
        onSave={() => {
          setIsConfiguring(false);
          // Mettre à jour l'URL affichée
          getApiUrl().then(url => setCurrentUrl(url || ''));
        }}
      />

      <ServerInfoModal
        visible={showServerInfo}
        currentUrl={currentUrl}
        onClose={() => setShowServerInfo(false)}
        onReset={handleReset}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-6 relative">

          <View className="absolute top-4 right-6 z-10">
            <TouchableOpacity
              onPress={() => setShowServerInfo(true)}
              className="h-10 w-10 items-center justify-center rounded-full shadow-sm active:opacity-70"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#404040', borderWidth: 1 }}
            >
              <Text className="text-lg">⚙️</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mb-4">
            <View className="bg-primary/10 h-20 w-20 items-center justify-center rounded-3xl mb-4">
              <Text className="text-primary text-4xl font-bold">A</Text>
            </View>
            <Text variant="h1" className="text-foreground text-3xl font-bold">
              Welcome to AREA
            </Text>
          </View>

          {/* Hero Description */}
          <Text style={{ color: isDark ? '#d4d4d8' : '#52525b', textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 24 }}>
            Automate your workflow by linking the accounts of your favorite apps and services.
            Create powerful integrations between different platforms to save time and boost productivity.
          </Text>

          {/* Hero Images */}
          <View className="flex-row justify-center items-center gap-4 mb-8">
            <Image
              source={heroDiscord}
              className="w-36 h-24 rounded-xl"
              resizeMode="cover"
            />
            <Image
              source={heroYoutube}
              className="w-36 h-24 rounded-xl"
              resizeMode="cover"
            />
          </View>

          {/* CTA Buttons */}
          <View className="gap-3 mb-4">
            <Link href="/(auth)/sign-in" asChild>
              <Button size="lg" className="w-full">
                <Text className="text-primary-foreground font-semibold text-base">
                  Sign In
                </Text>
              </Button>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <Button size="lg" className="w-full" style={{ backgroundColor: '#6b21a8' }}>
                <Text className="text-primary-foreground font-semibold text-base">Create Account</Text>
              </Button>
            </Link>
          </View>
        </View>

        {/* Services Section */}
        <View className="px-6 py-6">
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
            Available Services
          </Text>
          <Text style={{ color: isDark ? '#d4d4d8' : '#52525b', textAlign: 'center', fontSize: 14, marginBottom: 24 }}>
            Connect with your favorite platforms
          </Text>

          <View className="flex-row flex-wrap justify-center gap-4">
            {SERVICES.map((service) => (
              <View
                key={service.id}
                className="items-center"
                style={{ width: '30%' }}
              >
                <View className="border border-border h-16 w-16 items-center justify-center rounded-2xl mb-2" style={{ backgroundColor: isDark ? '#27272a' : '#f5f5f5' }}>
                  <Image
                    source={service.icon}
                    className="h-8 w-8"
                    resizeMode="contain"
                    tintColor={Platform.select({
                      native: service.useTint
                        ? isDark
                          ? 'white'
                          : 'black'
                        : undefined,
                    })}
                  />
                </View>
                <Text style={{ color: isDark ? 'white' : 'black', fontSize: 12, fontWeight: '500' }}>
                  {service.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 py-8 mt-auto" style={{ backgroundColor: isDark ? '#09090b' : '#f5f5f5' }}>
          <View className="items-center mb-4">
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: 'bold' }}>AREA</Text>
            <Text style={{ color: isDark ? '#d4d4d8' : '#52525b', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              Automate your workflow by connecting your favorite apps and services.
            </Text>
          </View>
          <Text style={{ color: isDark ? '#d4d4d8' : '#52525b', fontSize: 12, textAlign: 'center' }}>
            © 2025 AREA. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}