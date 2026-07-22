import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import * as usersApi from '@/screens/users/api/usersApi';
import {
  EMPTY_USER_FORM,
  ManagedUser,
  UserBranch,
  UserFormData,
  userToForm,
} from '@/screens/users/types';
import { isAxiosError } from '@/api/apiService';

const HOME_PAGE_OPTIONS = [
  { label: 'Página predeterminada', value: '/' },
  { label: 'Facturación', value: '/procesos/facturacion' },
  { label: 'Productos', value: '/procesos/producto' },
  { label: 'Configuración', value: '/procesos/configuracion' },
  { label: 'Usuarios', value: '/procesos/users' },
];

interface UserFormModalProps {
  visible: boolean;
  user: ManagedUser | null;
  branches: UserBranch[];
  onClose: () => void;
  onSaved: () => void;
}

const UserFormModal = ({ visible, user, branches, onClose, onSaved }: UserFormModalProps) => {
  const theme = useTheme();
  const [form, setForm] = useState<UserFormData>({ ...EMPTY_USER_FORM });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setForm(user ? userToForm(user) : { ...EMPTY_USER_FORM });
    setSubmitted(false);
  }, [user, visible]);

  const update = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const save = async () => {
    setSubmitted(true);
    if (!form.first_name.trim() || !form.last_name.trim() || !form.user.trim()) {
      Toast.show({ type: 'info', text1: 'Campos requeridos', text2: 'Completa nombre, apellido y usuario.' });
      return;
    }

    setSaving(true);
    try {
      const response = await usersApi.saveUser(form);
      Toast.show({ type: 'success', text1: 'Usuario guardado', text2: response?.message });
      onSaved();
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo guardar',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error comunicando con el servidor',
      });
    } finally {
      setSaving(false);
    }
  };

  const switchTrack = { false: theme.colors.border, true: `${theme.colors.primary}88` };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={user ? `Editar usuario #${user.id}` : 'Nuevo usuario'}
      footer={
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Button title="Cancelar" variant="light" onPress={onClose} disabled={saving} style={{ flex: 1 }} />
          <Button title="Guardar" icon="save" onPress={save} loading={saving} style={{ flex: 1 }} />
        </View>
      }
    >
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Nombre"
            value={form.first_name}
            onChangeText={(value) => update('first_name', value)}
            error={submitted && !form.first_name.trim() ? 'Requerido' : undefined}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Apellido"
            value={form.last_name}
            onChangeText={(value) => update('last_name', value)}
            error={submitted && !form.last_name.trim() ? 'Requerido' : undefined}
          />
        </View>
      </View>

      <TextInput
        label="Usuario"
        iconName="person"
        autoCapitalize="none"
        value={form.user}
        onChangeText={(value) => update('user', value)}
        error={submitted && !form.user.trim() ? 'Requerido' : undefined}
      />

      <TextInput
        label="Contraseña"
        iconName="lock-outline"
        secureTextEntry
        autoCapitalize="none"
        value={form.password}
        onChangeText={(value) => update('password', value)}
        placeholder={user ? 'Déjala vacía para conservarla' : 'Contraseña'}
      />

      <TextInput
        label="Correo electrónico"
        iconName="email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(value) => update('email', value)}
      />

      <TextInput
        label="Teléfono"
        iconName="phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(value) => update('phone', value)}
      />

      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing.xs }}>
        Sucursal
      </Text>
      <Dropdown
        options={branches.map((branch) => ({ label: branch.name, value: String(branch.id) }))}
        value={form.id_branch}
        label={branches.length === 0 ? 'No hay sucursales disponibles' : 'Selecciona una sucursal'}
        onSelect={(option) => update('id_branch', String(option.value))}
        iconName="store"
      />

      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.xs }}>
        Página de inicio
      </Text>
      <Dropdown
        options={HOME_PAGE_OPTIONS}
        value={form.home_page}
        onSelect={(option) => update('home_page', String(option.value))}
        iconName="home"
      />

      <View style={{ marginTop: theme.spacing.lg }}>
        <SwitchRow
          label="Usuario activo"
          value={form.active}
          onValueChange={(value) => update('active', value)}
          trackColor={switchTrack}
        />
        <SwitchRow
          label="Recibir notificaciones por correo"
          value={form.show_notification_email}
          onValueChange={(value) => update('show_notification_email', value)}
          trackColor={switchTrack}
        />
        <SwitchRow
          label="Derechos de administrador"
          value={form.admin}
          onValueChange={(value) => update('admin', value)}
          trackColor={switchTrack}
          last
        />
      </View>
    </Modal>
  );
};

const SwitchRow = ({
  label,
  value,
  onValueChange,
  trackColor,
  last,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor: { false: string; true: string };
  last?: boolean;
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.text, flex: 1, marginRight: theme.spacing.md }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );
};

export default UserFormModal;
