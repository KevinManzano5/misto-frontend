import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  has_store: boolean;
  store_id: string | null;
}

export interface PlatformUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: string;
  created_at: string;
}

export interface ListUsersResponse {
  users: PlatformUser[];
  total_count: number;
  page: number;
  page_size: number;
}

export const userService = {
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Obtiene los usuarios de la plataforma (paginados)
  getAll: async (page: number = 1): Promise<ListUsersResponse> => {
    const response = await apiClient.get<ListUsersResponse>('/users', {
      params: { page },
    });
    return response.data;
  },
};
