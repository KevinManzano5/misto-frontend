import axios from 'axios';
import Cookies from 'js-cookie';

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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si el token expiró o no es válido
      console.error('No autorizado. Redirigiendo al login...');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
