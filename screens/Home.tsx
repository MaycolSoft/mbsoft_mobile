// HomeScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import useStore from '@/store/useStore';



export default function HomeScreen() {
  const count = useStore((state) => state.count);
  const increaseCount = useStore((state) => state.increaseCount);
  const resetCount = useStore((state) => state.resetCount);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World! mundo moundo</Text>
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
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  counterText: {
    fontSize: 20,
    marginBottom: 10,
  },
});
