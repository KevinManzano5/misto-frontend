'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { serviceService, Service } from '@/services/serviceService';
import { ServiceSchedule } from '@/services/serviceScheduleService';
import { StoreCategory } from '@/services/storeCategoryService';
import ServiceForm, { ServiceFormPayload } from './ServiceForm';
import ServiceSchedulesSection from './ServiceSchedulesSection';

interface StoreServicesSectionProps {
  storeId: string;
  categories: StoreCategory[];
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

function formatLeadTime(minutes: number): string {
  if (!minutes) return 'Sin mínimo de anticipación';
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `Mínimo ${hours} ${hours === 1 ? 'hora' : 'horas'} de anticipación`;
  }
  return `Mínimo ${minutes} min de anticipación`;
}

export default function StoreServicesSection({
  storeId,
  categories,
}: StoreServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [schedulesOpenId, setSchedulesOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      try {
        const data = await serviceService.getByStoreId(storeId);
        if (!cancelled) setServices(data);
      } catch (err: unknown) {
        console.error('Error al cargar los servicios de la tienda', err);
        if (cancelled) return;
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar los servicios de la tienda.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar los servicios.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const isBusy = creating || editingId !== null || deletingId !== null;

  const handleOpenCreate = () => {
    setSaveError('');
    setCreating(true);
  };

  const handleCancelCreate = () => {
    setCreating(false);
    setSaveError('');
  };

  const handleSubmitCreate = async (payload: ServiceFormPayload) => {
    setSaveError('');
    setSaving(true);
    try {
      const created = await serviceService.create(storeId, payload);
      setServices((prev) => [...prev, created]);
      setCreating(false);
    } catch (err: unknown) {
      console.error('Error al crear el servicio', err);
      if (isAxiosError(err)) {
        setSaveError(
          err.response?.data?.detail || 'No se pudo crear el servicio.',
        );
      } else {
        setSaveError('Ocurrió un error inesperado al crear el servicio.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (serviceId: string) => {
    setSaveError('');
    setEditingId(serviceId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSaveError('');
  };

  const handleSubmitEdit = async (
    serviceId: string,
    payload: ServiceFormPayload,
  ) => {
    setSaveError('');
    setSaving(true);
    try {
      const updated = await serviceService.update(serviceId, payload);
      setServices((prev) =>
        prev.map((service) => (service.id === serviceId ? updated : service)),
      );
      setEditingId(null);
    } catch (err: unknown) {
      console.error('Error al actualizar el servicio', err);
      if (isAxiosError(err)) {
        setSaveError(
          err.response?.data?.detail || 'No se pudo actualizar el servicio.',
        );
      } else {
        setSaveError('Ocurrió un error inesperado al actualizar el servicio.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSchedules = (serviceId: string) => {
    setSchedulesOpenId((prev) => (prev === serviceId ? null : serviceId));
  };

  const handleSchedulesSaved = (
    serviceId: string,
    schedules: ServiceSchedule[],
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, schedules } : service,
      ),
    );
  };

  const handleOpenDelete = (serviceId: string) => {
    setDeleteError('');
    setDeletingId(serviceId);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async (serviceId: string) => {
    setDeleteError('');
    setDeleting(true);
    try {
      await serviceService.delete(serviceId);
      setServices((prev) =>
        prev.filter((service) => service.id !== serviceId),
      );
      setDeletingId(null);
    } catch (err: unknown) {
      console.error('Error al eliminar el servicio', err);
      if (isAxiosError(err)) {
        setDeleteError(
          err.response?.data?.detail || 'No se pudo eliminar el servicio.',
        );
      } else {
        setDeleteError('Ocurrió un error inesperado al eliminar el servicio.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-start gap-4">
        <h2 className="text-xl font-medium text-white tracking-tight">
          Servicios
        </h2>
        {!creating && (
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={loading || categories.length === 0 || isBusy}
            className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nuevo servicio
          </button>
        )}
      </div>

      {!creating && categories.length === 0 && (
        <p className="text-neutral-500 text-sm">
          Asigna al menos una categoría a la tienda para poder crear
          servicios.
        </p>
      )}

      {creating && (
        <ServiceForm
          idPrefix="service-create"
          categories={categories}
          initialValues={{
            category_id: categories[0]?.id ?? '',
            name: '',
            description: '',
            duration_minutes: '',
            price: '',
            min_lead_time_minutes: '',
          }}
          submitLabel="Crear servicio"
          savingLabel="Creando..."
          saving={saving}
          error={saveError}
          onSubmit={handleSubmitCreate}
          onCancel={handleCancelCreate}
        />
      )}

      {loading ? (
        <p className="text-neutral-500 text-sm animate-pulse">
          Cargando servicios...
        </p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : services.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          Esta tienda no tiene servicios registrados.
        </p>
      ) : (
        <ul className="space-y-3">
          {services.map((service) =>
            editingId === service.id ? (
              <li key={service.id}>
                <ServiceForm
                  idPrefix={`service-edit-${service.id}`}
                  categories={categories}
                  initialValues={{
                    category_id: service.category_id,
                    name: service.name,
                    description: service.description,
                    duration_minutes: String(service.duration_minutes),
                    price: String(service.price),
                    min_lead_time_minutes: String(
                      service.min_lead_time_minutes,
                    ),
                  }}
                  submitLabel="Guardar"
                  savingLabel="Guardando..."
                  saving={saving}
                  error={saveError}
                  onSubmit={(payload) =>
                    handleSubmitEdit(service.id, payload)
                  }
                  onCancel={handleCancelEdit}
                />
              </li>
            ) : (
              <li
                key={service.id}
                className="border border-neutral-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{service.name}</p>
                      {!service.is_active && (
                        <span className="text-xs text-neutral-500 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-neutral-500 mt-1">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      {formatDuration(service.duration_minutes)}
                      {' · '}
                      {formatLeadTime(service.min_lead_time_minutes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-white font-medium whitespace-nowrap">
                      ${formatPrice(service.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleSchedules(service.id)}
                      disabled={isBusy}
                      className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Horarios
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(service.id)}
                      disabled={isBusy}
                      className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(service.id)}
                      disabled={isBusy}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {schedulesOpenId === service.id && (
                  <ServiceSchedulesSection
                    serviceId={service.id}
                    schedules={service.schedules}
                    onSaved={(schedules) =>
                      handleSchedulesSaved(service.id, schedules)
                    }
                  />
                )}

                {deletingId === service.id && (
                  <div className="border border-red-900/50 bg-red-950/20 rounded-lg p-3 space-y-3">
                    <p className="text-sm text-neutral-300">
                      ¿Eliminar &quot;{service.name}&quot;? Esta acción no se
                      puede deshacer.
                    </p>
                    {deleteError && (
                      <p className="text-red-400 text-sm">{deleteError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(service.id)}
                        disabled={deleting}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                      >
                        {deleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        disabled={deleting}
                        className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
