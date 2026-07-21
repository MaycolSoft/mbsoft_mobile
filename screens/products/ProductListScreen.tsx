import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postRequest, isAxiosError } from '@/api/apiService';
import { Product } from '@/interfaces';
import { useTheme } from '@/theme/ThemeProvider';

//////////COMPONENTS//////////
import ProductOverlay from './CustomListTest';
import Button from '@/components/Button';
import ProductForm from './ProductForm';
import SearchBar from '@/components/SearchBar';
import AppModal from '@/components/Modal';
//////////COMPONENTS//////////




interface WrapperProps {
  useSafeArea?: boolean; // Booleano para decidir el uso de SafeArea
  children: React.ReactNode; // Elementos hijos a renderizar
  style?: object; // Estilos opcionales
}


const SafeAreaWrapper: React.FC<WrapperProps> = ({ useSafeArea = false, children, style }) => {
  const Container = useSafeArea ? SafeAreaView : View;


  let _style = {  }
  if(!useSafeArea){
    _style = { flex: 1, marginTop: 10 }
  }

  return <Container style={[{ defaultStyle: { flex: 1 } }, style, _style ]}>{children}</Container>;
};


type RouteParams = {
  useSafeArea: boolean;
};
type ProductListRouteProp = RouteProp<{ params: RouteParams }, 'params'>;


const ProductListScreen: React.FC = () => {

  const theme = useTheme();
  const route = useRoute<ProductListRouteProp>();
  const { useSafeArea = false } = route.params;

  const MAX_ITEMS = 50;
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [initialized, setInitialized] = useState(false);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [filterField, setFilterField] = useState('description');


  const fetchProducts = useCallback(async () => {

    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await postRequest('api/pos/searchProduct', {
        "include_images"  : 1,
        "per_page" : 35,
        "page"     : page,
        "q"        : searchText,
        "field"    : filterField,
      });

      const newProducts = response.data?.data?.data;

      setProducts((prevProducts) => {
        const combined = [...prevProducts, ...newProducts];
        return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
      });

      setPage((prevPage) => prevPage + 1);
      setHasMore(newProducts.length > 0);

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

  const initialFetcProduct = () => {
    setHasMore(true);
    setPage(1);
    setProducts([]);
  }

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return; // No ejecutar el código en el primer render
    }

    const delayDebounceFn = setTimeout(() => {
      initialFetcProduct();
    }, 1000); // Ajusta el tiempo en milisegundos según prefieras, por ejemplo 1000 ms = 1 segundo

    return () => clearTimeout(delayDebounceFn); // Limpia el timeout si el usuario sigue escribiendo
  }, [searchText]);


  const handleEditProduct = (product: Product) => {
    setShowFormModal(true);
    setSelectedProduct({ ...product });
  };

  return (
    <SafeAreaWrapper style={[styles.safeContainer, { backgroundColor: theme.colors.background }]} useSafeArea={useSafeArea}>

      <SearchBar
        searchText      = {searchText}
        setSearchText   = {setSearchText}
        onSubmitEditing = {fetchProducts}
        setFilterField  = {setFilterField}
        toggleViewStyle = {toggleViewStyle}
        viewStyle       = {viewStyle}
      />

      <View style={styles.container}>
        <ProductOverlay
          products={products}
          viewStyle={viewStyle}
          onPress={(product) => {
            handleEditProduct(product)
          }}
          onEndReached={()=>{
            fetchProducts();
          }}
          loading={loading}
        />
      </View>

      <AppModal
        visible={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedProduct ? 'Editar producto' : 'Nuevo producto'}
      >
        {showFormModal && (
          <ProductForm product={selectedProduct} onCancel={() => setShowFormModal(false)} onSave={()=>{
            initialFetcProduct()
            setShowFormModal(false)
          }} />
        )}
      </AppModal>

      <View style={styles.fabContainer}>
        <Button
          icon="add"
          onPress={()=>{
            setSelectedProduct(undefined);
            setShowFormModal(true);
          }}
          style={styles.fab}
        />
      </View>

    </SafeAreaWrapper>
  );
};



const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    padding: 0,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 0,
  },
});


export default ProductListScreen;
