// HomeScreen.tsx
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import CameraComponent from '@/components/Camera';


export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false); // Controla la apertura de la cámara
  const [images, setImages] = useState<string[]>([]); // Almacena las imágenes capturadas

  const handleSendImages = (capturedImages: string[]) => {
    setImages(capturedImages); // Guarda las imágenes en el estado
  };

  return (
    <View style={styles.container}>
      {isCameraOpen ? (
        <CameraComponent
          onClose={() => setIsCameraOpen(false)} // Cierra la cámara
          onDone={handleSendImages} // Recibe las imágenes capturadas
        />
      ) : (
        <View style={styles.content}>
          <TouchableOpacity style={styles.button} onPress={() => setIsCameraOpen(true)}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>Captured Images:</Text>
              <View style={styles.previewList}>
                {images.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.previewImage} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  content: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 5,
  },
});
