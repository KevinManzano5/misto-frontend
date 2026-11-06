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
  completed: 'Completada',
  expired: 'Expirada',
};

const STATUS_STYLES: Record<StoreAppointment['status'], string> = {
  confirmed: 'bg-green-950/40 text-green-400 border-green-900/50',
  pending: 'bg-yellow-950/40 text-yellow-400 border-yellow-900/50',
  cancelled: 'bg-neutral-800/40 text-neutral-400 border-neutral-700/50',
  completed: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
  expired: 'bg-neutral-800/40 text-neutral-500 border-neutral-700/50',
};

const DATE_FILTER_DEBOUNCE_MS = 1000;

const isValidDate = (value: string) =>
  value === '' || DateTime.fromISO(value).isValid;

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

  const today = DateTime.now().setZone(timezone).toISODate() ?? '';

  // Valores que el usuario edita directamente en los inputs.
  const [startDateInput, setStartDateInput] = useState(today);
  const [endDateInput, setEndDateInput] = useState(today);

  // Valores "debounced": solo se actualizan 3s después de que el usuario
  // deja de escribir, y son los que disparan la request al backend.
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>(
    {},
  );

  // Id de la cita para la cual se está pidiendo la razón de cancelación/rechazo
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const dateRangeError =
    !isValidDate(startDateInput) || !isValidDate(endDateInput)
      ? 'La fecha ingresada no es válida.'
      : startDateInput && endDateInput && startDateInput > endDateInput
        ? 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".'
        : '';

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStartDate(startDateInput);
      setEndDate(endDateInput);
    }, DATE_FILTER_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [startDateInput, endDateInput]);

  useEffect(() => {
    if (
      !isValidDate(startDate) ||
      !isValidDate(endDate) ||
      (startDate && endDate && startDate > endDate)
    ) {
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await appointmentService.getByStoreId(storeId, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
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
  }, [storeId, startDate, endDate]);

  const handleClearFilters = () => {
    setStartDateInput('');
    setEndDateInput('');
  };

  const handleApprove = async (appointmentId: string) => {
    setUpdatingId(appointmentId);
    setActionErrors((prev) => ({ ...prev, [appointmentId]: '' }));

    try {
      await appointmentService.updateStatus(appointmentId, {
        status: 'confirmed',
      });
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'confirmed' }
            : appointment,
        ),
      );
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

  const handleOpenCancelPrompt = (appointmentId: string) => {
    setActionErrors((prev) => ({ ...prev, [appointmentId]: '' }));
    setCancelReason('');
    setCancelPromptId(appointmentId);
  };

  const handleCloseCancelPrompt = () => {
    setCancelPromptId(null);
    setCancelReason('');
  };

  const handleCancel = async (appointmentId: string) => {
    if (!cancelReason.trim()) return;

    setUpdatingId(appointmentId);
    setActionErrors((prev) => ({ ...prev, [appointmentId]: '' }));

    try {
      await appointmentService.cancel(appointmentId, cancelReason.trim());
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment,
        ),
      );
      setCancelPromptId(null);
      setCancelReason('');
    } catch (err: unknown) {
      console.error('Error al cancelar la cita', err);
      const message = isAxiosError(err)
        ? err.response?.data?.detail || 'No se pudo cancelar la cita.'
        : 'Ocurrió un error inesperado al cancelar la cita.';
      setActionErrors((prev) => ({ ...prev, [appointmentId]: message }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="appointments-start-date"
            className="text-xs text-neutral-500"
          >
            Desde
          </label>
          <input
            id="appointments-start-date"
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="appointments-end-date"
            className="text-xs text-neutral-500"
          >
            Hasta
          </label>
          <input
            id="appointments-end-date"
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          Ver todas las citas
        </button>
      </div>

      {!dateRangeError && loading && (
        <p className="text-neutral-500 animate-pulse">Cargando citas...</p>
      )}

      {(dateRangeError || (!loading && error)) && (
        <p className="text-red-400 text-sm">{dateRangeError || error}</p>
      )}

      {!dateRangeError && !loading && !error && appointments.length === 0 && (
        <p className="text-neutral-500">
          No hay citas para el rango seleccionado.
        </p>
      )}

      {!dateRangeError &&
        !loading &&
        !error &&
        appointments.map((appointment) => {
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

            {appointment.status === 'cancelled' &&
              appointment.cancellation_reason && (
                <div className="border-t border-neutral-800 pt-3">
                  <p className="text-sm text-neutral-500 mb-1">
                    Razón de la cancelación
                  </p>
                  <p className="text-sm text-neutral-300">
                    {appointment.cancellation_reason}
                  </p>
                </div>
              )}

            {actionErrors[appointment.id] && (
              <p className="text-red-400 text-sm">
                {actionErrors[appointment.id]}
              </p>
            )}

            {cancelPromptId === appointment.id ? (
              <div className="space-y-2 border-t border-neutral-800 pt-3">
                <label
                  htmlFor={`cancel-reason-${appointment.id}`}
                  className="block text-sm text-neutral-400"
                >
                  Razón de la cancelación
                </label>
                <textarea
                  id={`cancel-reason-${appointment.id}`}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Indica el motivo..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={isUpdating || !cancelReason.trim()}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  >
                    {isUpdating ? 'Guardando...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCancelPrompt}
                    disabled={isUpdating}
                    className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  >
                    Volver
                  </button>
                </div>
              </div>
            ) : (
              <>
                {appointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(appointment.id)}
                      disabled={isUpdating}
                      className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    >
                      {isUpdating ? 'Guardando...' : 'Aprobar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCancelPrompt(appointment.id)}
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
                    onClick={() => handleOpenCancelPrompt(appointment.id)}
                    disabled={isUpdating}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  >
                    Cancelar cita
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
