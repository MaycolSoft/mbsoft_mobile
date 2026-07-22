import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Toast from 'react-native-toast-message';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import { PosCustomer } from '@/screens/pos/types';

interface CustomerModalProps {
  visible: boolean;
  onSelect: (customer: PosCustomer | null) => void;
  onClose: () => void;
}

const CustomerModal = ({ visible, onSelect, onClose }: CustomerModalProps) => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFilter('');
    setLoading(true);

    posApi
      .getCustomers()
      .then(setCustomers)
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Error al obtener los clientes' }))
      .finally(() => setLoading(false));
  }, [visible]);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone, c.rnc_cedula_rnc]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [customers, filter]);

  const pick = (customer: PosCustomer | null) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Cliente">
      <TextInput
        placeholder="Buscar por nombre, RNC, teléfono…"
        iconName="search"
        value={filter}
        onChangeText={setFilter}
      />

      <TouchableOpacity
        onPress={() => pick(null)}
        style={{
          padding: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>— Consumidor final (sin cliente) —</Text>
      </TouchableOpacity>

      {loading && (
        <Text style={{ color: theme.colors.textMuted, padding: theme.spacing.md }}>Cargando clientes…</Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => pick(item)}
            style={{ padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
              {`${item.first_name ?? ''} ${item.last_name ?? ''}`.trim()}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
              {[item.rnc_cedula_rnc, item.phone, item.email].filter(Boolean).join(' · ')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </Modal>
  );
};

export default CustomerModal;
