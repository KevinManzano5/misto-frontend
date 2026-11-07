import { apiClient } from '@/lib/apiClient';
import { StoreCategory } from './storeCategoryService';

export interface StorePaymentMethods {
  cash_on_site: boolean;
  card_advance: boolean;
}

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
  payment_methods: StorePaymentMethods;
  average_rating: number;
  rating_count: number;
  categories: StoreCategory[];
  app_usage_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  name: string;
  description: string;
}

export interface UpdateStoreFeeRequest {
  app_usage_fee_percentage: number;
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

export interface ListStoresResponse {
  stores: Store[];
  total_count: number;
  page: number;
  page_size: number;
}

export const storeService = {
  // Obtiene las tiendas (paginadas)
  getAll: async (page: number = 1): Promise<ListStoresResponse> => {
    const response = await apiClient.get<ListStoresResponse>('/stores', {
      params: { page },
    });
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

  // Obtiene los horarios disponibles ("HH:mm") para una fecha y servicio dados
  getAvailability: async (
    storeId: string,
    date: string,
    serviceId: string,
  ): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `/stores/${storeId}/availability`,
      { params: { date, service_id: serviceId } },
    );
    return response.data;
  },

  // Actualiza la configuración de la tienda
  update: async (id: string, data: UpdateStoreRequest): Promise<Store> => {
    const response = await apiClient.patch<Store>(`/stores/${id}`, data);
    return response.data;
  },

  // Actualiza el porcentaje de comisión que cobra la app a la tienda
  updateFee: async (
    id: string,
    data: UpdateStoreFeeRequest,
  ): Promise<Store> => {
    const response = await apiClient.patch<Store>(`/stores/${id}/fee`, data);
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
