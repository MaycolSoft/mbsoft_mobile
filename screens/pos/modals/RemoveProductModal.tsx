import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';

interface RemoveProductModalProps {
  visible: boolean;
  onConfirm: (credentials: { user: string; pass: string }) => void;
  onClose: () => void;
}

/** Gate de supervisor para remover una línea del carrito, cuando `allow_remove_product_pos` es falso. */
const RemoveProductModal = ({ visible, onConfirm, onClose }: RemoveProductModalProps) => {
  const theme = useTheme();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    if (visible) {
      setUser('');
      setPass('');
    }
  }, [visible]);

  const submit = () => {
    if (!user || !pass) return;
    onConfirm({ user, pass });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Remover producto — acceso administrativo">
      <View>
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
          Se necesita autorización de un supervisor para quitar este producto del carrito.
        </Text>

        <TextInput label="Usuario" iconName="person-outline" value={user} onChangeText={setUser} autoCapitalize="none" />
        <TextInput label="Clave" iconName="lock-outline" secureTextEntry value={pass} onChangeText={setPass} />

        <Button title="Proceder" onPress={submit} disabled={!user || !pass} style={{ marginTop: theme.spacing.md }} />
      </View>
    </Modal>
  );
};

export default RemoveProductModal;
