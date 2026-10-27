import { apiClient } from '@/lib/apiClient';

// 1. Definimos las interfaces TypeScript basándonos en los structs de tu Golang
export interface CreateAppointmentRequest {
  store_id: string;
  start_time: string; // ISO 8601 string, manejado por time.Time en Go
}

export interface AppointmentResponse {
  id: string;
  store_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

// 2. Creamos los métodos para comunicarnos con el backend
export const appointmentService = {
  create: async (
    data: CreateAppointmentRequest,
  ): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(
      '/appointments',
      data,
    );
    return response.data;
  },

  getByStoreAndDate: async (
    storeId: string,
    start: string,
    end: string,
  ): Promise<AppointmentResponse[]> => {
    const response = await apiClient.get<AppointmentResponse[]>(
      `/appointments`,
      {
        params: {
          store_id: storeId,
          start_time: start,
          end_time: end,
        },
      },
    );
    return response.data;
  },
};
