import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Theme color constants for programmatic usage
 * Use these when you need to pass colors to components that don't support Tailwind classes
 */
export const themeColors = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(240, 10%, 3.9%)',
    card: 'hsl(0, 0%, 98%)',
    primary: 'hsl(262, 83%, 58%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(240, 5%, 96%)',
    muted: 'hsl(240, 5%, 96%)',
    mutedForeground: 'hsl(240, 4%, 46%)',
    border: 'hsl(240, 6%, 90%)',
    success: 'hsl(142, 76%, 36%)',
    destructive: 'hsl(0, 84%, 60%)',
  },
  dark: {
    background: 'hsl(240, 10%, 4%)',
    foreground: 'hsl(0, 0%, 98%)',
    card: 'hsl(240, 10%, 6%)',
    primary: 'hsl(262, 83%, 58%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(240, 4%, 16%)',
    muted: 'hsl(240, 4%, 16%)',
    mutedForeground: 'hsl(240, 5%, 65%)',
    border: 'hsl(240, 4%, 16%)',
    success: 'hsl(142, 70%, 45%)',
    destructive: 'hsl(0, 62%, 50%)',
  },
} as const;

/**
 * Get theme colors based on dark mode state
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? themeColors.dark : themeColors.light;
}

