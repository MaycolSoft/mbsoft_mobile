// src/api/axiosInstance.ts
import axios from 'axios';
import useAuthStore from '@/store/useStore';

export const DEFAULT_BASE_URL = 'http://10.15.15.117:8000/';

const axiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
});

// Interceptores para añadir el token y la URL base configurada a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    config.baseURL = state?.config?.apiUrl || DEFAULT_BASE_URL;

    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
