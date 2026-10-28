'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { DateTime } from 'luxon';
import { storeService, Store } from '@/services/storeService';
import {
  appointmentService,
  AppointmentStatus,
} from '@/services/appointmentService';
import UserMenu from '@/components/UserMenu';
import Sidebar from '@/components/Sidebar';

// Evita que "YYYY-MM-DD" se interprete como UTC y cambie de día por el offset local.
function getDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00`).getDay();
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Si la tienda no permite citas el mismo día, la fecha mínima seleccionable es mañana.
function getMinSelectableDate(store: Store): string {
  return store.allow_same_day_appointments
    ? getTodayDateString()
    : getTomorrowDateString();
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Horarios disponibles para la fecha elegida
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Confirmation statuses
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmedStatus, setConfirmedStatus] =
    useState<AppointmentStatus | null>(null);

  // Carga inicial de la tienda
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeData = await storeService.getById(id);
        setStore(storeData);

        const minDate = getMinSelectableDate(storeData);
        setSelectedDate((prev) => (prev < minDate ? minDate : prev));
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
      setSlotsError('');

      try {
        const slots = await storeService.getAvailability(id, selectedDate);
        setAvailableSlots(slots);
      } catch (err: unknown) {
        console.error('Error al cargar los horarios disponibles', err);
        setAvailableSlots([]);
        if (axios.isAxiosError(err)) {
          setSlotsError(
            err.response?.data?.detail ||
              'No se pudo cargar los horarios disponibles.',
          );
        } else {
          setSlotsError(
            'Ocurrió un error inesperado al cargar los horarios disponibles.',
          );
        }
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
    setConfirmedStatus(null);

    try {
      const appointment = await appointmentService.create({
        store_id: id,
        start_time: buildStartTime(selectedDate, selectedTime, store.timezone),
      });
      setConfirmedStatus(appointment.status);
      setAvailableSlots((prev) => prev.filter((time) => time !== selectedTime));
      setSelectedTime('');
    } catch (err: unknown) {
      console.error('Error al confirmar la cita', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setConfirmError(
            'Ya tienes una cita pendiente o confirmada en esta tienda. No puedes agendar otra hasta que se complete o se cancele.',
          );
        } else {
          setConfirmError(
            err.response?.data?.detail || 'No se pudo confirmar la cita.',
          );
        }
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
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans flex">
      <Sidebar />

      <div className="flex-1 flex flex-col pb-12">
        <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <Link
            href="/"
            className="text-xl font-semibold text-white tracking-tight hover:text-neutral-300 transition-colors"
          >
            Misto
          </Link>
          <UserMenu />
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8 w-full">
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
                min={getMinSelectableDate(store)}
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
              ) : slotsError ? (
                <p className="text-red-400 text-sm">{slotsError}</p>
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
            {confirmedStatus === 'confirmed' && (
              <p className="text-green-400 text-sm mb-4">
                ¡Cita confirmada con éxito!
              </p>
            )}
            {confirmedStatus === 'pending' && (
              <p className="text-yellow-400 text-sm mb-4">
                Tu cita quedó pendiente de confirmación por parte de la
                tienda.
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
