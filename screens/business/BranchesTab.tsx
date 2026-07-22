import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { getRequest, postRequest, isAxiosError } from '@/api/apiService';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

// type_document: 1=Factura, 2=Nota de crédito, 3=Entrada de productos,
// 4=Membresía clientes (el backend siempre la deja en "", no es editable), 5=Facturas suspendidas
interface DocumentPrefix {
  type_document: number;
  prefix: string;
}

interface Branch {
  id: number; // 0 = nueva
  name: string;
  address: string;
  phone: string;
  // Cómo se muestra la búsqueda de productos en el POS para esta sucursal.
  // "tabla" (default): lista de resultados de búsqueda, como hoy.
  // "cartas": explorar por categoría con tarjetas visuales, tocar para agregar.
  modo_busqueda_products_facturacion: 'tabla' | 'cartas';
  day_limit_for_invoice_return: number;
  show_monto_devuelto_and_monto_pagado: boolean;
  '10_porciento_de_ley': boolean;
  show_control_itbis: boolean;
  allow_remove_product_pos: boolean;
  allow_digital_invoices: boolean;
  pie_de_pagina_factura: string;
  pie_de_pagina_notas_de_credito: string;
  pie_de_pagina_entradas_productos: string;
  prefix?: DocumentPrefix[];
}

const emptyBranch = (): Branch => ({
  id: 0,
  name: '',
  address: '',
  phone: '',
  modo_busqueda_products_facturacion: 'tabla',
  day_limit_for_invoice_return: 0,
  show_monto_devuelto_and_monto_pagado: false,
  '10_porciento_de_ley': false,
  show_control_itbis: false,
  allow_remove_product_pos: false,
  allow_digital_invoices: false,
  pie_de_pagina_factura: '',
  pie_de_pagina_notas_de_credito: '',
  pie_de_pagina_entradas_productos: '',
  prefix: [],
});

function getPrefix(prefixes: DocumentPrefix[] | undefined, typeDocument: number) {
  return prefixes?.find((p) => p.type_document === typeDocument)?.prefix ?? '';
}

const SectionTitle = ({ children }: { children: string }) => {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, fontWeight: '700', marginBottom: theme.spacing.md, marginTop: theme.spacing.lg }}>
      {children}
    </Text>
  );
};

