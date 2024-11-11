import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Modal, Portal, Provider } from 'react-native-paper';


import { postRequest, isAxiosError } from '@/api/apiService';
import Dropdown from '@/components/Dropdown';
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

  const [searchText, setSearchText] = useState('');
  const [filterField, setFilterField] = useState('description');



  const fetchProducts = useCallback(async () => {
    
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await postRequest('api/pos/searchFilterProduct', { 
        pagenum  : page,
        pagesize : 2
      });

      const newProducts = response.data?.products;

      setProducts((prevProducts) => {
        const combined = [...prevProducts, ...newProducts];
        return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
      });

      setPage((prevPage) => prevPage + 1);
      setHasMore(newProducts.length > 0); // Si no hay más productos, se detiene la carga infinita
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
  }, [loading, hasMore, page]);



  
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 1000); // Ajusta el tiempo en milisegundos según prefieras, por ejemplo 1000 ms = 1 segundo
  
    return () => clearTimeout(delayDebounceFn); // Limpia el timeout si el usuario sigue escribiendo
  }, [searchText, fetchProducts]);


  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <Text>Referencia: {item.reference}</Text>
      <Text>Descripción: {item.description}</Text>
      <Text>Precio: ${item.sale_price}</Text>
      <Button title="Editar" onPress={() => handleEditProduct(item)} />
    </View>
  );
  

  return (
    <Provider>

      <View style={styles.container}>

        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 0,
          marginTop:10,
          textAlign: 'center',
        }}>Buscar Productos</Text>

        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <TextInputField
              placeholder="Escriba para buscar..."
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              onSubmitEditing={fetchProducts}
            />
          </View>

          <Dropdown
            onSelect={(option) => setFilterField(option.value)}
            options={[
              { label: 'Descripción', value: 'description' },
              { label: 'Referencia', value: 'reference' },
              { label: 'Categoría', value: 'categoria' },
              { label: 'Unidad', value: 'unidad' },
              { label: 'Impuesto', value: 'tax' },
            ]}
            iconMode={true} // Activa el modo ícono para el dropdown
            style={styles.dropdownStyle}
          />
        </View>




        {/* <Text style={styles.title}>Listado de Productos</Text> */}
        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            onEndReached={fetchProducts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && products.length > 0 ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : null
            }
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
          />
        )}


        <Button
          title="Crear Nuevo Producto"
          onPress={() => {
            setSelectedProduct(null);
            setShowFormModal(true);
          }}
        />

        <Portal>
          <Modal visible={showFormModal} onDismiss={() => setShowFormModal(false)}>
            <ProductForm
              product={selectedProduct}
              onClose={() => setShowFormModal(false)}
              onSave={fetchProducts}
            />
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 5,
    paddingLeft:10,
    paddingRight:10,
  },
  inputContainer: {
    flex: 7, // Ocupa el 90% del espacio
  },
  dropdownStyle: {
    flex: 1, // Ocupa el 10% del espacio
  },
});

export default ProductListScreen;
