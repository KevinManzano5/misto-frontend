import { apiClient } from '@/lib/apiClient';

export interface StoreSchedule {
  id: string;
  store_id: string;
  day_of_week: number; // 0 = domingo ... 6 = sábado
  open_time: string; // "HH:mm:ss", vacío si is_closed
  close_time: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateStoreScheduleRequest {
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export const storeScheduleService = {
  getByStoreId: async (storeId: string): Promise<StoreSchedule[]> => {
    const response = await apiClient.get<StoreSchedule[]>(
      `/stores/${storeId}/schedules`,
    );
    return response.data;
  },

  update: async (
    storeId: string,
    dayOfWeek: number,
    data: UpdateStoreScheduleRequest,
  ): Promise<StoreSchedule> => {
    const response = await apiClient.put<StoreSchedule>(
      `/stores/${storeId}/schedules/${dayOfWeek}`,
      data,
    );
    return response.data;
  },
};
