import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { DropdownProps, Options } from '@/interfaces';
import { useTheme } from '@/theme/ThemeProvider';

const Dropdown: React.FC<DropdownProps> = ({
  label = "",
  options,
  value,
  onSelect = () => {},
  style = {},
  iconMode = false,
  iconName,
  extraButton = null,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Options | null>(null);
  const dropdownRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    top: 0,
    left: 0,
    width: 200,
    maxHeight: 260,
  });

  const handleSelect = (option: Options) => {
    setSelectedOption(option);
    onSelect(option);
    setVisible(false);
  };

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((fx, fy, width, height, px, py) => {
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        const dropdownWidth = Math.max(width, 200);
        const isTooFarRight = px + dropdownWidth > screenWidth;

        const margin = 12;
        const spaceBelow = screenHeight - (py + height) - margin;
        const spaceAbove = py - margin;
        const desiredHeight = Math.min(options.length * 44 + 8, 260);
        const openUpward = spaceBelow < desiredHeight && spaceAbove > spaceBelow;

        setDropdownPosition({
          top: openUpward ? undefined : py + height,
          bottom: openUpward ? screenHeight - py : undefined,
          left: isTooFarRight ? screenWidth - dropdownWidth - 10 : px,
          width: dropdownWidth,
          maxHeight: Math.max(120, Math.min(desiredHeight, openUpward ? spaceAbove : spaceBelow)),
        });

        setVisible(true);
      });
    }
  };

  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find((option) => option.value === value);
      setSelectedOption(found || null);
    }
  }, [value, options]);

  return (
    <View style={[styles.main, style]} ref={dropdownRef}>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={[
            iconMode ? styles.iconButton : styles.selectButton,
            {
              flex: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          {iconMode ? (
            <MaterialIcons name="filter-list" size={24} color={theme.colors.text} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {iconName && (
                <MaterialIcons name={iconName} size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: theme.colors.text }}>{selectedOption?.label || (label || 'Selecciona una opción')}</Text>
            </View>
          )}
        </TouchableOpacity>

        {extraButton && (
          <Button
            icon={extraButton.icon}
            onPress={extraButton.onPress}
            variant={extraButton.variant || 'primary'}
            size={extraButton.size || 'x-small'}
            style={{ ...styles.extraButton, ...extraButton.style }}
          />
        )}
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.dropdown,
                {
                  top: dropdownPosition.top,
                  bottom: dropdownPosition.bottom,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  maxHeight: dropdownPosition.maxHeight,
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.radius.md,
                  ...theme.shadow,
                },
              ]}
            >
              <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(option)}
                    style={[styles.option, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text style={{ color: theme.colors.text }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {},
  selectButton: {
    padding: 10,
    borderWidth: 1,
    width: '100%',
  },
  iconButton: {
    padding: 2,
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    overflow: 'hidden',
  },
  option: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  extraButton: {
    marginLeft: 0,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dropdown;
