import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import { CameraView, CameraPictureOptions } from 'expo-camera';
import Toast from 'react-native-toast-message';
import Button from "@/components/Button"


interface CameraComponentProps {
  onClose: () => void; // Llamado para cerrar la cámara.
  onDone: (images: string[]) => void; // Llamado para enviar imágenes capturadas.
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onClose, onDone }) => {
  const cameraRef = useRef<CameraView>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]); // Almacena las imágenes capturadas.
  const [facing, setFacing] = useState<'back' | 'front'>('front'); // Controla la cámara frontal o trasera.
  const [takingPicture, setTakingPicture] = useState(false); // Estado para controlar si se está tomando una foto.

  const takePicture = async () => {
    setTakingPicture(true)
    if (cameraRef.current) {
      try {
        const options: CameraPictureOptions = { quality: 0.8, base64: false };
        const result = await cameraRef.current.takePictureAsync(options); // Llamamos correctamente `takePicture`
        
        if(result){
          setCapturedImages((prev) => [...prev, result.uri]);
        }else{
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "Error Tomando la foto",
          });
        }
        
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "Error Tomando la foto",
        });
      }finally{
        setTakingPicture(false)
      }
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
            disabled={takingPicture}
          />
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.text}>Done</Text>
          </TouchableOpacity>
        </View>

      </View>

    </View>
  );
};

export default CameraComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 4,
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
