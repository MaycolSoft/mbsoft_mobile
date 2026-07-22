import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import useStore from '@/store/useStore';
import { DEFAULT_BASE_URL } from '@/api/axiosInstance';
import { useTheme } from '@/theme/ThemeProvider';
import { showAlert } from '@/components/AppAlert';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';

import { getPosSessionToken, GeneralConfiguration, PosCustomer, PosNcf, PosPayments, PosProduct, parseScanInput } from '@/screens/pos/types';
import { usePosCart } from '@/screens/pos/hooks/usePosCart';
import { useProductSearch } from '@/screens/pos/hooks/useProductSearch';
import * as posApi from '@/screens/pos/api/posApi';
import { formatCurrency } from '@/screens/pos/constants';
import { isAxiosError } from '@/api/apiService';

import CartList from '@/screens/pos/components/CartList';
import SearchResultsList from '@/screens/pos/components/SearchResultsList';
import CategoryBrowser from '@/screens/pos/components/CategoryBrowser';
import OpenCashModal from '@/screens/pos/modals/OpenCashModal';
import CustomerModal from '@/screens/pos/modals/CustomerModal';
import PaymentModal from '@/screens/pos/modals/PaymentModal';
import RemoveProductModal from '@/screens/pos/modals/RemoveProductModal';
import CloseCashModal from '@/screens/pos/modals/CloseCashModal';
import SuspendedInvoicesModal from '@/screens/pos/modals/SuspendedInvoicesModal';
import ReprintInvoiceModal from '@/screens/pos/modals/ReprintInvoiceModal';
import CancelInvoiceModal from '@/screens/pos/modals/CancelInvoiceModal';
import PosActionsSheet from '@/screens/pos/components/PosActionsSheet';

