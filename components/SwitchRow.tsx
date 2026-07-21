import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface SwitchRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}

const SwitchRow = ({ label, value, onChange, iconName }: SwitchRowProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.card },
      ]}
    >
      {iconName && <MaterialIcons name={iconName} size={20} color={theme.colors.textMuted} style={{ marginRight: 10 }} />}
      <Text style={{ color: theme.colors.text, flex: 1, fontSize: theme.typography.fontSize.md }}>{label}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 12,
  },
});

export default SwitchRow;
