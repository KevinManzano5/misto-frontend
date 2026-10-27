import { apiClient } from '@/lib/apiClient';
import { StoreSchedule } from './storeScheduleService';

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
  appointment_duration: number; // minutos
  timezone: string;
  schedules: StoreSchedule[];
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  name: string;
  description: string;
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

  // Get details for a specific store
  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${id}`);
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
};
