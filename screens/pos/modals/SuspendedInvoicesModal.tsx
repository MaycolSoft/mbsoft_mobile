import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import { PosSuspendedInvoice } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

interface SuspendedInvoicesModalProps {
  visible: boolean;
  onClose: () => void;
  onResumed: () => void;
}

/** Ventas suspendidas — retomar restaura el carrito de la sesión en el backend. */
const SuspendedInvoicesModal = ({ visible, onClose, onResumed }: SuspendedInvoicesModalProps) => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<PosSuspendedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [resumingId, setResumingId] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    posApi
      .getSuspendedInvoices()
      .then(setInvoices)
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Error al obtener las facturas suspendidas' }))
      .finally(() => setLoading(false));
  }, [visible]);

  const resume = async (invoice: PosSuspendedInvoice) => {
    setResumingId(invoice.id_suspension);
    try {
      const response = await posApi.resumeSuspendedInvoice(invoice.id_suspension);
      Toast.show({ type: 'success', text1: 'Éxito', text2: response?.message || 'Venta retomada' });
      onResumed();
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al retomar la venta',
      });
    } finally {
      setResumingId(null);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Facturas suspendidas">
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => String(item.id_suspension)}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 }}>
              No hay ventas suspendidas
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => resume(item)}
              disabled={resumingId !== null}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                opacity: resumingId !== null && resumingId !== item.id_suspension ? 0.5 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                  #{item.id_suspension}
                  {item.customer ? ` — ${item.customer.first_name ?? ''} ${item.customer.last_name ?? ''}`.trim() : ' — Consumidor final'}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                  {new Date(item.created_at).toLocaleString('es-DO')} · {item.shopping_cart?.length ?? 0} productos ·{' '}
                  {formatCurrency(item.total)}
                </Text>
              </View>

              {resumingId === item.id_suspension ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <MaterialIcons name="play-circle-outline" size={26} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </Modal>
  );
};

export default SuspendedInvoicesModal;
