import React, {useEffect} from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import useStore from '@/store/useStore';

//////////////// Screens ////////////////
import Portfolio   from '@/screens/Portfolio';
import Prices      from '@/screens/Prices';
import Settings    from '@/screens/Settings';
import LogScreen   from '@/components/LogScreen';
import Iframe      from '@/components/Iframe';
import ProductListScreen from '@/screens/products/ProductListScreen';
import ProductForm from '@/screens/products/ProductForm';
//////////////// Screens ////////////////



const Logout = () => {
  const { setAccessToken } = useStore();

  useEffect(() => {
    // Limpia el accessToken y redirige al usuario al LoginScreen
    setAccessToken(null);
    // navigation.replace('Login'); // Reemplaza para evitar volver a las pestañas
  }, []);

  return null; // No renderiza nada ya que solo ejecuta la lógica de logout
};


type NavigationProp = StackNavigationProp<{
  [key: string]: any; // Permitir propiedades adicionales
}>;


const App: React.FC = () => {
  
  const { config } = useStore();
  const navigation = useNavigation<NavigationProp>();
  const Drawer = createDrawerNavigator ();


  return (
    <Drawer.Navigator 
      // initialRouteName="ProductListScreen"
    >
      <Drawer.Screen 
        name="Productos"
        component={ProductListScreen}
        initialParams={{ useSafeArea: false }}
        options={{ unmountOnBlur: true }}  
      />

      <Drawer.Screen 
        name="Telescope"
        component={Iframe}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault(); // Evitar navegación predeterminada

            Alert.alert(
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
        options={{ unmountOnBlur: true }}
      />


      <Drawer.Screen name="Settings"    component={Settings} />
      <Drawer.Screen name="Portfolio"   component={Portfolio} />
      
      <Drawer.Screen name="Prices"      component={Prices} />
      <Drawer.Screen name="Http Log"    component={LogScreen} />
      <Drawer.Screen name="Crear Producto" component={ProductForm} />


      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          drawerItemStyle: {
            backgroundColor: config.darkMode ? '#333' : '#ececec', 
          }, // Opcional: para personalizar el estilo
          drawerLabel: "Logout",
          // drawerIcon: ({ color, size }) => (
          //   <Icon name="logout" color={color} size={size} />
          // ),
          // onPress: () => {
          //   // Alert.alert('Confirmación', '¿Seguro que deseas cerrar sesión?');
          // },
        }}
      />
    </Drawer.Navigator>
  );
};

export default App;
