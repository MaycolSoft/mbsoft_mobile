// App.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from '@/BottomTabs';
import Login from '@/screens/Login';
import useStore from '@/store/useStore';
import Toast from 'react-native-toast-message';


export default function App() {
  const accessToken = useStore((state) => state.accessToken);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [showBottomTabs, setShowBottomTabs] = useState(false); // Estado para controlar qué pantalla mostrar

  useEffect(() => {
    if (accessToken) {
      // Desvanece el Login
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Al terminar la animación, muestra BottomTabs y reinicia la opacidad
        setShowBottomTabs(true);
        opacityAnim.setValue(1); // Reinicia la opacidad para futuras transiciones
      });
    } else {
      setShowBottomTabs(false); // Muestra Login si no hay accessToken
      opacityAnim.setValue(1);  // Asegura que Login sea visible
    }
  }, [accessToken]);


  return (
    <NavigationContainer>
      <View style={styles.container}>
        {showBottomTabs ? (
          <BottomTabs />
        ) : (
          <Animated.View style={{ flex: 1, opacity: opacityAnim }}>
            <Login />
          </Animated.View>
        )}
        <Toast />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
