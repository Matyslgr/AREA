import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ServerConfigModal } from '@/components/server-config-modal';
import { getApiUrl } from '@/lib/api';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Import local assets
const heroDiscord = require('../assets/yt_discord_hero.png');
const heroYoutube = require('../assets/yt_gmail_hero.png');

// Feature images
const featureImages = [
  require('../assets/feature1.jpeg'),
  require('../assets/feature2.jpeg'),
  require('../assets/feature3.jpeg'),
  require('../assets/feature4.jpeg'),
  require('../assets/feature5.jpeg'),
];

// Services data with local icons
const SERVICES = [
  {
    id: 'google',
    name: 'Google',
    icon: require('../assets/google.png'),
    useTint: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: require('../assets/github.png'),
    useTint: true,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: require('../assets/spotify.png'),
    useTint: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: require('../assets/notion.png'),
    useTint: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: require('../assets/linkedin.png'),
    useTint: false,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: require('../assets/twitch.png'),
    useTint: false,
  },
];

export default function HomePage() {
  const { colorScheme } = useColorScheme();
  const [activeFeature, setActiveFeature] = React.useState(0);

  const [isConfiguring, setIsConfiguring] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkServerConfig() {
      const url = await getApiUrl();
      // We consider "http://localhost:8080" as not configured for physical mobile
      if (!url || url === 'http://localhost:8080') {
        setIsConfiguring(true);
      }
      setIsLoading(false);
    }
    checkServerConfig();
  }, []);

  if (isLoading) return null; // Or a Spinner/Loader

  return (
    <SafeAreaView className="bg-background flex-1">
      <ServerConfigModal
        visible={isConfiguring}
        onSave={() => setIsConfiguring(false)}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="px-6 pt-8 pb-6">
          {/* Logo */}
          <View className="items-center mb-4">
            <View className="bg-primary/10 h-20 w-20 items-center justify-center rounded-3xl mb-4">
              <Text className="text-primary text-4xl font-bold">A</Text>
            </View>
            <Text variant="h1" className="text-foreground text-3xl font-bold">
              Welcome to AREA
            </Text>
          </View>

          {/* Hero Description */}
          <Text className="text-muted-foreground text-center text-base leading-6 mb-6">
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
              <Button variant="outline" size="lg" className="w-full">
                <Text className="font-semibold text-base">Create Account</Text>
              </Button>
            </Link>
          </View>
        </View>

        {/* Features Section */}
        <View className="py-6 bg-muted/30">
          <Text className="text-foreground text-xl font-bold text-center mb-6 px-6">
            Key Features
          </Text>

          {/* Feature Images Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={SCREEN_WIDTH - 48}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24 }}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
              setActiveFeature(index);
            }}
            scrollEventThrottle={16}
          >
            {featureImages.map((image, index) => (
              <View
                key={index}
                className="mr-4"
                style={{ width: SCREEN_WIDTH - 72 }}
              >
                <Image
                  source={image}
                  className={cn(
                    'w-full h-48 rounded-2xl',
                    activeFeature === index ? 'opacity-100' : 'opacity-70'
                  )}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-2 mt-4">
            {featureImages.map((_, index) => (
              <View
                key={index}
                className={cn(
                  'h-2 rounded-full',
                  activeFeature === index
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30'
                )}
              />
            ))}
          </View>
        </View>

        {/* Services Section */}
        <View className="px-6 py-6">
          <Text className="text-foreground text-xl font-bold text-center mb-2">
            Available Services
          </Text>
          <Text className="text-muted-foreground text-center text-sm mb-6">
            Connect with your favorite platforms
          </Text>

          <View className="flex-row flex-wrap justify-center gap-4">
            {SERVICES.map((service) => (
              <View
                key={service.id}
                className="items-center"
                style={{ width: (SCREEN_WIDTH - 72) / 3 }}
              >
                <View className="bg-card border border-border h-16 w-16 items-center justify-center rounded-2xl mb-2">
                  <Image
                    source={service.icon}
                    className="h-8 w-8"
                    resizeMode="contain"
                    tintColor={Platform.select({
                      native: service.useTint
                        ? colorScheme === 'dark'
                          ? 'white'
                          : 'black'
                        : undefined,
                    })}
                  />
                </View>
                <Text className="text-foreground text-xs font-medium">
                  {service.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 py-8 bg-muted/50 mt-auto">
          <View className="items-center mb-4">
            <Text className="text-foreground text-lg font-bold">AREA</Text>
            <Text className="text-muted-foreground text-xs text-center mt-2">
              Automate your workflow by connecting your favorite apps and services.
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs text-center">
            © 2025 AREA. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
