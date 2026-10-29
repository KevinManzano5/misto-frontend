'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { DateTime } from 'luxon';
import {
  appointmentService,
  UserAppointment,
} from '@/services/appointmentService';
import UserMenu from '@/components/UserMenu';
import Sidebar from '@/components/Sidebar';

const STATUS_LABELS: Record<UserAppointment['status'], string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
  expired: 'Expirada',
};

const STATUS_STYLES: Record<UserAppointment['status'], string> = {
  confirmed: 'bg-green-950/40 text-green-400 border-green-900/50',
  pending: 'bg-yellow-950/40 text-yellow-400 border-yellow-900/50',
  cancelled: 'bg-neutral-800/40 text-neutral-400 border-neutral-700/50',
  completed: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
  expired: 'bg-neutral-800/40 text-neutral-500 border-neutral-700/50',
};

export default function AppointmentsHistoryPage() {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>(
    {},
  );

  // Id de la cita para la cual se está pidiendo la razón de cancelación
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getMine();
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.start_time).getTime() -
            new Date(a.start_time).getTime(),
        );
        setAppointments(sorted);
      } catch (err: unknown) {
        console.error('Error al cargar el historial de citas', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudo cargar el historial de citas.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar las citas.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

    setCancelingId(appointmentId);
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
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <Link
            href="/"
            className="text-xl font-semibold text-white tracking-tight"
          >
            Misto
          </Link>
          <UserMenu />
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-12 w-full">
          <h2 className="text-2xl font-medium text-white tracking-tight mb-8">
            Mis citas
          </h2>

        {loading && (
          <p className="text-neutral-500 animate-pulse">Cargando citas...</p>
        )}

        {!loading && error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && appointments.length === 0 && (
          <p className="text-neutral-500">
            Todavía no tienes citas agendadas.
          </p>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const start = DateTime.fromISO(appointment.start_time, {
                zone: 'utc',
              }).toLocal();
              const end = DateTime.fromISO(appointment.end_time, {
                zone: 'utc',
              }).toLocal();

              return (
                <div
                  key={appointment.id}
                  className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {appointment.store_name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {start.toFormat('dd/MM/yyyy')} ·{' '}
                        {start.toFormat('HH:mm')} - {end.toFormat('HH:mm')}
                      </p>
                    </div>
                    <span
                      className={`text-xs border px-2 py-1 rounded-full ${STATUS_STYLES[appointment.status]}`}
                    >
                      {STATUS_LABELS[appointment.status]}
                    </span>
                  </div>

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
                          disabled={
                            cancelingId === appointment.id ||
                            !cancelReason.trim()
                          }
                          className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                          {cancelingId === appointment.id
                            ? 'Cancelando...'
                            : 'Confirmar'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseCancelPrompt}
                          disabled={cancelingId === appointment.id}
                          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  ) : (
                    (appointment.status === 'pending' ||
                      appointment.status === 'confirmed') && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelPrompt(appointment.id)}
                        disabled={cancelingId === appointment.id}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                      >
                        Cancelar cita
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
