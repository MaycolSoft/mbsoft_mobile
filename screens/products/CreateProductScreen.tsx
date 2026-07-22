import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductForm from './ProductForm';
import { useTheme } from '@/theme/ThemeProvider';

type ProductDrawerParams = {
  Productos: undefined;
  'Crear Producto': undefined;
};

const CreateProductScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ProductDrawerParams>>();

  const goToProducts = () => navigation.navigate('Productos');

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.xxxl,
            },
          ]}
        >
          <View style={styles.formContainer}>
            <ProductForm onCancel={goToProducts} onSave={goToProducts} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 720,
  },
});

export default CreateProductScreen;
