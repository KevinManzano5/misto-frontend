import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Creamos la instancia principal
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Leemos el token de la cookie
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para inyectar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Aquí puedes sacar el token de localStorage, cookies o tu manejador de estado
    // Ejemplo básico con localStorage (solo útil en Client Components):
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores globalmente (Ej. Token expirado)
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const isAuthRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRefreshCall
    ) {
      return Promise.reject(error);
    }

    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
      authService.logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await authService.refresh({ refresh_token: refreshToken });
      authService.setToken(refreshed.access_token, refreshed.refresh_token);
      processQueue(refreshed.access_token);

      originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(null);
      authService.logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
