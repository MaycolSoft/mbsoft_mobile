import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PosProduct } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';

interface SearchResultsListProps {
  results: PosProduct[] | null;
  onSelect: (product: PosProduct) => void;
}

const SearchResultsList = ({ results, onSelect }: SearchResultsListProps) => {
  const theme = useTheme();

  if (!results) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.md, ...theme.shadow },
      ]}
    >
      {results.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, padding: theme.spacing.md }}>Sin resultados</Text>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          {results.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => onSelect(product)}
              style={[styles.row, { borderBottomColor: theme.colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{product.description}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                  {product.reference}
                </Text>
              </View>
              <Text style={{ color: theme.colors.success, fontWeight: '700' }}>
                {formatCurrency(product.sale_price)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 280,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 20,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SearchResultsList;
