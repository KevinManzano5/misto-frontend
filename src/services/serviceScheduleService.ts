import { apiClient } from '@/lib/apiClient';

export interface ServiceScheduleSegment {
  id: string;
  open_time: string; // "HH:mm:ss"
  close_time: string;
}

export interface ServiceSchedule {
  id: string;
  store_service_id: string;
  day_of_week: number; // 0 = domingo ... 6 = sábado
  segments: ServiceScheduleSegment[];
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateServiceScheduleSegmentRequest {
  open_time: string;
  close_time: string;
}

export interface UpdateServiceScheduleRequest {
  is_closed: boolean;
  segments: UpdateServiceScheduleSegmentRequest[];
}

export const serviceScheduleService = {
  update: async (
    serviceId: string,
    dayOfWeek: number,
    data: UpdateServiceScheduleRequest,
  ): Promise<ServiceSchedule> => {
    const response = await apiClient.put<ServiceSchedule>(
      `/services/${serviceId}/schedules/${dayOfWeek}`,
      data,
    );
    return response.data;
  },
};
