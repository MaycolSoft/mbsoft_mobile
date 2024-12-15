import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Portal } from 'react-native-paper';
import Button from '@/components/Button';
type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;


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
  extraButton?: {
    title?:string,
    icon?: MaterialIconsName; // Nombre del ícono
    onPress: () => void; // Acción al presionar el botón
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'light'; // Variante del botón (opcional)
    size?: 'small' | 'medium' | 'large'; // Tamaño del botón (opcional)
    style?: ViewStyle; // Estilo adicional (opcional)
  };
}



const Dropdown: React.FC<DropdownProps> = ({ 
  label = "",
  options,
  onSelect = () => {},
  style = {},
  iconMode = false ,
  extraButton = null
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
      <View style={[styles.dropdownContainer]}>

        {/* <TouchableOpacity onPress={toggleDropdown} style={iconMode ? styles.iconButton : styles.selectButton}> */}
        <TouchableOpacity onPress={toggleDropdown} style={[iconMode ? styles.iconButton : styles.selectButton, { flex: 1 }]} >
          {iconMode ? (
            <MaterialIcons name="filter-list" size={24} color="black" />
          ) : (
            <Text>{selectedOption?.label || (label || 'Selecciona una opción')}</Text>
          )}
        </TouchableOpacity>

        {/* Botón adicional opcional */}
        {extraButton && (
          <Button
            icon={extraButton.icon}
            onPress={extraButton.onPress}
            variant={extraButton.variant || 'primary'}
            size={extraButton.size || 'x-small'}
            style={{...styles.extraButton, ...extraButton.style}}
          />
        )}
      </View>
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
    // flex: 1,
  },
  selectButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width:"100%"
  },
  iconButton: {
    padding: 2,
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#eaeaea',
    borderRadius: 5,
    width: 200,
    zIndex: 1000, // Asegura que esté encima de otros elementos
    elevation: 10, // Sombra en Android
    shadowColor: '#000', // Sombra negra para iOS
    shadowOffset: { width: 0, height: 4 }, // Desplazamiento de la sombra
    shadowOpacity: 0.3, // Opacidad de la sombra
    shadowRadius: 4, // Difuminado de la sombra
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownContainer: {
    flexDirection: 'row', // Alinear elementos horizontalmente
    alignItems: 'stretch', // Ambos elementos se estirarán para igualar la altura
  },
  extraButton: {
    marginLeft: 0, // Espaciado entre el dropdown y el botón
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dropdown;
