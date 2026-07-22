import { useCallback, useMemo, useState } from 'react';
import * as posApi from '@/screens/pos/api/posApi';
import { PosCartLine, PosCaja, PosTotals, PosProduct } from '@/screens/pos/types';

/**
 * El carrito real vive en el backend, atado a `tokenSession` — este hook lo
 * espeja localmente y expone las mutaciones. Puerto de `usePosCart.js` (web),
 * adaptado para recibir el `tokenSession` directo en vez de leerlo de un store
 * de configuración (acá no existe uno).
 */
export function usePosCart(tokenSession: string | null) {
  const [cart, setCart] = useState<PosCartLine[]>([]);
  // null = aún no consultado; false = caja cerrada (hay que abrirla)
  const [cajaOpen, setCajaOpen] = useState<boolean | null>(null);
  const [posCaja, setPosCaja] = useState<PosCaja | null>(null);

  const fetchCart = useCallback(async () => {
    if (!tokenSession) return undefined;

    const data = await posApi.getProductsSession(tokenSession);
    setCajaOpen(data?.caja !== null && data?.caja !== undefined);
    setPosCaja(data?.caja ?? null);
    setCart(data?.cart || []);
    return data;
  }, [tokenSession]);

  const addProduct = useCallback(
    async (product: PosProduct, cantidad: number) => {
      if (!tokenSession) return undefined;

      const line = await posApi.addProduct({
        reference: product.reference,
        cantidad,
        fventaDecimal: product?.unidad?.venta_decimal,
        token: tokenSession,
      });

      setCart((prev) => {
        const index = prev.findIndex((item) => item.product?.id === line?.product?.id);
        if (index === -1) return line ? [...prev, line] : prev;
        const copy = [...prev];
        copy[index] = line;
        return copy;
      });

      return line;
    },
    [tokenSession]
  );

  const removeProduct = useCallback(
    async (item: PosCartLine, credentials?: { user: string; pass: string }) => {
      if (!tokenSession || !item.product?.id) return;

      await posApi.removeProduct({
        idproducto: item.product.id,
        tokenSession: item.token_session || tokenSession,
        ...credentials,
      });

      setCart((prev) => prev.filter((i) => i.product?.id !== item.product?.id));
    },
    [tokenSession]
  );

  const clearCartLocal = useCallback(() => setCart([]), []);

  const fetchCuadrePreview = useCallback(async () => {
    if (!tokenSession) return undefined;
    return posApi.getFacturasCuadre(tokenSession);
  }, [tokenSession]);

  const closeCaja = useCallback(
    async (params: { user: string; pass: string; montoCierre: number }) => {
      if (!tokenSession) return undefined;

      const result = await posApi.realizarCuadre({ ...params, tokenSession });
      setCajaOpen(false);
      setPosCaja(null);
      return result;
    },
    [tokenSession]
  );

  const totals: PosTotals = useMemo(
    () => ({
      subTotal: cart.reduce((acc, item) => acc + (parseFloat(String(item.sub_total)) || 0), 0),
      totalTax: cart.reduce((acc, item) => acc + (parseFloat(String(item.monto_tax)) || 0), 0),
      total: cart.reduce((acc, item) => acc + (parseFloat(String(item.total)) || 0), 0),
      totalLey: cart.reduce((acc, item) => acc + (parseFloat(String(item.monto_porciento_de_ley)) || 0), 0),
    }),
    [cart]
  );

  return {
    cart,
    cajaOpen,
    posCaja,
    totals,
    fetchCart,
    addProduct,
    removeProduct,
    clearCartLocal,
    fetchCuadrePreview,
    closeCaja,
  };
}

export default usePosCart;
