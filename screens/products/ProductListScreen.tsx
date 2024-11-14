import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Modal, Portal, Provider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


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
      
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        
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

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return; // No ejecutar el código en el primer render
    }

    const delayDebounceFn = setTimeout(() => {
      setHasMore(true);
      setPage(0);
      setProducts([]);
      // fetchProducts();
    }, 1000); // Ajusta el tiempo en milisegundos según prefieras, por ejemplo 1000 ms = 1 segundo
  
    return () => clearTimeout(delayDebounceFn); // Limpia el timeout si el usuario sigue escribiendo
  }, [searchText]);


  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  

  

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productContainer, viewStyle === 'grid' && styles.gridProductContainer]}>
      <Image source={{ uri: 'https://t4.ftcdn.net/jpg/00/27/99/73/360_F_27997377_6iqcc9JW0g06VQUXXN7kYNFrB3TLYUhU.jpg' }} style={styles.productImage} />
      <Text style={styles.productName}>{item.description}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEditProduct(item)}>
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

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
              numColumns={viewStyle === 'list' ? 1 : 2} // Configuración de columnas basada en el estilo
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


const styles = StyleSheet.create({

  modalContainer: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 10,
    position: 'relative',
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
  productContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
});


export default ProductListScreen;
