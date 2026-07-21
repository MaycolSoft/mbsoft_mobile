import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CheckBoxProps {
  remember: boolean;
  setRemember: (value: boolean) => void;
  disabled?: boolean;
}

const CheckBox = ({ remember, setRemember, disabled }: CheckBoxProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: remember ? theme.colors.primary : theme.colors.border,
            backgroundColor: remember ? theme.colors.primary : 'transparent',
            borderRadius: theme.radius.sm,
          },
        ]}
        onPress={() => setRemember(!remember)}
        disabled={disabled}
      >
        {remember && <Text style={{ color: theme.colors.onPrimary, fontSize: 14 }}>✓</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CheckBox;
