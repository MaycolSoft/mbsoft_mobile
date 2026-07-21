import React, { forwardRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  EvilIcons,
} from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

type IconName =
  | keyof typeof Feather.glyphMap
  | keyof typeof FontAwesome.glyphMap
  | keyof typeof FontAwesome5.glyphMap
  | keyof typeof Fontisto.glyphMap
  | keyof typeof MaterialIcons.glyphMap
  | keyof typeof MaterialCommunityIcons.glyphMap
  | keyof typeof Ionicons.glyphMap
  | keyof typeof EvilIcons.glyphMap;

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  iconName?: IconName;
  iconPosition?: 'left' | 'right';
  containerStyle?: RNTextInputProps['style'];
}

function renderIcon(name: string, size: number, color: string) {
  if (name in Feather.glyphMap) {
    return <Feather name={name as keyof typeof Feather.glyphMap} size={size} color={color} />;
  }
  if (name in MaterialIcons.glyphMap) {
    return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color} />;
  }
  if (name in MaterialCommunityIcons.glyphMap) {
    return <MaterialCommunityIcons name={name as keyof typeof MaterialCommunityIcons.glyphMap} size={size} color={color} />;
  }
  if (name in Ionicons.glyphMap) {
    return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
  }
  if (name in EvilIcons.glyphMap) {
    return <EvilIcons name={name as keyof typeof EvilIcons.glyphMap} size={size} color={color} />;
  }
  if (name in FontAwesome.glyphMap) {
    return <FontAwesome name={name as keyof typeof FontAwesome.glyphMap} size={size} color={color} />;
  }
  if (name in FontAwesome5.glyphMap) {
    return <FontAwesome5 name={name as keyof typeof FontAwesome5.glyphMap} size={size} color={color} />;
  }
  if (name in Fontisto.glyphMap) {
    return <Fontisto name={name as keyof typeof Fontisto.glyphMap} size={size} color={color} />;
  }
  return <MaterialIcons name="error-outline" size={size} color={color} />;
}

const TextInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const { label, error, iconName, iconPosition = 'left', containerStyle, style, onFocus, onBlur, ...rest } = props;
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;

  return (
    <View style={[{ marginBottom: theme.spacing.lg }, containerStyle]}>
      {label && (
        <Text style={{ marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, color: theme.colors.textMuted }}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.card,
            borderColor,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        {iconName && iconPosition === 'left' && (
          <View style={{ marginRight: theme.spacing.sm }}>{renderIcon(String(iconName), 20, theme.colors.textMuted)}</View>
        )}

        <RNTextInput
          ref={ref}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: theme.colors.text, fontSize: theme.typography.fontSize.md },
            style,
          ]}
          {...rest}
        />

        {iconName && iconPosition === 'right' && (
          <View style={{ marginLeft: theme.spacing.sm }}>{renderIcon(String(iconName), 20, theme.colors.textMuted)}</View>
        )}
      </View>

      {error && (
        <Text style={{ color: theme.colors.danger, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
});

export default TextInput;
