// store/useStore.ts
import { create } from 'zustand/react';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage


interface StoreState {
  accessToken: string | null;
  setAccessToken: (token: string|null) => void;
  removeAccessToken: () => void;
  toggleDarkMode: () => void;
  updateConfig: (partialConfig: Partial<AppConfig>) => void;
  [key: string]: any; // Agrega esta línea para permitir propiedades adicionales
}

interface AppConfig {
  darkMode: boolean;
  language: string;
  // Agrega más configuraciones si necesitas
}

const initialConfig: AppConfig = {
  darkMode: false,
  language: 'es',
};

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      config: initialConfig,

      setAccessToken: (token) => set({ accessToken: token }),
      removeAccessToken: () => set({ accessToken: null }),
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

const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs], // Inserta el nuevo log al principio
    })),
}));
//////////////////// LOGS ////////////////////



export {
  useLogStore,
  useStore
}

export default useStore;
