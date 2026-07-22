import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import { CameraView, CameraPictureOptions, useCameraPermissions } from 'expo-camera';
import Toast from 'react-native-toast-message';
import Button from "@/components/Button"


interface CameraComponentProps {
  onClose: () => void; // Llamado para cerrar la cámara.
  onDone: (images: string[]) => void; // Llamado para enviar imágenes capturadas.
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onClose, onDone }) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]); // Almacena las imágenes capturadas.
  const [facing, setFacing] = useState<'back' | 'front'>('back'); // Controla la cámara frontal o trasera.
  const [takingPicture, setTakingPicture] = useState(false); // Estado para controlar si se está tomando una foto.

  const takePicture = async () => {
    if (!cameraRef.current || takingPicture) return;

    setTakingPicture(true);
    try {
      const options: CameraPictureOptions = { quality: 0.8, base64: false };
      const result = await cameraRef.current.takePictureAsync(options);

      if (result) {
        setCapturedImages((prev) => [...prev, result.uri]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error tomando la foto',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error tomando la foto',
      });
    } finally {
      setTakingPicture(false);
    }
  };

  const handleDone = () => {
    if (capturedImages.length > 0) {
      onDone(capturedImages);
    }
    onClose(); // Cerrar la cámara
  };
  
  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color="#fff" />
        <Button title="Cancelar" variant="light" onPress={onClose} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos permiso para usar la cámara y fotografiar el producto.</Text>
        <Button
          title={permission.canAskAgain ? 'Permitir cámara' : 'Abrir configuración'}
          icon="photo-camera"
          onPress={() => {
            if (permission.canAskAgain) {
              requestPermission();
            } else {
              Linking.openSettings();
            }
          }}
        />
        <Button title="Cancelar" variant="light" onPress={onClose} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        flash="off"
        mode="picture"
        zoom={0}
        // onCameraReady={() => console.log('Camera is ready')}
        onMountError={(error) => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo inicializar la cámara',
          });
        }}
      />

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>


      <View
        style={{
          position: "absolute", // Posición absoluta
          bottom: 0, // Anclar al fondo
          left: 0, // Alinear al borde izquierdo
          right: 0, // Alinear al borde derecho
        }}
      >

        {capturedImages.length > 0 && (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.previewList}
            horizontal
            showsHorizontalScrollIndicator={false} // Opcional: Ocultar el indicador de scroll
          >
            {capturedImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteImage(index)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}


        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>
              {facing === 'back' ? 'Camara Frontal' : 'Camara Trasera'}
            </Text>
          </TouchableOpacity>
          <Button
            title="Tomar Foto"
            onPress={takePicture}
            loading={takingPicture}
          />
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.text}>Finalizar</Text>
          </TouchableOpacity>
        </View>

      </View>

    </View>
  );
};

export default CameraComponent;

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  previewContainer: {
    backgroundColor: '#f8f8f8',
    padding: 5,
    borderWidth: 1,
    borderColor:'red'
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },




  scrollContainer: {
    maxHeight: 100,
  },
  previewList: {
    flexDirection: "row",
    alignItems: "center", // Centrar las imágenes
    paddingVertical: 5, // Opcional: Espaciado vertical
  },
  previewImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 5,
  },



  imageContainer: {
    position: 'relative',
  },
  deleteButton: {
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
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

});
