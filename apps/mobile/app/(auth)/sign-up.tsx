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
import { ThemedSafeAreaView } from '@/components/ui/themed-view';
import { SocialConnections } from '@/components/social-connections';
import { useAuth } from '@/contexts/AuthContext';
import { Link, router } from 'expo-router';
import * as React from 'react';
import {
  Pressable,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function SignUpScreen() {
  const { signUp } = useAuth();
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

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signUp(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.replace('/(app)/account-setup');
    }
  }

  return (
    <ThemedSafeAreaView>
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
                <CardTitle className="text-center text-xl">Create your account</CardTitle>
                <CardDescription className="text-center">
                  Welcome! Please fill in the details to get started.
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      returnKeyType="done"
                      onSubmitEditing={onSubmit}
                    />
                    <Text className="text-muted-foreground text-xs">
                      Must be at least 8 characters
                    </Text>
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
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Text>
                  </Button>
                </View>

                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-muted-foreground text-sm">Already have an account?</Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable>
                      <Text className="text-primary text-sm font-medium">Sign in</Text>
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
    </ThemedSafeAreaView>
  );
}
