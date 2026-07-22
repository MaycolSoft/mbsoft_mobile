import { useCallback, useState } from 'react';
import * as posApi from '@/screens/pos/api/posApi';
import { PosProduct } from '@/screens/pos/types';

export function useProductSearch() {
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (term: string) => {
    setSearching(true);
    try {
      const { total, products } = await posApi.searchProduct(term);

      const exact = products.filter(
        (p: PosProduct) => String(p.reference).toLowerCase() === term.toLowerCase()
      );

      const exactMatch = total === 1 ? products[0] : exact.length === 1 ? exact[0] : null;

      return { total, products, exactMatch };
    } finally {
      setSearching(false);
    }
  }, []);

  return { search, searching };
}

export default useProductSearch;
