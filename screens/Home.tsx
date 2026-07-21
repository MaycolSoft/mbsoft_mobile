import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import DrawerContent from '@/components/DrawerContent';
import { showAlert } from '@/components/AppAlert';

//////////////// Screens ////////////////
import Portfolio   from '@/screens/Portfolio';
import Prices      from '@/screens/Prices';
import Settings    from '@/screens/Settings';
import LogScreen   from '@/components/LogScreen';
import Iframe      from '@/components/Iframe';
import ProductListScreen from '@/screens/products/ProductListScreen';
import ProductForm from '@/screens/products/ProductForm';
import BusinessConfigurationScreen from '@/screens/business/BusinessConfigurationScreen';
//////////////// Screens ////////////////


type NavigationProp = StackNavigationProp<{
  [key: string]: any; // Permitir propiedades adicionales
}>;


const Home: React.FC = () => {

  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textMuted,
        drawerActiveBackgroundColor: theme.dark ? theme.colors.surface : `${theme.colors.primary}1A`,
        drawerStyle: { backgroundColor: theme.colors.card, width: 260 },
        drawerLabelStyle: { fontSize: theme.typography.fontSize.sm, marginLeft: -8 },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen
        name="Productos"
        component={ProductListScreen}
        initialParams={{ useSafeArea: false }}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="inventory-2" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Crear Producto"
        component={ProductForm}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="add-box" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Telescope"
        component={Iframe}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault(); // Evitar navegación predeterminada

            showAlert(
              "Abrir Telescope",
              "¿Cómo deseas abrir la página?",
              [
                {
                  text: "WebView",
                  onPress: () =>  navigation.navigate('Telescope', { openInWebView: true }),
                },
                {
                  text: "Navegador Externo",
                  onPress: () => navigation.navigate('Telescope', { openInWebView: false }),
                },
                { text: "Cancelar", style: "cancel" },
              ]
            );
          },
        }}
        options={{
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="telescope" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Prices"
        component={Prices}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="sell" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Portfolio"
        component={Portfolio}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="people-outline" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Http Log"
        component={LogScreen}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="receipt-long" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Config. Negocio"
        component={BusinessConfigurationScreen}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="store" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default Home;
