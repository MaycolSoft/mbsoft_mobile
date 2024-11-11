import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {postRequest, getRequest, isAxiosError} from '@/api/apiService';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import TextInputField from '@/components/InputField';


interface Product {
  id?: number;
  [key:string]: any;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

interface Option {
  [key: string]: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose=()=>{}, onSave=()=>{} }) => {

  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    costo: '',
    precio: '',
    categoria: '0',
    unidad: '0',
    tax: '0',
    tax_include: true,
    status: true,
  });

  const [categorias, setCategorias] = useState<Option[]>([]);
  const [unidades, setUnidades] = useState<Option[]>([]);
  const [taxes, setTaxes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const defaultList = [
    { value: '0', label: 'Opcion # 0' },
    { value: '1', label: 'Opcion # 1' },
    { value: '2', label: 'Opcion # 2' },
  ];

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await getRequest('api/pos/getCategoriaUnidadesTax');
      // LOG  {"categoria": [{"created_at": "2024-11-10T16:21:08.000000Z", "deleted_at": null, "description": "e", "id": 6, "id_empresa": 1001, "status": true, "updated_at": "2024-11-10T16:21:08.000000Z"}], "tax": [{"created_at": "2024-11-10T16:21:35.000000Z", "deleted_at": null, "description": "el 11 porcietno", "id": 5, "id_empresa": 1001, "porciento_tax": "11.00%", "status": true, "tax": "0.11", "updated_at": "2024-11-10T16:21:35.000000Z"}], "unidad": [{"created_at": "2024-11-10T16:21:21.000000Z", "deleted_at": null, "description": "qwe", "id": 6, "id_empresa": 1001, "sigla": "e", "status": true, "updated_at": "2024-11-10T16:21:21.000000Z", "venta_decimal": false}]}
      // setCategorias(response.data.data.categoria);
      // setUnidades(response.data.data.unidad);
      // setTaxes(response.data.data.tax);
      console.log(response.data.data);
      
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
      
      setCategorias(defaultList);
      setUnidades(defaultList);
      setTaxes(defaultList);
    }
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await postRequest('/productos/updateOrCreateProduct', formData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Producto guardado correctamente',
      });
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={ styles.cardContainer }>

          <TextInputField
            placeholder="Referencia"
            value={formData.reference}
            onChangeText={(text) => handleChange('reference', text)}
            // style={styles.input}
          />
          <TextInputField
            placeholder="Descripción"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            // style={styles.input}
          />

        </View>
      </ScrollView>
      
      {/* Contenedor de botones en la parte inferior de la pantalla */}
      <View style={
        styles.footer
        }>
        <Button
          title={loading ? 'Guardando...' : 'Guardar Producto'}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
        />
        <Button
          title="Cancelar"
          onPress={onClose}
          color="red"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
  },
  cardContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default ProductForm;
