import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Portal } from 'react-native-paper';

interface Options {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface DropdownProps {
  options: Options[];
  onSelect?: (option: Options) => void;
  style?: ViewStyle;
  iconMode?: boolean;
  label?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label = "",
  options,
  onSelect = () => {},
  style = {},
  iconMode = false 
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Options | null>(null);
  const dropdownRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleSelect = (option: Options) => {
    setSelectedOption(option);
    onSelect(option);
    setVisible(false);
  };

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((fx, fy, width, height, px, py) => {
        const screenWidth = Dimensions.get('window').width;
        const dropdownWidth = 200; // Ancho del dropdown
        const isTooFarRight = px + dropdownWidth > screenWidth;
        
        // Calcula la posición horizontal y vertical del dropdown
        setDropdownPosition({
          top: py + height, // Aparece justo debajo del botón
          left: isTooFarRight ? screenWidth - dropdownWidth - 10 : px, // Ajusta a la izquierda si se sale del borde derecho
        });
        
        setVisible(!visible);
      });
    }
  };

  return (
    <View style={[styles.main, style]} ref={dropdownRef}>
      <TouchableOpacity onPress={toggleDropdown} style={iconMode ? styles.iconButton : styles.selectButton}>
        {iconMode ? (
          <MaterialIcons name="filter-list" size={24} color="black" />
        ) : (
          <Text>{selectedOption?.label || (label || 'Selecciona una opción')}</Text>
        )}
      </TouchableOpacity>

      {visible && (
       <Portal>
          <View style={[
            styles.dropdown, { 
              top: dropdownPosition.top, 
              left: dropdownPosition.left 
            }
          ]}>
            {options.map((option, index) => (
              <TouchableOpacity key={index} onPress={() => handleSelect(option)} style={styles.option}>
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    // backgroundColor: 'white',
    flex: 1,
  },
  selectButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  iconButton: {
    padding: 2,
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
    width: 200,
    zIndex: 1000, // Asegura que esté en un nivel alto
    elevation: 10, // Solo para Android
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Dropdown;
