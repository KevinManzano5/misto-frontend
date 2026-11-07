'use client';

import { Service } from '@/services/serviceService';
import { formatCurrencyCOP } from '@/lib/formatCurrency';

interface StoreServicesListProps {
  services: Service[];
  loading: boolean;
  error: string;
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

export default function StoreServicesList({
  services,
  loading,
  error,
  selectedServiceId,
  onSelect,
}: StoreServicesListProps) {
  if (loading) {
    return (
      <p className="text-neutral-500 text-sm animate-pulse">
        Cargando servicios...
      </p>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-medium text-white mb-2 tracking-tight">
        Servicios
      </h2>
      <p className="text-sm text-neutral-500 mb-6">
        Selecciona un servicio para ver los horarios disponibles.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(service.id)}
                className={`w-full text-left flex items-start justify-between gap-4 border rounded-lg p-4 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                  isSelected
                    ? 'border-white bg-neutral-800/60'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
                }`}
              >
                <div>
                  <p className="text-white font-medium">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-neutral-500 mt-1">
                      {service.description}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    {formatDuration(service.duration_minutes)}
                  </p>
                </div>
                <p className="text-white font-medium whitespace-nowrap">
                  {formatCurrencyCOP(service.price)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
