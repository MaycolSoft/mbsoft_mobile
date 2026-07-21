import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import { getRequest, postRequest, putRequest, deleteRequest, isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Badge from '@/components/Badge';
import { showAlert } from '@/components/AppAlert';

interface Command {
  key: string;
  command: string;
  label: string;
  description: string;
  schedulable: boolean;
  defaultArgs: Record<string, any>;
}

interface ScheduledTask {
  id: number;
  name: string;
  command: string;
  command_key: string;
  active: boolean;
  cron_expression: string;
  next_run_at: string | null;
  arguments_json?: any;
}

const FREQUENCIES = [
  { key: 'specific_time', label: 'Hora específica' },
  { key: 'every_minute', label: 'Cada minuto', cron: '* * * *' },
  { key: 'every_5_minutes', label: 'Cada 5 min', cron: '*/5 * * *' },
  { key: 'every_10_minutes', label: 'Cada 10 min', cron: '*/10 * * *' },
  { key: 'every_30_minutes', label: 'Cada 30 min', cron: '*/30 * * *' },
  { key: 'every_hour', label: 'Cada 1 hr', cron: '0 * * *' },
  { key: 'every_6_hours', label: 'Cada 6 hr', cron: '0 */6 * *' },
];

const DAYS = [
  { key: 'sun', label: 'D', cron: 0 },
  { key: 'mon', label: 'L', cron: 1 },
  { key: 'tue', label: 'M', cron: 2 },
  { key: 'wed', label: 'X', cron: 3 },
  { key: 'thu', label: 'J', cron: 4 },
  { key: 'fri', label: 'V', cron: 5 },
  { key: 'sat', label: 'S', cron: 6 },
];

const DAY_PRESETS = [
  { key: 'weekdays', label: 'Lun-Vie', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
  { key: 'daily', label: 'Diario', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] },
  { key: 'weekend', label: 'Fines', days: ['sat', 'sun'] },
  { key: 'custom', label: 'Manual', days: null as string[] | null },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function buildCronExpressions(selectedDays: string[], times: string[]) {
  const cronDays = selectedDays.map((key) => DAYS.find((d) => d.key === key)?.cron).filter((d) => d !== undefined).join(',');

  return times.map((time) => {
    const [hour, minute] = time.split(':');
    return { time, cron_expression: `${Number(minute)} ${Number(hour)} * * ${cronDays}` };
  });
}

function errorMessage(error: any, fallback: string) {
  return isAxiosError(error) ? error.response?.data.message || fallback : fallback;
}

const ScheduledTasksTab = () => {
  const theme = useTheme();

  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingCommands, setLoadingCommands] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [commandKey, setCommandKey] = useState('');
  const [mode, setMode] = useState<'schedule' | 'run_once'>('schedule');
  const [frequency, setFrequency] = useState('specific_time');
  const [dayPreset, setDayPreset] = useState('weekdays');
  const [customDays, setCustomDays] = useState<string[]>(['mon', 'wed', 'fri']);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [customName, setCustomName] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo'
  );
  const [argsText, setArgsText] = useState('{}');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedCommand = useMemo(
    () => commands.find((c) => c.key === commandKey) || commands[0] || null,
    [commands, commandKey]
  );

  const selectedDays = useMemo(() => {
    const preset = DAY_PRESETS.find((p) => p.key === dayPreset);
    if (!preset) return [];
    return preset.key === 'custom' ? customDays : preset.days ?? [];
  }, [dayPreset, customDays]);

  const cronPreview = useMemo(() => {
    if (mode !== 'schedule' || !selectedDays.length) return [];
    const cronDays = selectedDays.map((key) => DAYS.find((d) => d.key === key)?.cron).filter((d) => d !== undefined).join(',');

    if (frequency !== 'specific_time') {
      const config = FREQUENCIES.find((f) => f.key === frequency);
      if (!config?.cron) return [];
      return [{ time: config.label, cron_expression: `${config.cron} ${cronDays}` }];
    }

    if (!times.length) return [];
    return buildCronExpressions(selectedDays, times);
  }, [mode, selectedDays, times, frequency]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await getRequest('api/scheduled-tasks');
      setTasks(response.data?.data ?? []);
    } catch (error) {
      setTasks([]);
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudieron cargar las tareas') });
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadCommands = async () => {
    setLoadingCommands(true);
    try {
      const response = await getRequest('api/scheduled-tasks/commands');
      const raw = response.data?.data;
      const normalized: Command[] = Array.isArray(raw)
        ? raw.map((item: any, index: number) => ({
            key: item.key || item.command_key || String(index),
            command: item.command || '',
            label: item.label || item.command || `Comando ${index + 1}`,
            description: item.description || item.command || '',
            schedulable: item.schedulable !== false,
            defaultArgs: item.defaultArgs || item.default_args || {},
          }))
        : Object.entries(raw ?? {}).map(([key, item]: [string, any]) => ({
            key,
            command: item.command || '',
            label: item.label || item.command || key,
            description: item.description || item.command || '',
            schedulable: item.schedulable !== false,
            defaultArgs: item.defaultArgs || item.default_args || {},
          }));

      setCommands(normalized);
      if (normalized[0]) {
        setCommandKey(normalized[0].key);
        setArgsText(JSON.stringify(normalized[0].defaultArgs || {}, null, 2));
        setMode(normalized[0].schedulable ? 'schedule' : 'run_once');
      }
    } catch (error) {
      setCommands([]);
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudieron cargar los comandos') });
    } finally {
      setLoadingCommands(false);
    }
  };

  useEffect(() => {
    loadTasks();
    loadCommands();
  }, []);

  const handleChangeCommand = (key: string) => {
    const cmd = commands.find((c) => c.key === key);
    if (!cmd) return;
    setCommandKey(key);
    setArgsText(JSON.stringify(cmd.defaultArgs || {}, null, 2));
    setCustomName('');
    if (!cmd.schedulable) setMode('run_once');
  };

  const toggleCustomDay = (dayKey: string) => {
    setDayPreset('custom');
    setCustomDays((prev) => (prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]));
  };

  const addTime = () => {
    const value = `${hour}:${minute}`;
    if (times.includes(value)) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Esa hora ya fue agregada' });
      return;
    }
    setTimes((prev) => [...prev, value].sort());
  };

  const removeTime = (time: string) => setTimes((prev) => prev.filter((t) => t !== time));

  const parseArguments = (): Record<string, any> | null => {
    try {
      return JSON.parse(argsText || '{}');
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Los argumentos no son un JSON válido' });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedCommand) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Seleccioná un comando' });
      return;
    }
    const args = parseArguments();
    if (args === null) return;

    if (mode === 'schedule') {
      if (!selectedDays.length) {
        Toast.show({ type: 'info', text1: 'Aviso', text2: 'Seleccioná al menos un día' });
        return;
      }
      if (frequency === 'specific_time' && !times.length) {
        Toast.show({ type: 'info', text1: 'Aviso', text2: 'Agregá al menos una hora' });
        return;
      }
    }

    setLoadingAction(true);
    try {
      if (mode === 'schedule') {
        await postRequest('api/scheduled-tasks/bulk', {
          command_key: selectedCommand.key,
          name: customName.trim() || selectedCommand.label,
          arguments_json: args,
          timezone,
          active: true,
          schedules: cronPreview,
        });
        Toast.show({ type: 'success', text1: 'Éxito', text2: 'Tarea programada creada' });
        await loadTasks();
      } else {
        await postRequest('api/scheduled-tasks/run-once', { command_key: selectedCommand.key, arguments: args });
        Toast.show({ type: 'success', text1: 'Éxito', text2: 'Comando enviado a ejecución' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudo procesar la solicitud') });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRunTest = async () => {
    if (!selectedCommand) return;
    const args = parseArguments();
    if (args === null) return;

    setLoadingAction(true);
    try {
      await postRequest('api/scheduled-tasks/run-once', { command_key: selectedCommand.key, arguments: args });
      Toast.show({ type: 'success', text1: 'Éxito', text2: 'Prueba ejecutada correctamente' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudo procesar la solicitud') });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleActive = async (task: ScheduledTask) => {
    setLoadingAction(true);
    try {
      await putRequest(`api/scheduled-tasks/${task.id}`, { active: !task.active });
      Toast.show({ type: 'success', text1: 'Éxito', text2: task.active ? 'Tarea desactivada' : 'Tarea activada' });
      await loadTasks();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudo procesar la solicitud') });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = (task: ScheduledTask) => {
    showAlert('Eliminar tarea', '¿Seguro que deseas eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoadingAction(true);
          try {
            await deleteRequest(`api/scheduled-tasks/${task.id}`);
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Tarea eliminada correctamente' });
            await loadTasks();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudo procesar la solicitud') });
          } finally {
            setLoadingAction(false);
          }
        },
      },
    ]);
  };

  const handleRunStored = async (task: ScheduledTask) => {
    setLoadingAction(true);
    try {
      await postRequest('api/scheduled-tasks/run-once', {
        command_key: task.command_key,
        arguments: task.arguments_json ?? {},
      });
      Toast.show({ type: 'success', text1: 'Éxito', text2: 'Comando enviado a ejecución' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage(error, 'No se pudo procesar la solicitud') });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
      {/* Command + mode */}
      <Dropdown
        label={selectedCommand?.label || 'Selecciona un comando'}
        options={commands.map((c) => ({ label: c.label, value: c.key }))}
        value={commandKey}
        onSelect={(opt) => handleChangeCommand(String(opt.value))}
      />

      {selectedCommand?.description && (
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.md }}>
          {selectedCommand.description}
        </Text>
      )}

      <View style={[styles.segmented, { borderColor: theme.colors.border, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg }]}>
        <TouchableOpacity
          onPress={() => setMode('schedule')}
          disabled={!selectedCommand?.schedulable}
          style={[styles.segment, { backgroundColor: mode === 'schedule' ? theme.colors.primary : 'transparent' }]}
        >
          <Text style={{ color: mode === 'schedule' ? theme.colors.onPrimary : theme.colors.text }}>Programar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('run_once')}
          style={[styles.segment, { backgroundColor: mode === 'run_once' ? theme.colors.primary : 'transparent', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: theme.colors.border }]}
        >
          <Text style={{ color: mode === 'run_once' ? theme.colors.onPrimary : theme.colors.text }}>Una vez</Text>
        </TouchableOpacity>
      </View>

      {mode === 'schedule' && (
        <>
          <Dropdown
            label="Frecuencia"
            options={FREQUENCIES.map((f) => ({ label: f.label, value: f.key }))}
            value={frequency}
            onSelect={(opt) => setFrequency(String(opt.value))}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: theme.spacing.md }}>
            {DAY_PRESETS.map((preset) => {
              const selected = dayPreset === preset.key;
              return (
                <TouchableOpacity
                  key={preset.key}
                  onPress={() => setDayPreset(preset.key)}
                  style={[
                    styles.pill,
                    { backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderRadius: theme.radius.full },
                  ]}
                >
                  <Text style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontSize: theme.typography.fontSize.sm }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {dayPreset === 'custom' && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md }}>
              {DAYS.map((day) => {
                const selected = customDays.includes(day.key);
                return (
                  <TouchableOpacity
                    key={day.key}
                    onPress={() => toggleCustomDay(day.key)}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderRadius: theme.radius.full },
                    ]}
                  >
                    <Text style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontWeight: '700' }}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {frequency === 'specific_time' && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.xs }}>
                ¿A qué hora?
              </Text>

              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Dropdown options={HOURS.map((h) => ({ label: h, value: h }))} value={hour} onSelect={(opt) => setHour(String(opt.value))} />
                </View>
                <Text style={{ color: theme.colors.text }}>:</Text>
                <View style={{ flex: 1 }}>
                  <Dropdown options={MINUTES.map((m) => ({ label: m, value: m }))} value={minute} onSelect={(opt) => setMinute(String(opt.value))} />
                </View>
                <TouchableOpacity
                  onPress={addTime}
                  style={[styles.addTimeButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
                >
                  <MaterialIcons name="add" size={20} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing.sm }}>
                {times.length === 0 ? (
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm }}>Sin horas</Text>
                ) : (
                  times.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => removeTime(time)}
                      style={[styles.timeChip, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.full }]}
                    >
                      <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.sm }}>{time}</Text>
                      <MaterialIcons name="close" size={14} color={theme.colors.textMuted} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          <View
            style={[
              styles.summary,
              { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg },
            ]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{cronPreview.length} tarea(s) a crear</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 4 }}>
              {DAY_PRESETS.find((p) => p.key === dayPreset)?.label}
              {frequency === 'specific_time' && times.length > 0 ? ` · ${times.join(' · ')}` : ''}
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity onPress={() => setAdvancedOpen((prev) => !prev)} style={{ marginBottom: theme.spacing.md }}>
        <Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.sm }}>
          {advancedOpen ? 'Ocultar avanzado' : 'Opciones avanzadas'}
        </Text>
      </TouchableOpacity>

      {advancedOpen && (
        <View>
          {mode === 'schedule' && (
            <>
              <TextInput label="Nombre opcional" value={customName} onChangeText={setCustomName} placeholder={selectedCommand?.label} />
              <TextInput label="Zona horaria" value={timezone} onChangeText={setTimezone} />
            </>
          )}
          <TextInput
            label="Argumentos JSON"
            value={argsText}
            onChangeText={setArgsText}
            multiline
            numberOfLines={6}
            style={{ height: 120, textAlignVertical: 'top' }}
          />
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xxl }}>
        <Button title="Probar" variant="light" onPress={handleRunTest} loading={loadingAction} style={{ flex: 1 }} />
        <Button
          title={mode === 'schedule' ? 'Crear tarea' : 'Ejecutar ahora'}
          onPress={handleSubmit}
          loading={loadingAction}
          disabled={!selectedCommand}
          style={{ flex: 1 }}
        />
      </View>

      {/* Saved tasks */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Tareas guardadas ({tasks.length})
      </Text>

      {tasks.length === 0 && !loadingTasks && (
        <Text style={{ color: theme.colors.textMuted }}>No hay tareas guardadas</Text>
      )}

      {tasks.map((task) => (
        <View key={task.id} style={[styles.taskCard, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{task.name}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>{task.command}</Text>
            </View>
            <Badge positive={task.active} trueLabel="Activa" falseLabel="Pausada" />
          </View>

          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 6, fontFamily: 'monospace' }}>
            {task.cron_expression}
          </Text>

          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
            {task.next_run_at ? `Próxima: ${task.next_run_at}` : 'Sin próxima ejecución'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: theme.spacing.sm }}>
            <Button icon="play-arrow" size="small" variant="light" onPress={() => handleRunStored(task)} />
            <Button icon="power-settings-new" size="small" variant={task.active ? 'primary' : 'light'} onPress={() => handleToggleActive(task)} />
            <Button icon="delete" size="small" variant="danger" onPress={() => handleDelete(task)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dayCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  summary: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  taskCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
  },
});

export default ScheduledTasksTab;
