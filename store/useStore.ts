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

//////////////////// LOGS ////////////////////
interface LogEntry {
  method: string;
  url: string;
  data?: any;
  params?: any;
  timestamp: Date;
}

interface LogStore {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs], // Inserta el nuevo log al principio
    })),
}));
//////////////////// LOGS ////////////////////



export default useStore;
