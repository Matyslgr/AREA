import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { View } from 'react-native';

export default function AppLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}
