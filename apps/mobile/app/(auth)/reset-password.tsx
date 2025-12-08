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
import { router } from 'expo-router';
import * as React from 'react';
import { TextInput, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  function onCodeSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    confirmPasswordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!code || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);
    // TODO: Implement reset password logic with API
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/sign-in');
    }, 1000);
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
                <CardTitle className="text-center text-xl">Reset your password</CardTitle>
                <CardDescription className="text-center">
                  Enter the code from your email and your new password
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-6">
                <View className="gap-4">
                  <View className="gap-1.5">
                    <Label htmlFor="code">Reset Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter code"
                      keyboardType="number-pad"
                      value={code}
                      onChangeText={setCode}
                      onSubmitEditing={onCodeSubmitEditing}
                      returnKeyType="next"
                    />
                  </View>
                  <View className="gap-1.5">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      onSubmitEditing={onPasswordSubmitEditing}
                      returnKeyType="next"
                    />
                  </View>
                  <View className="gap-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      ref={confirmPasswordInputRef}
                      id="confirm-password"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
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
                    disabled={loading || !code || !password || !confirmPassword}
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
