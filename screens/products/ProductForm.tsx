import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// types.ts o models.ts
export interface Product {
  id?: number;               // Opcional, porque puede no estar presente para productos nuevos
  reference: string;
  description: string;
  sale_price: number;
  costo_price: number;
  id_categoria: string;      // ID de la categoría
  id_unidad: string;         // ID de la unidad
  id_tax: string;            // ID del impuesto
  tax_include: boolean;
  status: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

interface Option {
  id: string;
  description: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
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

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await axios.get('/pos/getCategoriaUnidadesTax');
      setCategorias(response.data.data.categoria);
      setUnidades(response.data.data.unidad);
      setTaxes(response.data.data.tax);
    } catch (error) {
      setCategorias([{ id: '0', description: 'No se pudieron cargar las categorías' }]);
      setUnidades([{ id: '0', description: 'No se pudieron cargar las unidades' }]);
      setTaxes([{ id: '0', description: 'No se pudieron cargar los impuestos' }]);
    }
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/productos/updateOrCreateProduct', formData);
      Alert.alert('Éxito', 'Producto guardado correctamente.');
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Formulario de Producto</Text>

          {/* Campos de Texto Básicos en una Fila Completa */}
          <TextInput
            placeholder="Referencia"
            value={formData.reference}
            onChangeText={(text) => handleChange('reference', text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            style={styles.input}
          />

          {/* Diseño en Dos Columnas para Costo y Precio */}
          <View style={styles.row}>
            <View style={styles.column}>
              <TextInput
                placeholder="Costo"
                value={formData.costo}
                onChangeText={(text) => handleChange('costo', text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <TextInput
                placeholder="Precio"
                value={formData.precio}
                onChangeText={(text) => handleChange('precio', text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Diseño en Dos Columnas para Categoría y Unidad */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Categoría</Text>
              <Picker
                selectedValue={formData.categoria}
                onValueChange={(value) => handleChange('categoria', value)}
                style={styles.picker}
              >
                {categorias.length === 0 ? (
                  <Picker.Item label="No se pudieron cargar las categorías" value="0" />
                ) : (
                  categorias.map((categoria) => (
                    <Picker.Item key={categoria.id} label={categoria.description} value={categoria.id} />
                  ))
                )}
              </Picker>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Unidad</Text>
              <Picker
                selectedValue={formData.unidad}
                onValueChange={(value) => handleChange('unidad', value)}
                style={styles.picker}
              >
                {unidades.length === 0 ? (
                  <Picker.Item label="No se pudieron cargar las unidades" value="0" />
                ) : (
                  unidades.map((unidad) => (
                    <Picker.Item key={unidad.id} label={unidad.description} value={unidad.id} />
                  ))
                )}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button title={loading ? 'Guardando...' : 'Guardar Producto'} onPress={handleSubmit} disabled={loading} />
            <Button title="Cancelar" onPress={onClose} color="red" />
          </View>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  
  outerContainer: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f0f0f0',  // Color de fondo para resaltar la "tarjeta"
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
    elevation: 5, // Para sombra en Android
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
    width: '48%', // Ocupa casi la mitad del ancho disponible
  },
  picker: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ProductForm;
