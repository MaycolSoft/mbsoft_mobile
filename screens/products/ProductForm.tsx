import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider, Portal, ActivityIndicator } from 'react-native-paper';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Linking, Alert} from 'react-native';
import { postRequest, getRequest, deleteRequest, isAxiosError } from '@/api/apiService';


import CustomException from '@/Utils/CustomException';
import Dropdown       from '@/components/Dropdown';
import Button         from '@/components/Button';
import Camera         from '@/components/Camera';
import TextInputField from '@/components/InputField';
import { Product, ProductFormInterface, CategoriaUnidadesTax } from '@/interfaces';


interface ImageManagementInterface {
  // image_url?: string; // Opcional si puede estar ausente
  [key: string]: any; // Permitir propiedades adicionales
}



const ProductForm = ({ product, onCancel=()=>{}, onSave=()=>{} }: ProductFormInterface) => {
  const [formData, setFormData] = useState<Product>({
    "id"          : undefined,
    "reference"   : '',
    "description" : '',
    "costo_price" : 0,
    "sale_price"  : 0,
    "id_unidad"    : '0',
    "id_categoria" : '0',
    "id_tax"       : '0',
    "tax_include" : false,
    "status"      : false,
  });
  const [gettingCategoriaUnidadesTax, setGettingCategoriaUnidadesTax] = useState(false);
  const [categoriaUnidadesTax, setCategoriaUnidadesTax] = useState<CategoriaUnidadesTax>({
    categoria: [],
    tax: [],
    unidad: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageManagment, setImageManagment] = useState<ImageManagementInterface[]>([]);
  const [imageManagmentRemoved, setImageManagmentRemoved] = useState<ImageManagementInterface[]>([]);


  const [modalPreviewImageVisible, setModalPreviewImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalPreviewImageVisible(true);
  };

  const closeImageModal = () => {
    setModalPreviewImageVisible(false);
    setSelectedImage(null);
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: any = {};
  
    // Validar referencia
    if (!formData.reference) newErrors.reference = 'La referencia es obligatoria.';
  
    // Validar descripción
    if (!formData.description) newErrors.description = 'La descripción es obligatoria.';
  
    // Validar costo_price
    if (!formData.costo_price) {
      newErrors.costo_price = 'El costo es obligatorio.';
    } else if (isNaN(Number(formData.costo_price)) || Number(formData.costo_price) <= 0) {
      newErrors.costo_price = 'El costo debe ser un número positivo.';
    }
  
    // Validar sale_price
    if (!formData.sale_price) {
      newErrors.sale_price = 'El precio es obligatorio.';
    } else if (isNaN(Number(formData.sale_price)) || Number(formData.sale_price) <= 0) {
      newErrors.sale_price = 'El precio debe ser un número positivo.';
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

    setLoading(true);

    try {

      const productForm = {
        "id_product" : formData.id,
        "reference"  : formData.reference,
        "description": formData.description,
        "costo"      : formData.costo_price,
        "precio"     : formData.sale_price,
        "categoria"  : formData.id_categoria,
        "unidad"     : formData.id_unidad,
        "tax"        : formData.id_tax,
        "tax_include": `${formData.tax_include}`,
        "status"     : `${formData.status}`,
      }


      await postRequest('api/productos/updateOrCreateProduct', productForm);
      await handleSendImages();
      await handleRemoveImages();

      onSave();

      Toast.show({
        type: 'success',
        text1: 'Producto guardado correctamente',
      });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: error.response?.data.message || 'Error en la respuesta del servidor',
        })
      } else if (error instanceof CustomException) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Ha ocurrido un error al cargar los productos',
        });
      }
    }finally{
      setLoading(false);
    }
  };

  const handleSendImages = async () => {

    if(imageManagment.length == 0 && product?.id){
      return
    }


    const formData = new FormData();

    for (const [index, image] of imageManagment.entries()) {
      try {
        // Convertir URI local a Base64
        const base64Data = await FileSystem.readAsStringAsync(image.image_url, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        const fileName = image.image_url.split('/').pop(); // Nombre del archivo
        const fileType = fileName?.split('.').pop() || 'jpeg'; // Tipo MIME
  
        // Agregar archivo al FormData
        formData.append(`file[${index}]`, {
          uri: `data:image/${fileType};base64,${base64Data}`,
          name: fileName,
          type: `image/${fileType}`,
        });
      } catch (error) {
        console.error(`Error al procesar la imagen ${index}:`, error);
      }
    }

    formData.append('save_location', 'db');

    try {
      await postRequest('api/productos/saveImages/'+product?.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Imágenes enviadas correctamente.',
      });
    } catch (error) {    
      throw new CustomException({ code: "04", message: 'Imagenes: ' + error.message });
    }
  };

  const handleRemoveImages = async () => {
    if(imageManagmentRemoved.length == 0){
      return
    }

    try{
      imageManagmentRemoved.forEach(async (image) => {
        await deleteRequest('api/productos/deleteImage/'+image.id);
      });

      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Imágenes eliminadas correctamente.',
      });
    }catch(error){
      if(isAxiosError(error)){
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: error.response?.data.message || 'Error en la respuesta del servidor',
        })
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error eliminando imágenes.',
      });
    }

  }

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

  const fillFieldUpdateProductMode = () => {

    if(!product) return;

    try {

      setFormData(product);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Ocurrio un problema al tratar de llenar el formulario para editar el producto',
      });
    }

  }



  useEffect(()=>{
    getCategoriaUnidadesTax();
    fillFieldUpdateProductMode();
  },[])

  const [scrollViewKey, setScrollViewKey] = useState(0);


  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>
        {/* LOADING LAYER */}
        {loading && (
          <View
            style={{
              position: 'absolute',   // Coloca este View encima de todo
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,              // Ocupa toda la pantalla
              justifyContent: 'center', // Centra verticalmente
              alignItems: 'center',     // Centra horizontalmente
              backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo semitransparente opcional
              zIndex: 1000,            // Asegura que esté por encima de otros componentes
              borderRadius:10
            }}
          >
            <ActivityIndicator animating={loading} color="blue" size="large" />
          </View>
          )}
        <View style={styles.container}>
          <Text style={styles.headerTitle}>{product ? 'Editar Producto' : 'Crear Producto'}</Text>

          <ScrollView 
            contentContainerStyle={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
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
              error={errors.costo_price}
              onChangeText={(value) => handleChange('costo_price', value)}
            />
            <TextInputField
              label="Precio"
              value={formData.sale_price}
              placeholder="Precio"
              keyboardType="numeric"
              error={errors.sale_price}
              onChangeText={(value) => handleChange('sale_price', value)}
            />


            <View style={styles.dropdownGrid}>
              {/* CATEGORIA */}
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
                  value={formData.id_categoria}
                />
              </View>
              {/* UNIDAD */}
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
                  value={formData.id_unidad}
                />
              </View>
              {/* ITEBIS */}
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
                  extraButton={{
                    icon: 'settings',
                    onPress: () => console.log('Abrir configuración'),
                    variant: 'dark'
                  }}
                  value={formData.id_tax}
                />
              </View>

            </View>

            <View style={styles.dropdownGrid}>
              <View style={styles.dropdownContainer}>
                  <Text style={styles.sectionTitle}>Impuesto Incluido</Text>
                  <Dropdown
                    label="Impuesto Incluido"
                    onSelect={(item) => handleChange('tax_include', item.value === 'SI'?1:0)}
                    options={[
                      { label: 'SI', value: 'SI' },
                      { label: 'NO', value: 'NO' },
                    ]}
                    value={formData.tax_include ? 'SI' : 'NO'}
                  />
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.sectionTitle}>Estado</Text>
                <Dropdown
                  label="Estado"
                  onSelect={(item) => handleChange('status', item.value === 'ACTIVO')}
                  options={[
                    { label: 'ACTIVO', value: 'ACTIVO' },
                    { label: 'INACTIVO', value: 'INACTIVO' },
                  ]}
                  value={formData.status ? 'ACTIVO' : 'INACTIVO'}
                />
              </View>
            </View>

            {product && (
              <>
                <View>
                  {isCameraOpen ? (
                  <Portal >
                    <Camera
                      onClose={() => setIsCameraOpen(false)}
                      onDone={(images)=>{
                        setImageManagment((prev) => [...prev, ...images.map((uri) => ({ image_url: uri }))]);
                      }}
                    />
                  </Portal>
                  ) : (
                    <View
                     style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap', // Permite que los elementos bajen a una nueva línea si no caben
                      justifyContent: 'space-between', // Distribuye los botones
                      paddingTop: 10,
                      paddingBottom: 10,
                      maxWidth: "100%", // Establece un ancho máximo para limitar el contenedor
                     }}
                    >
                      <Button title="Abrir Camara" onPress={() => setIsCameraOpen(true)} />
                      <Button
                        title="Elegir Imagenes"
                        variant='success'
                        onPress={async () => {
                          try {
                            // Verificar y solicitar permisos
                            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                            if (status === 'denied') {
                              Alert.alert(
                                'Permisos denegados',
                                'Has denegado los permisos para acceder a la galería. Ve a la configuración de la app para habilitarlos.',
                                [
                                  {
                                    text: 'Cancelar',
                                    style: 'cancel',
                                  },
                                  {
                                    text: 'Abrir configuración',
                                    onPress: () => Linking.openSettings(), // Abre la configuración de la app
                                  },
                                ]
                              );
                              return;
                            }


                            if (status !== 'granted') {
                              Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Necesitamos acceso a tu galería para seleccionar imágenes.',
                              });
                              return;
                            }


                            // Abrir la galería
                            const result = await ImagePicker.launchImageLibraryAsync({
                              mediaTypes: ["images"],
                              allowsEditing: false,
                              quality: 1, // Máxima calidad
                              allowsMultipleSelection:true,
                              selectionLimit: 5,
                            });

                            if (!result.canceled) {
                              // Manejar las imágenes seleccionadas
                              setImageManagment((prev) => {
                                const newImageManagment = [...prev, ...result.assets.map((asset) => ({ image_url: asset.uri }))];
                                setScrollViewKey((prevKey) => prevKey + 1); // Cambia la clave
                                return newImageManagment;
                              });
                            } else {
                              Toast.show({
                                type: 'info',
                                text1: 'Info',
                                text2: 'Selección cancelada.',
                              });
                            }
                          } catch (error) {
                            Toast.show({
                              type: 'error',
                              text1: 'Error',
                              text2: 'Error al abrir la galería.',
                            });
                          }
                        }}
                      />
                    </View>
                  )}
                  {/* {uploading && <Text>Subiendo imágenes...</Text>} */}
                </View>

                <View> 
                  <ScrollView
                    key={scrollViewKey}
                    style={styles.productImageScrollContainer}
                    contentContainerStyle={styles.productImagePreviewList}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <>
                      {product?.images && product.images.map((value, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            openImageModal(
                              value.image_url
                                ? value.image_url
                                : `data:image/jpeg;base64,${value.image}`
                            )
                          }
                        >
                          <View key={index} style={[
                            styles.productImageContainer,
                            {
                              backgroundColor: !product?.images? 'transparent' :product.images[index].deleted_at ? 'rgba(220, 20, 0, 0.4)' : 'transparent',
                              borderRadius:10,
                            }
                          ]}>
                            <Image
                              source={
                                value.image_url
                                  ? { uri: value.image_url } // Imagen desde URL
                                  : { uri: `data:image/jpeg;base64,${value.image}` } // Imagen en Base64
                              }
                              style={styles.productImagePreviewImage}
                            />
                            <TouchableOpacity
                              style={styles.productImageDeleteButton}
                              onPress={() => {

                                setImageManagmentRemoved((prev) => [...prev, {"id": value.id}]);

                                if(product.images)
                                  if(product.images[index].deleted_at){
                                    product.images[index].deleted_at = null;
                                    
                                    const indexToRemove = imageManagmentRemoved.findIndex((item) => item.id == value.id);

                                    if (indexToRemove !== -1) {
                                      setImageManagmentRemoved((prev) => prev.filter((_, index) => index !== indexToRemove));
                                    }

                                  }else{
                                    product.images[index].deleted_at = new Date().toISOString();
                                  }
                              }}
                            >
                              <Text style={styles.productImageDeleteButtonText}>X</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {imageManagment.map((value, index) => (
                        <React.Fragment key={`imageManagment-${index}`}>
                          <View style={[
                            styles.productImageContainer,
                            {
                              borderRadius:10,
                              backgroundColor: 'rgba(0, 255, 0, 0.4)',
                              marginRight:1,
                            }
                          ]}>
                            <Image
                              source={{ uri: value?.image_url }}
                              style={styles.productImagePreviewImage}
                            />
                            <TouchableOpacity
                              style={styles.productImageDeleteButton}
                              onPress={() => {
                                setImageManagment((prev) => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <Text style={styles.productImageDeleteButtonText}>X</Text>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      ))}
                    </>
                  </ScrollView>
                </View>
              </>
            )}
          </ScrollView>

          <Portal>
            <Modal
              visible={modalPreviewImageVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={closeImageModal}
            >

              <View style={{ 
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                justifyContent: "center",
                alignItems: "center",// styles.modalContainer
              }}>

                <View
                  style={{
                    position: "absolute",
                    top: 50,
                    // right: 50,
                    // paddingHorizontal: 20,
                    // paddingVertical: 10,
                    // backgroundColor: "red",
                    // borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Preview</Text>
                </View>


                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={{
                      width: "90%",
                      height: "70%",
                      resizeMode: "contain",
                    }}
                  />
                )}


                <Button 
                  // size="large"
                  title="Cerrar"
                  onPress={closeImageModal}
                  variant='danger'
                  icon='close'
                  style={{
                    width: "100%",
                    margin: 10,
                  }}
                />

              </View>
              
            </Modal>
          </Portal>

          {/* Botones */}
          <View style={styles.footer}>
            <Button title="Cancelar" onPress={onCancel} variant="danger" />
            <Button title="Guardar" onPress={handleSubmit} variant="primary" />
          </View>
        </View>
      </SafeAreaView>
    </Provider>
  );
};


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



  

  productImageScrollContainer: {
    maxHeight: 100,
  },
  productImagePreviewList: {
    flexDirection: "row",
    alignItems: "center", // Centrar las imágenes
    paddingVertical: 5, // Opcional: Espaciado vertical
  },
  productImagePreviewImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 5,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImageDeleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(220, 20, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageDeleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

});


export default ProductForm;
