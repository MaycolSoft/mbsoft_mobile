import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';

interface MarqueeTextProps {
  text: string;
  speed?: number; // Velocidad del scroll (pixeles por segundo aprox.)
  style?: any;    // Estilos extra para el Texto
  containerStyle?: any; // Estilos extra para el contenedor
}

const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  speed = 50,
  style,
  containerStyle,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  // Valor animado que controla la posición X del texto
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Cuando se mide el ancho del contenedor
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Cuando se mide el ancho del texto
  const onTextLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setTextWidth(width);
  };

  useEffect(() => {
    // Si el texto es más ancho que el contenedor, iniciar la animación
    if (textWidth > containerWidth && containerWidth > 0) {
      startAnimation();
    } else {
      // Si no es más largo, resetear la animación al inicio
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textWidth, containerWidth]);

  const startAnimation = () => {
    // Posicionar el texto inicialmente justo a la derecha del contenedor
    animatedValue.setValue(containerWidth);

    // Calcular la distancia total a recorrer (cont + text)
    const distance = containerWidth + textWidth;

    // Duración aproximada basada en la velocidad
    const duration = (distance / speed) * 1000;

    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -textWidth, // hasta que el texto desaparezca por la izquierda
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      {
        // Repetir la animación infinitamente
        resetBeforeIteration: true,
      }
    ).start();
  };

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={onContainerLayout}
    >
      <Animated.Text
        onLayout={onTextLayout}
        style={[
          styles.text,
          style,
          {
            transform: [{ translateX: animatedValue }],
            // Importante para que sea una sola línea y no se corte con "..."
            whiteSpace: 'nowrap' as any, // iOS/Android ignoran esto, pero en Web no.
          },
        ]}
        numberOfLines={1}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // para que el texto que se sale no sea visible
  },
  text: {
    fontSize: 16,
    // Asegurarse de que sea una sola línea en iOS/Android:
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default MarqueeText;
