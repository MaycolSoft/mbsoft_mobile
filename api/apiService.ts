// src/api/apiService.ts
import axiosInstance from './axiosInstance';
import { useLogStore } from '@/store/useStore';

interface AxiosError {
  response?: {
    status: number;
    data: {
      message: string;
      [key: string]: any; // Permite otras propiedades adicionales en la respuesta
    };
  };
  message: string;
}

export const isAxiosError = (error: any): error is AxiosError => {
  return error && error.response && typeof error.response.status === 'number';
};


// Función para registrar logs en el store de Zustand
const logRequest = (method: string, url: string, data?: any, params?: any) => {
  const addLog = useLogStore.getState().addLog; // Obtenemos la función `addLog` de Zustand
  addLog({ method, url, data, params, timestamp: new Date() });
};


export const getRequest = async (url: string, params = {}) => {
  logRequest("GET", url, undefined, params);
  return axiosInstance.get(url, { params });
};

export const postRequest = async (url: string, data = {}, config={}) => {
  logRequest("POST", url, data);
  return axiosInstance.post(url, data, {...config});
};

export const putRequest = async (url: string, data = {}) => {
  logRequest("PUT", url, data);
  return axiosInstance.put(url, data);
};

export const deleteRequest = async (url: string) => {
  logRequest("DELETE", url);
  return axiosInstance.delete(url);
};
