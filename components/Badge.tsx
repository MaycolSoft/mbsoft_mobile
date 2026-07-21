import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface BadgeProps {
  positive: boolean;
  trueLabel: string;
  falseLabel: string;
}

const Badge = ({ positive, trueLabel, falseLabel }: BadgeProps) => {
  const theme = useTheme();
  const color = positive ? theme.colors.success : theme.colors.textMuted;

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.radius.full,
          borderColor: color,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 3,
        },
      ]}
    >
      <MaterialIcons name={positive ? 'check-circle' : 'cancel'} size={13} color={color} />
      <Text style={{ color, fontSize: theme.typography.fontSize.xs, marginLeft: 4, fontWeight: '600' }}>
        {positive ? trueLabel : falseLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});

export default Badge;
