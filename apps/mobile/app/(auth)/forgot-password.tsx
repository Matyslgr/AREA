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
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { Pressable, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit() {
    if (!email) return;
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 justify-center px-6 py-8">
          <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-xl">Check your email</CardTitle>
              <CardDescription className="text-center">
                We've sent a password reset link to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <Button
                className="w-full"
                onPress={() => router.replace('/(auth)/reset-password')}
              >
                <Text className="text-primary-foreground font-semibold">
                  Enter Reset Code
                </Text>
              </Button>
              <View className="flex-row items-center justify-center gap-1">
                <Text className="text-muted-foreground text-sm">Didn't receive the email?</Text>
                <Pressable onPress={() => setSent(false)}>
                  <Text className="text-primary text-sm font-medium">Try again</Text>
                </Pressable>
              </View>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-8 items-center">
              <View className="bg-primary/10 mb-4 h-16 w-16 items-center justify-center rounded-2xl">
                <Text className="text-primary text-3xl font-bold">A</Text>
              </View>
            </View>

            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm">
              <CardHeader>
                <CardTitle className="text-center text-xl">Forgot password?</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we'll send you a reset link
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
                    disabled={loading || !email}
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </Button>
                </View>

                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-muted-foreground text-sm">Remember your password?</Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable>
                      <Text className="text-primary text-sm font-medium">Sign in</Text>
                    </Pressable>
                  </Link>
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
