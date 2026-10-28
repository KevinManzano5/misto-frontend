import { apiClient } from '@/lib/apiClient';

// 1. Definimos las interfaces TypeScript basándonos en los structs de tu Golang
export interface CreateAppointmentRequest {
  store_id: string;
  start_time: string; // ISO 8601 string, manejado por time.Time en Go
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'expired';

export interface UpdateAppointmentStatusRequest {
  status: 'confirmed' | 'cancelled';
}

export interface AppointmentResponse {
  id: string;
  store_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}

// Cita tal como la devuelve el listado por tienda (sin store_id/user_id,
// pero con los datos del cliente que agendó)
export interface StoreAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  client_username: string;
  client_email: string;
  client_first_name: string;
  client_last_name: string;
}

// Cita tal como la devuelve el historial del usuario (con el nombre de la
// tienda en vez de los datos del cliente)
export interface UserAppointment {
  id: string;
  store_id: string;
  store_name: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
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

  // Obtiene las citas de una tienda, opcionalmente filtradas por rango de fechas (YYYY-MM-DD)
  getByStoreId: async (
    storeId: string,
    filters?: { startDate?: string; endDate?: string },
  ): Promise<StoreAppointment[]> => {
    const response = await apiClient.get<StoreAppointment[]>(
      `/stores/${storeId}/appointments`,
      {
        params: {
          start_date: filters?.startDate || undefined,
          end_date: filters?.endDate || undefined,
        },
      },
    );
    return response.data;
  },

  // Obtiene el historial de citas del usuario autenticado
  getMine: async (): Promise<UserAppointment[]> => {
    const response = await apiClient.get<UserAppointment[]>('/appointments');
    return response.data;
  },

  // Aprueba o cancela una solicitud de cita
  updateStatus: async (
    id: string,
    data: UpdateAppointmentStatusRequest,
  ): Promise<AppointmentResponse> => {
    const response = await apiClient.patch<AppointmentResponse>(
      `/appointments/${id}/status`,
      data,
    );
    return response.data;
  },

  // Cancela una cita (pendiente o confirmada)
  cancel: async (id: string): Promise<AppointmentResponse> => {
    const response = await apiClient.patch<AppointmentResponse>(
      `/appointments/${id}/cancel`,
    );
    return response.data;
  },
};
