import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { vars } from 'nativewind';
import { cn } from '@/lib/utils';

// Define CSS variables for light and dark themes
const lightTheme = vars({
  '--background': '0 0% 100%',
  '--foreground': '240 10% 3.9%',
  '--card': '0 0% 98%',
  '--card-foreground': '240 10% 3.9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '240 10% 3.9%',
  '--primary': '262 83% 58%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '240 5% 96%',
  '--secondary-foreground': '240 6% 10%',
  '--muted': '240 5% 96%',
  '--muted-foreground': '240 4% 46%',
  '--accent': '262 83% 58%',
  '--accent-foreground': '0 0% 100%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '240 6% 90%',
  '--input': '240 6% 90%',
  '--ring': '262 83% 58%',
  '--success': '142 76% 36%',
  '--success-foreground': '0 0% 100%',
  '--warning': '38 92% 50%',
  '--warning-foreground': '0 0% 100%',
});

const darkTheme = vars({
  '--background': '240 10% 4%',
  '--foreground': '0 0% 98%',
  '--card': '240 10% 6%',
  '--card-foreground': '0 0% 98%',
  '--popover': '240 10% 6%',
  '--popover-foreground': '0 0% 98%',
  '--primary': '262 83% 58%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '240 4% 16%',
  '--secondary-foreground': '0 0% 98%',
  '--muted': '240 4% 16%',
  '--muted-foreground': '240 5% 65%',
  '--accent': '262 83% 58%',
  '--accent-foreground': '0 0% 100%',
  '--destructive': '0 62% 50%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '240 4% 16%',
  '--input': '240 4% 16%',
  '--ring': '262 83% 58%',
  '--success': '142 70% 45%',
  '--success-foreground': '0 0% 100%',
  '--warning': '38 92% 50%',
  '--warning-foreground': '0 0% 100%',
});

export { lightTheme, darkTheme };

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * A View component that applies theme CSS variables
 * Use this as the root view of each screen to ensure theme variables are available
 */
export function ThemedView({ children, className, style, ...props }: ThemedViewProps) {
  const { isDark } = useTheme();

  return (
    <View
      className={cn('flex-1 bg-background', className)}
      style={[isDark ? darkTheme : lightTheme, style]}
      {...props}
    >
      {children}
    </View>
  );
}

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  children: React.ReactNode;
}

/**
 * A SafeAreaView component that applies theme CSS variables
 * Use this as the root view of each screen for proper safe area handling with theming
 */
export function ThemedSafeAreaView({ children, className, style, ...props }: ThemedSafeAreaViewProps) {
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      className={cn('flex-1 bg-background', className)}
      style={[isDark ? darkTheme : lightTheme, style]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}

/**
 * Get the current theme variables object
 */
export function useThemeVars() {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
}
