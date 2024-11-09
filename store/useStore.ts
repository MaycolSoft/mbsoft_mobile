// store/useStore.ts
import { create } from 'zustand/react';

interface StoreState {
  count: number;
  increaseCount: () => void;
  resetCount: () => void;
  
  accessToken: string | null;
  setAccessToken: (token: string|null) => void;
  removeAccessToken: () => void;
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  increaseCount: () => set((state) => ({ count: state.count + 1 })),
  resetCount: () => set({ count: 0 }),

  setAccessToken: (token) => set({ accessToken: token }),
  removeAccessToken: () => set({ accessToken: null }),
  accessToken: null,
}));

export default useStore;
