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

export const userService = {
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
};
