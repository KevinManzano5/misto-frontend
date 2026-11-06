import { apiClient } from '@/lib/apiClient';

export interface Service {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

export interface UpdateServiceRequest {
  category_id?: string;
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
}

export const serviceService = {
  // Obtiene los servicios que ofrece una tienda
  getByStoreId: async (storeId: string): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>(
      `/stores/${storeId}/services`,
    );
    return response.data;
  },

  // Crea un nuevo servicio para una tienda
  create: async (
    storeId: string,
    data: CreateServiceRequest,
  ): Promise<Service> => {
    const response = await apiClient.post<Service>(
      `/stores/${storeId}/services`,
      data,
    );
    return response.data;
  },

  // Actualiza un servicio existente; solo se aplican los campos enviados
  update: async (
    serviceId: string,
    data: UpdateServiceRequest,
  ): Promise<Service> => {
    const response = await apiClient.patch<Service>(
      `/services/${serviceId}`,
      data,
    );
    return response.data;
  },

  // Elimina un servicio
  delete: async (serviceId: string): Promise<void> => {
    await apiClient.delete(`/services/${serviceId}`);
  },
};
