import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { Modal, Portal, Provider } from 'react-native-paper';
import ProductForm from './ProductForm';



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
}

const ProductListScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://tu-api.com/pos/searchFilterProduct');
      setProducts(response.data.data);
    } catch (error) {
      // console.error(error);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Listado de Productos</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
          />
        )}
        <Button title="Crear Nuevo Producto" onPress={() => {
          setSelectedProduct(null);
          setShowFormModal(true);
        }} />

        {/* Modal del formulario de creación/edición */}
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
    padding: 20,
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
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 20,
  },
});

export default ProductListScreen;
