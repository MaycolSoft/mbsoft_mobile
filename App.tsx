// App.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Toast, { BaseToast, BaseToastProps, ToastConfig } from "react-native-toast-message";

import Login from '@/screens/Login';
import useStore from '@/store/useStore';
import Home from '@/screens/Home';

////////////////////////////
const Stack = createStackNavigator();

const toastProps: BaseToastProps = {
  text1Style: {
    fontSize: 18,
  },
  text2Style: {
    fontSize: 14,
  },
  text2NumberOfLines: 0,
  style: {
    height: "auto",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
};
////////////////////////////





export default function App() {
  const { accessToken, config } = useStore();
  
  const resolvedTheme = config.darkMode ? 'dark' : 'light';


  const theme: Theme = useMemo(() => ({
    dark: resolvedTheme === 'dark',
    colors: {
      primary: resolvedTheme === 'dark' ? '#BB86FC' : '#6200EE',
      background: resolvedTheme === 'dark' ? '#121212' : '#FFFFFF',
      card: resolvedTheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
      text: resolvedTheme === 'dark' ? '#FFFFFF' : '#000000',
      border: resolvedTheme === 'dark' ? '#383838' : '#E8E8E8',
      notification: resolvedTheme === 'dark' ? '#FF0266' : '#FF453A',
    },
  }), [resolvedTheme]);



const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        { 
          borderLeftColor: '#69C779',
          backgroundColor: theme.colors.card,
        },
        toastProps.style
      ]}
      text1Style={[toastProps.text1Style, { color: theme.colors.text }]}
      text2Style={[toastProps.text2Style, { color: theme.colors.text }]}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: "#FE6301",
        },
      ]}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: "#FFC107",
        },
      ]}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style
      ]}
    />
  ),
};

  return (
    <NavigationContainer theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  }
                ],
              },
            }),
          }}>
          
          {accessToken ? (
            <Stack.Screen name="Home" component={Home} />
          ) : (
            <Stack.Screen 
              name="Login" 
              component={Login}
              options={{
                transitionSpec: {
                  open: { animation: 'timing', config: { duration: 500 } },
                  close: { animation: 'timing', config: { duration: 300 } },
                },
              }}
            />
          )}
        </Stack.Navigator>

        <Toast config={toastConfig} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
