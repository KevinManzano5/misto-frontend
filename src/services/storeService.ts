import { apiClient } from '@/lib/apiClient';
import { StoreSchedule } from './storeScheduleService';
import { StoreCategory } from './storeCategoryService';

export interface Store {
  id: string;
  slug: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
  appointment_duration: number; // minutos
  timezone: string;
  auto_confirm_appointments: boolean;
  email: string;
  address: string;
  phone_number: string;
  allow_same_day_appointments: boolean;
  schedules: StoreSchedule[];
  categories: StoreCategory[];
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  name: string;
  description: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  email?: string;
  address?: string;
  phone_number?: string;
  is_active?: boolean;
  auto_confirm_appointments?: boolean;
  allow_same_day_appointments?: boolean;
}

export const storeService = {
  // Get all stores for the home page
  getAll: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/stores');
    return response.data;
  },

  // Create a new store for the authenticated user
  create: async (data: CreateStoreRequest): Promise<Store> => {
    const response = await apiClient.post<Store>('/stores', data);
    return response.data;
  },

  // Obtiene los detalles de una tienda por id o por slug
  getById: async (idOrSlug: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${idOrSlug}`);
    return response.data;
  },

  // Obtiene los horarios disponibles ("HH:mm") para una fecha dada
  getAvailability: async (storeId: string, date: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `/stores/${storeId}/availability`,
      { params: { date } },
    );
    return response.data;
  },

  // Actualiza la configuración de la tienda
  update: async (id: string, data: UpdateStoreRequest): Promise<Store> => {
    const response = await apiClient.patch<Store>(`/stores/${id}`, data);
    return response.data;
  },

  // Reemplaza el conjunto de categorías asignadas a la tienda
  updateCategories: async (
    id: string,
    categoryIds: string[],
  ): Promise<StoreCategory[]> => {
    const response = await apiClient.put<StoreCategory[]>(
      `/stores/${id}/categories`,
      { category_ids: categoryIds },
    );
    return response.data;
  },
};
