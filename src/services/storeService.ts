import { apiClient } from '@/lib/apiClient';

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export const storeService = {
  // Obtener todas las tiendas para la página principal
  getAll: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/stores');
    return response.data;
  },

  // Obtener el detalle de una tienda específica
  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${id}`);
    return response.data;
  },
};
