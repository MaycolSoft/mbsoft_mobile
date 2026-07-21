import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, EvilIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconsName = keyof typeof MaterialCommunityIcons.glyphMap;
type IoniconsName = keyof typeof Ionicons.glyphMap;
type EvilIconsName = keyof typeof EvilIcons.glyphMap;

interface CustomButtonProps {
  title?: string;
  onPress: () => void;
  icon?: MaterialIconsName | MaterialCommunityIconsName | IoniconsName | EvilIconsName;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'light';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'x-small' | 'small' | 'medium' | 'large';
  borderRadius?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const sizePadding = {
  'x-small': { vertical: 4, horizontal: 6 },
  small: { vertical: 6, horizontal: 12 },
  medium: { vertical: 12, horizontal: 20 },
  large: { vertical: 14, horizontal: 24 },
};

const sizeFontSize = {
  'x-small': 12,
  small: 14,
  medium: 16,
  large: 18,
};

const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  color,
  disabled = false,
  loading = false,
  size = 'medium',
  borderRadius,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const variantColors: Record<string, { bg: string; text: string }> = {
    primary: { bg: theme.colors.primary, text: theme.colors.onPrimary },
    secondary: { bg: theme.colors.textMuted, text: theme.colors.onPrimary },
    danger: { bg: theme.colors.danger, text: '#fff' },
    success: { bg: theme.colors.success, text: '#fff' },
    warning: { bg: theme.colors.warning, text: theme.colors.text },
    info: { bg: theme.colors.primary, text: theme.colors.onPrimary },
    dark: { bg: theme.dark ? theme.colors.surface : theme.colors.text, text: theme.dark ? theme.colors.text : theme.colors.background },
    light: { bg: theme.colors.surface, text: theme.colors.text },
  };

  const { bg, text } = variantColors[variant];
  const padding = sizePadding[size];

  const getIconComponent = (name: string, iconSize: number, iconColor: string) => {
    if (name in MaterialIcons.glyphMap) {
      return <MaterialIcons name={name as MaterialIconsName} size={iconSize} color={iconColor} />;
    }
    if (name in MaterialCommunityIcons.glyphMap) {
      return <MaterialCommunityIcons name={name as MaterialCommunityIconsName} size={iconSize} color={iconColor} />;
    }
    if (name in Ionicons.glyphMap) {
      return <Ionicons name={name as IoniconsName} size={iconSize} color={iconColor} />;
    }
    if (name in EvilIcons.glyphMap) {
      return <EvilIcons name={name as EvilIconsName} size={iconSize} color={iconColor} />;
    }
    return <MaterialIcons name="error" size={iconSize} color={iconColor} />;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: color || bg,
          borderRadius: borderRadius ?? theme.radius.md,
          paddingVertical: padding.vertical,
          paddingHorizontal: padding.horizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={text} />
      ) : (
        <>
          {icon && getIconComponent(icon, 20, text)}
          {title && (
            <Text
              style={[
                styles.buttonText,
                { color: text, fontSize: sizeFontSize[size], marginLeft: icon ? theme.spacing.sm : 0 },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
});

export default Button;
