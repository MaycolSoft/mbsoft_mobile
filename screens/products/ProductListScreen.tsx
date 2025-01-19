import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import { Modal, Portal, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { postRequest, isAxiosError } from '@/api/apiService';
import { Product } from '@/interfaces';

//////////COMPONENTS//////////
import ProductOverlay from './CustomListTest';
import Dropdown from '@/components/Dropdown';
import ProductForm from './ProductForm';
import TextInputField from '@/components/InputField';
//////////COMPONENTS//////////




interface WrapperProps {
  useSafeArea?: boolean; // Booleano para decidir el uso de SafeArea
  children: React.ReactNode; // Elementos hijos a renderizar
  style?: object; // Estilos opcionales
}


const SafeAreaWrapper: React.FC<WrapperProps> = ({ useSafeArea = false, children, style }) => {
  const Container = useSafeArea ? SafeAreaView : View;

  return <Container style={[{ defaultStyle: { flex: 1 } }, style]}>{children}</Container>;
};







const ProductListScreen: React.FC = () => {

  const route = useRoute();
  const { useSafeArea } = route.params || {useSafeArea:false}; // Acceso a los parámetros

  const MAX_ITEMS = 50;
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
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
          "per_page" : 35,
          "page"     : page,
          "q"        : searchText
        });

        const newProducts = response.data?.data?.data;        

        setProducts((prevProducts) => {
          const combined = [...prevProducts, ...newProducts];
          return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
        });

        setPage((prevPage) => prevPage + 1);
        setHasMore(newProducts.length > 0);
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
  //     setPage(1);
  //     setProducts([]);
  //     fetchProducts();
  //   }, 1000); // Ajusta el tiempo en milisegundos según prefieras, por ejemplo 1000 ms = 1 segundo
  
  //   return () => clearTimeout(delayDebounceFn); // Limpia el timeout si el usuario sigue escribiendo
  // }, [searchText]);


  const handleEditProduct = (product: Product) => {
    setShowFormModal(true);
    setSelectedProduct({ ...product });
  };

  return (
    <Provider>
      <SafeAreaWrapper style={styles.safeContainer} useSafeArea={useSafeArea}>

        <View style={[styles.searchContainer]}>
          <TextInputField
            placeholder="Escriba para buscar..."
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            onSubmitEditing={fetchProducts}
            // style={{height:40, flex:7}}
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
          <ProductOverlay
            products={products}
            onPress={(product) => {
              handleEditProduct(product)
            }}
            onEndReached={()=>{
              fetchProducts();
            }}
            loading={loading}
          />
        </View>

        <Portal>
          <Modal visible={showFormModal} onDismiss={() => setShowFormModal(false)} contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFormModal(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
            <ProductForm product={selectedProduct} onClose={() => setShowFormModal(false)} onSave={fetchProducts} />
          </Modal>
        </Portal>

      </SafeAreaWrapper>
    </Provider>
  );
};



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
    height:150
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
    // borderWidth:4,
    // borderColor:"red"
  },
  container: {
    flex: 1,
    padding: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 10,
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
