import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, EvilIcons } from '@expo/vector-icons'; // Librería de íconos
////////////////////////////
type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconsName = keyof typeof MaterialCommunityIcons.glyphMap;
type IoniconsName = keyof typeof Ionicons.glyphMap;
type EvilIconsName = keyof typeof EvilIcons.glyphMap;
////////////////////////////
import useStore from '@/store/useStore';



interface CustomButtonProps {
  title?: string; // El título ahora es opcional si se usa un ícono
  onPress: () => void;
  icon?: MaterialIconsName | MaterialCommunityIconsName | IoniconsName | EvilIconsName; // Nombre del ícono (opcional)
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'light'; // Variantes del botón
  color?: string; // Color personalizado opcional
  disabled?: boolean;
  loading?: boolean;
  size?: 'x-small' | 'small' | 'medium' | 'large'; // Tamaño del botón (opcional)
  borderRadius?: number; // Radio de bordes personalizado
  style?: ViewStyle; // Estilo adicional para el botón
  textStyle?: TextStyle; // Estilo adicional para el texto
}

const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  icon, // Nueva prop
  variant = 'primary',
  color,
  disabled = false,
  loading = false,
  size = 'medium',
  borderRadius,
  style,
  textStyle,
}) => {


  const { config } = useStore();

  // Estilos base combinados con props específicas
  const buttonStyle = [
    styles.button,
    styles[variant], // Estilo basado en la variante
    sizeStyles[size], // Estilo basado en el tamaño
    color && { backgroundColor: color }, // Color personalizado
    borderRadius !== undefined && { borderRadius }, // Radio personalizado
    disabled && styles.disabled, // Estado deshabilitado
    style, // Estilo adicional pasado como prop
  ];

  const textStyleCombined = [
    styles.buttonText,
    textStyles[size], // Texto basado en el tamaño
    textStyle, // Estilo adicional para el texto
  ];

  const getIconComponent = (name: string, size: number, color: string, style?: any) => {
    if (name in MaterialIcons.glyphMap) {
      return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color} style={style} />;
    }
    if (name in MaterialCommunityIcons.glyphMap) {
      return <MaterialCommunityIcons name={name as keyof typeof MaterialCommunityIcons.glyphMap} size={size} color={color} style={style} />;
    }
    if (name in Ionicons.glyphMap) {
      return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} style={style} />;
    }
    if (name in EvilIcons.glyphMap) {
      return <EvilIcons name={name as keyof typeof EvilIcons.glyphMap} size={size} color={color} style={style} />;
    }
    return <MaterialIcons name="error" size={size} color={color} style={style} />;
  };



  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {/* {icon && <MaterialIcons name={icon} size={20} color="#fff" style={{ marginRight: title ? 8 : 0 }} />} */}
          {icon && getIconComponent(icon, 20, config.darkMode?'#fff':'#333', { marginRight: title ? 8 : 0 })}
          {title && <Text style={textStyleCombined}>{title}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Variantes del botón
  primary: {
    backgroundColor: '#007AFF', // Azul
  },
  secondary: {
    backgroundColor: '#4CAF50', // Verde
  },
  danger: {
    backgroundColor: '#F44336', // Rojo
  },
  success: {
    backgroundColor: '#28A745', // Verde más claro
  },
  warning: {
    backgroundColor: '#FFC107', // Naranja
  },
  info: {
    backgroundColor: '#17A2B8', // Azul claro
  },
  dark: {
    backgroundColor: '#343A40', // Gris oscuro
  },
  light: {
    backgroundColor: '#F8F9FA', // Gris claro / Blanco
  },
  disabled: {
    opacity: 0.6,
  },
});

// Estilos por tamaño
const sizeStyles = StyleSheet.create({
  'x-small': {
    paddingVertical: 4, // Menor espacio vertical
    paddingHorizontal: 6, // Menor espacio horizontal
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  
});

// Estilos de texto por tamaño
const textStyles = StyleSheet.create({
  'x-small': {
    fontSize: 12, // Tamaño de fuente más pequeño
  },
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
});

export default Button;
