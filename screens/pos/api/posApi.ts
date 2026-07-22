// Adaptador de API para el módulo POS/Facturación.
//
// Son wrappers finos sobre `@/api/apiService` (para que las llamadas sigan
// pasando por el Http Log como el resto de la app). Las formas de respuesta
// devueltas acá son tentativas: CLAUDE.md documenta que varios endpoints
// (envelopes legacy, el código de error 35000002 de validación de sucursal,
// etc.) todavía no fueron confirmados contra el backend real. Cuando se
// confirmen, el único lugar a tocar es el cuerpo de estas funciones — las
// pantallas que las llamen no deberían necesitar cambios.

import { getRequest, postRequest } from '@/api/apiService';
import {
  PosCartLine,
  PosCategory,
  PosCuadrePreview,
  PosInvoice,
  PosInvoiceDetail,
  PosNcf,
  PosProduct,
  PosSuspendedInvoice,
} from '@/screens/pos/types';

export async function getGeneralConfiguration() {
  const response = await getRequest('api/getGeneralConfiguration');
  return response.data?.data;
}

export async function getNCFs(): Promise<PosNcf[]> {
  const response = await getRequest('api/pos/getNCFs');
  return response.data?.data?.ncf ?? [];
}

export async function getProductsSession(tokenSession: string) {
  const response = await getRequest('api/pos/getProductsSession', {
    validateOpenPos: true,
    tokenSession,
  });
  return response.data?.data as { caja?: any; cart?: PosCartLine[] } | undefined;
}

export async function searchProduct(term: string): Promise<{ products: PosProduct[]; total: number }> {
  const response = await postRequest('api/pos/searchProduct', { parametro: term });
  const products = response.data?.data?.data ?? [];
  const total = response.data?.data?.total ?? products.length;
  return { products, total };
}

export async function getCategorias(): Promise<PosCategory[]> {
  const response = await getRequest('api/pos/getCategorias');
  return response.data?.data ?? [];
}

export async function getProductsByIdCategory(idCategoria: number): Promise<PosProduct[]> {
  const response = await getRequest(`api/pos/getProductsByIdCategory/${idCategoria}`);
  return response.data?.data ?? [];
}

export async function addProduct(params: { reference: string; cantidad: number; fventaDecimal?: any; token: string }) {
  const payload = { ...params };

  // Comportamiento heredado de la pantalla web: si la unidad no vende
  // decimales, redondea la cantidad a entero.
  if (payload.fventaDecimal != 'false') {
    payload.cantidad = parseFloat(payload.cantidad.toFixed(0));
  }

  const response = await postRequest('api/pos/addProduct', payload);
  return response.data?.data as PosCartLine;
}

export async function removeProduct(params: { idproducto: number; tokenSession: string; user?: string; pass?: string }) {
  await postRequest('api/pos/removeProductCart', params);
}

export async function abrirCaja(params: { montoApertura: number; tokenSession: string }) {
  const response = await postRequest('api/pos/abrirCaja', {
    abrir_caja_monto_de_apertura: params.montoApertura,
    abrir_caja_token_session: params.tokenSession,
  });
  return response.data;
}

export async function getCustomers() {
  const response = await getRequest('api/customer/getCustomers');
  return response.data?.customers ?? [];
}

export async function storeInvoice(payload: Record<string, any>) {
  const response = await postRequest('api/pos/storeInvoice', payload);
  return response.data;
}

export async function getFacturasCuadre(tokenSession: string): Promise<PosCuadrePreview | undefined> {
  const response = await getRequest('api/pos/getFacturasCuadre', { tokenSession });
  return response.data?.data;
}

export async function realizarCuadre(params: { user: string; pass: string; montoCierre: number; tokenSession: string }) {
  const response = await postRequest('api/pos/realizarCuadre', {
    user: params.user,
    pass: params.pass,
    monto_cierre: params.montoCierre,
    token_session: params.tokenSession,
  });
  return response.data;
}

export async function suspendInvoice(payload: Record<string, any>) {
  const response = await postRequest('api/suspend_invoice', payload);
  return response.data;
}

export async function getSuspendedInvoices(): Promise<PosSuspendedInvoice[]> {
  const response = await getRequest('api/suspend_invoice');
  return response.data?.data ?? [];
}

export async function resumeSuspendedInvoice(idSuspension: number) {
  const response = await postRequest(`api/suspend_invoice/resumeInvoice/${idSuspension}`, {});
  return response.data;
}

// Contrato legacy, no modernizado (a diferencia de otras pantallas de esta
// app): pagenum es 0-indexado, y un filtro por fecha exige además un campo
// hermano "filtervalue{index}" con el índice de ese grupo dentro de
// filterGroups. Ver CLAUDE.md / docs/pos-invoicing.md del repo web.
export async function getFacturas(params: {
  pagenum: number;
  pagesize: number;
  sortdatafield: string;
  sortorder: 'asc' | 'desc';
  numeroFactura?: string;
  dateFilter?: string;
}): Promise<{ invoices: PosInvoice[]; meta: any }> {
  const filterGroups: any[] = [];
  const payload: Record<string, any> = {
    pagenum: params.pagenum,
    pagesize: params.pagesize,
    sortdatafield: params.sortdatafield,
    sortorder: params.sortorder,
  };

  if (params.numeroFactura?.trim()) {
    filterGroups.push({ field: 'numero_factura', filters: [{ value: params.numeroFactura.trim() }] });
  }

  if (params.dateFilter) {
    const dateIndex = filterGroups.length;
    filterGroups.push({ field: 'created_at', filters: [{ value: params.dateFilter }] });
    payload[`filtervalue${dateIndex}`] = params.dateFilter;
  }

  if (filterGroups.length > 0) {
    payload.filterscount = filterGroups.length;
    payload.filterGroups = filterGroups;
  }

  const response = await postRequest('api/pos/getFacturas', payload);
  return { invoices: response.data?.factura ?? [], meta: response.data?.data };
}

export async function getFacturaToCancelar(numeroFactura: string): Promise<{ factura?: PosInvoiceDetail; days?: number }> {
  const response = await getRequest('api/notas_de_credito/getFacturaToCancelar', { factura: numeroFactura });
  return { factura: response.data?.data?.factura, days: response.data?.data?.days };
}

export async function cancelarFactura(payload: {
  facturaId: number;
  clasificacion: string;
  tabla: { devolucion: number; quantity: number; id_producto: number }[];
  comments: string;
}) {
  const response = await postRequest('api/notas_de_credito/cancelarFactura', {
    'cancelacion-factura_id': payload.facturaId,
    'cancelacion-factura_clasificacion': payload.clasificacion,
    tabla: JSON.stringify(payload.tabla),
    'cancelacion-factura_comments': payload.comments,
  });
  return response.data;
}
