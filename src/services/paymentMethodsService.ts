import { apiClient } from '@/lib/apiClient';

export interface PaymentMethodsConfig {
  cash_on_site_enabled: boolean;
  card_advance_enabled: boolean;
  updated_at: string;
}

export interface UpdatePaymentMethodsRequest {
  cash_on_site_enabled?: boolean;
  card_advance_enabled?: boolean;
}

export const paymentMethodsService = {
  // Obtiene los métodos de pago habilitados globalmente en la plataforma
  get: async (): Promise<PaymentMethodsConfig> => {
    const response = await apiClient.get<PaymentMethodsConfig>(
      '/payment-methods',
    );
    return response.data;
  },

  // Enciende/apaga un método de pago a nivel global
  update: async (
    data: UpdatePaymentMethodsRequest,
  ): Promise<PaymentMethodsConfig> => {
    const response = await apiClient.patch<PaymentMethodsConfig>(
      '/payment-methods',
      data,
    );
    return response.data;
  },
};
