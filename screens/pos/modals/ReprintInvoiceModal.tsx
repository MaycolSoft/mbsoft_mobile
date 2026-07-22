import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import useStore from '@/store/useStore';
import { DEFAULT_BASE_URL } from '@/api/axiosInstance';
import * as posApi from '@/screens/pos/api/posApi';
import { PosInvoice } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { label: 'Fecha', value: 'created_at' },
  { label: 'ITBIS', value: 'total_tax' },
  { label: 'Total', value: 'total' },
];

interface ReprintInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Historial de facturas / reimpresión. Contrato legacy (`api/pos/getFacturas`
 * con `filterGroups`/`pagenum` 0-indexado) — ver `posApi.getFacturas`.
 */
const ReprintInvoiceModal = ({ visible, onClose }: ReprintInvoiceModalProps) => {
  const theme = useTheme();
  const apiUrl = useStore((state) => state.config.apiUrl);

  const [numeroFactura, setNumeroFactura] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [invoices, setInvoices] = useState<PosInvoice[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async (targetPage: number, field = sortField, order = sortOrder) => {
    setLoading(true);
    try {
      const { invoices: items, meta: pageMeta } = await posApi.getFacturas({
        pagenum: targetPage - 1,
        pagesize: PAGE_SIZE,
        sortdatafield: field,
        sortorder: order,
        numeroFactura,
        dateFilter,
      });
      setInvoices(items);
      setMeta(pageMeta);
      setPage(targetPage);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al buscar facturas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setNumeroFactura('');
    setDateFilter('');
    setSortField('created_at');
    setSortOrder('desc');
    fetchInvoices(1, 'created_at', 'desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const openReport = async (invoice: PosInvoice) => {
    if (!invoice.url_reporte) return;
    try {
      const base = (apiUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
      const path = String(invoice.url_reporte).replace(/^\//, '');
      await WebBrowser.openBrowserAsync(`${base}/${path}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo abrir el reporte — el link puede haber expirado' });
    }
  };

  const totalPages = meta?.last_page || 1;
  const currentPage = meta?.current_page || page;

  return (
    <Modal visible={visible} onClose={onClose} title="Historial / re-imprimir factura">
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="# Factura"
            iconName="receipt-long"
            value={numeroFactura}
            onChangeText={setNumeroFactura}
            onSubmitEditing={() => fetchInvoices(1)}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="YYYY-MM-DD"
            iconName="event"
            value={dateFilter}
            onChangeText={setDateFilter}
            onSubmitEditing={() => fetchInvoices(1)}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <Dropdown
            label="Ordenar por"
            options={SORT_OPTIONS}
            value={sortField}
            onSelect={(opt) => {
              const field = String(opt.value);
              setSortField(field);
              fetchInvoices(1, field, sortOrder);
            }}
          />
        </View>
        <TouchableOpacity
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
          }}
        >
          <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Button title="Buscar" onPress={() => fetchInvoices(1)} style={{ flex: 1 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginVertical: 20 }}>
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
                <Text style={{ color: theme.colors.success, fontWeight: '700', marginTop: 4 }}>
                  {formatCurrency(item.total)}
                </Text>
              </View>

              <TouchableOpacity onPress={() => openReport(item)} hitSlop={8}>
                <MaterialIcons name="print" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
          {meta ? `Página ${currentPage} de ${totalPages} · ${meta.total ?? invoices.length} facturas` : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button title="Anterior" variant="light" size="small" disabled={currentPage <= 1 || loading} onPress={() => fetchInvoices(currentPage - 1)} />
          <Button title="Siguiente" variant="light" size="small" disabled={currentPage >= totalPages || loading} onPress={() => fetchInvoices(currentPage + 1)} />
        </View>
      </View>
    </Modal>
  );
};

export default ReprintInvoiceModal;
