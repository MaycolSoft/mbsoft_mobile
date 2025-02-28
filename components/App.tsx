import React from 'react';
import { View, Text, Image, useWindowDimensions, StyleSheet } from 'react-native';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

export default function App() {
  const { width } = useWindowDimensions();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);

  const images = [
    { id: 1, uri: 'https://placehold.co/600x300.png?text=Imagen+1' },
    { id: 2, uri: 'https://placehold.co/600x300.png?text=Imagen+2' },
    { id: 3, uri: 'https://placehold.co/600x300.png?text=Imagen+3' },
  ];

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        width={width}
        height={300}
        data={images}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Image {item.id}</Text>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </View>
        )}
        loop
        autoPlay
      />

      <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={styles.dotStyle}
        containerStyle={styles.paginationContainer}
        onPress={onPressPagination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  itemContainer: { flex: 1, borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemText: { position: 'absolute', top: 10, left: 10, color: '#fff', fontSize: 18 },
  dotStyle: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 50 },
  paginationContainer: { gap: 5, marginTop: 10 },
});
