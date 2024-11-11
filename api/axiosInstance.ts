// src/api/axiosInstance.ts
import axios from 'axios';
import useAuthStore from '@/store/useStore';

const baseURL = 'https://laravel-modekaiser.koyeb.app/';

const axiosInstance = axios.create({
  baseURL,
});

// Interceptores para añadir el token a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState()?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
