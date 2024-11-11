import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Asegúrate de instalar esta librería para los íconos

interface Options {
  label: string;
  value: string;
  [key: string]: any;
}

interface DropdownProps {
  options: Options[];
  onSelect?: (option: Options) => void;
  style?: ViewStyle;
  iconMode?: boolean; // Nueva prop para el modo ícono
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect = () => {}, style = {}, iconMode = false }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Options | null>(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<View>(null);

  const handleSelect = (option: Options) => {
    setSelectedOption(option);
    onSelect(option);
    setVisible(false);
  };

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((fx, fy, width, height, px, py) => {
        const screenHeight = 800;
        setOpenUpwards(py + 200 > screenHeight);
        setVisible(!visible);
      });
    } else {
      setVisible(!visible);
    }
  };

  return (
    <View style={[style]} ref={dropdownRef}>
      <TouchableOpacity onPress={toggleDropdown} style={iconMode ? styles.iconButton : styles.selectButton}>
        {iconMode ? (
          <MaterialIcons name="filter-list" size={24} color="black" />
        ) : (
          <Text>{selectedOption?.label || 'Selecciona una opción'}</Text>
        )}
      </TouchableOpacity>
      {visible && (
        <View style={[styles.dropdown, openUpwards ? { bottom: 30 } : { top: 30 }]}>
          {options.map((option, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelect(option)} style={styles.option}>
              <Text>{option?.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  iconButton: { // Estilo para el modo ícono
    padding: 10,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: 200,
    position: 'absolute',
    zIndex: 1000,
    elevation: 10,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Dropdown;
