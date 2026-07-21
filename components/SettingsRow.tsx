import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SettingsRowProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
  last?: boolean;
  stacked?: boolean;
}

const SettingsRow = ({ label, description, children, last, stacked }: SettingsRowProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        stacked ? styles.stackedContainer : styles.container,
        {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={stacked ? undefined : styles.labelContainer}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md }}>{label}</Text>
        {description && (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.fontSize.xs,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {children && <View style={stacked ? { marginTop: theme.spacing.md } : undefined}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stackedContainer: {},
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
});

export default SettingsRow;
