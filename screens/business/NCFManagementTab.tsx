import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { getRequest, postRequest, putRequest, isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';

interface NCF {
  id: number;
  nombre: string;
  serie: string;
  codigo: string;
  active: boolean;
  orden: number;
  require_rnc: boolean;
  validate_expiration: boolean;
}

interface SerieNCF {
  id: number;
  start: number;
  end: number;
  current_value: number;
  total_approved: number;
  auto_active_next_serie: boolean;
  current_active: boolean;
  used: boolean;
  completed: boolean;
  start_date: string;
  end_date: string;
}

function todayFormatted(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getFullYear()}`;
}

const emptyNcfForm = (): NCF => ({
  id: 0,
  nombre: '',
  serie: '',
  codigo: '',
  active: false,
  orden: 0,
  require_rnc: false,
  validate_expiration: false,
});

const NCFForm = ({ ncf, onSaved }: { ncf: NCF; onSaved: (ncf: NCF) => void }) => {
  const theme = useTheme();
  const [form, setForm] = useState<NCF>(ncf);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(ncf);
  }, [ncf]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await postRequest('api/pos/saveNCF', {
        ncf_id: form.id || undefined,
        ncf_serie: form.serie,
        ncf_name: form.nombre,
        ncf_codigo: form.codigo,
        active: form.active,
        require_rnc: form.require_rnc,
        validate_expiration: form.validate_expiration,
      });

      Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'NCF guardado' });
      onSaved(response.data.data ?? form);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo guardar el NCF',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>NCF</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput label="Serie" value={form.serie} onChangeText={(v) => setForm((p) => ({ ...p, serie: v }))} />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput label="Código" value={form.codigo} onChangeText={(v) => setForm((p) => ({ ...p, codigo: v }))} />
        </View>
      </View>

      <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm((p) => ({ ...p, nombre: v }))} />

      <SwitchRow label="Requiere RNC" value={form.require_rnc} onChange={(v) => setForm((p) => ({ ...p, require_rnc: v }))} />
      <SwitchRow label="Activo" value={form.active} onChange={(v) => setForm((p) => ({ ...p, active: v }))} />
      <SwitchRow label="Validar vigencia" value={form.validate_expiration} onChange={(v) => setForm((p) => ({ ...p, validate_expiration: v }))} />

      <Button title="Guardar NCF" onPress={save} loading={saving} style={{ marginTop: theme.spacing.md }} />
    </View>
  );
};

const SwitchRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => {
  const theme = useTheme();
  return (
    <View style={[styles.switchRow, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
      <Text style={{ color: theme.colors.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="#fff" />
    </View>
  );
};

const SeriesForm = ({ ncfId, onSaved }: { ncfId: number; onSaved: () => void }) => {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    series_ncf_inicio: '0',
    series_ncf_final: '0',
    serie_ncf_txt_start_date: todayFormatted(),
    serie_ncf_txt_end_date: todayFormatted(365),
    series_ncf_reorden: '1',
    series_ncf_auto_active_next_serie: false,
  });

  const save = async () => {
    setSaving(true);
    try {
      const response = await postRequest('api/pos/saveSeriesNCF', {
        ncf_id: ncfId,
        ...form,
      });
      Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'Serie guardada' });
      onSaved();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo guardar la serie',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nueva serie</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.sm }}>
        Se tomará la fecha de inicio como primera serie para su uso
      </Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput label="Inicio" keyboardType="numeric" value={form.series_ncf_inicio} onChangeText={(v) => setForm((p) => ({ ...p, series_ncf_inicio: v }))} />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput label="Final" keyboardType="numeric" value={form.series_ncf_final} onChangeText={(v) => setForm((p) => ({ ...p, series_ncf_final: v }))} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput label="Fecha de inicio (MM/DD/YYYY)" value={form.serie_ncf_txt_start_date} onChangeText={(v) => setForm((p) => ({ ...p, serie_ncf_txt_start_date: v }))} />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput label="Fecha final (MM/DD/YYYY)" value={form.serie_ncf_txt_end_date} onChangeText={(v) => setForm((p) => ({ ...p, serie_ncf_txt_end_date: v }))} />
        </View>
      </View>

      <TextInput label="Reorden" value={form.series_ncf_reorden} onChangeText={(v) => setForm((p) => ({ ...p, series_ncf_reorden: v }))} />

      <SwitchRow
        label="Activar serie siguiente cuando se agote"
        value={form.series_ncf_auto_active_next_serie}
        onChange={(v) => setForm((p) => ({ ...p, series_ncf_auto_active_next_serie: v }))}
      />

      <Button title="Guardar serie" variant="success" onPress={save} loading={saving} style={{ marginTop: theme.spacing.md }} />
    </View>
  );
};

const SerieRow = ({ serie, onActivate }: { serie: SerieNCF; onActivate: () => void }) => {
  const theme = useTheme();
  return (
    <View style={[styles.serieRow, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
          {serie.start} - {serie.end}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
          {serie.start_date} — {serie.end_date}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          <Badge positive={serie.current_active} trueLabel="Activo actual" falseLabel="Inactivo" />
          <Badge positive={serie.auto_active_next_serie} trueLabel="Auto-activar" falseLabel="Manual" />
          <Badge positive={serie.completed} trueLabel="Completado" falseLabel="Pendiente" />
        </View>
      </View>

      {!serie.current_active && (
        <Button title="Activar" size="small" onPress={onActivate} />
      )}
    </View>
  );
};

const NCFManagementTab = () => {
  const theme = useTheme();
  const [ncfList, setNcfList] = useState<NCF[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNcf, setSelectedNcf] = useState<NCF>(emptyNcfForm());
  const [seriesList, setSeriesList] = useState<SerieNCF[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  const loadNCFs = async () => {
    setLoading(true);
    try {
      const response = await getRequest('api/pos/getNCFs', { all: 1 });
      setNcfList(response.data.data.ncf ?? []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudieron cargar los NCF',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNCFs();
  }, []);

  const loadSeries = async (ncfId: number) => {
    if (!ncfId) {
      setSeriesList([]);
      return;
    }
    setSeriesLoading(true);
    try {
      const response = await getRequest(`api/pos/getSeriesNCF/${ncfId}`);
      setSeriesList(response.data.data.series ?? []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudieron cargar las series',
      });
    } finally {
      setSeriesLoading(false);
    }
  };

  const openConfigure = (ncf: NCF) => {
    setSelectedNcf(ncf);
    setModalVisible(true);
    loadSeries(ncf.id);
  };

  const openNew = () => {
    setSelectedNcf(emptyNcfForm());
    setSeriesList([]);
    setModalVisible(true);
  };

  const activateSerie = async (serieId: number) => {
    try {
      const response = await putRequest(`api/pos/activeSerie/${serieId}`);
      Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'Serie activada' });
      loadSeries(selectedNcf.id);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo activar la serie',
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        data={ncfList}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={loadNCFs}
        ListHeaderComponent={
          <Button title="Nuevo NCF" onPress={openNew} style={{ marginBottom: theme.spacing.lg }} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 }}>
              No hay NCFs configurados
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openConfigure(item)}
            style={[
              styles.ncfCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.fontSize.md }}>
                {item.nombre}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm }}>
                {item.serie} · {item.codigo}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Badge positive={item.active} trueLabel="Activo" falseLabel="Inactivo" />
                <Badge positive={item.require_rnc} trueLabel="Requiere RNC" falseLabel="Sin RNC" />
                <Badge positive={item.validate_expiration} trueLabel="Valida vigencia" falseLabel="Sin vigencia" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Configurar NCF">
        <NCFForm ncf={selectedNcf} onSaved={(ncf) => { setSelectedNcf(ncf); loadNCFs(); }} />

        {selectedNcf.id ? (
          <>
            <SeriesForm ncfId={selectedNcf.id} onSaved={() => loadSeries(selectedNcf.id)} />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Series existentes</Text>
            {seriesLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : seriesList.length === 0 ? (
              <Text style={{ color: theme.colors.textMuted }}>No hay series configuradas</Text>
            ) : (
              seriesList.map((serie) => (
                <SerieRow key={serie.id} serie={serie} onActivate={() => activateSerie(serie.id)} />
              ))
            )}
          </>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
            Guardá el NCF primero para poder agregarle series.
          </Text>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  ncfCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 12,
  },
  serieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
  },
});

export default NCFManagementTab;
