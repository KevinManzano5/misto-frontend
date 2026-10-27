'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { DateTime } from 'luxon';
import {
  appointmentService,
  StoreAppointment,
} from '@/services/appointmentService';

const STATUS_LABELS: Record<StoreAppointment['status'], string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

const STATUS_STYLES: Record<StoreAppointment['status'], string> = {
  confirmed: 'bg-green-950/40 text-green-400 border-green-900/50',
  pending: 'bg-yellow-950/40 text-yellow-400 border-yellow-900/50',
  cancelled: 'bg-neutral-800/40 text-neutral-400 border-neutral-700/50',
};

interface StoreAppointmentsSectionProps {
  storeId: string;
  timezone: string;
}

export default function StoreAppointmentsSection({
  storeId,
  timezone,
}: StoreAppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<StoreAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getByStoreId(storeId);
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime(),
        );
        setAppointments(sorted);
      } catch (err: unknown) {
        console.error('Error al cargar las citas', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail || 'No se pudieron cargar las citas.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar las citas.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [storeId]);

  const handleUpdateStatus = async (
    appointmentId: string,
    status: 'confirmed' | 'cancelled',
  ) => {
    setUpdatingId(appointmentId);
    setActionErrors((prev) => ({ ...prev, [appointmentId]: '' }));

    try {
      await appointmentService.updateStatus(appointmentId, { status });

      if (status === 'cancelled') {
        setAppointments((prev) =>
          prev.filter((appointment) => appointment.id !== appointmentId),
        );
      } else {
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status }
              : appointment,
          ),
        );
      }
    } catch (err: unknown) {
      console.error('Error al actualizar el estado de la cita', err);
      const message = isAxiosError(err)
        ? err.response?.data?.detail || 'No se pudo actualizar la cita.'
        : 'Ocurrió un error inesperado al actualizar la cita.';
      setActionErrors((prev) => ({ ...prev, [appointmentId]: message }));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-neutral-500 animate-pulse">Cargando citas...</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (appointments.length === 0) {
    return (
      <p className="text-neutral-500">
        No hay citas pendientes ni confirmadas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const start = DateTime.fromISO(appointment.start_time, {
          zone: 'utc',
        }).setZone(timezone);
        const end = DateTime.fromISO(appointment.end_time, {
          zone: 'utc',
        }).setZone(timezone);
        const isUpdating = updatingId === appointment.id;

        return (
          <div
            key={appointment.id}
            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">
                  {start.toFormat('dd/MM/yyyy')}
                </p>
                <p className="text-sm text-neutral-500">
                  {start.toFormat('HH:mm')} - {end.toFormat('HH:mm')}
                </p>
              </div>
              <span
                className={`text-xs border px-2 py-1 rounded-full ${STATUS_STYLES[appointment.status]}`}
              >
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>

            <div className="border-t border-neutral-800 pt-3">
              <p className="text-sm text-neutral-300">
                {appointment.client_first_name} {appointment.client_last_name}{' '}
                <span className="text-neutral-500">
                  (@{appointment.client_username})
                </span>
              </p>
              <p className="text-sm text-neutral-500">
                {appointment.client_email}
              </p>
            </div>

            {actionErrors[appointment.id] && (
              <p className="text-red-400 text-sm">
                {actionErrors[appointment.id]}
              </p>
            )}

            {appointment.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                  disabled={isUpdating}
                  className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                >
                  {isUpdating ? 'Guardando...' : 'Aprobar'}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                  disabled={isUpdating}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                >
                  Rechazar
                </button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                disabled={isUpdating}
                className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
              >
                {isUpdating ? 'Guardando...' : 'Cancelar cita'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
