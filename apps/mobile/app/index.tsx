import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 justify-between px-6 py-8">
        <View className="flex-1 items-center justify-center gap-6">
          <View className="bg-primary/10 mb-4 h-24 w-24 items-center justify-center rounded-3xl">
            <Text className="text-primary text-5xl font-bold">A</Text>
          </View>
          <Text variant="h1" className="text-foreground">
            AREA
          </Text>
          <Text className="text-muted-foreground max-w-xs text-center text-lg">
            Connect your favorite services and automate your workflow
          </Text>
        </View>

        <View className="gap-4">
          <Link href="/(auth)/sign-in" asChild>
            <Button size="lg" className="w-full">
              <Text className="text-primary-foreground font-semibold">Sign In</Text>
            </Button>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Button variant="outline" size="lg" className="w-full">
              <Text className="font-semibold">Create Account</Text>
            </Button>
          </Link>
          {/* DEV ONLY: Bypass login */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onPress={() => router.push('/(app)/dashboard')}
          >
            <Text className="text-muted-foreground text-xs">Skip to Dashboard (Dev)</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
