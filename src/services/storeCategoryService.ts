import { apiClient } from '@/lib/apiClient';

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreCategoryRequest {
  name: string;
  slug: string;
}

export interface UpdateStoreCategoryRequest {
  name?: string;
  slug?: string;
}

export const storeCategoryService = {
  // Obtiene todas las categorías de tienda disponibles
  getAll: async (): Promise<StoreCategory[]> => {
    const response = await apiClient.get<StoreCategory[]>('/store-categories');
    return response.data;
  },

  // Crea una nueva categoría de tienda
  create: async (
    data: CreateStoreCategoryRequest,
  ): Promise<StoreCategory> => {
    const response = await apiClient.post<StoreCategory>(
      '/store-categories',
      data,
    );
    return response.data;
  },

  // Actualiza una categoría de tienda existente
  update: async (
    categoryId: string,
    data: UpdateStoreCategoryRequest,
  ): Promise<StoreCategory> => {
    const response = await apiClient.patch<StoreCategory>(
      `/store-categories/${categoryId}`,
      data,
    );
    return response.data;
  },

  // Elimina una categoría de tienda
  delete: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/store-categories/${categoryId}`);
  },
};
