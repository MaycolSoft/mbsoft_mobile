import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}

const SwitchRow = ({ label, description, value, onChange, iconName }: SwitchRowProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.card },
      ]}
    >
      {iconName && <MaterialIcons name={iconName} size={20} color={theme.colors.textMuted} style={{ marginRight: 10 }} />}
      <View style={styles.copy}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md }}>{label}</Text>
        {description && (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 12,
  },
});

export default SwitchRow;
