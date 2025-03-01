import React, {useState, useEffect, useRef} from 'react';
import { View, Text, Image, useWindowDimensions, StyleSheet } from 'react-native';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

interface CarouselImageItem {
  type?: 'image';
  id: string|number;
  uri: string;
  [key: string]: any;
}

interface CarouselProps {
  images?: CarouselImageItem[];
  text?: string[];
  onPress?: () => void;
}


interface CarouselTextItem {
  type: 'text';
  text: string;
}

type CarouselItem = CarouselImageItem | CarouselTextItem;




const CarouselComponent: React.FC<CarouselProps> = ({ images=[], text=[], onPress }) => {

  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  
  const [parentWidth, setParentWidth] =   useState(0);
  const [parentHeight, setParentHeight] = useState(0);
  const [listObject, setListObject] = useState<CarouselItem[]>(() => {
    const imagesList: CarouselImageItem[] = images.map((item) => ({
      ...item,
      type: "image",
    }));
  
    const textList: CarouselTextItem[] = text.map((item) => ({
      text: item,
      type: "text",
    }));
  
    return [...imagesList, ...textList];
  });
  


  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };



  return (
    <View 
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setParentWidth(width);
        setParentHeight(height);
      }}
      style={styles.container}
    >
      {parentWidth > 0 && (
        <Carousel
          // style={{
          //   borderWidth:1,
          //   borderColor:'red',
          //   padding:1
          // }}
          ref={ref}
          width={parentWidth}
          height={parentHeight}
          data={listObject}
          onProgressChange={progress}
          renderItem={({ item }: { item: CarouselItem }) => (
            <View style={styles.itemContainer}>
              {item.type === 'text' && (
                <Text>{item.text}</Text>
              )}
              {item.type === 'image' && (
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
          loop={listObject.length>1}
          autoPlay={listObject.length>1}
          autoPlayInterval={listObject.length>1?5000:undefined}
        />
      )}

      {/* <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={styles.dotStyle}
        containerStyle={styles.paginationContainer}
        onPress={onPressPagination}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: 'red',
    // borderWidth: 1,
    // borderRadius: 3,
    width  : '100%',
    height : '100%',
  },
  itemContainer: { 
    width: '100%', 
    borderRadius: 10, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
  },
  image: { 
    width: '100%', 
    height: '100%',
  },
  itemText: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dotStyle: { 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 50, 
    width: 8, 
    height: 8 
  },
  paginationContainer: { 
    gap: 5, 
    marginTop: 15,
    paddingHorizontal: 10,
  },
});

export default CarouselComponent;