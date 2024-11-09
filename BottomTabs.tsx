// BottomTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

// Importa tus pantallas
import Home        from '@/screens/Home';
import Portfolio   from '@/screens/Portfolio';
import Prices      from '@/screens/Prices';
import Settings    from '@/screens/Settings';
import Transaction from '@/screens/Transaction';
import Login       from '@/screens/Login';
import ProductListScreen from '@/screens/products/ProductListScreen';


import useStore from '@/store/useStore';

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: '#fff',
  },
};

export default function BottomTabs() {
  
  const count = useStore((state) => state.count);
 
  return (
    <Tab.Navigator 
    // screenOptions={screenOptions}
    >
      <Tab.Screen
        name={"Home"}
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={Portfolio}
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
        name="Transaction"
        component={Transaction}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="exchange" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Login"
        component={Login}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="login" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
