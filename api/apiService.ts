// src/api/apiService.ts
import axiosInstance from './axiosInstance';
import { useLogStore } from '@/store/useStore';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

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


const MAX_STRING_LENGTH = 4000;
const MAX_ARRAY_ITEMS = 50;
const SENSITIVE_KEY = /password|passwd|token|authorization|secret|api[_-]?key/i;
const BINARY_KEY = /^(image|base64|blob|file|content)$/i;
let requestSequence = 0;

const summarizeString = (value: string) => {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}\n… [${value.length - MAX_STRING_LENGTH} caracteres omitidos]`;
};

const sanitizeLogValue = (value: any, key = '', depth = 0, seen = new WeakSet<object>()): any => {
  if (SENSITIVE_KEY.test(key)) return '••••••••';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' && BINARY_KEY.test(key) && value.length > 160) {
    return `[contenido binario omitido: ${value.length} caracteres]`;
  }
  if (typeof value === 'string') return summarizeString(value);
  if (typeof value !== 'object') return value;
  if (depth >= 6) return '[profundidad omitida]';
  if (seen.has(value)) return '[referencia circular]';

  seen.add(value);

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    const parts = (value as any)._parts as Array<[string, any]> | undefined;
    if (!parts) return '[FormData]';

    return parts.reduce<Record<string, any>>((result, [partKey, partValue]) => {
      const safeValue = partValue?.name
        ? { file: partValue.name, type: partValue.type ?? 'archivo' }
        : sanitizeLogValue(partValue, partKey, depth + 1, seen);
      const existing = result[partKey];
      result[partKey] = existing === undefined
        ? safeValue
        : Array.isArray(existing) ? [...existing, safeValue] : [existing, safeValue];
      return result;
    }, {});
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item, index) => sanitizeLogValue(item, `${index}`, depth + 1, seen));
    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`… [${value.length - MAX_ARRAY_ITEMS} elementos omitidos]`);
    }
    return items;
  }

  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      sanitizeLogValue(entryValue, entryKey, depth + 1, seen),
    ]),
  );
};

const runLoggedRequest = async <T>(
  method: string,
  url: string,
  request: () => Promise<AxiosResponse<T>>,
  data?: any,
  params?: any,
) => {
  const id = `${Date.now()}-${requestSequence++}`;
  const startedAt = Date.now();
  const { addLog, updateLog } = useLogStore.getState();

  addLog({
    id,
    method,
    url,
    data: sanitizeLogValue(data),
    params: sanitizeLogValue(params),
    timestamp: new Date(),
    status: 'pending',
  });

  try {
    const response = await request();
    updateLog(id, {
      status: 'success',
      httpStatus: response.status,
      durationMs: Date.now() - startedAt,
      response: sanitizeLogValue(response.data),
    });
    return response;
  } catch (error: any) {
    updateLog(id, {
      status: 'error',
      httpStatus: error?.response?.status,
      durationMs: Date.now() - startedAt,
      error: sanitizeLogValue(error?.response?.data ?? { message: error?.message || 'Error desconocido' }),
    });
    throw error;
  }
};


export const getRequest = async (url: string, params = {}) => {
  return runLoggedRequest('GET', url, () => axiosInstance.get(url, { params }), undefined, params);
};

export const postRequest = async (url: string, data = {}, config: AxiosRequestConfig = {}) => {
  return runLoggedRequest('POST', url, () => axiosInstance.post(url, data, config), data);
};

export const putRequest = async (url: string, data = {}) => {
  return runLoggedRequest('PUT', url, () => axiosInstance.put(url, data), data);
};

export const deleteRequest = async (url: string) => {
  return runLoggedRequest('DELETE', url, () => axiosInstance.delete(url));
};
