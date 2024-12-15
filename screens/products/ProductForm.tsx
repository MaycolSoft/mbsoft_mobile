import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { postRequest } from '@/api/apiService';
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

const ProductForm = ({ product, onClose }: ProductFormInterface) => {
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    costo_price: '',
    sale_price: '',
    id_categoria: null,
    id_unidad: null,
    id_tax: null,
    tax_include: false,
    status: true,
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.reference) newErrors.reference = 'La referencia es obligatoria.';
    if (!formData.description) newErrors.description = 'La descripción es obligatoria.';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await postRequest('/productos/updateOrCreateProduct', formData);
      Toast.show({
        type: 'success',
        text1: 'Producto guardado correctamente',
      });
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al guardar el producto',
      });
    }
  };

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
              value={formData.costo_price}
              placeholder="Costo"
              keyboardType="numeric"
              onChangeText={(value) => handleChange('costo_price', value)}
            />
            <TextInputField
              label="Precio"
              value={formData.sale_price}
              placeholder="Precio"
              keyboardType="numeric"
              onChangeText={(value) => handleChange('sale_price', value)}
            />


            <View style={styles.dropdownGrid}>
              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Categoría"
                  onSelect={(item) => handleChange('id_categoria', item.value)}
                  options={[
                    { label: 'Categoría 1', value: '1' },
                    { label: 'Categoría 2', value: '2' },
                  ]}
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
                  onSelect={(item) => handleChange('id_unidad', item.value)}
                  options={[
                    { label: 'Unidad 1', value: '1' },
                    { label: 'Unidad 2', value: '2' },
                  ]}
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
                  onSelect={(item) => handleChange('id_tax', item.value)}
                  options={[
                    { label: '11%', value: 11 },
                    { label: '12%', value: 12 },
                  ]}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Impuesto Incluido"
                  onSelect={(item) => handleChange('tax_include', item.value === 'SI')}
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
