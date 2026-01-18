import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

function Input(props: TextInputProps & { className?: string; placeholderClassName?: string }) {
  const { isDark } = useTheme();

  const inputStyle = {
    backgroundColor: isDark ? '#27272a' : '#f5f5f5',
    borderColor: isDark ? '#3f3f46' : '#d4d4d8',
    color: isDark ? 'white' : 'black',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    height: 40,
    width: '100%',
  };

  return (
    <TextInput
      style={inputStyle}
      placeholderTextColor={isDark ? '#71717a' : '#a1a1a6'}
      editable={props.editable !== false}
      {...props}
    />
  );
}

export { Input };
