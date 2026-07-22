// Tipos del módulo POS/Facturación. Ver CLAUDE.md → "POS / Invoice migration plan"
// para el contrato completo y el estado de cada fase.

export interface PosUser {
  id: number;
  id_empresa: number;
  id_role?: number;
  first_name?: string;
  email?: string;
  [key: string]: any;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * `btoa` no está garantizado en Hermes/RN (no hay polyfill en react-native
 * core ni en las dependencias del proyecto) — encoder base64 mínimo, solo
 * para el string ASCII simple que produce `getPosSessionToken`.
 */
function base64Encode(input: string): string {
  let output = '';
  let i = 0;

  while (i < input.length) {
    const byte1 = input.charCodeAt(i++);
    const byte2 = input.charCodeAt(i++);
    const byte3 = input.charCodeAt(i++);

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
    const enc3 = isNaN(byte2) ? 64 : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
    const enc4 = isNaN(byte3) ? 64 : byte3 & 63;

    output +=
      BASE64_CHARS.charAt(enc1) +
      BASE64_CHARS.charAt(enc2) +
      (enc3 === 64 ? '=' : BASE64_CHARS.charAt(enc3)) +
      (enc4 === 64 ? '=' : BASE64_CHARS.charAt(enc4));
  }

  return output;
}

/**
 * Deriva el mismo `tokenSession` que usa el frontend web:
 * `btoa(`${id_empresa}-${id}`)`. Se calcula on-demand a partir de
 * `currentUser` en vez de guardarse como estado aparte, para que nunca
 * quede desincronizado.
 */
export function getPosSessionToken(user: PosUser | null): string | null {
  if (!user) return null;
  return base64Encode(`${user.id_empresa}-${user.id}`);
}

export interface PosProduct {
  id: number;
  reference: string;
  description: string;
  sale_price: number;
  unidad?: { venta_decimal?: string | boolean; [key: string]: any };
  [key: string]: any;
}

export interface PosCategory {
  id: number;
  description: string;
  [key: string]: any;
}

export interface PosCartLine {
  product?: PosProduct;
  reference?: string;
  description?: string;
  quantity?: number;
  cantidad?: number;
  qty?: number;
  sale_price?: number;
  precio?: number;
  monto_tax?: number;
  total?: number;
  sub_total?: number;
  monto_porciento_de_ley?: number;
  token_session?: string;
  [key: string]: any;
}

export interface PosCaja {
  monto_apertura?: number;
  fecha_de_apertura?: string;
  monto_actual?: number;
  [key: string]: any;
}

export interface PosTotals {
  subTotal: number;
  totalTax: number;
  total: number;
  totalLey: number;
}

export interface PosNcf {
  id: number;
  default_selected: boolean;
  serie: string;
  nombre: string;
  codigo: string;
  require_rnc?: boolean;
  [key: string]: any;
}

export interface PosCustomer {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  rnc?: string;
  rnc_cedula_rnc?: string;
  rnc_razon_social?: string;
  rnc_nombre_comercial?: string;
  rnc_regimen_de_pagos?: string;
  [key: string]: any;
}

export interface PosInvoice {
  id: number;
  numero_factura: string;
  ncf?: string;
  created_at: string;
  customer?: { first_name?: string; last_name?: string } | null;
  user?: { first_name?: string; last_name?: string } | null;
  total_tax?: number;
  total?: number;
  url_reporte?: string;
  [key: string]: any;
}

export type PosInvoiceSortField =
  | 'created_at'
  | 'numero_factura'
  | 'ncf'
  | 'total'
  | 'total_tax';

export interface PosInvoiceFilters {
  search: string;
  numFactura: string;
  startDate: string;
  endDate: string;
  ncf: string;
  rnc: string;
  customerId: string;
  userId: string;
}

export interface PosInvoicePaginator {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface PosInvoiceDetailLine {
  id_producto: number;
  description?: string;
  reference?: string;
  quantity: number;
  refund_amount?: number;
  total?: number;
  [key: string]: any;
}

export interface PosInvoiceDetail {
  id: number;
  numero_factura: string;
  ncf?: string;
  created_at: string;
  customer?: { first_name?: string; last_name?: string } | null;
  total?: number;
  detalle?: PosInvoiceDetailLine[];
  [key: string]: any;
}

export const DGII_CLASIFICACIONES = [
  { value: '01', label: 'DETERIORO DE FACTURA PRE-IMPRESA' },
  { value: '02', label: 'ERRORES DE IMPRESIÓN (FACTURA PRE-IMPRESA)' },
  { value: '03', label: 'IMPRESIÓN DEFECTUOSA' },
  { value: '04', label: 'CORRECCIÓN DE LA INFORMACIÓN' },
  { value: '05', label: 'CAMBIO DE PRODUCTOS' },
  { value: '06', label: 'DEVOLUCIÓN DE PRODUCTOS' },
  { value: '07', label: 'OMISIÓN DE PRODUCTOS' },
  { value: '08', label: 'ERRORES EN SECUENCIA NCF' },
  { value: '09', label: 'POR CESE DE OPERACIONES' },
  { value: '10', label: 'PÉRDIDA O HURTO DE TALONARIOS' },
];

export interface PosCuadrePreview {
  posCaja?: PosCaja;
  withRNC?: number;
  withoutRNC?: number;
  sub_total?: number;
  total_tax?: number;
  total?: number;
  [key: string]: any;
}

export interface PosSuspendedInvoice {
  id_suspension: number;
  customer?: { first_name?: string; last_name?: string } | null;
  created_at: string;
  shopping_cart?: any[];
  total?: number;
  [key: string]: any;
}

export interface PosPayment {
  amount: number;
  auth: string;
}

export type PosPayments = Record<string, PosPayment>;

export interface GeneralConfiguration {
  allow_remove_product_pos?: boolean;
  '10_porciento_de_ley'?: boolean;
  modo_busqueda_products_facturacion?: 'tabla' | 'cartas';
  [key: string]: any;
}

/** Línea del carrito, normalizada de forma defensiva (los campos varían según el endpoint que la haya devuelto). */
export function getLineDisplay(item: PosCartLine) {
  const product: Partial<PosProduct> = item.product || {};
  return {
    id: product.id,
    reference: product.reference ?? item.reference ?? '',
    description: product.description ?? item.description ?? '',
    quantity: item.quantity ?? item.cantidad ?? item.qty ?? 0,
    price: item.sale_price ?? product.sale_price ?? item.precio ?? 0,
    tax: item.monto_tax ?? 0,
    total: item.total ?? 0,
  };
}

/** Interpreta la convención "cantidad*codigo" del campo de escaneo (ej: "3*7460123456"). */
export function parseScanInput(raw: string): { qty: number; term: string } {
  const text = raw.trim();
  const match = text.match(/^(\d+(?:\.\d+)?)\*(.+)$/);

  if (match) {
    return { qty: parseFloat(match[1]), term: match[2].trim() };
  }
  return { qty: 1, term: text };
}
