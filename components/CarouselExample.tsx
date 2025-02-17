// CarouselExample.tsx
import * as React from "react";
import { Text, StyleSheet } from 'react-native';
import { View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';



interface RenderItemProps {
  rounded?: boolean;
}

export const renderItem = ({ rounded = false }: RenderItemProps) => {
  return ({ item, index }: { item: string; index: number }) => {
    return (
      <View
        style={[
          styles.item,
          rounded && styles.rounded,
          { backgroundColor: item },
        ]}
      >
        <Text style={styles.text}>{`Ítem ${index + 1}`}</Text>
      </View>
    );
  };
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  rounded: {
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});




const defaultDataWith6Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

const CarouselExample = () => {
  const carouselRef = React.useRef<ICarouselInstance>(null);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
      <Carousel
        ref={carouselRef}
        autoPlayInterval={2000}
        data={defaultDataWith6Colors}
        height={220}
        loop
        pagingEnabled
        snapEnabled
        width={430 * 0.75}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: 240,
        }}
        mode="horizontal-stack"
        modeConfig={{
          snapDirection: "left",
          stackInterval: 18,
        }}
        customConfig={() => ({ type: "positive", viewCount: 5 })}
        renderItem={renderItem({ rounded: true })}
      />
    </View>
  );
};

export default CarouselExample;
