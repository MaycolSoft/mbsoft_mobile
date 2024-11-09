// HomeScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer'; // Importa DrawerNavigationProp
import { Ionicons } from '@expo/vector-icons';
import useStore from '@/store/useStore';

// Define el tipo RootDrawerParamList para que use tu drawer
type RootDrawerParamList = {
  Home: undefined;
  Settings: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();

  const count = useStore((state) => state.count);
  const increaseCount = useStore((state) => state.increaseCount);
  const resetCount = useStore((state) => state.resetCount);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World! mundo mundo</Text>
      <Text style={styles.counterText}>Global Count: {count}</Text>
      <Button title="Increase Count" onPress={increaseCount} />
      <Button title="Reset Count" onPress={resetCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerButton: {
    position: 'absolute',
    top: 40,
    left: 20, // Posición del botón en la parte superior izquierda
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  counterText: {
    fontSize: 20,
    marginBottom: 10,
  },
});
