import React, { memo, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HttpLogEntry, useLogStore } from '@/store/useStore';
import { useTheme } from '@/theme/ThemeProvider';
import { showAlert } from '@/components/AppAlert';
import TextInput from '@/components/TextInput';

type LogFilter = 'ALL' | 'ERROR' | 'GET' | 'POST' | 'PUT' | 'DELETE';

const FILTERS: Array<{ key: LogFilter; label: string; icon?: keyof typeof MaterialIcons.glyphMap }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'ERROR', label: 'Errores', icon: 'error-outline' },
  { key: 'GET', label: 'GET' },
  { key: 'POST', label: 'POST' },
  { key: 'PUT', label: 'PUT' },
  { key: 'DELETE', label: 'DELETE' },
];

const hasPayload = (value: any) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const formatPayload = (value: any) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatTime = (timestamp: Date) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const PayloadViewer = ({
  visible,
  title,
  content,
  onClose,
}: {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}) => {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[styles.viewerContainer, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[
            styles.viewerHeader,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
              paddingHorizontal: theme.spacing.lg,
            },
          ]}
        >
          <View style={[styles.viewerIcon, { backgroundColor: `${theme.colors.primary}18`, borderRadius: theme.radius.md }]}>
            <MaterialIcons name="data-object" size={21} color={theme.colors.primary} />
          </View>
          <View style={styles.viewerTitleContainer}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, fontWeight: '700' }}>
              {title}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
              {content.length.toLocaleString()} caracteres capturados
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar detalle"
            accessibilityRole="button"
            hitSlop={12}
            style={[styles.viewerClose, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.full }]}
          >
            <MaterialIcons name="close" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.viewerVerticalScroll}
          contentContainerStyle={{ padding: theme.spacing.md }}
          showsVerticalScrollIndicator
        >
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator
            contentContainerStyle={[
              styles.viewerCodeContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text
              selectable
              style={[
                styles.viewerCodeText,
                { color: theme.colors.text, fontSize: theme.typography.fontSize.xs },
              ]}
            >
              {content}
            </Text>
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const getMethodColor = (method: string, colors: ReturnType<typeof useTheme>['colors']) => {
  switch (method.toUpperCase()) {
    case 'POST':
      return colors.success;
    case 'PUT':
    case 'PATCH':
      return colors.warning;
    case 'DELETE':
      return colors.danger;
    default:
      return colors.primary;
  }
};

const DetailSection = ({
  icon,
  title,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: any;
}) => {
  const theme = useTheme();
  const [viewerVisible, setViewerVisible] = useState(false);
  const formattedValue = useMemo(() => formatPayload(value), [value]);

  if (!hasPayload(value)) return null;

  return (
    <View style={styles.detailSection}>
      <View style={styles.detailTitleRow}>
        <MaterialIcons name={icon} size={15} color={theme.colors.textMuted} />
        <Text style={[styles.detailTitle, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }]}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={[
          styles.codeBlock,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <Text
          selectable
          numberOfLines={12}
          ellipsizeMode="tail"
          style={[styles.codeText, { color: theme.colors.text, fontSize: theme.typography.fontSize.xs }]}
        >
          {formattedValue}
        </Text>
      </ScrollView>
      <TouchableOpacity
        onPress={() => setViewerVisible(true)}
        style={[styles.viewFullButton, { borderColor: theme.colors.border, borderRadius: theme.radius.sm }]}
      >
        <MaterialIcons name="fullscreen" size={17} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.xs, fontWeight: '700' }}>
          Ver completo
        </Text>
      </TouchableOpacity>

      <PayloadViewer
        visible={viewerVisible}
        title={title}
        content={formattedValue}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

const LogCard = memo(({ item }: { item: HttpLogEntry }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const methodColor = getMethodColor(item.method, theme.colors);
  const statusColor = item.status === 'success'
    ? theme.colors.success
    : item.status === 'error' ? theme.colors.danger : theme.colors.warning;
  const statusIcon = item.status === 'success'
    ? 'check-circle'
    : item.status === 'error' ? 'error' : 'schedule';
  const statusLabel = item.httpStatus
    ? `${item.httpStatus}`
    : item.status === 'pending' ? 'Pendiente' : 'Sin respuesta';
  const hasDetails = [item.params, item.data, item.response, item.error].some(hasPayload);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => hasDetails && setExpanded((value) => !value)}
      style={[
        styles.card,
        theme.shadow,
        {
          backgroundColor: theme.colors.card,
          borderColor: expanded ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.methodBadge,
            {
              backgroundColor: `${methodColor}18`,
              borderColor: `${methodColor}55`,
              borderRadius: theme.radius.sm,
            },
          ]}
        >
          <Text style={[styles.methodText, { color: methodColor, fontSize: theme.typography.fontSize.xs }]}>{item.method.toUpperCase()}</Text>
        </View>

        <View style={styles.urlContainer}>
          <Text style={[styles.urlText, { color: theme.colors.text, fontSize: theme.typography.fontSize.sm }]} numberOfLines={1}>
            {item.url}
          </Text>
          <View style={styles.metadataRow}>
            <Text style={[styles.metadataText, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }]}>{formatTime(item.timestamp)}</Text>
            {item.durationMs !== undefined && (
              <>
                <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.metadataText, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }]}>{item.durationMs} ms</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18`, borderRadius: theme.radius.full }]}>
            <MaterialIcons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor, fontSize: theme.typography.fontSize.xs }]}>{statusLabel}</Text>
          </View>
          {hasDetails && (
            <MaterialIcons
              name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textMuted}
            />
          )}
        </View>
      </View>

      {expanded && (
        <View style={[styles.details, { borderTopColor: theme.colors.border }]}>
          <DetailSection icon="tune" title="Parámetros" value={item.params} />
          <DetailSection icon="upload" title="Request" value={item.data} />
          <DetailSection
            icon={item.status === 'error' ? 'error-outline' : 'download'}
            title={item.status === 'error' ? 'Error' : 'Response'}
            value={item.status === 'error' ? item.error : item.response}
          />
        </View>
      )}
    </TouchableOpacity>
  );
});

LogCard.displayName = 'LogCard';

const SummaryItem = ({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: number;
  label: string;
  color: string;
}) => {
  const theme = useTheme();

  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}18`, borderRadius: theme.radius.md }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <View>
        <Text style={[styles.summaryValue, { color: theme.colors.text, fontSize: theme.typography.fontSize.md }]}>{value}</Text>
        <Text style={[styles.summaryLabel, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }]}>{label}</Text>
      </View>
    </View>
  );
};

