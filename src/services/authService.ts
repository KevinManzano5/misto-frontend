import { apiClient } from '@/lib/apiClient';
import Cookies from 'js-cookie';

export interface SignUpRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  // Añade refresh_token si tu API de Go lo devuelve
}

export interface ValidateTokenResponse {
  valid: boolean;
  user_id: string;
  email: string;
  role: string;
}

export const authService = {
  register: async (data: SignUpRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/sign_up', data);
    return response.data;
  },

  login: async (data: SignInRequest): Promise<TokenResponse> => {
    // Ajusta la ruta '/auth/signin' según cómo la definiste en tu router de Go
    const response = await apiClient.post<TokenResponse>('/auth/sign_in', data);
    return response.data;
  },

  validate: async (): Promise<ValidateTokenResponse> => {
    const response = await apiClient.get<ValidateTokenResponse>(
      '/auth/validate',
    );
    return response.data;
  },

  setToken: (token: string) => {
    // Guarda el token en una cookie válida por 7 días
    Cookies.set('token', token, { expires: 7, path: '/' });

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token); // Opcional: mantenerlo aquí por compatibilidad
    }
  },

  logout: () => {
    Cookies.remove('token', { path: '/' });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
  },
};
