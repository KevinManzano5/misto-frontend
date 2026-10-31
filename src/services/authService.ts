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
  refresh_token?: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user_id: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
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

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    // Endpoint público, no requiere Authorization
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      data,
    );
    return response.data;
  },

  setToken: (token: string, refreshToken?: string) => {
    // Guarda el token en una cookie válida por 7 días
    Cookies.set('token', token, { expires: 7, path: '/' });

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token); // Opcional: mantenerlo aquí por compatibilidad
    }

    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' });

      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  },

  getRefreshToken: (): string | undefined => {
    const cookieToken = Cookies.get('refreshToken');
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken') ?? undefined;
    }

    return undefined;
  },

  logout: () => {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/sign-in';
    }
  },
};
