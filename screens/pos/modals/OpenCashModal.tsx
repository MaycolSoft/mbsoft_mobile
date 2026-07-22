import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import { isAxiosError } from '@/api/apiService';

interface OpenCashModalProps {
  visible: boolean;
  tokenSession: string;
  onOpened: () => void;
  onClose: () => void;
}

const OpenCashModal = ({ visible, tokenSession, onOpened, onClose }: OpenCashModalProps) => {
  const theme = useTheme();
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setMonto('');
  }, [visible]);

  const abrirCaja = async () => {
    setSaving(true);
    try {
      const response = await posApi.abrirCaja({
        montoApertura: parseFloat(monto) || 0,
        tokenSession,
      });

      if (response.code === 200) {
        Toast.show({ type: 'success', text1: 'Éxito', text2: response.message });
        onOpened();
      } else {
        Toast.show({ type: 'info', text1: 'Aviso', text2: response.message });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al abrir caja',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Abrir caja">
      <View>
        <TextInput
          label="Monto de apertura"
          iconName="payments"
          keyboardType="numeric"
          placeholder="0.00"
          value={monto}
          onChangeText={setMonto}
        />

        <Button title="Abrir caja" onPress={abrirCaja} loading={saving} style={{ marginTop: theme.spacing.md }} />
      </View>
    </Modal>
  );
};

export default OpenCashModal;
