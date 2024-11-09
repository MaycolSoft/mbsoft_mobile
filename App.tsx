import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';
import Login from '@/screens/Login';
import useStore from '@/store/useStore';

export default function App() {

  const accessToken = useStore((state) => state.accessToken);

  if (!accessToken) {
    return (
      <Login/>
    );
  }else{
    return (
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    );
  }
}
