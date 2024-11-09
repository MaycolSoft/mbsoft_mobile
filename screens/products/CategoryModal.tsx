import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { Modal, Portal, Provider } from 'react-native-paper';

interface CategoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (description: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ visible, onDismiss, onSave }) => {
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave(description);
    onDismiss();
  };

  return (
    <Provider>
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.title}>Crear o Editar Categoría</Text>
          <TextInput
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button title="Guardar" onPress={handleSave} />
            <Button title="Cancelar" onPress={onDismiss} color="red" />
          </View>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    padding: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default CategoryModal;
