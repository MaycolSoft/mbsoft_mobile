import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import useStore from '@/store/useStore';

const LoginScreen = () => {
  const [idEmpresa, setIdEmpresa] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const setAccessToken = useStore((state) => state.setAccessToken);

  
  const handleLogin = async () => {

    setAccessToken("HOLA")
    return
    // Validación básica de campos
    if (!idEmpresa || !username || !password) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    try {
      // Datos para enviar al backend
      const payload = {
        id_empresa: parseInt(idEmpresa, 10),
        username: username,
        password: password,
      };

      // URL de tu backend
      const url = 'https://laravel-modekaiser.koyeb.app/login';

      const response = await axios.post(url, payload);

      // Procesar respuesta del backend
      if (response.status === 200) {
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
        // Aquí podrías navegar a otra pantalla o guardar el token en AsyncStorage
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ha ocurrido un error en el inicio de sesión');
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Ajusta el comportamiento en iOS y Android
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          <TextInput
            style={styles.input}
            placeholder="ID de Empresa"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={idEmpresa}
            onChangeText={setIdEmpresa}
          />

          <TextInput
            style={styles.input}
            placeholder="Username o Email"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.rememberContainer}>
            <Text style={styles.rememberText}>Recordar</Text>
            <TouchableOpacity
              style={[styles.checkbox, remember ? styles.checkboxSelected : null]}
              onPress={() => setRemember(!remember)}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberText: {
    fontSize: 16,
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 3,
  },
  checkboxSelected: {
    backgroundColor: '#333',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
