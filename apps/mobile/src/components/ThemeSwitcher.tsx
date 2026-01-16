import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

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
    const { colorScheme } = useColorScheme();

    const iconColor = colorScheme === 'dark' ? '#fafafa' : '#09090b';
    const activeIconColor = '#ffffff';

    return (
        <View className="my-4">
            <Text className="text-foreground mb-3 font-semibold">Appearance</Text>
            <View className="bg-secondary/50 flex-row rounded-2xl p-1">
                {THEME_OPTIONS.map((option) => {
                    const isActive = themeMode === option.id;
                    const IconComponent = option.icon;

                    return (
                        <Pressable
                            key={option.id}
                            onPress={() => setThemeMode(option.id)}
                            className={cn(
                                'flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3',
                                isActive ? 'bg-primary' : 'bg-transparent'
                            )}
                        >
                            <IconComponent
                                size={18}
                                color={isActive ? activeIconColor : iconColor}
                            />
                            <Text
                                className={cn(
                                    'text-sm font-medium',
                                    isActive ? 'text-primary-foreground' : 'text-foreground'
                                )}
                            >
                                {option.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <Text className="text-muted-foreground mt-2 text-xs text-center">
                {themeMode === 'system'
                    ? `Following system preference (${isDark ? 'Dark' : 'Light'})`
                    : `${themeMode === 'dark' ? 'Dark' : 'Light'} mode enabled`}
            </Text>
        </View>
    );
}
