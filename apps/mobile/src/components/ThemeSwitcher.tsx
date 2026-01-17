import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme-colors';
import { Sun, Moon, Smartphone } from 'lucide-react-native';

interface ThemeOption {
    id: ThemeMode;
    name: string;
    icon: React.ComponentType<{ size: number; color: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Smartphone },
];

export function ThemeSwitcher() {
    const { themeMode, setThemeMode, isDark } = useTheme();
    const colors = getColors(isDark);

    const iconColor = colors.foreground;
    const activeIconColor = colors.primaryForeground;

    return (
        <View className="my-4">
            <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}>Appearance</Text>
            <View
                className="flex-row rounded-2xl p-1"
                style={{ backgroundColor: colors.secondary }}
            >
                {THEME_OPTIONS.map((option) => {
                    const isActive = themeMode === option.id;
                    const IconComponent = option.icon;

                    return (
                        <Pressable
                            key={option.id}
                            onPress={() => setThemeMode(option.id)}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                            style={{ backgroundColor: isActive ? colors.primary : 'transparent' }}
                        >
                            <IconComponent
                                size={18}
                                color={isActive ? activeIconColor : iconColor}
                            />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: isActive ? colors.primaryForeground : colors.foreground,
                                }}
                            >
                                {option.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
                {themeMode === 'system'
                    ? `Following system preference (${isDark ? 'Dark' : 'Light'})`
                    : `${themeMode === 'dark' ? 'Dark' : 'Light'} mode enabled`}
            </Text>
        </View>
    );
}
