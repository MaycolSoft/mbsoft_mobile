import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, ScrollView, View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Modal, Portal, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import Carousel from 'react-native-reanimated-carousel';


import { postRequest, isAxiosError } from '@/api/apiService';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import ProductForm from './ProductForm';
import TextInputField from '@/components/InputField';


interface Product {
  id: number;
  reference: string;
  description: string;
  sale_price: number;
  costo_price: number;
  id_categoria: string;
  id_unidad: string;
  id_tax: string;
  tax_include: boolean;
  status: boolean;
  images?: any[];
  [key:string]: any;
}

const MAX_ITEMS = 50;

const ProductListScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [viewStyle, setViewStyle] = useState('grid');



  const [searchText, setSearchText] = useState('');
  const [filterField, setFilterField] = useState('description');




  const fetchProducts = useCallback(async () => {

    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let anotherFilter = {}
      let path = '';
      if(searchText != ''){
        anotherFilter = {
          "filterscount": 1,
          "filterGroups": [
            {
              "field": filterField,
              "filters": [
                {"value": searchText}
              ]
            }
          ]
        }
      }
      const version2 = true
      if(version2){
        const response = await postRequest('api/pos/searchProduct', { 
          "include_images"  : 1,
          "per_page" : 10,
          "page"     : page,
          "q"        : searchText
        });

        const newProducts = response.data?.data?.data;

        setProducts((prevProducts) => {
          const combined = [...prevProducts, ...newProducts];
          return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
        });

        setPage((prevPage) => prevPage + 1);
  
        if (response.data?.data?.next_page_url == null){
          setHasMore(false);
        }else{
          setHasMore(newProducts.length > 0);
        }
      }else{
        const response = await postRequest('api/pos/searchFilterProduct', { 
          pagenum  : page,
          pagesize : 10,
          ...anotherFilter
        });

        const newProducts = response.data?.products;

        setProducts((prevProducts) => {
          const combined = [...prevProducts, ...newProducts];
          return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
        });

        setPage((prevPage) => prevPage + 1);
  
        if (response.data?.data?.next_page_url == null){
          setHasMore(false);
        }else{
          setHasMore(newProducts.length > 0);
        }
      }

    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'info',
          text1: 'Warning',
          text2: error.response?.data.message || 'Error en la respuesta del servidor',
        })
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Ha ocurrido un error al cargar los productos',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchText, filterField]); // Incluye searchText y filterField en las dependencias



  const toggleViewStyle = () => {
    setViewStyle((prevStyle) => (prevStyle === 'list' ? 'grid' : 'list'));
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   if (!initialized) {
  //     setInitialized(true);
  //     return; // No ejecutar el código en el primer render
  //   }

  //   const delayDebounceFn = setTimeout(() => {
  //     setHasMore(true);
  //     setPage(0);
  //     setProducts([]);
  //     // fetchProducts();
  //   }, 1000); // Ajusta el tiempo en milisegundos según prefieras, por ejemplo 1000 ms = 1 segundo
  
  //   return () => clearTimeout(delayDebounceFn); // Limpia el timeout si el usuario sigue escribiendo
  // }, [searchText]);


  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };





  // const renderProduct2 = ({ item }: { item: Product }) => (
  //   <View style={[styles.productContainer, viewStyle === 'grid' && styles.gridProductContainer]}>
  //     <Image source={{ uri: 'https://t4.ftcdn.net/jpg/00/27/99/73/360_F_27997377_6iqcc9JW0g06VQUXXN7kYNFrB3TLYUhU.jpg' }} style={styles.productImage} />
  //     <Text style={styles.productName}>{item.description}</Text>
  //     <TouchableOpacity style={styles.editButton} onPress={() => handleEditProduct(item)}>
  //       <Text style={styles.editButtonText}>Editar</Text>
  //     </TouchableOpacity>
  //   </View>
  // );


  const DEFAULT_IMAGE = "https://t4.ftcdn.net/jpg/00/27/99/73/360_F_27997377_6iqcc9JW0g06VQUXXN7kYNFrB3TLYUhU.jpg";
  const renderProduct =  ({ item }: { item: Product }) => {

    const width = Dimensions.get('window').width;
    let images = []

    if( item?.images ){
      images = item?.images?.map(img => {
        if (img.image_url) {
          return img.image_url;
        } else if (img.image) {
          return `data:image/${img.extension};base64,${img.image}`;
        }
        return null;
      }).filter(Boolean); // Filtra valores null o undefined
    }

    const imageSources = images.length > 0 ? images : [DEFAULT_IMAGE];


    return (
      <View  style={[styles.gridProductContainer]}>
        <TouchableOpacity 
          onPress={()=>{handleEditProduct(item)}}
          onLongPress={() =>{handleEditProduct(item)}}
          accessibilityLabel={`Producto: ${item.description}`}
          accessibilityHint="Presiona para ver más detalles o mantén presionado para más opciones."
        >
          <Carousel
            loop
            width={width}
            height={width / 2}
            // autoPlay={true}
            data={imageSources}
            // data={[...new Array(6).keys()]}
            // scrollAnimationDuration={2000}
            // onSnapToItem={(index) => console.log('current index:', index)}
            renderItem={({ index, item }) => (
                <View
                    style={{
                        // flex: 1,
                        // borderWidth: 1,
                        // borderColor:'red',
                        justifyContent: 'center',
                        width:165
                    }}
                >
                    <Image 
                      source={{ uri: item }} 
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                    />

                </View>
            )}
          />
          <Text style={styles.productName}>{item.description}</Text>
        </TouchableOpacity>
      </View>
   );

  };

  // return (
  //   <View style={[styles.gridProductContainer]}>
  //     <FlatList
  //       data={imageSources}
  //       horizontal
  //       showsHorizontalScrollIndicator={false}
  //       pagingEnabled
  //       keyExtractor={(image, index) => `${item.id}-${index}`}
  //       renderItem={({ item: imageUrl }) => (
  //         <View style={styles.imageContainer}>
  //           <Text style={styles.productName}>{item.description}</Text>
  //           {/* <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} /> */}
  //         </View>
  //       )}
  //       // style={styles.carouselContainer}
  //       contentContainerStyle={{ alignItems: 'center' }} // Centra el contenido en el contenedor
  //     />

  //     <Text style={styles.productName}>{item.description}</Text>
      
  //     {/* <TouchableOpacity style={styles.editButton} onPress={() => handleEditProduct(item)}>
  //       <Text style={styles.editButtonText}>Editar</Text>
  //     </TouchableOpacity> */}
  //   </View>
  // );


  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>

        <View style={[styles.searchContainer]}>
          <TextInputField
            placeholder="Escriba para buscar..."
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            onSubmitEditing={fetchProducts}
            style={{height:40, flex:7}}
          />

          <Dropdown 
            onSelect={(option) => setFilterField(`${option.value}`)}
            options={[
              { label: 'Descripción', value: 'description' },
              { label: 'Referencia', value: 'reference' },
              { label: 'Categoría', value: 'categoria' },
              { label: 'Unidad', value: 'unidad' },
              { label: 'Impuesto', value: 'tax' },
            ]}
            iconMode={true} // Activa el modo ícono para el dropdown
            style={{...styles.dropdownStyle, flex:1}}
          />

          <TouchableOpacity onPress={toggleViewStyle} style={[styles.toggleButton, {flex:0.7}]}>
            <MaterialIcons name={viewStyle === 'list' ? 'view-module' : 'view-list'} size={24} color="black" />
          </TouchableOpacity>
        </View>


        <View style={styles.container}>
          {loading && products.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProduct}
              key={viewStyle === 'list' ? 'list' : 'grid'}
              numColumns={viewStyle === 'grid' ? 2 : 1} // Configuración de columnas basada en el estilo
              contentContainerStyle={viewStyle === 'grid' && styles.gridContentContainer}
            />
          )}
        </View>

        <Portal>
          <Modal visible={showFormModal} onDismiss={() => setShowFormModal(false)} contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFormModal(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
            <ProductForm product={selectedProduct} onClose={() => setShowFormModal(false)} onSave={fetchProducts} />
          </Modal>
        </Portal>

      </SafeAreaView>
    </Provider>
  );
};


