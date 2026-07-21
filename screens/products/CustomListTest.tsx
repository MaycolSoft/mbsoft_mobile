import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { Product, ProductOverlayProps } from '@/interfaces';
import Carousel from '@/components/Carousel';
import { useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

const DEFAULT_IMAGE = 'https://t4.ftcdn.net/jpg/00/27/99/73/360_F_27997377_6iqcc9JW0g06VQUXXN7kYNFrB3TLYUhU.jpg';

function buildCarouselImages(item: Product) {
  if (!item?.images || item.images.length === 0) {
    return [{ id: item.id ?? 'new', uri: DEFAULT_IMAGE }];
  }
  return item.images.map((value, index) => ({
    id: value.id ?? `new-${index}`,
    uri: value.image_url ?? `data:image/jpeg;base64,${value.image}`,
  }));
}

const AnimatedText = ({ text, color }: { text: string; color: string }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const CHARACTER_WIDTH = 8;
  const TEXT_WIDTH = text.length * CHARACTER_WIDTH;
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const needsScroll = TEXT_WIDTH >= SCREEN_WIDTH;

  useEffect(() => {
    if (!needsScroll) return;

    const duration = (TEXT_WIDTH + SCREEN_WIDTH) * 40;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, { toValue: -TEXT_WIDTH, duration, useNativeDriver: true }),
        Animated.delay(1100),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [needsScroll, scrollX, TEXT_WIDTH, SCREEN_WIDTH]);

  if (!needsScroll) {
    return (
      <Text style={{ textAlign: 'center', maxHeight: 20, color }} numberOfLines={1}>
        {text}
      </Text>
    );
  }

  return (
    <View style={styles.textWrapper}>
      <Animated.Text
        style={[
          styles.overlayText,
          { color },
          { transform: [{ translateX: scrollX }] },
          { width: TEXT_WIDTH + SCREEN_WIDTH },
        ]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {text}
      </Animated.Text>
    </View>
  );
};

interface ItemProps {
  item: Product;
  theme: Theme;
  onPress: (product: Product) => void;
}

const GridCard = React.memo(({ item, theme, onPress, itemWidth, cardHeight }: ItemProps & { itemWidth: number; cardHeight: number }) => {
  return (
    <View
      style={[
        styles.gridCard,
        {
          width: itemWidth,
          height: cardHeight,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          ...theme.shadow,
        },
      ]}
    >
      <View style={{ width: itemWidth, minHeight: cardHeight * 0.7, maxHeight: cardHeight * 0.7 }}>
        <Carousel images={buildCarouselImages(item)} />
      </View>

      <TouchableOpacity onPress={() => onPress(item)}>
        <View style={[styles.infoContainer, { width: itemWidth, backgroundColor: theme.colors.card }]}>
          <View style={styles.descriptionContainer}>
            <AnimatedText text={item.description} color={theme.colors.text} />
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: theme.colors.success }]}>${item.sale_price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const ListRow = React.memo(({ item, theme, onPress }: ItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[
        styles.listRow,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={[styles.listImage, { borderRadius: theme.radius.sm }]}>
        <Carousel images={buildCarouselImages(item)} />
      </View>

      <View style={styles.listInfo}>
        <AnimatedText text={item.description} color={theme.colors.text} />
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>{item.reference}</Text>
        <Text style={[styles.priceText, { color: theme.colors.success, marginTop: 4 }]}>
          ${item.sale_price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const ProductOverlay: React.FC<ProductOverlayProps> = ({
  products = [],
  onPress = () => {},
  loading = false,
  numColumns = 2,
  viewStyle = 'grid',
  onEndReached = () => {},
}) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      if (viewStyle === 'list') {
        return <ListRow item={item} theme={theme} onPress={onPress} />;
      }

      const itemWidth = screenWidth / numColumns - 16;
      const cardHeight = itemWidth * 1.3;
      return <GridCard item={item} theme={theme} onPress={onPress} itemWidth={itemWidth} cardHeight={cardHeight} />;
    },
    [viewStyle, theme, onPress, numColumns, screenWidth]
  );

  const keyExtractor = useCallback(
    (item: Product) => (item?.id ? item.id.toString() : item.reference.toString()),
    []
  );

  return (
    <FlatList
      key={viewStyle}
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={viewStyle === 'list' ? 1 : numColumns}
      contentContainerStyle={styles.list}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      ListFooterComponent={loading ? <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 16 }} /> : null}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  gridCard: {
    borderWidth: StyleSheet.hairlineWidth,
    margin: 6,
    overflow: 'hidden',
  },
  infoContainer: {
    position: 'relative',
    paddingVertical: 6,
  },
  descriptionContainer: {
    paddingHorizontal: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    width: Dimensions.get('window').width - 16,
  },
  listImage: {
    width: 84,
    height: 84,
    overflow: 'hidden',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  textWrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  overlayText: {
    fontSize: 16,
  },
});

export default ProductOverlay;
