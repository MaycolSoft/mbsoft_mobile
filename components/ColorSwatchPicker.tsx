import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface Swatch {
  key: string;
  light: string;
  dark: string;
}

interface ColorSwatchPickerProps {
  swatches: Swatch[];
  value?: string;
  onSelect: (key: string) => void;
}

const ColorSwatchPicker = ({ swatches, value, onSelect }: ColorSwatchPickerProps) => {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {swatches.map((swatch) => {
        const color = theme.dark ? swatch.dark : swatch.light;
        const selected = value ? value === swatch.key : swatch.key === 'default' || swatch.key === 'indigo';

        return (
          <TouchableOpacity
            key={swatch.key}
            onPress={() => onSelect(swatch.key)}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: selected ? theme.colors.text : theme.colors.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}
          >
            {selected && (
              <MaterialIcons name="check" size={16} color={theme.dark ? '#000' : '#fff'} style={{ opacity: 0.85 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ColorSwatchPicker;
