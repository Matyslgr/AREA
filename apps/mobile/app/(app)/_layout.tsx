import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? 'hsl(240, 10%, 4%)' : 'hsl(0, 0%, 100%)',
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