const LogScreen: React.FC = () => {
  const theme = useTheme();
  const logs = useLogStore((state) => state.logs);
  const clearLogs = useLogStore((state) => state.clearLogs);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LogFilter>('ALL');

  const summary = useMemo(() => ({
    total: logs.length,
    success: logs.filter((log) => log.status === 'success').length,
    errors: logs.filter((log) => log.status === 'error').length,
  }), [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesFilter = filter === 'ALL'
        || (filter === 'ERROR' ? log.status === 'error' : log.method.toUpperCase() === filter);
      const matchesQuery = !normalizedQuery
        || log.url.toLowerCase().includes(normalizedQuery)
        || log.method.toLowerCase().includes(normalizedQuery)
        || `${log.httpStatus ?? ''}`.includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, logs, query]);

  const confirmClear = () => {
    showAlert(
      'Limpiar historial',
      'Se eliminarán todos los requests y responses guardados en esta sesión.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: clearLogs },
      ],
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: `${theme.colors.primary}18`, borderRadius: theme.radius.md }]}>
            <MaterialIcons name="http" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.typography.fontSize.lg }]}>Monitor HTTP</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }]}>Requests de la sesión actual</Text>
          </View>
          <TouchableOpacity
            onPress={confirmClear}
            disabled={logs.length === 0}
            accessibilityLabel="Limpiar historial HTTP"
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                opacity: logs.length === 0 ? 0.45 : 1,
              },
            ]}
          >
            <MaterialIcons name="delete-sweep" size={21} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.summary,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <SummaryItem icon="swap-vert" value={summary.total} label="Total" color={theme.colors.primary} />
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
          <SummaryItem icon="check-circle" value={summary.success} label="Exitosos" color={theme.colors.success} />
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
          <SummaryItem icon="error" value={summary.errors} label="Errores" color={theme.colors.danger} />
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar endpoint, método o status..."
          iconName="search"
          containerStyle={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.full,
                  },
                ]}
              >
                {item.icon && (
                  <MaterialIcons
                    name={item.icon}
                    size={14}
                    color={selected ? theme.colors.onPrimary : theme.colors.textMuted}
                  />
                )}
                <Text style={[styles.filterText, { color: selected ? theme.colors.onPrimary : theme.colors.text, fontSize: theme.typography.fontSize.xs }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogCard item={item} />}
        contentContainerStyle={[styles.listContent, filteredLogs.length === 0 && styles.emptyListContent]}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.full }]}>
              <MaterialIcons
                name={logs.length === 0 ? 'travel-explore' : 'filter-alt-off'}
                size={34}
                color={theme.colors.textMuted}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text, fontSize: theme.typography.fontSize.lg }]}>
              {logs.length === 0 ? 'Aún no hay actividad' : 'Sin coincidencias'}
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm }]}>
              {logs.length === 0
                ? 'Los próximos requests aparecerán aquí con su respuesta y duración.'
                : 'Prueba con otro filtro o término de búsqueda.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCopy: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  clearButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  summaryValue: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    marginHorizontal: 5,
  },
  searchInput: {
    marginBottom: 8,
  },
  filters: {
    gap: 7,
    paddingBottom: 12,
  },
  filterChip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    borderWidth: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodBadge: {
    width: 58,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  urlContainer: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metadataText: {
    fontSize: 10,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 3,
  },
  statusBadge: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 11,
    gap: 12,
  },
  detailSection: {
    gap: 6,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  codeBlock: {
    maxHeight: 230,
    borderWidth: 1,
    padding: 10,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  viewFullButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  viewerContainer: {
    flex: 1,
  },
  viewerHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  viewerIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  viewerTitleContainer: {
    flex: 1,
  },
  viewerClose: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerVerticalScroll: {
    flex: 1,
  },
  viewerCodeContent: {
    minWidth: '100%',
    borderWidth: 1,
    padding: 12,
  },
  viewerCodeText: {
    fontFamily: 'monospace',
    lineHeight: 17,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 38,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});

export default LogScreen;
