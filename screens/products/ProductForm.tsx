import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Linking, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postRequest, getRequest, deleteRequest, isAxiosError } from '@/api/apiService';
import { showAlert } from '@/components/AppAlert';
import { useTheme } from '@/theme/ThemeProvider';

import CustomException from '@/Utils/CustomException';
import Dropdown       from '@/components/Dropdown';
import Button         from '@/components/Button';
import Camera         from '@/components/Camera';
import TextInput      from '@/components/TextInput';
import SwitchRow      from '@/components/SwitchRow';
import { Product, ProductImage, ProductFormInterface, CategoriaUnidadesTax } from '@/interfaces';


interface PendingProductImage {
  uri: string;
  name: string;
  mimeType: string;
  file?: any;
}

type ImageSaveLocation = 'local' | 'db';

const getImageExtension = (uri: string, fileName?: string | null) => {
  const source = fileName || uri.split('?')[0];
  const extension = source.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
};

const toPendingImage = (
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
  file?: any,
): PendingProductImage => {
  const extension = getImageExtension(uri, fileName);
  const normalizedMimeExtension = extension === 'jpg' ? 'jpeg' : extension;

  return {
    uri,
    name: fileName || `producto-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`,
    mimeType: mimeType || `image/${normalizedMimeExtension}`,
    file,
  };
};

const getProductImageUri = (image: ProductImage) => {
  if (image.image_url) return image.image_url;
  if (!image.image) return '';

  const extension = image.extension === 'jpg' ? 'jpeg' : image.extension || 'jpeg';
  return `data:image/${extension};base64,${image.image}`;
};

const getSavedProductId = (responseData: any, fallbackId?: number) => {
  if (fallbackId) return fallbackId;

  const payload = responseData?.data ?? responseData;
  const candidates = [
    payload,
    payload?.id,
    payload?.id_product,
    payload?.product_id,
    payload?.product?.id,
    responseData?.id,
    responseData?.id_product,
  ];

  const id = candidates.find((candidate) => Number.isFinite(Number(candidate)) && Number(candidate) > 0);
  return id === undefined ? undefined : Number(id);
};

const SectionTitle = ({ icon, children }: { icon: keyof typeof MaterialIcons.glyphMap; children: string }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>
      <MaterialIcons name={icon} size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, fontWeight: '700' }}>{children}</Text>
    </View>
  );
};

