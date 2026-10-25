import { apiClient } from '@/lib/apiClient';

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

// Interface for store services
export interface StoreServiceItem {
  id: string;
  store_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export const storeService = {
  // Get all stores for the home page
  getAll: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/stores');
    return response.data;
  },

  // Get details for a specific store
  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${id}`);
    return response.data;
  },

  // Obtain the services associated with a store
  getServices: async (storeId: string): Promise<StoreServiceItem[]> => {
    const response = await apiClient.get<StoreServiceItem[]>(
      `/stores/${storeId}/services`,
    );
    return response.data;
  },

  // Obtain the available time slots for a specific date and service
  getAvailability: async (
    storeId: string,
    serviceId: string,
    date: string,
  ): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `/stores/${storeId}/availability`,
      {
        params: { serviceId, date },
      },
    );
    return response.data;
  },
};
