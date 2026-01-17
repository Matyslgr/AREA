// Theme colors for dynamic styling when CSS variables don't work properly
export const themeColors = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(240, 10%, 3.9%)',
    card: 'hsl(0, 0%, 98%)',
    cardForeground: 'hsl(240, 10%, 3.9%)',
    primary: 'hsl(262, 83%, 58%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(240, 5%, 96%)',
    secondaryForeground: 'hsl(240, 6%, 10%)',
    muted: 'hsl(240, 5%, 96%)',
    mutedForeground: 'hsl(240, 4%, 46%)',
    accent: 'hsl(262, 83%, 58%)',
    accentForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(240, 6%, 90%)',
    input: 'hsl(240, 6%, 90%)',
    destructive: 'hsl(0, 84%, 60%)',
    success: 'hsl(142, 76%, 36%)',
  },
  dark: {
    background: 'hsl(240, 10%, 4%)',
    foreground: 'hsl(0, 0%, 98%)',
    card: 'hsl(240, 10%, 6%)',
    cardForeground: 'hsl(0, 0%, 98%)',
    primary: 'hsl(262, 83%, 58%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(240, 4%, 16%)',
    secondaryForeground: 'hsl(0, 0%, 98%)',
    muted: 'hsl(240, 4%, 16%)',
    mutedForeground: 'hsl(240, 5%, 65%)',
    accent: 'hsl(262, 83%, 58%)',
    accentForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(240, 4%, 16%)',
    input: 'hsl(240, 4%, 16%)',
    destructive: 'hsl(0, 62%, 50%)',
    success: 'hsl(142, 70%, 45%)',
  },
};

export function getColors(isDark: boolean) {
  return isDark ? themeColors.dark : themeColors.light;
}
