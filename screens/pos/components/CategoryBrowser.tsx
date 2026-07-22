import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import { PosCategory, PosProduct } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

interface CategoryBrowserProps {
  onSelectProduct: (product: PosProduct) => void;
}

/**
 * Modo "Carta" del POS: explorar por categoría con tarjetas visuales en vez
 * de escribir en el buscador — pensado para sucursales donde el cajero
 * prefiere tocar en vez de tipear (ver `modo_busqueda_products_facturacion`
 * en `screens/business/BranchesTab.tsx`).
 */
const CategoryBrowser = ({ onSelectProduct }: CategoryBrowserProps) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<PosCategory | null>(null);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setLoadingCategories(true);
    posApi
      .getCategorias()
      .then(setCategories)
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar las categorías' }))
      .finally(() => setLoadingCategories(false));
  }, []);

  const openCategory = async (category: PosCategory) => {
    setSelectedCategory(category);
    setLoadingProducts(true);
    try {
      const items = await posApi.getProductsByIdCategory(category.id);
      setProducts(items);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudieron cargar los productos',
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  if (selectedCategory) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backRow}>
          <MaterialIcons name="arrow-back" size={20} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '600' }}>{selectedCategory.description}</Text>
        </TouchableOpacity>

        {loadingProducts ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={{ padding: theme.spacing.md }}
            ListEmptyComponent={
              <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 }}>
                Sin productos en esta categoría
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectProduct(item)}
                style={[
                  styles.productCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.md },
                ]}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '700' }} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 4 }}>
                  {item.reference}
                </Text>
                <Text style={{ color: theme.colors.success, fontWeight: '700', marginTop: 8 }}>
                  {formatCurrency(item.sale_price)}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {loadingCategories ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: theme.spacing.md }}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 }}>
              Sin categorías configuradas
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openCategory(item)}
              style={[
                styles.categoryCard,
                { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md },
              ]}
            >
              <MaterialIcons name="category" size={22} color={theme.colors.onPrimary} />
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '700', marginTop: 8, textAlign: 'center' }} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  productCard: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 100,
  },
});

export default CategoryBrowser;
