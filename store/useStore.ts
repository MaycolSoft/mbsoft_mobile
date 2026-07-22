// store/useStore.ts
import { create } from 'zustand/react';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage
import { PosUser } from '@/screens/pos/types';


interface StoreState {
  accessToken: string | null;
  currentUser: PosUser | null;
  setAccessToken: (token: string|null) => void;
  removeAccessToken: () => void;
  setCurrentUser: (user: PosUser | null) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  updateConfig: (partialConfig: Partial<AppConfig>) => void;
  [key: string]: any; // Agrega esta línea para permitir propiedades adicionales
}

export type TextSize = 'small' | 'medium' | 'large';

interface AppConfig {
  darkMode: boolean;
  language: string;
  accentColor?: string;
  cardTint?: string;
  textSize: TextSize;
  apiUrl?: string;
  // Agrega más configuraciones si necesitas
}

const initialConfig: AppConfig = {
  darkMode: false,
  language: 'es',
  textSize: 'medium',
};

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      currentUser: null,
      config: initialConfig,

      setAccessToken: (token) => set({ accessToken: token }),
      removeAccessToken: () => set({ accessToken: null }),
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ accessToken: null, currentUser: null }),
      toggleDarkMode: () => set((state) => ({
        config: { ...state.config, darkMode: !state.config.darkMode }
      })),
      updateConfig: (partialConfig) => set((state) => ({
        config: { ...state.config, ...partialConfig }
      }))
    }),
    {
      name: 'app-storage', // Nombre para localStorage/AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Usa AsyncStorage
      partialize: (state) => ({ config: state.config }), // Solo persiste la configuración
    }
  )
);






//////////////////// LOGS ////////////////////
export type HttpLogStatus = 'pending' | 'success' | 'error';

export interface HttpLogEntry {
  id: string;
  method: string;
  url: string;
  data?: any;
  params?: any;
  response?: any;
  error?: any;
  httpStatus?: number;
  durationMs?: number;
  status: HttpLogStatus;
  timestamp: Date;
}

interface LogStore {
  logs: HttpLogEntry[];
  addLog: (log: HttpLogEntry) => void;
  updateLog: (id: string, changes: Partial<HttpLogEntry>) => void;
  clearLogs: () => void;
}

const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 200),
    })),
  updateLog: (id, changes) =>
    set((state) => ({
      logs: state.logs.map((log) => (log.id === id ? { ...log, ...changes } : log)),
    })),
  clearLogs: () => set({ logs: [] }),
}));
//////////////////// LOGS ////////////////////



export {
  useLogStore,
  useStore
}

export default useStore;
