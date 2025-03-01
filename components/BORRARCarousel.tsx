import React, { useRef, useEffect } from "react";
import { ScrollView, Dimensions } from "react-native";

interface CarouselInterface {
  children: React.ReactElement<{ style?: any }>[]; // Tipo para elementos que aceptan estilo
  isCarousel?: boolean; // Indica si es un carrusel automático
  interval?: number; // Tiempo entre desplazamientos automáticos
}

const Carousel: React.FC<CarouselInterface> = ({
  children,
  isCarousel = false,
  interval = 3000,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (!isCarousel || !children || children.length === 0) return;

    let currentIndex = 0;
    const autoScroll = setInterval(() => {
      if (scrollViewRef.current) {
        currentIndex = (currentIndex + 1) % children.length;
        scrollViewRef.current.scrollTo({
          x: currentIndex * screenWidth,
          animated: true,
        });
      }
    }, interval);

    return () => clearInterval(autoScroll); // Limpia el intervalo al desmontar
  }, [isCarousel, children, screenWidth, interval]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    >
      {children.map((child, index) =>
        React.cloneElement(child, {
          key: index,
          style: {
            width: screenWidth, // Ocupa el ancho de la pantalla
            ...child.props.style, // Mantiene estilos existentes
          },
        })
      )}
    </ScrollView>
  );
};

export default Carousel;
