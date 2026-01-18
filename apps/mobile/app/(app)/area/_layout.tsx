import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function AreaLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? 'hsl(240, 10%, 3.9%)' : 'hsl(0, 0%, 100%)',
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
