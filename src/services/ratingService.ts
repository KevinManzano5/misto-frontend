import { apiClient } from '@/lib/apiClient';

export interface Rating {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  client_username: string;
  client_first_name: string;
  client_last_name: string;
}

export interface GetStoreRatingsResponse {
  ratings: Rating[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface CreateRatingRequest {
  score: number;
  comment: string;
}

export const ratingService = {
  // Obtiene las reseñas (paginadas) de una tienda
  getByStore: async (
    storeId: string,
    page: number = 1,
  ): Promise<GetStoreRatingsResponse> => {
    const response = await apiClient.get<GetStoreRatingsResponse>(
      `/stores/${storeId}/ratings`,
      { params: { page } },
    );
    return response.data;
  },

  // Crea una reseña para una cita completada
  createForAppointment: async (
    appointmentId: string,
    data: CreateRatingRequest,
  ): Promise<Rating> => {
    const response = await apiClient.post<Rating>(
      `/appointments/${appointmentId}/ratings`,
      data,
    );
    return response.data;
  },
};
