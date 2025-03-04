// screens/Settings.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DarkModeButton from '@/components/DarkModeButton';



export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dark Mode</Text>
      <DarkModeButton />
      
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
    fontWeight: 'bold',
  },
});
