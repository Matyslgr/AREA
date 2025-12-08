import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { SocialConnections } from '@/components/social-connections';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'expo-router';
import * as React from 'react';
import {
  Pressable,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!email || !password) return;
    setError('');
    setLoading(true);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-8 items-center">
              <View className="bg-primary/10 mb-4 h-16 w-16 items-center justify-center rounded-2xl">
                <Text className="text-primary text-3xl font-bold">A</Text>
              </View>
            </View>

            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm">
              <CardHeader>
                <CardTitle className="text-center text-xl">Welcome back</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-6">
                <View className="gap-4">
                  <View className="gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="m@example.com"
                      keyboardType="email-address"
                      autoComplete="email"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onSubmitEditing={onEmailSubmitEditing}
                      returnKeyType="next"
                    />
                  </View>
                  <View className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/(auth)/forgot-password" asChild>
                        <Pressable>
                          <Text className="text-primary text-sm">Forgot password?</Text>
                        </Pressable>
                      </Link>
                    </View>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      returnKeyType="done"
                      onSubmitEditing={onSubmit}
                    />
                  </View>
                  {error ? (
                    <Text className="text-destructive text-center text-sm">{error}</Text>
                  ) : null}
                  <Button
                    className="w-full"
                    onPress={onSubmit}
                    disabled={loading || !email || !password}
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Text>
                  </Button>
                </View>

                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-muted-foreground text-sm">Don't have an account?</Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <Pressable>
                      <Text className="text-primary text-sm font-medium">Sign up</Text>
                    </Pressable>
                  </Link>
                </View>

                <View className="flex-row items-center">
                  <Separator className="flex-1" />
                  <Text className="text-muted-foreground px-4 text-sm">or continue with</Text>
                  <Separator className="flex-1" />
                </View>

                <SocialConnections />
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
