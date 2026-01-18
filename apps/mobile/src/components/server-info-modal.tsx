import React from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';

interface ServerInfoModalProps {
  visible: boolean;
  currentUrl: string;
  onClose: () => void;
  onReset: () => void;
}

export function ServerInfoModal({ visible, currentUrl, onClose, onReset }: ServerInfoModalProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={onClose}>
        <Pressable className="rounded-3xl overflow-hidden border shadow-xl" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="p-6 items-center">
              <View className="h-16 w-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">🌐</Text>
              </View>

              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground, marginBottom: 8 }}>
                Server Connection
              </Text>

              <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginBottom: 24 }}>
                You are currently connected to:
              </Text>

              <View className="w-full p-4 rounded-xl border mb-8" style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground, textAlign: 'center', fontFamily: 'monospace', fontSize: 14 }} numberOfLines={1}>
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
                  <Text style={{ color: colors.mutedForeground }}>Close</Text>
                </Button>
              </View>
            </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}