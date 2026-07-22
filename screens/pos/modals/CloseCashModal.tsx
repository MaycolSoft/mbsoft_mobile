import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { PosCuadrePreview } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

interface CloseCashModalProps {
  visible: boolean;
  fetchPreview: () => Promise<PosCuadrePreview | undefined>;
  onConfirm: (params: { user: string; pass: string; montoCierre: number }) => Promise<any>;
  onClose: () => void;
}

/** Cierre de caja (cuadre) — exige credenciales de un supervisor, mismo gate que el web. */
const CloseCashModal = ({ visible, fetchPreview, onConfirm, onClose }: CloseCashModalProps) => {
  const theme = useTheme();
  const [preview, setPreview] = useState<PosCuadrePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setUser('');
    setPass('');
    setMontoCierre('');
    setLoadingPreview(true);

    fetchPreview()
      .then((data) => setPreview(data ?? null))
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Error al cargar el resumen de cierre' }))
      .finally(() => setLoadingPreview(false));
  }, [visible]);

  const submit = async () => {
    if (!user || !pass || montoCierre === '') {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Completá usuario, clave y monto de cierre' });
      return;
    }

    setSaving(true);
    try {
      const result = await onConfirm({ user, pass, montoCierre: parseFloat(montoCierre) || 0 });
      Toast.show({ type: 'success', text1: 'Éxito', text2: result?.message || 'Caja cerrada con éxito' });
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al cerrar la caja',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Cerrar caja (cuadre)">
      <View>
        {loadingPreview ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginBottom: theme.spacing.lg }} />
        ) : preview ? (
          <View style={{ marginBottom: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: theme.spacing.md }}>
            <SummaryRow label="Apertura" value={formatCurrency(preview.posCaja?.monto_apertura)} />
            <SummaryRow label="Facturas con RNC" value={String(preview.withRNC ?? 0)} />
            <SummaryRow label="Facturas sin RNC" value={String(preview.withoutRNC ?? 0)} />
            <SummaryRow label="Subtotal" value={formatCurrency(preview.sub_total)} />
            <SummaryRow label="ITBIS" value={formatCurrency(preview.total_tax)} />
            <SummaryRow label="TOTAL VENDIDO" value={formatCurrency(preview.total)} emphasize />
          </View>
        ) : null}

        <TextInput label="Usuario supervisor" iconName="person-outline" value={user} onChangeText={setUser} autoCapitalize="none" />
        <TextInput label="Clave supervisor" iconName="lock-outline" secureTextEntry value={pass} onChangeText={setPass} />
        <TextInput
          label="Monto contado en caja"
          iconName="payments"
          keyboardType="numeric"
          placeholder="0.00"
          value={montoCierre}
          onChangeText={setMontoCierre}
        />

        <Button title="Cerrar caja" variant="danger" onPress={submit} loading={saving} style={{ marginTop: theme.spacing.md }} />
      </View>
    </Modal>
  );
};

const SummaryRow = ({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ color: emphasize ? theme.colors.text : theme.colors.textMuted, fontWeight: emphasize ? '700' : '400' }}>{label}</Text>
      <Text style={{ color: emphasize ? theme.colors.success : theme.colors.text, fontWeight: emphasize ? '700' : '400' }}>{value}</Text>
    </View>
  );
};

export default CloseCashModal;
