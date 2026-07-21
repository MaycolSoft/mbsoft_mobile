import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import useStore from '@/store/useStore';
import { showAlert } from '@/components/AppAlert';

const DrawerContent = (props: DrawerContentComponentProps) => {
  const theme = useTheme();
  const setAccessToken = useStore((state) => state.setAccessToken);

  const handleLogout = () => {
    showAlert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => setAccessToken(null) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, fontWeight: '700', marginTop: theme.spacing.sm }}>
            mbsoft
          </Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color={theme.colors.danger} />
          <Text style={{ color: theme.colors.danger, marginLeft: theme.spacing.md, fontSize: theme.typography.fontSize.md }}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  logo: {
    width: 56,
    height: 56,
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});

export default DrawerContent;
