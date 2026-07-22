const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  minimumFractionDigits: 2,
});

export function formatCurrency(value: any): string {
  return currencyFormatter.format(parseFloat(value) || 0);
}

export interface PaymentMethod {
  key: string;
  label: string;
  authLabel?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { key: 'cash', label: 'Efectivo' },
  { key: 'card', label: 'Tarjeta', authLabel: 'No. de autorización' },
  { key: 'cheque', label: 'Cheque', authLabel: 'No. de cheque' },
  { key: 'nota_de_credito', label: 'Nota de crédito', authLabel: 'No. de nota' },
];