const SwitchRow = ({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) => {
  const theme = useTheme();
  return (
    <View style={[styles.switchRow, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
      <View style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text }}>{label}</Text>
        {description && (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>{description}</Text>
        )}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="#fff" />
    </View>
  );
};

const BranchForm = ({ branch, onSaved }: { branch: Branch; onSaved: (branch: Branch) => void }) => {
  const theme = useTheme();
  const [form, setForm] = useState<Branch>(branch);
  const [prefixFactura, setPrefixFactura] = useState(getPrefix(branch.prefix, 1));
  const [prefixNotaCredito, setPrefixNotaCredito] = useState(getPrefix(branch.prefix, 2));
  const [prefixEntradaProductos, setPrefixEntradaProductos] = useState(getPrefix(branch.prefix, 3));
  const [prefixSuspendidas, setPrefixSuspendidas] = useState(getPrefix(branch.prefix, 5));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(branch);
    setPrefixFactura(getPrefix(branch.prefix, 1));
    setPrefixNotaCredito(getPrefix(branch.prefix, 2));
    setPrefixEntradaProductos(getPrefix(branch.prefix, 3));
    setPrefixSuspendidas(getPrefix(branch.prefix, 5));
  }, [branch]);

  const save = async () => {
    if (!form.name.trim()) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'El nombre de la sucursal es requerido' });
      return;
    }

    setSaving(true);
    try {
      const response = await postRequest('api/branch/updateOrCreateBranch', {
        id_branch: form.id || undefined,
        branch_name: form.name,
        branch_location: form.address,
        branch_phone: form.phone,
        modo_busqueda_products_facturacion: form.modo_busqueda_products_facturacion,
        day_limit_for_invoice_return: form.day_limit_for_invoice_return,
        show_monto_devuelto_and_monto_pagado: form.show_monto_devuelto_and_monto_pagado,
        '10_porciento_de_ley': form['10_porciento_de_ley'],
        show_control_itbis: form.show_control_itbis,
        allow_remove_product_pos: form.allow_remove_product_pos,
        allow_digital_invoices: form.allow_digital_invoices,
        'pie_de_pagina-factura': form.pie_de_pagina_factura,
        'pie_de_pagina-notas_de_credito': form.pie_de_pagina_notas_de_credito,
        'pie_de_pagina-entradas_productos': form.pie_de_pagina_entradas_productos,
        prefix_factura: prefixFactura,
        prefix_nota_de_credito: prefixNotaCredito,
        prefix_entrada_de_productos: prefixEntradaProductos,
        prefix_suspended_invoices: prefixSuspendidas,
      });

      Toast.show({ type: 'success', text1: 'Éxito', text2: response.data.message || 'Sucursal guardada' });
      onSaved(response.data.data ?? form);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudo guardar la sucursal',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <SectionTitle>Información general</SectionTitle>
      <TextInput label="Nombre" iconName="store" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />
      <TextInput label="Dirección" iconName="place" value={form.address} onChangeText={(v) => setForm((p) => ({ ...p, address: v }))} />
      <TextInput label="Teléfono" iconName="call" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} />

      <SectionTitle>Comportamiento del POS</SectionTitle>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing.sm }}>
        Modo de búsqueda de productos
      </Text>
      <View style={[styles.segmented, { borderColor: theme.colors.border, borderRadius: theme.radius.md, marginBottom: theme.spacing.md }]}>
        {(['tabla', 'cartas'] as const).map((mode, index) => {
          const selected = form.modo_busqueda_products_facturacion === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setForm((p) => ({ ...p, modo_busqueda_products_facturacion: mode }))}
              style={[
                styles.segment,
                {
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                  borderLeftWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderLeftColor: theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontWeight: selected ? '700' : '400' }}>
                {mode === 'tabla' ? 'Tabla' : 'Carta'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        label="Días límite para devolución de factura"
        iconName="event-busy"
        keyboardType="numeric"
        value={String(form.day_limit_for_invoice_return)}
        onChangeText={(v) => setForm((p) => ({ ...p, day_limit_for_invoice_return: parseInt(v, 10) || 0 }))}
      />

      <SwitchRow
        label="Permitir eliminar productos en el POS"
        description="Si está apagado, borrar un producto del carrito pide usuario y clave de supervisor"
        value={form.allow_remove_product_pos}
        onChange={(v) => setForm((p) => ({ ...p, allow_remove_product_pos: v }))}
      />
      <SwitchRow
        label="Mostrar monto devuelto y monto pagado"
        value={form.show_monto_devuelto_and_monto_pagado}
        onChange={(v) => setForm((p) => ({ ...p, show_monto_devuelto_and_monto_pagado: v }))}
      />
      <SwitchRow
        label="10% de ley"
        value={form['10_porciento_de_ley']}
        onChange={(v) => setForm((p) => ({ ...p, '10_porciento_de_ley': v }))}
      />
      <SwitchRow
        label="Mostrar control de ITBIS"
        value={form.show_control_itbis}
        onChange={(v) => setForm((p) => ({ ...p, show_control_itbis: v }))}
      />
      <SwitchRow
        label="Permitir facturas digitales"
        value={form.allow_digital_invoices}
        onChange={(v) => setForm((p) => ({ ...p, allow_digital_invoices: v }))}
      />

      <SectionTitle>Prefijos de documentos</SectionTitle>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput label="Factura" value={prefixFactura} onChangeText={setPrefixFactura} autoCapitalize="characters" />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput label="Nota de crédito" value={prefixNotaCredito} onChangeText={setPrefixNotaCredito} autoCapitalize="characters" />
        </View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput label="Entrada de productos" value={prefixEntradaProductos} onChangeText={setPrefixEntradaProductos} autoCapitalize="characters" />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput label="Facturas suspendidas" value={prefixSuspendidas} onChangeText={setPrefixSuspendidas} autoCapitalize="characters" />
        </View>
      </View>

      <SectionTitle>Pie de página de documentos</SectionTitle>
      <TextInput
        label="Factura"
        value={form.pie_de_pagina_factura}
        onChangeText={(v) => setForm((p) => ({ ...p, pie_de_pagina_factura: v }))}
        multiline
        numberOfLines={2}
      />
      <TextInput
        label="Notas de crédito"
        value={form.pie_de_pagina_notas_de_credito}
        onChangeText={(v) => setForm((p) => ({ ...p, pie_de_pagina_notas_de_credito: v }))}
        multiline
        numberOfLines={2}
      />
      <TextInput
        label="Entradas de productos"
        value={form.pie_de_pagina_entradas_productos}
        onChangeText={(v) => setForm((p) => ({ ...p, pie_de_pagina_entradas_productos: v }))}
        multiline
        numberOfLines={2}
      />

      <Button title="Guardar sucursal" onPress={save} loading={saving} style={{ marginTop: theme.spacing.lg }} />
    </View>
  );
};

const BranchesTab = () => {
  const theme = useTheme();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(emptyBranch());

  const loadBranches = async (query?: string) => {
    setLoading(true);
    try {
      const response = await getRequest('api/branch', query ? { search: query } : {});
      setBranches(response.data.data ?? []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isAxiosError(error) ? error.response?.data.message : 'No se pudieron cargar las sucursales',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const openEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setModalVisible(true);
  };

  const openNew = () => {
    setSelectedBranch(emptyBranch());
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        data={branches}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={() => loadBranches(search)}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.lg }}>
            <TextInput
              placeholder="Buscar por nombre o dirección…"
              iconName="search"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => loadBranches(search)}
            />
            <Button title="Nueva sucursal" onPress={openNew} />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 }}>
              No hay sucursales configuradas
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openEdit(item)}
            style={[
              styles.branchCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
            ]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.fontSize.md }}>
              {item.name}
            </Text>
            {!!item.address && (
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginTop: 2 }}>
                {item.address}
              </Text>
            )}
            {!!item.phone && (
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                {item.phone}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={selectedBranch.id ? 'Editar sucursal' : 'Nueva sucursal'}
      >
        <BranchForm
          branch={selectedBranch}
          onSaved={(branch) => {
            setSelectedBranch(branch);
            loadBranches(search);
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  branchCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 12,
  },
});

export default BranchesTab;
