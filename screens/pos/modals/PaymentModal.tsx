import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { PosPayments } from '@/screens/pos/types';
import { formatCurrency, PAYMENT_METHODS } from '@/screens/pos/constants';

interface PaymentModalProps {
  visible: boolean;
  total: number;
  payments: PosPayments;
  setPayments: React.Dispatch<React.SetStateAction<PosPayments>>;
  onConfirm: () => void;
  onClose: () => void;
  confirming?: boolean;
}

const PaymentModal = ({ visible, total, payments, setPayments, onConfirm, onClose, confirming = false }: PaymentModalProps) => {
  const theme = useTheme();
  const [methodKey, setMethodKey] = useState('cash');
  const [amount, setAmount] = useState('');
  const [auth, setAuth] = useState('');

  const paid = useMemo(
    () => Object.values(payments).reduce((acc, p) => acc + (parseFloat(String(p.amount)) || 0), 0),
    [payments]
  );
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);
  const isCovered = paid >= total && total > 0;

  const method = PAYMENT_METHODS.find((m) => m.key === methodKey);

  useEffect(() => {
    if (!visible) return;
    setMethodKey('cash');
    setAuth('');
    setAmount(remaining > 0 ? remaining.toFixed(2) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addPayment = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;

    setPayments((prev) => ({
      ...prev,
      [methodKey]: { amount: value, auth: methodKey === 'cash' ? '' : auth },
    }));

    const nextRemaining = Math.max(0, total - (paid + value));
    setAmount(nextRemaining > 0 ? nextRemaining.toFixed(2) : '');
    setAuth('');
  };

  const removePayment = (key: string) => {
    setPayments((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Cobrar"
      footer={
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Button title="Cancelar" variant="light" onPress={onClose} style={{ flex: 1 }} />
          <Button
            title="Cobrar"
            onPress={onConfirm}
            disabled={!isCovered}
            loading={confirming}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.xxl, fontWeight: '700', marginBottom: theme.spacing.lg }}>
        {formatCurrency(total)}
      </Text>

      <Dropdown
        label="Método"
        options={PAYMENT_METHODS.map((m) => ({ label: m.label, value: m.key }))}
        value={methodKey}
        onSelect={(opt) => setMethodKey(String(opt.value))}
      />

      <View style={{ marginTop: theme.spacing.md }}>
        <TextInput
          label="Monto"
          iconName="payments"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {method?.authLabel && (
        <TextInput label={method.authLabel} value={auth} onChangeText={setAuth} />
      )}

      <Button title="Agregar pago" variant="light" onPress={addPayment} style={{ marginBottom: theme.spacing.lg }} />

      {Object.entries(payments).length > 0 && (
        <View style={{ marginBottom: theme.spacing.lg }}>
          {Object.entries(payments).map(([key, p]) => (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, flex: 1 }}>
                {PAYMENT_METHODS.find((m) => m.key === key)?.label || key}
              </Text>
              <Text style={{ color: theme.colors.text, marginRight: theme.spacing.md }}>{formatCurrency(p.amount)}</Text>
              {!!p.auth && <Text style={{ color: theme.colors.textMuted, marginRight: theme.spacing.md }}>{p.auth}</Text>}
              <TouchableOpacity onPress={() => removePayment(key)} hitSlop={8}>
                <MaterialIcons name="close" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: theme.colors.textMuted }}>Pagado</Text>
          <Text style={{ color: theme.colors.text }}>{formatCurrency(paid)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: theme.colors.textMuted }}>Restante</Text>
          <Text style={{ color: theme.colors.text }}>{formatCurrency(remaining)}</Text>
        </View>
        {change > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.success, fontWeight: '700' }}>DEVUELTA</Text>
            <Text style={{ color: theme.colors.success, fontWeight: '700' }}>{formatCurrency(change)}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default PaymentModal;
