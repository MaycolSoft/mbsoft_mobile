import React, { useEffect, useState, useCallback, useRef } from 'react';
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

  return <Container style={[styles.flex, style, _style]}>{children}</Container>;
};


type RouteParams = {
  useSafeArea: boolean;
};
type ProductListRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

const PRODUCTS_PER_PAGE = 35;
const MAX_ITEMS = 50;


const ProductListScreen: React.FC = () => {

  const theme = useTheme();
  const route = useRoute<ProductListRouteProp>();
  const { useSafeArea = false } = route.params ?? {};

  const [products, setProducts] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const searchGenerationRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const fetchProducts = useCallback(async (pageToLoad = 1, replace = pageToLoad === 1) => {
    if (!replace && (loadingMoreRef.current || !hasMoreRef.current)) return;

    const generation = replace ? ++searchGenerationRef.current : searchGenerationRef.current;
    if (replace) {
      hasMoreRef.current = true;
      setProducts([]);
      setTotalResults(0);
      setNextPage(1);
    } else {
      loadingMoreRef.current = true;
    }

    setLoading(true);

    try {
      const response = await postRequest('api/pos/searchProduct', {
        parametro: searchText.trim() || '%',
        include_images: true,
        per_page: PRODUCTS_PER_PAGE,
        page: pageToLoad,
      });

      if (generation !== searchGenerationRef.current) return;

      const paginator = response.data?.data;
      const newProducts: Product[] = Array.isArray(paginator?.data) ? paginator.data : [];
      const currentPage = Number(paginator?.current_page ?? pageToLoad);
      const lastPage = Number(paginator?.last_page ?? currentPage);
      const total = Number(paginator?.total ?? newProducts.length);

      setProducts((prevProducts) => {
        if (replace) return newProducts.slice(0, MAX_ITEMS);

        const existingIds = new Set(prevProducts.map((item) => item.id ?? item.reference));
        const uniqueProducts = newProducts.filter((item) => !existingIds.has(item.id ?? item.reference));
        const combined = [...prevProducts, ...uniqueProducts];
        return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
      });

      setTotalResults(total);
      setNextPage(currentPage + 1);
      hasMoreRef.current = Number.isFinite(lastPage)
        ? currentPage < lastPage
        : newProducts.length === PRODUCTS_PER_PAGE;

    } catch (error) {
      if (generation !== searchGenerationRef.current) return;

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
      if (!replace) loadingMoreRef.current = false;
      if (generation === searchGenerationRef.current) setLoading(false);
    }
  }, [searchText]);



  const toggleViewStyle = () => {
    setViewStyle((prevStyle) => (prevStyle === 'list' ? 'grid' : 'list'));
  };

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      fetchProducts(1, true);
    }, 450);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [fetchProducts]);

  const submitSearch = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    fetchProducts(1, true);
  };


  const handleEditProduct = (product: Product) => {
    setShowFormModal(true);
    setSelectedProduct({ ...product });
  };

  return (
    <SafeAreaWrapper style={[styles.safeContainer, { backgroundColor: theme.colors.background }]} useSafeArea={useSafeArea}>

      <SearchBar
        searchText      = {searchText}
        setSearchText   = {setSearchText}
        onSubmitEditing = {submitSearch}
        toggleViewStyle = {toggleViewStyle}
        viewStyle       = {viewStyle}
        loading         = {loading}
        loadedCount     = {products.length}
        totalResults    = {totalResults}
      />

      <View style={styles.container}>
        <ProductOverlay
          products={products}
          viewStyle={viewStyle}
          onPress={(product) => {
            handleEditProduct(product)
          }}
          onEndReached={() => fetchProducts(nextPage, false)}
          loading={loading}
          emptyTitle={searchText.trim() ? 'No encontramos productos' : 'No hay productos registrados'}
          emptyDescription={searchText.trim()
            ? 'Prueba con otra referencia, descripción o categoría.'
            : 'Crea el primer producto usando el botón +.'}
        />
      </View>

      <AppModal
        visible={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedProduct ? 'Editar producto' : 'Nuevo producto'}
      >
        {showFormModal && (
          <ProductForm product={selectedProduct} onCancel={() => setShowFormModal(false)} onSave={()=>{
            fetchProducts(1, true)
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
  flex: {
    flex: 1,
  },
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