const ProductForm = ({ product, onCancel=()=>{}, onSave=()=>{} }: ProductFormInterface) => {
  const theme = useTheme();
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
  const [categoriaUnidadesTax, setCategoriaUnidadesTax] = useState<CategoriaUnidadesTax>({
    categoria: [],
    tax: [],
    unidad: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingProductImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product?.images ?? []);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [imageSaveLocation, setImageSaveLocation] = useState<ImageSaveLocation>('local');

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

    if (!formData.reference) newErrors.reference = 'La referencia es obligatoria.';
    if (!formData.description) newErrors.description = 'La descripción es obligatoria.';

    if (!formData.costo_price) {
      newErrors.costo_price = 'El costo es obligatorio.';
    } else if (isNaN(Number(formData.costo_price)) || Number(formData.costo_price) <= 0) {
      newErrors.costo_price = 'El costo debe ser un número positivo.';
    }

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

      const response = await postRequest('api/productos/updateOrCreateProduct', productForm);
      const productId = getSavedProductId(response.data, formData.id);

      if (pendingImages.length > 0 && !productId) {
        throw new CustomException({
          code: '05',
          message: 'El producto se guardó, pero el servidor no devolvió su ID para asociar las imágenes.',
        });
      }

      if (productId) {
        await handleSendImages(productId);
      }
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
          text2: 'Ha ocurrido un error al guardar el producto',
        });
      }
    }finally{
      setLoading(false);
    }
  };

  const handleSendImages = async (productId: number) => {
    if (pendingImages.length === 0) return;

    const imagesFormData = new FormData();

    for (const image of pendingImages) {
      if (Platform.OS === 'web') {
        const file = image.file ?? await fetch(image.uri).then((response) => response.blob());
        imagesFormData.append('file[]', file, image.name);
      } else {
        imagesFormData.append('file[]', {
          uri: image.uri,
          name: image.name,
          type: image.mimeType,
        } as any);
      }
    }

    imagesFormData.append('save_location', imageSaveLocation);

    try {
      await postRequest(`api/productos/saveImages/${productId}`, imagesFormData);
    } catch (error: any) {
      const message = isAxiosError(error)
        ? error.response?.data.message || error.message
        : error?.message;
      throw new CustomException({ code: '04', message: `Imágenes: ${message || 'no se pudieron guardar'}` });
    }
  };

  const handleRemoveImages = async () => {
    if (removedImageIds.length === 0) return;

    try {
      await Promise.all(
        removedImageIds.map((imageId) => deleteRequest(`api/productos/deleteImage/${imageId}`)),
      );
    } catch (error: any) {
      const message = isAxiosError(error)
        ? error.response?.data.message || error.message
        : error?.message;
      throw new CustomException({ code: '06', message: `Imágenes: ${message || 'no se pudieron eliminar'}` });
    }
  };

  const getProductImages = async (productId: number) => {
    try {
      const response = await getRequest(`api/productos/getImages/${productId}`);
      const images = response.data?.data;

      if (Array.isArray(images)) {
        setExistingImages(images);
      }
    } catch (error) {
      if (!product?.images?.length) {
        Toast.show({
          type: 'info',
          text1: 'Imágenes',
          text2: isAxiosError(error)
            ? error.response?.data.message || 'No se pudieron consultar las imágenes.'
            : 'No se pudieron consultar las imágenes.',
        });
      }
    }
  };

  const getCategoriaUnidadesTax = async () => {
    try {
      const response = await getRequest('api/pos/getCategoriaUnidadesTax', {})
      setCategoriaUnidadesTax(response.data?.data);
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

    setPendingImages([]);
    setRemovedImageIds([]);
    setExistingImages(product?.images ?? []);

    if (product?.id) {
      getProductImages(product.id);
    }
  }, [product?.id])

  const [scrollViewKey, setScrollViewKey] = useState(0);

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === 'denied') {
        showAlert(
          'Permisos denegados',
          'Has denegado los permisos para acceder a la galería. Ve a la configuración de la app para habilitarlos.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled) {
        setPendingImages((prev) => {
          const newImages = result.assets.map((asset) =>
            toPendingImage(asset.uri, asset.fileName, asset.mimeType, asset.file),
          );
          setScrollViewKey((prevKey) => prevKey + 1);
          return [...prev, ...newImages];
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error al abrir la galería.',
      });
    }
  };

  const toggleRemoveExistingImage = (imageId: number) => {
    const isMarkedForDeletion = removedImageIds.includes(imageId);

    setRemovedImageIds((prev) =>
      isMarkedForDeletion ? prev.filter((id) => id !== imageId) : [...prev, imageId],
    );
  };

  return (
    <View>
      {/* Información General */}
      <SectionTitle icon="inventory-2">Información General</SectionTitle>
      <TextInput
        label="Referencia"
        iconName="label"
        value={formData.reference}
        placeholder="Referencia"
        onChangeText={(value) => handleChange('reference', value)}
        error={errors.reference}
      />

      <TextInput
        label="Descripción"
        iconName="description"
        value={formData.description}
        placeholder="Descripción"
        onChangeText={(value) => handleChange('description', value)}
        error={errors.description}
      />

      {/* Precios */}
      <SectionTitle icon="payments">Precios</SectionTitle>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Costo"
            iconName="paid"
            value={`${formData.costo_price}`}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.costo_price}
            onChangeText={(value) => handleChange('costo_price', value)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Precio"
            iconName="sell"
            value={`${formData.sale_price}`}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.sale_price}
            onChangeText={(value) => handleChange('sale_price', value)}
          />
        </View>
      </View>

      {/* Clasificación */}
      <SectionTitle icon="category">Clasificación</SectionTitle>
      <View style={{ marginBottom: theme.spacing.md }}>
        <Dropdown
          label="Categoría"
          iconName="category"
          onSelect={(item) => handleChange('id_categoria', item.value)}
          options={categoriaUnidadesTax.categoria.map(item => ({
            label: item?.description,
            value: item?.id,
          }))}
          value={formData.id_categoria}
        />
      </View>

      <View style={{ marginBottom: theme.spacing.md }}>
        <Dropdown
          label="Unidad"
          iconName="straighten"
          onSelect={(item) => handleChange('id_unidad', item.value)}
          options={categoriaUnidadesTax.unidad.map(item => ({
            label: item?.description,
            value: item?.id,
          }))}
          value={formData.id_unidad}
        />
      </View>

      <View style={{ marginBottom: theme.spacing.lg }}>
        <Dropdown
          label="ITBIS"
          iconName="percent"
          onSelect={(item) => handleChange('id_tax', item.value)}
          options={categoriaUnidadesTax.tax.map(item => ({
            label: item?.description,
            value: item?.id,
          }))}
          value={formData.id_tax}
        />
      </View>

      <SwitchRow
        label="Impuesto incluido en el precio"
        iconName="receipt-long"
        value={!!formData.tax_include}
        onChange={(value) => handleChange('tax_include', value)}
      />

      <SwitchRow
        label="Producto activo"
        iconName="toggle-on"
        value={!!formData.status}
        onChange={(value) => handleChange('status', value)}
      />

      <SectionTitle icon="photo-camera">Imágenes</SectionTitle>

      <SwitchRow
        label="Guardar imágenes en la base de datos"
        description={imageSaveLocation === 'db'
          ? 'Modo DB: almacena el contenido de la imagen en base64.'
          : 'Modo local: guarda el archivo en storage y utiliza image_url.'}
        iconName={imageSaveLocation === 'db' ? 'dns' : 'folder'}
        value={imageSaveLocation === 'db'}
        onChange={(enabled) => setImageSaveLocation(enabled ? 'db' : 'local')}
      />

      {isCameraOpen ? (
        <Modal visible={isCameraOpen} animationType="slide" presentationStyle="fullScreen">
          <Camera
            onClose={() => setIsCameraOpen(false)}
            onDone={(images) => {
              setPendingImages((prev) => [...prev, ...images.map((uri) => toPendingImage(uri))]);
              setScrollViewKey((prevKey) => prevKey + 1);
            }}
          />
        </Modal>
      ) : (
        <View style={styles.imageActionsRow}>
          <Button title="Abrir cámara" icon="photo-camera" variant="light" onPress={() => setIsCameraOpen(true)} style={{ flex: 1 }} />
          <Button title="Elegir imágenes" icon="photo-library" variant="light" onPress={pickFromGallery} style={{ flex: 1 }} />
        </View>
      )}

      {(existingImages.length > 0 || pendingImages.length > 0) ? (
        <ScrollView
          key={scrollViewKey}
          style={styles.productImageScrollContainer}
          contentContainerStyle={styles.productImagePreviewList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {existingImages.map((value, index) => {
            const hasImageId = typeof value.id === 'number';
            const markedForDeletion = hasImageId && removedImageIds.includes(value.id as number);
            const imageUri = getProductImageUri(value);

            return (
              <TouchableOpacity
                key={value.id ?? `existing-${index}`}
                onPress={() => openImageModal(imageUri)}
              >
                <View style={[styles.imageThumb, { borderRadius: theme.radius.md, borderColor: theme.colors.border }]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[styles.productImagePreviewImage, { borderRadius: theme.radius.md }]}
                  />
                  {markedForDeletion && (
                    <View style={[styles.deletedOverlay, { backgroundColor: `${theme.colors.danger}66`, borderRadius: theme.radius.md }]} />
                  )}
                  {hasImageId && (
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: markedForDeletion ? theme.colors.success : theme.colors.danger }]}
                      onPress={() => toggleRemoveExistingImage(value.id as number)}
                    >
                      <MaterialIcons name={markedForDeletion ? 'undo' : 'close'} size={14} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {pendingImages.map((value, index) => (
            <TouchableOpacity
              key={`${value.uri}-${index}`}
              onPress={() => openImageModal(value.uri)}
            >
              <View style={[styles.imageThumb, { borderRadius: theme.radius.md, borderColor: theme.colors.success }] }>
                <Image source={{ uri: value.uri }} style={[styles.productImagePreviewImage, { borderRadius: theme.radius.md }]} />
                <TouchableOpacity
                  style={[styles.imageActionButton, { backgroundColor: theme.colors.danger }]}
                  onPress={() => setPendingImages((prev) => prev.filter((_, i) => i !== index))}
                >
                  <MaterialIcons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.emptyImagesText, { color: theme.colors.textMuted }]}>Aún no has agregado imágenes.</Text>
      )}

      <Modal visible={modalPreviewImageVisible} transparent animationType="fade" onRequestClose={closeImageModal}>
        <View style={styles.previewBackdrop}>
          <TouchableOpacity style={styles.previewClose} onPress={closeImageModal} hitSlop={12}>
            <MaterialIcons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          )}
        </View>
      </Modal>

      {/* Botones */}
      <View style={styles.footer}>
        <Button title="Cancelar" onPress={onCancel} variant="danger" disabled={loading} style={{ flex: 1 }} />
        <Button title="Guardar" onPress={handleSubmit} variant="primary" loading={loading} style={{ flex: 1 }} />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  imageActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  productImageScrollContainer: {
    maxHeight: 110,
  },
  productImagePreviewList: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  emptyImagesText: {
    marginBottom: 8,
    fontSize: 14,
  },
  productImagePreviewImage: {
    width: 84,
    height: 84,
  },
  imageThumb: {
    position: 'relative',
    borderWidth: 1,
  },
  deletedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageActionButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  previewImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
});


export default ProductForm;
