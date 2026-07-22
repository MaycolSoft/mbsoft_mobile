import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { DEFAULT_BASE_URL } from '@/api/axiosInstance';
import { isAxiosError } from '@/api/apiService';
import useStore from '@/store/useStore';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import {
  PosInvoice,
  PosInvoiceFilters,
  PosInvoicePaginator,
  PosInvoiceSortField,
} from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';

const PAGE_SIZE = 10;

const EMPTY_FILTERS: PosInvoiceFilters = {
  search: '',
  numFactura: '',
  startDate: '',
  endDate: '',
  ncf: '',
  rnc: '',
  customerId: '',
  userId: '',
};

const SORT_OPTIONS: { label: string; value: PosInvoiceSortField }[] = [
  { label: 'Fecha', value: 'created_at' },
  { label: 'Número de factura', value: 'numero_factura' },
  { label: 'NCF', value: 'ncf' },
  { label: 'ITBIS', value: 'total_tax' },
  { label: 'Total', value: 'total' },
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ReprintInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReprintInvoiceModal = ({ visible, onClose }: ReprintInvoiceModalProps) => {
  const theme = useTheme();
  const apiUrl = useStore((state) => state.config.apiUrl);

  const [filters, setFilters] = useState<PosInvoiceFilters>({ ...EMPTY_FILTERS });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortField, setSortField] = useState<PosInvoiceSortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [invoices, setInvoices] = useState<PosInvoice[]>([]);
  const [meta, setMeta] = useState<PosInvoicePaginator | null>(null);
  const [loading, setLoading] = useState(false);
  const requestSequence = useRef(0);

  const updateFilter = (key: keyof PosInvoiceFilters, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const validateDates = (values: PosInvoiceFilters) => {
    // El controller usa `if (num_factura) ... elseif (fechas)`: con número
    // de factura presente, el rango se ignora y no debe bloquear la búsqueda.
    if (values.numFactura.trim()) return true;
    if (!values.startDate && !values.endDate) return true;
    if (!values.startDate || !values.endDate) {
      Toast.show({ type: 'info', text1: 'Rango incompleto', text2: 'Indica la fecha inicial y la fecha final.' });
      return false;
    }
    if (!ISO_DATE_PATTERN.test(values.startDate) || !ISO_DATE_PATTERN.test(values.endDate)) {
      Toast.show({ type: 'info', text1: 'Fecha inválida', text2: 'Usa el formato YYYY-MM-DD.' });
      return false;
    }
    if (values.endDate < values.startDate) {
      Toast.show({ type: 'info', text1: 'Fecha inválida', text2: 'La fecha final debe ser igual o posterior a la inicial.' });
      return false;
    }
    return true;
  };

  const fetchInvoices = async (
    targetPage: number,
    field: PosInvoiceSortField = sortField,
    order: 'asc' | 'desc' = sortOrder,
    appliedFilters: PosInvoiceFilters = filters
  ) => {
    if (!validateDates(appliedFilters)) return;

    const sequence = ++requestSequence.current;
    setLoading(true);
    try {
      const result = await posApi.getFacturas({
        page: targetPage,
        perPage: PAGE_SIZE,
        sort: field,
        order,
        search: appliedFilters.search,
        numFactura: appliedFilters.numFactura,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        ncf: appliedFilters.ncf,
        rnc: appliedFilters.rnc,
        customerId: appliedFilters.customerId,
        userId: appliedFilters.userId,
      });

      if (sequence !== requestSequence.current) return;
      setInvoices(result.invoices);
      setMeta(result.meta);
    } catch (error) {
      if (sequence !== requestSequence.current) return;
      setInvoices([]);
      setMeta(null);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al buscar facturas',
      });
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    const initialFilters = { ...EMPTY_FILTERS };
    setFilters(initialFilters);
    setShowAdvanced(false);
    setSortField('created_at');
    setSortOrder('desc');
    setInvoices([]);
    setMeta(null);
    fetchInvoices(1, 'created_at', 'desc', initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const clearFilters = () => {
    const empty = { ...EMPTY_FILTERS };
    setFilters(empty);
    fetchInvoices(1, sortField, sortOrder, empty);
  };

  const openReport = async (invoice: PosInvoice) => {
    if (!invoice.url_reporte) return;
    try {
      const reportUrl = String(invoice.url_reporte);
      const url = /^https?:\/\//i.test(reportUrl)
        ? reportUrl
        : `${(apiUrl || DEFAULT_BASE_URL).replace(/\/$/, '')}/${reportUrl.replace(/^\//, '')}`;
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo abrir el reporte — el enlace puede haber expirado.' });
    }
  };

  const currentPage = meta?.current_page ?? 1;
  const totalPages = meta?.last_page ?? 1;

  return (
    <Modal visible={visible} onClose={onClose} title="Historial / re-imprimir factura">
      <TextInput
        label="Búsqueda general"
        placeholder="Factura, NCF, RNC, cliente o cajero…"
        iconName="search"
        value={filters.search}
        onChangeText={(value) => updateFilter('search', value)}
        onSubmitEditing={() => fetchInvoices(1)}
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Fecha inicial"
            placeholder="YYYY-MM-DD"
            iconName="event"
            value={filters.startDate}
            onChangeText={(value) => updateFilter('startDate', value)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Fecha final"
            placeholder="YYYY-MM-DD"
            iconName="event"
            value={filters.endDate}
            onChangeText={(value) => updateFilter('endDate', value)}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowAdvanced((previous) => !previous)}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}
      >
        <MaterialIcons
          name={showAdvanced ? 'expand-less' : 'expand-more'}
          size={22}
          color={theme.colors.primary}
        />
        <Text style={{ color: theme.colors.primary, fontWeight: '600', marginLeft: theme.spacing.xs }}>
          Filtros avanzados
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View
          style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          <TextInput
            label="Número de factura"
            placeholder="Coincidencia parcial"
            iconName="receipt-long"
            value={filters.numFactura}
            onChangeText={(value) => updateFilter('numFactura', value)}
          />

          {!!filters.numFactura.trim() && (!!filters.startDate || !!filters.endDate) && (
            <Text style={{ color: theme.colors.warning, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.md }}>
              El servidor da prioridad al número de factura y no aplica el rango de fechas mientras este filtro tenga valor.
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="NCF"
                value={filters.ncf}
                onChangeText={(value) => updateFilter('ncf', value)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="RNC"
                keyboardType="numeric"
                value={filters.rnc}
                onChangeText={(value) => updateFilter('rnc', value)}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="ID cliente"
                keyboardType="number-pad"
                value={filters.customerId}
                onChangeText={(value) => updateFilter('customerId', value.replace(/\D/g, ''))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="ID cajero"
                keyboardType="number-pad"
                value={filters.userId}
                onChangeText={(value) => updateFilter('userId', value.replace(/\D/g, ''))}
              />
            </View>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <Button title="Limpiar" variant="light" onPress={clearFilters} disabled={loading} style={{ flex: 1 }} />
        <Button title="Buscar" icon="search" onPress={() => fetchInvoices(1)} loading={loading} style={{ flex: 1 }} />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <Dropdown
            label="Ordenar por"
            options={SORT_OPTIONS}
            value={sortField}
            onSelect={(option) => {
              const field = option.value as PosInvoiceSortField;
              setSortField(field);
              fetchInvoices(1, field, sortOrder);
            }}
          />
        </View>
        <TouchableOpacity
          accessibilityLabel={sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
          onPress={() => {
            const order = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(order);
            fetchInvoices(1, sortField, order);
          }}
          style={{
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.card,
          }}
        >
          <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: theme.spacing.xl }} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginVertical: theme.spacing.xl }}>
              No hay facturas para mostrar
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                  #{item.numero_factura} {item.ncf ? `· ${item.ncf}` : ''}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                  {new Date(item.created_at).toLocaleString('es-DO')}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                  {item.customer ? `${item.customer.first_name ?? ''} ${item.customer.last_name ?? ''}`.trim() : 'Consumidor final'}
                  {item.user ? ` · ${item.user.first_name ?? ''} ${item.user.last_name ?? ''}`.trim() : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: 4 }}>
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                    ITBIS {formatCurrency(item.total_tax)}
                  </Text>
                  <Text style={{ color: theme.colors.success, fontWeight: '700' }}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => openReport(item)} hitSlop={8} disabled={!item.url_reporte}>
                <MaterialIcons
                  name="print"
                  size={24}
                  color={item.url_reporte ? theme.colors.primary : theme.colors.disabled}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, flex: 1 }}>
          {meta ? `Página ${currentPage} de ${totalPages} · ${meta.total} facturas` : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button
            title="Anterior"
            variant="light"
            size="small"
            disabled={currentPage <= 1 || loading}
            onPress={() => fetchInvoices(currentPage - 1)}
          />
          <Button
            title="Siguiente"
            variant="light"
            size="small"
            disabled={currentPage >= totalPages || loading}
            onPress={() => fetchInvoices(currentPage + 1)}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ReprintInvoiceModal;
