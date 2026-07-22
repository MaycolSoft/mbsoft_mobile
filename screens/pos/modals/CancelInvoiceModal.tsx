import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import * as posApi from '@/screens/pos/api/posApi';
import { DGII_CLASIFICACIONES, PosInvoiceDetail } from '@/screens/pos/types';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

interface CancelInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** id_role del usuario logueado, si viene en el login — el backend exige rol 3 para esta acción. */
  currentUserRole?: number;
}

/**
 * Devolución de factura → genera una Nota de Crédito (NCF 04). El backend
 * valida rol 3 del usuario de la sesión con un 403 — esto solo muestra un
 * aviso previo si conocemos el rol, nunca reemplaza esa validación.
 */
const CancelInvoiceModal = ({ visible, onClose, onSuccess, currentUserRole }: CancelInvoiceModalProps) => {
  const theme = useTheme();
  const [facturaNum, setFacturaNum] = useState('');
  const [searching, setSearching] = useState(false);
  const [factura, setFactura] = useState<PosInvoiceDetail | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [devoluciones, setDevoluciones] = useState<Record<number, number>>({});
  const [clasificacion, setClasificacion] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFacturaNum('');
    setFactura(null);
    setDays(null);
    setDevoluciones({});
    setClasificacion('');
    setComments('');
  }, [visible]);

  const totalDevolucion = useMemo(() => {
    if (!factura?.detalle) return 0;
    return factura.detalle.reduce((acc, item) => {
      const qty = devoluciones[item.id_producto] || 0;
      const unit = (parseFloat(String(item.total)) || 0) / (item.quantity || 1);
      return acc + qty * unit;
    }, 0);
  }, [factura, devoluciones]);

  const buscarFactura = async () => {
    if (!facturaNum.trim()) return;
    setSearching(true);
    try {
      const { factura: found, days: daysFound } = await posApi.getFacturaToCancelar(facturaNum.trim());
      if (!found) {
        Toast.show({ type: 'info', text1: 'Aviso', text2: 'La factura no existe' });
        return;
      }
      setFactura(found);
      setDays(daysFound ?? null);
      setDevoluciones({});
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al buscar la factura',
      });
    } finally {
      setSearching(false);
    }
  };

  const otraFactura = () => {
    setFactura(null);
    setDays(null);
    setDevoluciones({});
  };

  const setDevolucion = (idProducto: number, disponible: number, raw: string) => {
    const qty = Math.max(0, Math.min(disponible, parseFloat(raw) || 0));
    setDevoluciones((prev) => ({ ...prev, [idProducto]: qty }));
  };

  const hasDevolucion = Object.values(devoluciones).some((qty) => qty > 0);

  const submit = async () => {
    if (!factura) return;
    if (!clasificacion) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Elegí una clasificación' });
      return;
    }
    if (!hasDevolucion) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Indicá al menos un producto a devolver' });
      return;
    }

    const tabla = (factura.detalle ?? [])
      .filter((item) => (devoluciones[item.id_producto] || 0) > 0)
      .map((item) => ({
        devolucion: devoluciones[item.id_producto],
        quantity: item.quantity,
        id_producto: item.id_producto,
      }));

    setSubmitting(true);
    try {
      const response = await posApi.cancelarFactura({
        facturaId: factura.id,
        clasificacion,
        tabla,
        comments,
      });
      Toast.show({ type: 'success', text1: 'Éxito', text2: response?.message || 'Devolución registrada' });
      onSuccess();
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al registrar la devolución',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Devolución de factura">
      {currentUserRole !== undefined && currentUserRole !== 3 && (
        <View
          style={{
            backgroundColor: `${theme.colors.warning}22`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <Text style={{ color: theme.colors.warning, fontSize: theme.typography.fontSize.xs }}>
            ⚠ Tu usuario podría no tener permiso para registrar devoluciones (requiere rol de supervisor). El servidor
            va a rechazar la operación si no corresponde.
          </Text>
        </View>
      )}

      {!factura ? (
        <View>
          <TextInput
            label="Número de factura"
            iconName="receipt-long"
            value={facturaNum}
            onChangeText={setFacturaNum}
            onSubmitEditing={buscarFactura}
          />
          <Button title="Buscar" onPress={buscarFactura} loading={searching} />
        </View>
      ) : (
        <View>
          <View style={{ marginBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: theme.spacing.md }}>
            <SummaryRow label="Factura" value={`#${factura.numero_factura}`} />
            <SummaryRow label="NCF" value={factura.ncf ?? '—'} />
            <SummaryRow label="Fecha" value={factura.created_at} />
            <SummaryRow
              label="Cliente"
              value={factura.customer ? `${factura.customer.first_name ?? ''} ${factura.customer.last_name ?? ''}`.trim() : 'Consumidor final'}
            />
            <SummaryRow label="Total factura" value={formatCurrency(factura.total)} />
            {days != null && <SummaryRow label="Días transcurridos" value={String(days)} />}
          </View>

          <Text style={{ color: theme.colors.text, fontWeight: '700', marginBottom: theme.spacing.sm }}>Productos a devolver</Text>
          {(factura.detalle ?? []).map((item) => {
            const disponible = item.quantity - (item.refund_amount || 0);
            return (
              <View
                key={item.id_producto}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text }} numberOfLines={1}>
                    {item.description || item.reference || item.id_producto}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
                    Cant. {item.quantity} · Ya devuelto {item.refund_amount || 0}
                  </Text>
                </View>
                <View style={{ width: 70 }}>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0"
                    editable={disponible > 0}
                    value={devoluciones[item.id_producto] ? String(devoluciones[item.id_producto]) : ''}
                    onChangeText={(v) => setDevolucion(item.id_producto, disponible, v)}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
              </View>
            );
          })}

          <View style={{ marginTop: theme.spacing.md }}>
            <Dropdown
              label="Clasificación"
              options={DGII_CLASIFICACIONES.map((c) => ({ label: `${c.value} - ${c.label}`, value: c.value }))}
              value={clasificacion}
              onSelect={(opt) => setClasificacion(String(opt.value))}
            />
          </View>

          <TextInput label="Comentario" value={comments} onChangeText={setComments} multiline numberOfLines={2} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              marginBottom: theme.spacing.md,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>TOTAL A DEVOLVER</Text>
            <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>{formatCurrency(totalDevolucion)}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button title="Buscar otra" variant="light" onPress={otraFactura} style={{ flex: 1 }} />
            <Button title="Registrar devolución" variant="danger" onPress={submit} loading={submitting} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </Modal>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
      <Text style={{ color: theme.colors.text }}>{value}</Text>
    </View>
  );
};

export default CancelInvoiceModal;
