import { apiClient } from '@/lib/apiClient';

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export const storeCategoryService = {
  // Obtiene todas las categorías de tienda disponibles
  getAll: async (): Promise<StoreCategory[]> => {
    const response = await apiClient.get<StoreCategory[]>('/store-categories');
    return response.data;
  },
};
