import React, {useEffect} from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import useStore from '@/store/useStore';


//////////////// Screens ////////////////
import Home        from '@/screens/Home';
import Portfolio   from '@/screens/Portfolio';
import Prices      from '@/screens/Prices';
import Settings    from '@/screens/Settings';
import LogScreen   from '@/components/LogScreen';
import Login       from '@/screens/Login';
import ProductListScreen from '@/screens/products/ProductListScreen';
import ProductForm from '@/screens/products/ProductForm';
//////////////// Screens ////////////////



const Logout = () => {
  const navigation = useNavigation();
  const setAccessToken = useStore((state) => state.setAccessToken);

  useEffect(() => {
    // Limpia el accessToken y redirige al usuario al LoginScreen
    setAccessToken(null);
    // navigation.replace('Login'); // Reemplaza para evitar volver a las pestañas
  }, []);

  return null; // No renderiza nada ya que solo ejecuta la lógica de logout
};




const Drawer = createDrawerNavigator();

const App: React.FC = () => {
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

      <Drawer.Screen name="Settings"  component={Settings} />
      <Drawer.Screen name="Portfolio" component={Portfolio} />
      
      <Drawer.Screen name="Prices"      component={Prices} />
      <Drawer.Screen name="Http Log"    component={LogScreen} />
      <Drawer.Screen name="ProductForm" component={ProductForm} />


      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          drawerItemStyle: { backgroundColor: '#f8d7da' }, // Opcional: para personalizar el estilo
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
