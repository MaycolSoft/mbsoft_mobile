import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { postRequest } from '@/api/apiService';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import TextInputField from '@/components/InputField';

interface ProductFormInterface {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

const ProductForm = (props: ProductFormInterface) => {
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

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await postRequest('/productos/updateOrCreateProduct', formData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Producto guardado correctamente',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo guardar el producto',
      });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {props.product ? 'Editar Producto' : 'Crear Producto'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.row}>
          <TextInputField
            label="Referencia"
            value={formData.reference}
            placeholder="Referencia"
            onChangeText={(value) => handleChange('reference', value)}
            style={styles.input}
          />
          <TextInputField
            label="Descripción"
            value={formData.description}
            placeholder="Descripción"
            onChangeText={(value) => handleChange('description', value)}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <TextInputField
            label="Costo"
            value={formData.costo_price}
            placeholder="Costo"
            keyboardType="numeric"
            onChangeText={(value) => handleChange('costo_price', value)}
            style={styles.input}
          />
          <TextInputField
            label="Precio"
            value={formData.sale_price}
            placeholder="Precio"
            keyboardType="numeric"
            onChangeText={(value) => handleChange('sale_price', value)}
            style={styles.input}
          />
        </View>

        {/* Contenedor de Dropdowns en una cuadrícula de dos columnas */}
        <View style={styles.dropdownGrid}>
          <View style={styles.dropdownContainer}>
            <Dropdown
              label="Categoría"
              onSelect={(item) => handleChange('id_categoria', item.value)}
              options={[
                { label: 'Categoría 1', value: "1" },
                { label: 'Categoría 2', value: "2" },
              ]}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <Dropdown
              label="Unidad"
              onSelect={(item) => handleChange('id_unidad', item.value)}
              options={[
                { label: 'Unidad 1', value: "1" },
                { label: 'Unidad 2', value: "2" },
                { label: 'Unidad 3', value: "3" },
                { label: 'Unidad 4', value: "4" },
              ]}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <Dropdown
              label="ITBIS"
              onSelect={(item) => handleChange('id_tax', item.value)}
              options={[
                { label: '11%', value: 11 },
                { label: '12%', value: 12 },
                { label: '13%', value: 13 },
                { label: '15%', value: 15 },
                { label: '16%', value: 16 },
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

      <View style={styles.footer}>
        <Button
          title={"Crear"}
          onPress={handleSubmit}
          style={styles.createButton}
        />
        <Button
          title={"Cancelar"}
          onPress={props.onClose}
          style={styles.clearButton}
        />
      </View>
    </View>
  );
};

export default ProductForm;

const styles = StyleSheet.create({
  dropdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  dropdownContainer: {
    width: 120,
    marginVertical: 8,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },
  formContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 5,
  },
  createButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  header: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});