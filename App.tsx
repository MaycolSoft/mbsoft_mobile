// App.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Toast, { BaseToast, BaseToastProps, ToastConfig } from "react-native-toast-message";

import Login from '@/screens/Login';
import useStore from '@/store/useStore';
import Home from '@/screens/Home';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { AppAlertProvider } from '@/components/AppAlert';

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

function AppContent() {
  const { accessToken } = useStore();
  const theme = useTheme();

  const navTheme: Theme = useMemo(() => ({
    dark: theme.dark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
    fonts: DefaultTheme.fonts,
  }), [theme]);

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        {...toastProps}
        style={[
          {
            borderLeftColor: theme.colors.success,
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
            borderLeftColor: theme.colors.danger,
            backgroundColor: theme.colors.card,
          },
        ]}
        text1Style={[toastProps.text1Style, { color: theme.colors.text }]}
        text2Style={[toastProps.text2Style, { color: theme.colors.text }]}
      />
    ),
    warning: (props) => (
      <BaseToast
        {...props}
        {...toastProps}
        style={[
          toastProps.style,
          {
            borderLeftColor: theme.colors.warning,
            backgroundColor: theme.colors.card,
          },
        ]}
        text1Style={[toastProps.text1Style, { color: theme.colors.text }]}
        text2Style={[toastProps.text2Style, { color: theme.colors.text }]}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        {...toastProps}
        style={[
          toastProps.style,
          { backgroundColor: theme.colors.card },
        ]}
        text1Style={[toastProps.text1Style, { color: theme.colors.text }]}
        text2Style={[toastProps.text2Style, { color: theme.colors.text }]}
      />
    ),
  };

  return (
    <NavigationContainer theme={navTheme}>
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
        <AppAlertProvider />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
