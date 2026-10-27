'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { DateTime } from 'luxon';
import { storeService, Store } from '@/services/storeService';
import { appointmentService } from '@/services/appointmentService';
import UserMenu from '@/components/UserMenu';

// Evita que "YYYY-MM-DD" se interprete como UTC y cambie de día por el offset local.
function getDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00`).getDay();
}

// Combina fecha ("YYYY-MM-DD") y hora ("HH:mm") interpretándolas en la zona
// horaria de la tienda (no la del navegador) y devuelve un ISO 8601 con su
// offset correspondiente, ej. "2026-10-28T09:00:00-05:00".
function buildStartTime(date: string, time: string, storeTimezone: string): string {
  const startTime = DateTime.fromISO(`${date}T${time}`, {
    zone: storeTimezone,
  });

  return startTime.toISO({ suppressMilliseconds: true }) as string;
}

function StoreDetailsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scheduling statuses
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0],
  );
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Horarios disponibles para la fecha elegida
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Confirmation statuses
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Carga inicial de la tienda
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeData = await storeService.getById(id);
        setStore(storeData);
      } catch (err: unknown) {
        console.error(err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudo cargar la información de la tienda.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar los detalles.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStoreData();
  }, [id]);

  const daySchedule = store
    ? store.schedules.find(
        (schedule) => schedule.day_of_week === getDayOfWeek(selectedDate),
      ) ?? null
    : null;

  // Carga los horarios disponibles para la fecha elegida
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);

      try {
        const slots = await storeService.getAvailability(id, selectedDate);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error al cargar los horarios disponibles', err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailability();
  }, [id, selectedDate]);

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !store) return;

    setConfirming(true);
    setConfirmError('');
    setConfirmSuccess(false);

    try {
      await appointmentService.create({
        store_id: id,
        start_time: buildStartTime(selectedDate, selectedTime, store.timezone),
      });
      setConfirmSuccess(true);
      setAvailableSlots((prev) => prev.filter((time) => time !== selectedTime));
      setSelectedTime('');
    } catch (err: unknown) {
      console.error('Error al confirmar la cita', err);
      if (axios.isAxiosError(err)) {
        setConfirmError(
          err.response?.data?.detail || 'No se pudo confirmar la cita.',
        );
      } else {
        setConfirmError('Ocurrió un error inesperado al confirmar la cita.');
      }
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
        <p className="text-neutral-500 animate-pulse">
          Cargando información...
        </p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-6">
        <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center max-w-md w-full mb-4">
          {error || 'Tienda no encontrada'}
        </div>
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white"
        >
          ← Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans pb-12">
      <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link
          href="/"
          className="text-xl font-semibold text-white tracking-tight hover:text-neutral-300 transition-colors"
        >
          Misto
        </Link>
        <UserMenu />
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-white transition-colors mb-8 flex items-center gap-2"
        >
          ← Volver
        </button>

        <div className="mb-12 border-b border-neutral-800 pb-8">
          <h1 className="text-4xl font-medium text-white tracking-tight mb-4">
            {store.name}
          </h1>
          <p className="text-neutral-400 leading-relaxed text-lg">
            {store.description}
          </p>
        </div>

        <div className="max-w-md">
          <h2 className="text-xl font-medium text-white mb-6 tracking-tight">
            Elige fecha y hora
          </h2>
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
            <div className="mb-6">
              <label className="block text-sm text-neutral-400 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neutral-500 color-scheme-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm text-neutral-400 mb-2">
                Hora
              </label>

              {slotsLoading ? (
                <p className="text-neutral-500 text-sm">
                  Consultando horarios...
                </p>
              ) : !daySchedule || daySchedule.is_closed ? (
                <p className="text-red-400 text-sm">
                  La tienda está cerrada este día.
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  No hay horarios disponibles este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg transition-colors border ${
                        selectedTime === time
                          ? 'bg-white text-black border-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {confirmError && (
              <p className="text-red-400 text-sm mb-4">{confirmError}</p>
            )}
            {confirmSuccess && (
              <p className="text-green-400 text-sm mb-4">
                ¡Cita confirmada con éxito!
              </p>
            )}

            <button
              onClick={handleConfirmAppointment}
              disabled={
                !selectedDate ||
                !selectedTime ||
                !daySchedule ||
                daySchedule.is_closed ||
                confirming
              }
              className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StoreDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
          <p className="text-neutral-500 animate-pulse">Cargando...</p>
        </div>
      }
    >
      <StoreDetailsContent />
    </Suspense>
  );
}
