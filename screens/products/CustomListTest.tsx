import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Product , ProductOverlayProps } from '@/interfaces';
import { Marquee } from '@animatereactnative/marquee';
import Toast from 'react-native-toast-message';



const ProductOverlay: React.FC<ProductOverlayProps> = ({
  products     = [],
  onPress      = ()=>{},
  loading      = false, // 
  numColumns   = 5, // Default to 2 columns
  onEndReached = ()=>{},
}) => {
  const DEFAULT_IMAGE =
    'https://t4.ftcdn.net/jpg/00/27/99/73/360_F_27997377_6iqcc9JW0g06VQUXXN7kYNFrB3TLYUhU.jpg';

  const screenWidth = Dimensions.get('window').width;






  const AnimatedText = ({ text }: { text: string }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const CHARACTER_WIDTH = 8; // Ajusta según la fuente y tamaño
    const TEXT_WIDTH = text.length * CHARACTER_WIDTH; // Ancho del texto calculado
    const SCREEN_WIDTH = Dimensions.get('window').width;

    if (text.length * CHARACTER_WIDTH < SCREEN_WIDTH) {
      
      return <Text style={[ { textAlign:'center', maxHeight:20 }]}>{text}</Text>;
    }

    useEffect(() => {
      const duration = (TEXT_WIDTH + SCREEN_WIDTH) * 40; // Calcula duración relativa (ajustable para velocidad)
  
      // Inicia la animación en bucle con velocidad constante
      const startAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scrollX, {
              toValue: -TEXT_WIDTH, // Mueve el texto completamente hacia fuera de la pantalla
              duration: duration, // Duración basada en el texto
              useNativeDriver: true,
            }),
            Animated.delay(1100), // Pausa antes de reiniciar
          ])
        ).start();
      };
  
      startAnimation();
    }, [scrollX, TEXT_WIDTH]);

    return (
      <View style={styles.textWrapper}>
        <Animated.Text
          style={[
            styles.overlayText,
            {
              transform: [
                {
                  translateX: scrollX, // Controla el desplazamiento
                },
              ],
            },
            { width: TEXT_WIDTH + SCREEN_WIDTH }, // Ancho para permitir reaparecer
          ]}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {text}
        </Animated.Text>
      </View>
    );
  };






  const renderItem1 = ({ item }: { item: Product }) => {
    const image = item.images?.[0] || DEFAULT_IMAGE;
    const itemWidth = screenWidth / numColumns - 20; // Adjust width based on columns

    return (
      <TouchableOpacity
        style={[styles.card, { width: itemWidth }]}
        onPress={() => onPress && onPress(item)}
      >
        {/* Imagen del producto */}
        {/* <Image source={{ uri: image }} style={[styles.cardImage, { height: itemWidth }]} /> */}
        <ScrollView
          style={[styles.cardImage, { height: itemWidth }]}
          contentContainerStyle={styles.productImagePreviewList}
          horizontal
          showsHorizontalScrollIndicator={false} // Opcional: Ocultar el indicador de scroll
        >
         {item?.images && item.images.map((value, index) => (
            <Image 
              key={index}
              source={
                value.image_url
                  ? { uri: value.image_url } // Imagen desde URL
                  : { uri: `data:image/jpeg;base64,${value.image}` } // Imagen en Base64
              }
              style={[
                styles.cardImage,
                { 
                  // borderWidth:0.25,
                  // borderColor:"black",
                  height: itemWidth,
                  width: itemWidth-20
                }
              ]}
              />
          ))}
        </ScrollView>

        {/* Contenedor de información */}
        <View style={styles.infoContainer}>
          <View style={[styles.descriptionContainer]}>
            <AnimatedText text={item.description} />
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${item.sale_price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  const renderItem = ({ item }: { item: Product }) => {
    const itemWidth = screenWidth / numColumns - 20; // Adjust width based on columns
    const cardHeight = itemWidth * 1.2; // Define a consistent height-to-width ratio

    // return (
    //   <View
    //     style={{
    //       borderWidth: 0.25,
    //       borderColor: "gray",
    //       borderRadius: 8,
    //       margin: 2,
    //       width: itemWidth+10,
    //       height: cardHeight + 20,
    //       overflow: "visible", // Allow shadow to extend beyond border
    //       backgroundColor: "#fff",
    //       shadowColor: "#000",
    //       shadowOffset: { width: 0, height: 2 },
    //       shadowOpacity: 0.25,
    //       shadowRadius: 3.84,
    //       elevation: 5, // For Android shadow
    //     }}
    //   >
    //     {/* Imagen del producto */}
    //     <ScrollView
    //       style={{
    //         // flex: 1,
    //         // borderWidth: 1,
    //         // borderColor: "red",
    //         minHeight:cardHeight*0.7,
    //         maxHeight:cardHeight*0.7,
    //       }}
    //       contentContainerStyle={{
    //         // justifyContent: "center",
    //         // alignItems: "center",
    //       }}
    //       horizontal
    //       pagingEnabled
    //       showsHorizontalScrollIndicator={false}

    //     >
    //       {/* DEFAULT_IMAGE */}
    //       {(!item?.images || item.images.length == 0 )&& (
    //         <View
    //           key={0}
    //           style={{
    //             width: '100%',
    //             minWidth: '100%',
    //             maxHeight: '100%',
    //             minHeight: '100%',
    //           }}
    //         >
    //           <Image
    //             source={{ uri: DEFAULT_IMAGE}}
    //             style={{
    //               width: "100%",
    //               height: "100%",
    //               resizeMode: "contain", // Maintain aspect ratio within the container
    //             }}
    //           />
    //         </View>
    //       )}

    //       {item?.images && item.images.map((value, index) => (
    //         <View
    //           key={index}
    //           style={{
    //             width: '100%',
    //             minWidth: '100%',
    //             maxHeight: '100%',
    //             minHeight: '100%',
    //           }}
    //         >
    //           <Image
    //             source={
    //               // value.image_url && value.image
    //               value.image_url
    //                 ? { uri: value.image_url } // Imagen desde URL
    //                 : { uri: `data:image/jpeg;base64,${value.image}` } // Imagen en Base64
    //             }
    //             style={{
    //               width: "100%",
    //               height: "100%",
    //               resizeMode: "contain", // Maintain aspect ratio within the container
    //               borderRadius: 8,
    //             }}
    //           />
    //         </View>
    //       ))}
    //     </ScrollView>

    //     {/* Contenedor de información */}
    //     <TouchableOpacity
    //       onPress={() => onPress && onPress(item)}
    //     >
    //       <View style={[
    //         styles.infoContainer
    //       ]}>
    //         <View style={[
    //           styles.descriptionContainer
    //         ]}>
    //           <AnimatedText text={item.description} />
    //         </View>
    //         <View style={styles.priceContainer}>
    //           <Text style={styles.priceText}>${item.sale_price.toFixed(2)}</Text>
    //         </View>
    //       </View>
    //     </TouchableOpacity>
    //   </View>
    // );
    return(
      <View
        style={{
          // Tu card
          borderWidth: 0.25,
          borderColor: "gray",
          borderRadius: 8,
          margin: 2,
          width: itemWidth + 10,   // <--- ancho fijo
          height: cardHeight + 20,
          backgroundColor: "#fff" ,
          // backgroundColor: "red" ,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <TouchableOpacity
          onLongPress={()=>{
            Toast.show({
              type: 'info',
              text1: 'Warning',
              text2: 'HOLA'
            })
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            // El ScrollView también debe usar el MISMO ancho que el contenedor
            style={{
              width: itemWidth + 10,             // <--- ANCHO IGUAL que el padre
              minHeight: cardHeight * 0.7,
              maxHeight: cardHeight * 0.7,
            }}
            contentContainerStyle={{
              // lo que necesites
            }}
          >
            {/* DEFAULT IMAGE */}
            {(!item?.images || item.images.length === 0) && (
              <View
                key={0}
                style={{
                  width: itemWidth + 10,         // <--- MISMO ancho
                  height: '100%',
                }}
              >
                <Image
                  source={{ uri: DEFAULT_IMAGE }}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              </View>
            )}

            {/* DEMÁS IMÁGENES */}
            {item?.images?.map((value, index) => (
              <View
                key={index}
                style={{
                  width: itemWidth + 10,         // <--- MISMO ancho
                  height: '100%',
                }}
              >
                <Image
                  source={
                    value.image_url
                      ? { uri: value.image_url }
                      : { uri: `data:image/jpeg;base64,${value.image}` }
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                    borderRadius: 8,
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>

         {/* Contenedor de información */}
        <TouchableOpacity
          onPress={() => onPress && onPress(item)}
        >
          <View style={[
            styles.infoContainer
          ]}>
            <View style={[
              styles.descriptionContainer
            ]}>
              <AnimatedText text={item.description} />
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${item.sale_price.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  };



  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item?.id ? item.id.toString() : item.reference.toString()}
      numColumns={numColumns}
      contentContainerStyle={styles.list}
      onEndReached={onEndReached} // Llama a tu función para cargar más productos
      onEndReachedThreshold={1} // Carga más cuando el scroll llega al 50% del final
      // ListFooterComponent={loading && <ActivityIndicator size="small" />}
      ListFooterComponent={<>
        { loading && (
          <ActivityIndicator size={"large"} color="#0000ff" />
        )}
      </>}
    />
  );

};

const styles = StyleSheet.create({
  list: {
    // flex: 1, // Ocupa todo el espacio disponible
    justifyContent: 'flex-start', // Asegura que el contenido comience desde la parte superior
    alignItems: 'center', // Alinea horizontalmente en el centro
    paddingHorizontal: 0, // Sin espacio extra en los lados
    marginHorizontal: 0, // Sin márgenes adicionales
  },
  card: {
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    paddingBottom:5,
    paddingLeft:5,
    paddingRight:5
  },
  cardImage: {
    // width: '100%',
    // resizeMode: 'cover',
  },

  infoContainer: {
    width: "100%",
    // borderTopWidth: 0.25,
    // borderColor: "#c1c1c1",
    position: "relative",
    shadowColor: "#4e4d4d",
    backgroundColor: "#fff",
    borderBottomLeftRadius:  5,
    borderBottomRightRadius: 5,
    // shadowOffset: { width: 0, height: 1 }, // Sombra debajo del borde
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
    // elevation: 2, // Para sombra en Android
  },
  descriptionContainer: {
    paddingLeft:2,
    paddingRight:2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "green",
  },
  textWrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  overlayText: {
    color: 'black',
    fontSize: 16,
  },




  productImagePreviewList: {
    flexDirection: "row",
    alignItems: "center", // Centrar las imágenes
    paddingVertical: 5, // Opcional: Espaciado vertical
  },
  productImagePreviewImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 5,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImageDeleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    // backgroundColor: 'rgba(220, 20, 0, 0.5)',
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageDeleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

});


export default ProductOverlay;
