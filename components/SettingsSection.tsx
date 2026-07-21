import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.xxl }}>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.sm,
          marginLeft: theme.spacing.xs,
        }}
      >
        {title}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.lg,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});

export default SettingsSection;
