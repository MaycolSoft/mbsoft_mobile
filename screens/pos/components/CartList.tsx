import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { PosCartLine, getLineDisplay } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';

interface CartListProps {
  cart: PosCartLine[];
  onIncrement: (item: PosCartLine) => void;
  onDecrement: (item: PosCartLine) => void;
  onRemove: (item: PosCartLine) => void;
}

const CartList = ({ cart, onIncrement, onDecrement, onRemove }: CartListProps) => {
  const theme = useTheme();

  if (cart.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialIcons name="shopping-cart" size={40} color={theme.colors.textMuted} />
        <Text style={{ color: theme.colors.text, fontWeight: '700', marginTop: theme.spacing.md }}>
          Carrito vacío
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginTop: 4 }}>
          Escaneá o buscá un producto para empezar
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cart}
      keyExtractor={(item, index) => String(getLineDisplay(item).id ?? index)}
      contentContainerStyle={{ padding: theme.spacing.lg }}
      renderItem={({ item }) => {
        const line = getLineDisplay(item);
        return (
          <View
            style={[
              styles.row,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.md },
            ]}
          >
            <View style={styles.topRow}>
              <Text style={{ color: theme.colors.text, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                {line.description}
              </Text>
              <Text style={{ color: theme.colors.success, fontWeight: '700', marginLeft: theme.spacing.sm }}>
                {formatCurrency(line.total)}
              </Text>
            </View>

            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
              {line.reference} · {formatCurrency(line.price)} c/u
            </Text>

            <View style={styles.bottomRow}>
              <View style={[styles.stepper, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
                <TouchableOpacity onPress={() => onDecrement(item)} style={styles.stepperButton} hitSlop={8}>
                  <MaterialIcons name="remove" size={18} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={{ color: theme.colors.text, fontWeight: '700', minWidth: 28, textAlign: 'center' }}>
                  {line.quantity}
                </Text>

                <TouchableOpacity onPress={() => onIncrement(item)} style={styles.stepperButton} hitSlop={8}>
                  <MaterialIcons name="add" size={18} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => onRemove(item)} hitSlop={8} style={{ marginLeft: 'auto' }}>
                <MaterialIcons name="delete-outline" size={22} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default CartList;
