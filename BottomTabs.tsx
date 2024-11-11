// BottomTabs.tsx
import React, {useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Entypo, MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
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


const HomeScreen = () => {

  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={Home} options={{ 
        unmountOnBlur: true,
        title: 'Home' ,
        headerShown: false,
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home-outline" color={color} size={size} />
        ),
      }} />
    </Drawer.Navigator>
  );

}


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


const Tab = createBottomTabNavigator();

export default function BottomTabs() {

  
 
  return (
    <Tab.Navigator 
    // screenOptions={screenOptions}
    >
      <Tab.Screen
        name={"TabHome"}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
          headerShown: false,
          unmountOnBlur: true,
          
        }}
      />
      <Tab.Screen
        name="Product Form"
        component={ProductForm}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pie-chart" color={color} size={size} />
          ),
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Prices"
        component={Prices}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="dollar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list" color={color} size={size} />
          ),
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="terminal" color={color} size={size} />
          ),
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Logout"
        component={Logout}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="logout" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
