import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { postRequest, getRequest, isAxiosError } from '@/api/apiService';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import TextInputField from '@/components/InputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';

interface ProductFormInterface {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

interface CategoriaItem {
  id: number;
  description: string;
}

interface CategoriaUnidadesTax {
  categoria: CategoriaItem[];
  tax: any[]; // Puedes ajustar esto según tus datos de `tax`
  unidad: any[]; // Puedes ajustar esto según tus datos de `unidad`
}







const ProductForm = ({ product, onClose }: ProductFormInterface) => {
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    costo: '',
    precio: '',
    categoria: null,
    unidad: null,
    tax: null,
    tax_include: false,
    status: false,
  });

  const [gettingCategoriaUnidadesTax, setGettingCategoriaUnidadesTax] = useState(false);
  const [categoriaUnidadesTax, setCategoriaUnidadesTax] = useState<CategoriaUnidadesTax>({
    categoria: [],
    tax: [],
    unidad: [],
  });
  
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: any = {};
  
    // Validar referencia
    if (!formData.reference) newErrors.reference = 'La referencia es obligatoria.';
  
    // Validar descripción
    if (!formData.description) newErrors.description = 'La descripción es obligatoria.';
  
    // Validar costo
    if (!formData.costo) {
      newErrors.costo = 'El costo es obligatorio.';
    } else if (isNaN(Number(formData.costo)) || Number(formData.costo) <= 0) {
      newErrors.costo = 'El costo debe ser un número positivo.';
    }
  
    // Validar precio
    if (!formData.precio) {
      newErrors.precio = 'El precio es obligatorio.';
    } else if (isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número positivo.';
    }
  
    return newErrors;
  };
  

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await postRequest('api/productos/updateOrCreateProduct', formData);
      Toast.show({
        type: 'success',
        text1: 'Producto guardado correctamente',
      });
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'error',
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
    }
  };

  const getCategoriaUnidadesTax = async () => {
    try {
      const response = await getRequest('api/pos/getCategoriaUnidadesTax', {})

      const listCategoriaUnidadesTax = response.data?.data;

      setCategoriaUnidadesTax(listCategoriaUnidadesTax);
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
      setGettingCategoriaUnidadesTax(false);
    }
  }


  useEffect(()=>{
    getCategoriaUnidadesTax();
  },[])

  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>{product ? 'Editar Producto' : 'Crear Producto'}</Text>

          <ScrollView contentContainerStyle={styles.formContainer}>
            {/* Información General */}
            <Text style={styles.sectionTitle}>Información General</Text>
            <TextInputField
              label="Referencia"
              value={formData.reference}
              placeholder="Referencia"
              onChangeText={(value) => handleChange('reference', value)}
              error={errors.reference}
            />

            <TextInputField
              label="Descripción"
              value={formData.description}
              placeholder="Descripción"
              onChangeText={(value) => handleChange('description', value)}
              error={errors.description}
            />

            {/* Precios */}
            <Text style={styles.sectionTitle}>Precios</Text>
            <TextInputField
              label="Costo"
              value={formData.costo}
              placeholder="Costo"
              keyboardType="numeric"
              error={errors.costo}
              onChangeText={(value) => handleChange('costo', value)}
            />
            <TextInputField
              label="Precio"
              value={formData.precio}
              placeholder="Precio"
              keyboardType="numeric"
              error={errors.precio}
              onChangeText={(value) => handleChange('precio', value)}
            />


            <View style={styles.dropdownGrid}>
              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Categoría"
                  onSelect={(item) => handleChange('categoria', item.value)}
                  options={categoriaUnidadesTax.categoria.map(item => ({
                    label: item?.description,
                    value: item?.id,
                  }))}
                  extraButton={{
                    icon: 'settings',
                    onPress: () => console.log('Abrir configuración'),
                    variant: 'dark'
                  }}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Unidad"
                  onSelect={(item) => handleChange('unidad', item.value)}
                  options={
                    categoriaUnidadesTax.unidad.map(item => ({
                      label: item?.description,
                      value: item?.id,
                    }))
                  }
                  extraButton={{
                    icon: 'settings',
                    onPress: () => console.log('Abrir configuración'),
                    variant: 'dark'
                  }}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="ITBIS"
                  onSelect={(item) => handleChange('tax', item.value)}
                  options={
                    categoriaUnidadesTax.tax.map(item => ({
                      label: item?.description,
                      value: item?.id,
                    }))
                  }
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Impuesto Incluido"
                  onSelect={(item) => handleChange('tax_include', item.value === 'SI'?1:0)}
                  options={[
                    { label: 'SI', value: 'SI' },
                    { label: 'NO', value: 'NO' },
                  ]}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Estado"
                  onSelect={(item) => handleChange('status', item.value === 'ACTIVO')}
                  options={[
                    { label: 'ACTIVO', value: 'ACTIVO' },
                    { label: 'INACTIVO', value: 'INACTIVO' },
                  ]}
                />
              </View>
            </View>

          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <Button title="Guardar" onPress={handleSubmit} variant="primary" />
            <Button title="Cancelar" onPress={onClose} variant="danger" />
          </View>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

export default ProductForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dropdownContainer: {
    width: '48%', // Dos columnas
    marginBottom: 16, // Espacio vertical
    marginHorizontal: '1%', // Espacio horizontal para evitar solapes
  },
  
});
