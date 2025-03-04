import React, { useState, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; 
import { postRequest, isAxiosError } from '@/api/apiService';
import useStore from '@/store/useStore';
import TextInputField from '@/components/InputField';
import CheckBox from '@/components/CheckBox';


import Input from '@/components/Input';

const LoginScreen = () => {
  const { config } = useStore();
  const [idEmpresa, setIdEmpresa] = useState('1000');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);


  const [showInput, setShowInput] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setShowInput(!showInput));
  };



  const setAccessToken = useStore((state) => state.setAccessToken);

  // Función para cargar las credenciales guardadas (si existen)
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedIdEmpresa = await AsyncStorage.getItem('idEmpresa');
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        
        if (savedIdEmpresa && savedUsername && savedPassword) {
          setIdEmpresa(savedIdEmpresa);
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRemember(true); // Activa el switch de "Remember Me" si hay credenciales guardadas
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    loadCredentials();
  }, []);

  // Función para guardar credenciales en AsyncStorage
  const saveCredentials = async () => {
    if (remember) {
      try {
        await AsyncStorage.setItem('idEmpresa', idEmpresa);
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('password', password);
      } catch (error) {
        console.error('Error saving credentials:', error);
      }
    }
  };

  // Función para borrar credenciales de AsyncStorage
  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('idEmpresa');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!idEmpresa || !username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor, complete todos los campos.',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_empresa: parseInt(idEmpresa, 10),
        email: username,
        password: password,
      };

      const response = await postRequest("api/login", payload);

      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Inicio de sesión exitoso',
      });

      setAccessToken(response.data.data.token);

      if (remember) {
        await saveCredentials(); // Guarda las credenciales si el usuario activó "Remember Me"
      } else {
        await clearCredentials(); // Borra las credenciales si "Remember Me" no está activo
      }

    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'info',
          text1: 'Warning',
          text2: error.response?.data.message || 'Error en la respuesta del servidor',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Ha ocurrido un error en el inicio de sesión',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const textStyle = {
    color: config.darkMode ? '#fff' : 'black',
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          <TouchableWithoutFeedback onPress={handlePress}>
            <Animated.Text style={[styles.title, textStyle, { transform: [{ scale: scaleValue }] }]}>
              Iniciar Sesión
            </Animated.Text>
          </TouchableWithoutFeedback> 

          {showInput && (
            <View style={{ 
              display:"flex",
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 20 
            }}>
              {/* <Text style={[{ marginRight: 10, fontSize: 16 }, textStyle]}>ID de Empresa</Text> */}
              {/* <TextInputField
                placeholder="Empresa"
                keyboardType="numeric"
                value={idEmpresa}
                onChangeText={setIdEmpresa}
                editable={!loading}
                style={{
                  // flex: 1,
                  width:100,
                  height: 45,
                }}
              /> */}
              <Input
                label="Empresa"
                placeholder="Codigo Empresa"
                iconName="business"
                iconPosition="right"
                keyboardType='numeric'
                // error={errorMessage}
              />
            </View>
          )}


          <TextInputField
            placeholder="Username o Email"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <TextInputField
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <View style={styles.rememberContainer}>
            <Text style={[styles.rememberText, textStyle]}>Recordar</Text>
            {/* <TouchableOpacity
              style={[styles.checkbox, remember ? styles.checkboxSelected : null]}
              onPress={() => setRemember(!remember)}
              disabled={loading}
            /> */}
            <CheckBox
              remember={remember}
              setRemember={()=>setRemember(!remember)}
              disabled={loading}
            />
          </View>


          <TouchableOpacity
            style={[styles.loginButton, loading && { backgroundColor: config.darkMode ? '#333' : '#07608f' }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
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
    // backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
