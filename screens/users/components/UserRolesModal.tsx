import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import * as usersApi from '@/screens/users/api/usersApi';
import type { ManagedUser, UserRole } from '@/screens/users/types';

interface UserRolesModalProps {
  visible: boolean;
  user: ManagedUser | null;
  initialData: UserRole[];
  onClose: () => void;
  onSaved: (roles: UserRole[]) => void;
}

const UserRolesModal = ({ visible, user, initialData, onClose, onSaved }: UserRolesModalProps) => {
  const theme = useTheme();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRoles(initialData.map((role) => ({ ...role })));
    setSearch('');
  }, [initialData, visible]);

  const originalIds = useMemo(
    () => new Set(initialData.filter((role) => role.has_role).map((role) => role.id)),
    [initialData]
  );
  const selectedIds = useMemo(
    () => new Set(roles.filter((role) => role.has_role).map((role) => role.id)),
    [roles]
  );
  const hasChanges =
    selectedIds.size !== originalIds.size || [...selectedIds].some((id) => !originalIds.has(id));

  const visibleRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((role) =>
      `${role.id} ${role.name ?? ''} ${role.description ?? ''}`.toLowerCase().includes(term)
    );
  }, [roles, search]);

  const toggleRole = (id: number) => {
    setRoles((previous) =>
      previous.map((role) => (role.id === id ? { ...role, has_role: !role.has_role } : role))
    );
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await usersApi.saveUserRoles(user.id, [...selectedIds]);
      Toast.show({ type: 'success', text1: 'Roles actualizados', text2: response?.message });
      onSaved(roles);
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudieron guardar los roles',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error comunicando con el servidor',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Roles · ${user?.first_name ?? 'Usuario'}`}
      footer={
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Button
            title="Revertir"
            variant="light"
            onPress={() => setRoles(initialData.map((role) => ({ ...role })))}
            disabled={!hasChanges || saving}
            style={{ flex: 1 }}
          />
          <Button title="Guardar roles" icon="save" onPress={save} disabled={!hasChanges} loading={saving} style={{ flex: 1 }} />
        </View>
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        }}
      >
        <Text style={{ color: theme.colors.textMuted }}>
          {selectedIds.size} de {roles.length} seleccionados
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button
            title="Todos"
            size="small"
            variant="light"
            onPress={() => setRoles((previous) => previous.map((role) => ({ ...role, has_role: true })))}
          />
          <Button
            title="Ninguno"
            size="small"
            variant="light"
            onPress={() => setRoles((previous) => previous.map((role) => ({ ...role, has_role: false })))}
          />
        </View>
      </View>

      <TextInput
        placeholder="Buscar rol, descripción o ID…"
        iconName="search"
        value={search}
        onChangeText={setSearch}
      />

      {visibleRoles.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, textAlign: 'center', paddingVertical: theme.spacing.xl }}>
          No se encontraron roles
        </Text>
      ) : (
        visibleRoles.map((role) => {
          const selected = Boolean(role.has_role);
          return (
            <TouchableOpacity
              key={role.id}
              onPress={() => toggleRole(role.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? `${theme.colors.primary}14` : theme.colors.surface,
                borderRadius: theme.radius.md,
              }}
            >
              <MaterialIcons
                name={selected ? 'check-circle' : 'radio-button-unchecked'}
                size={22}
                color={selected ? theme.colors.primary : theme.colors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                  {role.description || role.name || `Rol #${role.id}`}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                  ID #{role.id}{role.name ? ` · ${role.name}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </Modal>
  );
};

export default UserRolesModal;
