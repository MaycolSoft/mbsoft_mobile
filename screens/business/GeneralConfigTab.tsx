import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { getRequest, postRequest, isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';

interface GeneralConfigForm {
  name_business: string;
  rnc: string;
  enable_system_membership_points: boolean;
  logo_preview: string;
  logo_uri?: string;
}

const GeneralConfigTab = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GeneralConfigForm>({
    name_business: '',
    rnc: '',
    enable_system_membership_points: false,
    logo_preview: '',
  });

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await getRequest('api/getConfigurationBussines');
      const data = response.data.data;
      setForm((prev) => ({
        ...prev,
        name_business: data.name,
        rnc: data.rnc ?? '',
        enable_system_membership_points: !!data.enable_system_membership_points,
        logo_preview: data.image,
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo cargar la configuración',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const pickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permisos', text2: 'Necesitamos acceso a tus fotos para elegir el logo.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setForm((prev) => ({ ...prev, logo_uri: result.assets[0].uri }));
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name_business', form.name_business);
      formData.append('rnc', form.rnc);
      formData.append('enable_system_membership_points', form.enable_system_membership_points ? '1' : '0');

      if (form.logo_uri) {
        const base64Data = await FileSystem.readAsStringAsync(form.logo_uri, {
          encoding: (FileSystem as any).EncodingType.Base64,
        });
        const fileName = form.logo_uri.split('/').pop() || 'logo.jpg';
        const fileType = fileName.split('.').pop() || 'jpeg';

        formData.append('logo', {
          uri: `data:image/${fileType};base64,${base64Data}`,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await postRequest('api/saveGeneralConfiguration', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'Configuración guardada' });
      await loadConfig();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo guardar la configuración',
      });
    } finally {
      setSaving(false);
    }
  };

  const logoSource = form.logo_uri
    ? { uri: form.logo_uri }
    : form.logo_preview
    ? { uri: `data:image/png;base64,${form.logo_preview}` }
    : undefined;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
      <TouchableOpacity onPress={pickLogo} style={styles.logoWrapper}>
        {logoSource ? (
          <Image source={logoSource} style={[styles.logo, { borderRadius: theme.radius.lg }]} resizeMode="contain" />
        ) : (
          <View
            style={[
              styles.logo,
              styles.logoPlaceholder,
              { borderRadius: theme.radius.lg, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm }}>Sin logo</Text>
          </View>
        )}
        <Text style={{ color: theme.colors.primary, marginTop: theme.spacing.sm, textAlign: 'center' }}>
          Cambiar logo
        </Text>
      </TouchableOpacity>

      <TextInput
        label="Nombre del negocio"
        value={form.name_business}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name_business: text }))}
        editable={!loading}
      />

      <TextInput
        label="RNC"
        value={form.rnc}
        onChangeText={(text) => setForm((prev) => ({ ...prev, rnc: text }))}
        editable={!loading}
      />

      <View
        style={[
          styles.switchRow,
          { borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md },
        ]}
      >
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, flex: 1 }}>
          Sistema de puntos de membresía
        </Text>
        <Switch
          value={form.enable_system_membership_points}
          onValueChange={(value) => setForm((prev) => ({ ...prev, enable_system_membership_points: value }))}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor="#fff"
        />
      </View>

      <Button title="Guardar configuración" onPress={saveConfig} loading={saving} disabled={loading} style={{ marginTop: theme.spacing.lg }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
  },
  logoPlaceholder: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
});

export default GeneralConfigTab;
