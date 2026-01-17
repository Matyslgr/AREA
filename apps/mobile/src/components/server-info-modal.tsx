import React from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

interface ServerInfoModalProps {
  visible: boolean;
  currentUrl: string;
  onClose: () => void;
  onReset: () => void;
}

export function ServerInfoModal({ visible, currentUrl, onClose, onReset }: ServerInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-background rounded-3xl overflow-hidden border border-border shadow-xl">
            <View className="p-6 items-center">
              <View className="h-16 w-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">🌐</Text>
              </View>

              <Text className="text-xl font-bold text-foreground mb-2">
                Server Connection
              </Text>

              <Text className="text-muted-foreground text-center mb-6">
                You are currently connected to:
              </Text>

              <View className="w-full bg-muted/50 p-4 rounded-xl border border-border mb-8">
                <Text className="text-foreground text-center font-mono text-sm" numberOfLines={1}>
                  {currentUrl || 'Unknown'}
                </Text>
              </View>

              <View className="w-full gap-3">
                <Button
                  onPress={onReset}
                  className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700"
                >
                  <Text className="text-white font-semibold">Disconnect & Change Server</Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={onClose}
                  className="w-full"
                >
                  <Text className="text-muted-foreground">Close</Text>
                </Button>
              </View>
            </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}