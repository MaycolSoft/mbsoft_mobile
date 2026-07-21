import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { getRequest, postRequest, deleteRequest, isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import Button from '@/components/Button';
import TagInput from '@/components/TagInput';
import { showAlert } from '@/components/AppAlert';

interface BackupFile {
  name: string;
  size: string;
  date: string;
}

const DEFAULT_EXCLUDED_TABLES = ['telescope_entries', 'telescope_entries_tags', 'telescope_monitoring'];

const BackupsTab = () => {
  const theme = useTheme();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [excludedTables, setExcludedTables] = useState<string[]>(DEFAULT_EXCLUDED_TABLES);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await getRequest('api/listBackups');
      setBackups(response.data.data ?? []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudieron cargar los backups',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await postRequest('api/backupDatabase', { excludeTables: excludedTables });
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: `Backup creado: ${response.data.data?.backupFileName ?? ''}`,
      });
      await loadBackups();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo crear el backup',
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = (fileName: string) => {
    showAlert('Eliminar backup', `¿Seguro que querés eliminar "${fileName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await deleteRequest(`api/deleteBackup/${fileName}`);
            Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'Backup eliminado' });
            loadBackups();
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo eliminar el backup',
            });
          }
        },
      },
    ]);
  };

  return (
    <FlatList
      contentContainerStyle={{ padding: theme.spacing.lg }}
      data={backups}
      keyExtractor={(item) => item.name}
      refreshing={loading}
      onRefresh={loadBackups}
      ListHeaderComponent={
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.lg, marginBottom: theme.spacing.xl },
          ]}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.fontSize.md, marginBottom: theme.spacing.sm }}>
            Crear nuevo backup
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.sm }}>
            Tablas excluidas
          </Text>
          <TagInput value={excludedTables} onChange={setExcludedTables} placeholder="Nombre de la tabla" />

          <Button title="Generar backup" variant="success" onPress={createBackup} loading={creating} style={{ marginTop: theme.spacing.lg }} />
        </View>
      }
      ListEmptyComponent={
        !loading ? (
          <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 }}>
            No hay backups disponibles
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.backupRow,
            { borderColor: theme.colors.border, borderRadius: theme.radius.md },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
              {item.size} · {item.date}
            </Text>
          </View>

          <Button title="Eliminar" variant="danger" size="small" onPress={() => deleteBackup(item.name)} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
  },
});

export default BackupsTab;