const PosScreen: React.FC = () => {
  const theme = useTheme();
  const currentUser = useStore((state) => state.currentUser);
  const apiUrl = useStore((state) => state.config.apiUrl);
  const tokenSession = getPosSessionToken(currentUser);

  const { cart, cajaOpen, totals, fetchCart, addProduct, removeProduct, fetchCuadrePreview, closeCaja, clearCartLocal } = usePosCart(tokenSession);
  const { search, searching } = useProductSearch();

  const [scanValue, setScanValue] = useState('');
  const [results, setResults] = useState<PosProduct[] | null>(null);
  const [pendingQty, setPendingQty] = useState(1);

  const [client, setClient] = useState<PosCustomer | null>(null);
  const [ncf, setNcf] = useState('');
  const [ncfList, setNcfList] = useState<PosNcf[]>([]);
  const ncfRequiresRnc = Boolean(ncfList.find((item) => item.codigo === ncf)?.require_rnc);
  const [payments, setPayments] = useState<PosPayments>({});
  const [generalConfiguration, setGeneralConfiguration] = useState<GeneralConfiguration>({});
  const isCartaMode = generalConfiguration?.modo_busqueda_products_facturacion === 'cartas';
  const [browseView, setBrowseView] = useState<'browse' | 'cart'>('browse');

  const [showOpenCash, setShowOpenCash] = useState(false);
  const [showCloseCash, setShowCloseCash] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const [showReprint, setShowReprint] = useState(false);
  const [showCancelInvoice, setShowCancelInvoice] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [removingItem, setRemovingItem] = useState<{ item: any; nextQty?: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadStartupData = useCallback(async () => {
    if (!tokenSession) return;

    try {
      const data = await fetchCart();
      if (data?.caja === null || data?.caja === undefined) {
        setShowOpenCash(true);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al obtener la sesión del POS',
      });
    }

    try {
      const config = await posApi.getGeneralConfiguration();
      if (!config) {
        showAlert('Falta configuración', 'El sistema necesita la configuración para el punto de venta.');
      } else {
        setGeneralConfiguration(config);
      }
    } catch (error: any) {
      const backend = error?.response?.data;
      if (backend?.code === 35000002 || backend?.code === 35000003) {
        showAlert('No se puede usar la facturación', backend.message);
      } else if (backend?.message) {
        Toast.show({ type: 'info', text1: 'Aviso', text2: backend.message });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Error al obtener la configuración general' });
      }
    }

    try {
      const ncfs = await posApi.getNCFs();
      setNcfList(ncfs);
      if (ncfs.length > 0) setNcf((prev) => prev || ncfs[0].codigo);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error al obtener los NCF' });
    }
  }, [tokenSession, fetchCart]);

  useFocusEffect(
    useCallback(() => {
      loadStartupData();
    }, [loadStartupData])
  );

  const addWithQty = async (product: PosProduct, qty: number) => {
    try {
      await addProduct(product, qty);
      setScanValue('');
      setResults(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo agregar el producto',
      });
    }
  };

  const runSearch = async () => {
    const { qty, term } = parseScanInput(scanValue);
    if (!term) return;

    try {
      const { total, products, exactMatch } = await search(term);

      if (total === 0) {
        Toast.show({ type: 'info', text1: 'Aviso', text2: `No se encontró: ${term}` });
        setScanValue('');
        return;
      }

      if (exactMatch) {
        await addWithQty(exactMatch, qty);
        return;
      }

      setPendingQty(qty);
      setResults(products);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al buscar el producto',
      });
    }
  };

  const incrementQty = async (item: any) => {
    if (!item.product) return;
    try {
      await addProduct(item.product, 1);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo agregar el producto',
      });
    }
  };

  // Quitar una línea entera (ícono de basura) o restar 1 unidad (stepper "-")
  // pasan por el mismo control administrativo: el backend solo sabe "sumar"
  // (addProduct, acumulativo) o "eliminar la línea completa" (removeProduct) —
  // no existe un endpoint para restar cantidad, así que restar es en
  // realidad "eliminar y volver a agregar con una unidad menos".
  const runRemoval = async (item: any, nextQty: number | undefined, credentials?: { user: string; pass: string }) => {
    try {
      await removeProduct(item, credentials);
      if (nextQty && nextQty > 0 && item.product) {
        await addProduct(item.product, nextQty);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'Error al eliminar el producto',
      });
    }
  };

  const requestRemoval = (item: any, nextQty?: number) => {
    if (generalConfiguration?.allow_remove_product_pos) {
      runRemoval(item, nextQty);
      return;
    }
    setRemovingItem({ item, nextQty });
  };

  const requestRemove = (item: any) => requestRemoval(item, undefined);

  const decrementQty = (item: any) => {
    const currentQty = item.quantity ?? item.cantidad ?? item.qty ?? 0;
    requestRemoval(item, currentQty > 1 ? currentQty - 1 : undefined);
  };

  const confirmRemoveWithAuth = async (credentials: { user: string; pass: string }) => {
    if (!removingItem) return;
    await runRemoval(removingItem.item, removingItem.nextQty, credentials);
    setRemovingItem(null);
  };

  const openPayment = () => {
    if (cart.length === 0) return;
    if (ncfList.length === 0) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'No hay comprobantes fiscales (NCF) configurados' });
      return;
    }
    if (ncfRequiresRnc && !client?.rnc) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Este comprobante requiere RNC del cliente' });
      return;
    }
    setShowPayment(true);
  };

  const createInvoice = async () => {
    if (ncfRequiresRnc && !client?.rnc) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Este comprobante requiere RNC del cliente' });
      return;
    }
    if (!tokenSession) return;

    setConfirming(true);

    let formFact: Record<string, any> = {
      ncf,
      token: tokenSession,
      method_payment: payments,
    };

    if (client) {
      formFact = {
        ...formFact,
        client: client.id,
        email_customer: client.email,
        rnc: client.rnc,
        rnc_razon_social: client.rnc_razon_social,
        rnc_nombre_comercial: client.rnc_nombre_comercial,
        rnc_cedula_rnc: client.rnc_cedula_rnc,
        rnc_regimen_de_pagos: client.rnc_regimen_de_pagos,
      };
    }

    try {
      const response = await posApi.storeInvoice(formFact);

      if (response.code !== 200) {
        showAlert('Error al crear la factura', response.message);
        return;
      }

      const { idFactura, url_reporte } = response.data ?? {};
      Toast.show({ type: 'success', text1: 'Éxito', text2: `Factura #${idFactura} creada con éxito` });

      if (url_reporte) {
        const base = (apiUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
        const path = String(url_reporte).replace(/^\//, '');
        WebBrowser.openBrowserAsync(`${base}/${path}`).catch(() => {});
      }

      setPayments({});
      setClient(null);
      setShowPayment(false);
      await fetchCart();
    } catch (error) {
      showAlert('Error al crear la factura', isAxiosError(error) ? error.response?.data.message : 'Ocurrió un error inesperado.');
    } finally {
      setConfirming(false);
    }
  };

  // El backend mueve el carrito de la sesión actual a "facturas suspendidas"
  // y lo vacía — mismo shape de payload que storeInvoice, sin método de pago.
  const handleSuspendInvoice = () => {
    if (cart.length === 0) return;

    showAlert('Suspender venta actual', '¿Deseás guardar esta venta para retomarla después? El carrito se vaciará.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Suspender',
        onPress: async () => {
          let formFact: Record<string, any> = {
            token: tokenSession,
            ncf,
            send_email_customer: false,
            is_credito: false,
            digital_invoices: 0,
          };

          if (client) {
            formFact = {
              ...formFact,
              client: client.id,
              email_customer: client.email,
              rnc: client.rnc,
              rnc_razon_social: client.rnc_razon_social,
              rnc_nombre_comercial: client.rnc_nombre_comercial,
              rnc_cedula_rnc: client.rnc_cedula_rnc,
              rnc_regimen_de_pagos: client.rnc_regimen_de_pagos,
            };
          }

          try {
            const response = await posApi.suspendInvoice(formFact);
            Toast.show({ type: 'success', text1: 'Éxito', text2: response?.message || 'Venta suspendida' });
            clearCartLocal();
            setPayments({});
            setClient(null);
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: isAxiosError(error) ? error.response?.data.message : 'Error al suspender la venta',
            });
          }
        },
      },
    ]);
  };

  const handleCloseCaja = (params: { user: string; pass: string; montoCierre: number }) => closeCaja(params);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: theme.spacing.lg, zIndex: 10 }}>
          <TextInput
            placeholder="Escaneá o buscá un producto…"
            iconName="qr-code-scanner"
            value={scanValue}
            onChangeText={(value) => {
              setScanValue(value);
              if (results) setResults(null);
            }}
            onSubmitEditing={runSearch}
            containerStyle={{ marginBottom: 0 }}
          />

          <SearchResultsList results={results} onSelect={(product) => addWithQty(product, pendingQty)} />

          {cajaOpen === false && (
            <TouchableOpacity
              onPress={() => setShowOpenCash(true)}
              style={[styles.cajaBanner, { backgroundColor: `${theme.colors.danger}22`, borderRadius: theme.radius.md }]}
            >
              <MaterialIcons name="warning" size={18} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, marginLeft: 8, fontWeight: '600' }}>
                Caja cerrada — tocá para abrir
              </Text>
            </TouchableOpacity>
          )}

          {cajaOpen === true && (
            <TouchableOpacity
              onPress={() => setShowCloseCash(true)}
              style={[styles.cajaBanner, { backgroundColor: `${theme.colors.success}22`, borderRadius: theme.radius.md }]}
            >
              <MaterialIcons name="check-circle" size={18} color={theme.colors.success} />
              <Text style={{ color: theme.colors.success, marginLeft: 8, fontWeight: '600' }}>
                Caja abierta — tocá para cerrar (cuadre)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowActionsSheet(true)}
            style={[styles.smallAction, { borderColor: theme.colors.border, borderRadius: theme.radius.md, marginTop: 10, alignSelf: 'flex-start' }]}
          >
            <MaterialIcons name="more-horiz" size={16} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, marginLeft: 6, fontSize: theme.typography.fontSize.sm }}>Más opciones</Text>
          </TouchableOpacity>
        </View>

        {isCartaMode ? (
          <View style={{ flex: 1 }}>
            <View style={[styles.segmented, { borderColor: theme.colors.border, borderRadius: theme.radius.md, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm }]}>
              <TouchableOpacity
                onPress={() => setBrowseView('browse')}
                style={[styles.segment, { backgroundColor: browseView === 'browse' ? theme.colors.primary : 'transparent' }]}
              >
                <Text style={{ color: browseView === 'browse' ? theme.colors.onPrimary : theme.colors.text, fontWeight: '600' }}>
                  Explorar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBrowseView('cart')}
                style={[
                  styles.segment,
                  { backgroundColor: browseView === 'cart' ? theme.colors.primary : 'transparent', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: theme.colors.border },
                ]}
              >
                <Text style={{ color: browseView === 'cart' ? theme.colors.onPrimary : theme.colors.text, fontWeight: '600' }}>
                  Carrito ({cart.length})
                </Text>
              </TouchableOpacity>
            </View>

            {browseView === 'browse' ? (
              <CategoryBrowser onSelectProduct={(product) => addWithQty(product, 1)} />
            ) : (
              <CartList cart={cart} onIncrement={incrementQty} onDecrement={decrementQty} onRemove={requestRemove} />
            )}
          </View>
        ) : (
          <CartList cart={cart} onIncrement={incrementQty} onDecrement={decrementQty} onRemove={requestRemove} />
        )}

        <View
          style={[
            styles.footer,
            { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, padding: theme.spacing.lg },
          ]}
        >
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowCustomer(true)}
              style={[styles.pill, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
            >
              <MaterialIcons name="person-outline" size={16} color={theme.colors.text} />
              <Text numberOfLines={1} style={{ color: theme.colors.text, marginLeft: 6, flexShrink: 1 }}>
                {client ? `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim() : 'Consumidor final'}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Dropdown
                iconName="receipt-long"
                options={ncfList.map((item) => ({ label: `${item.serie}${item.codigo} - ${item.nombre}`, value: item.codigo }))}
                value={ncf}
                onSelect={(opt) => setNcf(String(opt.value))}
                style={{ height: 40, justifyContent: 'center' }}
              />
            </View>
          </View>

          {ncfRequiresRnc && !client?.rnc && (
            <Text style={{ color: theme.colors.warning, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.sm }}>
              ⚠ Este comprobante requiere RNC del cliente
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <Text style={{ color: theme.colors.textMuted }}>Total</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.xxl, fontWeight: '700' }}>
              {formatCurrency(totals.total)}
            </Text>
          </View>

          <Button
            title={cajaOpen !== true ? 'Abrí la caja para cobrar' : cart.length === 0 ? 'Carrito vacío' : 'Cobrar'}
            onPress={openPayment}
            disabled={cajaOpen !== true || cart.length === 0}
          />
        </View>
      </KeyboardAvoidingView>

      <OpenCashModal
        visible={showOpenCash}
        tokenSession={tokenSession || ''}
        onOpened={() => {
          setShowOpenCash(false);
          fetchCart().catch(() => {});
        }}
        onClose={() => setShowOpenCash(false)}
      />

      <CustomerModal visible={showCustomer} onSelect={setClient} onClose={() => setShowCustomer(false)} />

      <PaymentModal
        visible={showPayment}
        total={totals.total}
        payments={payments}
        setPayments={setPayments}
        onConfirm={createInvoice}
        onClose={() => setShowPayment(false)}
        confirming={confirming}
      />

      <RemoveProductModal
        visible={!!removingItem}
        onConfirm={confirmRemoveWithAuth}
        onClose={() => setRemovingItem(null)}
      />

      <CloseCashModal
        visible={showCloseCash}
        fetchPreview={fetchCuadrePreview}
        onConfirm={handleCloseCaja}
        onClose={() => setShowCloseCash(false)}
      />

      <SuspendedInvoicesModal
        visible={showSuspended}
        onClose={() => setShowSuspended(false)}
        onResumed={() => fetchCart().catch(() => {})}
      />

      <ReprintInvoiceModal visible={showReprint} onClose={() => setShowReprint(false)} />

      <CancelInvoiceModal
        visible={showCancelInvoice}
        onClose={() => setShowCancelInvoice(false)}
        onSuccess={() => fetchCart().catch(() => {})}
        currentUserRole={currentUser?.id_role}
      />

      <PosActionsSheet
        visible={showActionsSheet}
        onClose={() => setShowActionsSheet(false)}
        actions={[
          { key: 'suspend', label: 'Suspender venta', icon: 'pause-circle-outline', onPress: handleSuspendInvoice, disabled: cart.length === 0 },
          { key: 'suspended', label: 'Ventas suspendidas', icon: 'restore', onPress: () => setShowSuspended(true) },
          { key: 'reprint', label: 'Historial / re-imprimir factura', icon: 'print', onPress: () => setShowReprint(true) },
          { key: 'cancel', label: 'Devolución de factura', icon: 'assignment-return', onPress: () => setShowCancelInvoice(true) },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cajaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
  },
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
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export default PosScreen;
