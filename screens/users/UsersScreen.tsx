import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import * as usersApi from '@/screens/users/api/usersApi';
import UserFormModal from '@/screens/users/components/UserFormModal';
import UserPermissionsModal from '@/screens/users/components/UserPermissionsModal';
import UserRolesModal from '@/screens/users/components/UserRolesModal';
import type {
  ManagedUser,
  UserBranch,
  UserPermission,
  UserRole,
} from '@/screens/users/types';

type SecurityModal = 'roles' | 'permissions' | null;

const UsersScreen = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [branches, setBranches] = useState<UserBranch[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [securityModal, setSecurityModal] = useState<SecurityModal>(null);
  const [securityUser, setSecurityUser] = useState<ManagedUser | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);

  const loadData = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [usersResult, branchesResult] = await Promise.all([
        usersApi.getUsers(),
        usersApi.getBranches(),
      ]);
      setUsers(usersResult);
      setBranches(branchesResult);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudieron cargar los usuarios',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error comunicando con el servidor',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.id, user.first_name, user.last_name, user.user, user.email]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [search, users]);

  const openCreate = () => {
    setEditingUser(null);
    setFormVisible(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setFormVisible(true);
  };

  const openSecurity = async (user: ManagedUser, type: Exclude<SecurityModal, null>) => {
    setLoadingSecurity(true);
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        usersApi.getUserRoles(user.id),
        usersApi.getUserPermissions(user.id),
      ]);
      setRoles(rolesResult);
      setPermissions(permissionsResult);
      setSecurityUser(user);
      setSecurityModal(type);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo cargar la seguridad',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error comunicando con el servidor',
      });
    } finally {
      setLoadingSecurity(false);
    }
  };

  const initials = (user: ManagedUser) =>
    `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase() || 'U';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.lg }}>
            <View style={styles.headingRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.xxl, fontWeight: '700' }}>
                  Usuarios
                </Text>
                <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>
                  Administra cuentas, roles y permisos
                </Text>
              </View>
              <Button title="Nuevo" icon="person-add" onPress={openCreate} size="small" />
            </View>

            <TextInput
              placeholder="Buscar por nombre, usuario, correo o ID…"
              iconName="search"
              value={search}
              onChangeText={setSearch}
              containerStyle={{ marginTop: theme.spacing.lg, marginBottom: 0 }}
            />

            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.sm }}>
              {filteredUsers.length} de {users.length} usuarios
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxxl }}>
              <MaterialIcons name="group-off" size={42} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.text, fontWeight: '700', marginTop: theme.spacing.md }}>
                No se encontraron usuarios
              </Text>
              <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
                Cambia la búsqueda o crea un usuario nuevo.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const active = Boolean(item.active);
          const admin = Boolean(item.admin);
          return (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
                ...theme.shadow,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${theme.colors.primary}20`,
                  }}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{initials(item)}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.fontSize.md }}>
                    {`${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || `Usuario #${item.id}`}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                    @{item.user || 'sin usuario'} · ID #{item.id}
                  </Text>
                  {!!item.email && (
                    <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }} numberOfLines={1}>
                      {item.email}
                    </Text>
                  )}
                </View>

                <TouchableOpacity onPress={() => openEdit(item)} hitSlop={10}>
                  <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                <StatusPill label={active ? 'Activo' : 'Inactivo'} positive={active} />
                {admin && <StatusPill label="Administrador" positive />}
              </View>

              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                <Button
                  title="Permisos"
                  icon="shield"
                  variant="light"
                  size="small"
                  onPress={() => openSecurity(item, 'permissions')}
                  disabled={loadingSecurity}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Roles"
                  icon="manage-accounts"
                  variant="light"
                  size="small"
                  onPress={() => openSecurity(item, 'roles')}
                  disabled={loadingSecurity}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          );
        }}
      />

      {loadingSecurity && (
        <View style={styles.loadingOverlay}>
          <View style={{ backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderRadius: theme.radius.lg }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: theme.spacing.sm }}>Cargando seguridad…</Text>
          </View>
        </View>
      )}

      <UserFormModal
        visible={formVisible}
        user={editingUser}
        branches={branches}
        onClose={() => setFormVisible(false)}
        onSaved={() => loadData(true)}
      />

      <UserRolesModal
        visible={securityModal === 'roles'}
        user={securityUser}
        initialData={roles}
        onClose={() => setSecurityModal(null)}
        onSaved={setRoles}
      />

      <UserPermissionsModal
        visible={securityModal === 'permissions'}
        user={securityUser}
        initialData={permissions}
        onClose={() => setSecurityModal(null)}
        onSaved={setPermissions}
      />
    </View>
  );
};

const StatusPill = ({ label, positive }: { label: string; positive: boolean }) => {
  const theme = useTheme();
  const color = positive ? theme.colors.success : theme.colors.danger;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: color,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 5 }} />
      <Text style={{ color, fontSize: theme.typography.fontSize.xs, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});

export default UsersScreen;
