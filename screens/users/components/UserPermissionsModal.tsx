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
import type { ManagedUser, UserPermission } from '@/screens/users/types';

interface PermissionModule {
  id: string;
  name: string;
  permissions: UserPermission[];
}

interface UserPermissionsModalProps {
  visible: boolean;
  user: ManagedUser | null;
  initialData: UserPermission[];
  onClose: () => void;
  onSaved: (permissions: UserPermission[]) => void;
}

const UserPermissionsModal = ({ visible, user, initialData, onClose, onSaved }: UserPermissionsModalProps) => {
  const theme = useTheme();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPermissions(initialData.map((permission) => ({ ...permission })));
    setSearch('');
    setCollapsed(new Set());
  }, [initialData, visible]);

  const originalIds = useMemo(
    () => new Set(initialData.filter((permission) => permission.has_permission).map((permission) => permission.id)),
    [initialData]
  );
  const selectedIds = useMemo(
    () => new Set(permissions.filter((permission) => permission.has_permission).map((permission) => permission.id)),
    [permissions]
  );
  const hasChanges =
    selectedIds.size !== originalIds.size || [...selectedIds].some((id) => !originalIds.has(id));

  const modules = useMemo<PermissionModule[]>(() => {
    const parents = permissions.filter((permission) => Number(permission.id_opcion) === 0);
    const parentIds = new Set(parents.map((permission) => Number(permission.id)));

    const result = parents.map((parent) => ({
      id: String(parent.id),
      name: parent.name,
      permissions: [
        parent,
        ...permissions.filter((permission) => Number(permission.id_opcion) === Number(parent.id)),
      ],
    }));

    const orphans = permissions.filter(
      (permission) => Number(permission.id_opcion) !== 0 && !parentIds.has(Number(permission.id_opcion))
    );
    if (orphans.length > 0) {
      result.push({ id: 'orphans', name: 'Otros permisos', permissions: orphans });
    }
    return result;
  }, [permissions]);

  const visibleModules = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return modules;
    return modules
      .map((module) => ({
        ...module,
        permissions: module.permissions.filter((permission) =>
          `${permission.id} ${permission.name}`.toLowerCase().includes(term)
        ),
      }))
      .filter((module) => module.name.toLowerCase().includes(term) || module.permissions.length > 0)
      .map((module) =>
        module.permissions.length > 0
          ? module
          : modules.find((source) => source.id === module.id) ?? module
      );
  }, [modules, search]);

  const togglePermission = (id: number) => {
    setPermissions((previous) =>
      previous.map((permission) =>
        permission.id === id
          ? { ...permission, has_permission: !permission.has_permission }
          : permission
      )
    );
  };

  const toggleModule = (module: PermissionModule, enabled: boolean) => {
    const ids = new Set(module.permissions.map((permission) => permission.id));
    setPermissions((previous) =>
      previous.map((permission) =>
        ids.has(permission.id) ? { ...permission, has_permission: enabled } : permission
      )
    );
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await usersApi.saveUserPermissions(user.id, [...selectedIds]);
      Toast.show({ type: 'success', text1: 'Permisos actualizados', text2: response?.message });
      onSaved(permissions);
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudieron guardar los permisos',
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
      title={`Permisos · ${user?.first_name ?? 'Usuario'}`}
      footer={
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Button
            title="Revertir"
            variant="light"
            onPress={() => setPermissions(initialData.map((permission) => ({ ...permission })))}
            disabled={!hasChanges || saving}
            style={{ flex: 1 }}
          />
          <Button title="Guardar" icon="save" onPress={save} disabled={!hasChanges} loading={saving} style={{ flex: 1 }} />
        </View>
      }
    >
      <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
        {selectedIds.size} de {permissions.length} permisos seleccionados
      </Text>
      <TextInput
        placeholder="Buscar módulo, permiso o ID…"
        iconName="search"
        value={search}
        onChangeText={setSearch}
      />

      {visibleModules.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, textAlign: 'center', paddingVertical: theme.spacing.xl }}>
          No se encontraron permisos
        </Text>
      ) : (
        visibleModules.map((module) => {
          const activeCount = module.permissions.filter((permission) => permission.has_permission).length;
          const allActive = module.permissions.length > 0 && activeCount === module.permissions.length;
          const isCollapsed = !search.trim() && collapsed.has(module.id);

          return (
            <View
              key={module.id}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    setCollapsed((previous) => {
                      const next = new Set(previous);
                      next.has(module.id) ? next.delete(module.id) : next.add(module.id);
                      return next;
                    })
                  }
                  hitSlop={8}
                >
                  <MaterialIcons
                    name={isCollapsed ? 'chevron-right' : 'expand-more'}
                    size={22}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{module.name}</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                    {activeCount}/{module.permissions.length} activos
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleModule(module, !allActive)} hitSlop={8}>
                  <MaterialIcons
                    name={allActive ? 'check-box' : activeCount > 0 ? 'indeterminate-check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={activeCount > 0 ? theme.colors.primary : theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {!isCollapsed &&
                module.permissions.map((permission) => (
                  <TouchableOpacity
                    key={permission.id}
                    onPress={() => togglePermission(permission.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.border,
                      backgroundColor: permission.has_permission ? `${theme.colors.primary}0D` : theme.colors.card,
                    }}
                  >
                    <MaterialIcons
                      name={permission.has_permission ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={permission.has_permission ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                      <Text style={{ color: theme.colors.text }}>{permission.name}</Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                        ID #{permission.id}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          );
        })
      )}
    </Modal>
  );
};

export default UserPermissionsModal;