const styles2 = StyleSheet.create({

  modalContainer: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 10,
    height:1,
    flex:1
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  container: {
    flex: 1,
    padding: 5,
  },

  gridProductContainer: {
    flex: 1,
    margin: 5,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  gridContentContainer: {
    padding: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 4,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
  },
  dropdownStyle: {
    alignItems:'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  toggleButton: {
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  productContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginHorizontal: 5,
  },

  carouselContainer: {
    marginBottom: 10,
  },
});


const styles = StyleSheet.create({
  // --- Estilos del producto ---\
  productContainer: {
    alignItems: 'center',
  },
  productImage: {
    width: '100%',      // Ancho completo del contenedor del FlatList
    aspectRatio: 1,     // Relación de aspecto cuadrada
    resizeMode: 'contain', // La imagen se adapta al tamaño sin recortarse
    borderRadius: 8,
  },
  imageContainer:{
    width: '100%',
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    width: '100%',       // Asegura que el contenedor ocupe el ancho completo disponible
    borderWidth: 1,
    borderColor: 'red',
    overflow: 'hidden',  // Evita desbordamiento de contenido en caso de que FlatList intente expandirse
  },
  gridProductContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // productImageContainer: {
  //   width: '100%',
  //   height: Dimensions.get('window').width / 2,
  //   overflow: 'hidden',
  // },
  productName: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridContentContainer: {
    // paddingHorizontal: 10,
    // paddingBottom: 20,
  },
  productImageContainer: {
    width: '100%',
    height: Dimensions.get('window').width / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // para que se vea bien el contenedor
  },




  // --- Estilos generales de la pantalla ---
  safeContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
  },
  dropdownStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  toggleButton: {
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // --- Estilos del modal ---
  modalContainer: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 10,
    flex: 1,
    height:1
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
});


export default ProductListScreen;
