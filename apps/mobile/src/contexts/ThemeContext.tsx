import * as React from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeModeState] = React.useState<ThemeMode>('system');
    const { setColorScheme, colorScheme } = useNativeWindColorScheme();
    const [systemColorScheme, setSystemColorScheme] = React.useState<'light' | 'dark'>(
        Appearance.getColorScheme() || 'dark'
    );

    // Listen for system color scheme changes
    React.useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme || 'dark');
        });
        return () => subscription.remove();
    }, []);

    // Calculate effective color scheme
    const effectiveColorScheme = React.useMemo(() => {
        if (themeMode === 'system') {
            return systemColorScheme;
        }
        return themeMode;
    }, [themeMode, systemColorScheme]);

    const isDark = effectiveColorScheme === 'dark';

    // Sync with NativeWind when effective color scheme changes
    React.useEffect(() => {
        setColorScheme(effectiveColorScheme);
    }, [effectiveColorScheme, setColorScheme]);

    // Load theme from storage on mount
    React.useEffect(() => {
        async function loadTheme() {
            try {
                const storedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
                if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
                    setThemeModeState(storedTheme as ThemeMode);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        }
        loadTheme();
    }, []);

    const setThemeMode = React.useCallback(async (newMode: ThemeMode) => {
        try {
            setThemeModeState(newMode);
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, newMode);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
