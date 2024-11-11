import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string; // Color opcional para el botón
  disabled?: boolean;
  loading?: boolean; // Para mostrar el indicador de carga
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<CustomButtonProps> = ({ title, onPress, color = '#007AFF', disabled = false, loading = false, style, textStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        style,
        { backgroundColor: color, opacity: disabled || loading ? 0.6 : 1 }, // Desactiva con opacidad
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
