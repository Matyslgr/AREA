import React, { useState } from 'react';
import { View, TextInput, Modal } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { setApiUrl } from '@/lib/api';

export function ServerConfigModal({ visible, onSave }: { visible: boolean, onSave: () => void }) {
  const [url, setUrl] = useState('https://server-production-613e.up.railway.app');

  const handleSave = async () => {
    if (!url) return;
    await setApiUrl(url);
    onSave();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-background px-6 justify-center">
        <View className="bg-primary/10 h-20 w-20 items-center justify-center rounded-3xl mb-6 self-center">
          <Text className="text-primary text-4xl font-bold">A</Text>
        </View>

        <Text variant="h1" className="text-center mb-2 font-bold text-2xl">Server Configuration</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Please enter your AREA server URL to continue.
        </Text>

        <View className="space-y-4">
          <TextInput
            placeholder="https://your-server.com"
            value={url}
            onChangeText={setUrl}
            className="bg-muted p-4 rounded-xl text-foreground border border-border"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button size="lg" className="w-full mt-4" onPress={handleSave}>
            <Text className="text-primary-foreground font-semibold">Connect to Server</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}