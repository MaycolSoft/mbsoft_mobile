import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { postRequest, isAxiosError } from '@/api/apiService';
import { DEFAULT_BASE_URL } from '@/api/axiosInstance';
import useStore from '@/store/useStore';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';
import CheckBox from '@/components/CheckBox';
import Button from '@/components/Button';

const LoginScreen = () => {
  const theme = useTheme();
  const [idEmpresa, setIdEmpresa] = useState('1000');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmpresa, setShowEmpresa] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);

  const setAccessToken = useStore((state) => state.setAccessToken);
  const apiUrl = useStore((state) => state.config.apiUrl);
  const updateConfig = useStore((state) => state.updateConfig);
  const [serverUrl, setServerUrl] = useState(apiUrl || DEFAULT_BASE_URL);

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
          setRemember(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    loadCredentials();
  }, []);

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
        await saveCredentials();
      } else {
        await clearCredentials();
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

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.xxl,
                ...theme.shadow,
              },
            ]}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.typography.fontSize.xl }]}>
              Iniciar Sesión
            </Text>

            <TextInput
              placeholder="Username o Email"
              iconName="person-outline"
              value={username}
              onChangeText={setUsername}
              editable={!loading}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Contraseña"
              iconName="lock-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {showEmpresa ? (
              <TextInput
                label="Empresa"
                placeholder="Código Empresa"
                iconName="business"
                keyboardType="numeric"
                value={idEmpresa}
                onChangeText={setIdEmpresa}
                editable={!loading}
              />
            ) : (
              <TouchableOpacity onPress={() => setShowEmpresa(true)} style={styles.empresaToggle}>
                <Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.sm }}>
                  Cambiar código de empresa
                </Text>
              </TouchableOpacity>
            )}

            {showServerConfig ? (
              <View>
                <TextInput
                  label="URL del servidor"
                  placeholder="http://ip:puerto/"
                  iconName="dns"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  editable={!loading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Button
                  title="Guardar servidor"
                  variant="light"
                  onPress={() => {
                    updateConfig({ apiUrl: serverUrl.trim() || undefined });
                    setShowServerConfig(false);
                    Toast.show({ type: 'success', text1: 'Servidor actualizado', text2: serverUrl.trim() || DEFAULT_BASE_URL });
                  }}
                  style={{ marginBottom: theme.spacing.lg }}
                />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setShowServerConfig(true)} style={styles.empresaToggle}>
                <Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.sm }}>
                  Configurar servidor
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.rememberContainer, { marginBottom: theme.spacing.xl }]}>
              <CheckBox remember={remember} setRemember={setRemember} disabled={loading} />
              <Text style={[styles.rememberText, { color: theme.colors.text, marginLeft: theme.spacing.sm }]}>
                Recordar mis datos
              </Text>
            </View>

            <Button
              title="Ingresar"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  empresaToggle: {
    marginBottom: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 14,
  },
});

export default LoginScreen;
