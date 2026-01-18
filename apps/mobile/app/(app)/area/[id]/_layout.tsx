import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { Stack } from 'expo-router';

export default function AreaIdLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
