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
  MyStoreAppointment,
  PaymentMethod,
} from '@/services/appointmentService';
import UserMenu from '@/components/UserMenu';
import Sidebar from '@/components/Sidebar';
import StarRating from '@/components/StarRating';
import StoreReviewsSection from './StoreReviewsSection';

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

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
  expired: 'Expirada',
};

function StoreDetailsContent() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scheduling statuses
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  // Cita vigente del usuario en esta tienda (si ya tiene una, no se muestra el calendario)
  const [existingAppointment, setExistingAppointment] =
    useState<MyStoreAppointment | null>(null);
  const [checkingExistingAppointment, setCheckingExistingAppointment] =
    useState(true);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [cancelActionError, setCancelActionError] = useState('');

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
        const storeData = await storeService.getById(slug);
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

    if (slug) fetchStoreData();
  }, [slug]);

  // Verifica si el usuario ya tiene una cita vigente en esta tienda
  useEffect(() => {
    const fetchExistingAppointment = async () => {
      if (!store) return;

      setCheckingExistingAppointment(true);

      try {
        const result = await appointmentService.getMyStatusForStore(
          store.id,
        );
        setExistingAppointment(
          result.has_appointment ? result.appointment : null,
        );
      } catch (err: unknown) {
        console.error('Error al verificar si ya tienes una cita', err);
      } finally {
        setCheckingExistingAppointment(false);
      }
    };

    fetchExistingAppointment();
  }, [store]);

  const daySchedule = store
    ? store.schedules.find(
        (schedule) => schedule.day_of_week === getDayOfWeek(selectedDate),
      ) ?? null
    : null;

  // Carga los horarios disponibles para la fecha elegida
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!store || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      setSlotsError('');

      try {
        const slots = await storeService.getAvailability(
          store.id,
          selectedDate,
        );
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
  }, [store, selectedDate]);

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !store || !selectedPaymentMethod) return;

    setConfirming(true);
    setConfirmError('');
    setConfirmedStatus(null);

    try {
      const appointment = await appointmentService.create({
        store_id: store.id,
        start_time: buildStartTime(selectedDate, selectedTime, store.timezone),
        payment_method: selectedPaymentMethod,
      });
      setConfirmedStatus(appointment.status);
      setAvailableSlots((prev) => prev.filter((time) => time !== selectedTime));
      setSelectedTime('');
      setSelectedPaymentMethod(null);
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

  const handleOpenCancelPrompt = () => {
    setCancelActionError('');
    setCancelReason('');
    setShowCancelPrompt(true);
  };

  const handleCloseCancelPrompt = () => {
    setShowCancelPrompt(false);
    setCancelReason('');
  };

  const handleCancelExistingAppointment = async () => {
    if (!existingAppointment || !cancelReason.trim()) return;

    setCanceling(true);
    setCancelActionError('');

    try {
      await appointmentService.cancel(
        existingAppointment.id,
        cancelReason.trim(),
      );
      setExistingAppointment(null);
      setShowCancelPrompt(false);
      setCancelReason('');
    } catch (err: unknown) {
      console.error('Error al cancelar la cita', err);
      if (axios.isAxiosError(err)) {
        setCancelActionError(
          err.response?.data?.detail || 'No se pudo cancelar la cita.',
        );
      } else {
        setCancelActionError('Ocurrió un error inesperado al cancelar la cita.');
      }
    } finally {
      setCanceling(false);
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
          <div className="mb-4">
            <StarRating
              averageRating={store.average_rating}
              ratingCount={store.rating_count}
            />
          </div>
          <p className="text-neutral-400 leading-relaxed text-lg mb-6">
            {store.description}
          </p>
          <div className="flex flex-col gap-2 text-sm text-neutral-400">
            {store.address && (
              <p className="flex items-center gap-2">
                <span className="text-neutral-500">Dirección:</span>
                {store.address}
              </p>
            )}
            {store.phone_number && (
              <p className="flex items-center gap-2">
                <span className="text-neutral-500">Teléfono:</span>
                {store.phone_number}
              </p>
            )}
            {store.email && (
              <p className="flex items-center gap-2">
                <span className="text-neutral-500">Correo:</span>
                {store.email}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-md">
          {checkingExistingAppointment ? (
            <p className="text-neutral-500 text-sm animate-pulse">
              Verificando citas existentes...
            </p>
          ) : existingAppointment ? (
            <>
              <h2 className="text-xl font-medium text-white mb-6 tracking-tight">
                Ya tienes una cita en esta tienda
              </h2>
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-3">
                <p className="text-neutral-400 text-sm mb-2">
                  No puedes agendar otra hasta que esta se complete o se
                  cancele.
                </p>
                <p className="text-white font-medium">
                  {STATUS_LABELS[existingAppointment.status]} ·{' '}
                  {DateTime.fromISO(existingAppointment.start_time, {
                    zone: 'utc',
                  })
                    .toLocal()
                    .toFormat('dd/MM/yyyy HH:mm')}
                </p>

                {cancelActionError && (
                  <p className="text-red-400 text-sm">{cancelActionError}</p>
                )}

                {(existingAppointment.status === 'pending' ||
                  existingAppointment.status === 'confirmed') &&
                  (showCancelPrompt ? (
                    <div className="space-y-2 border-t border-neutral-800 pt-3">
                      <label
                        htmlFor="cancel-reason"
                        className="block text-sm text-neutral-400"
                      >
                        Razón de la cancelación
                      </label>
                      <textarea
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Indica el motivo..."
                        rows={2}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCancelExistingAppointment}
                          disabled={canceling || !cancelReason.trim()}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                          {canceling ? 'Cancelando...' : 'Confirmar'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseCancelPrompt}
                          disabled={canceling}
                          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {existingAppointment.payment_method ===
                        'cash_on_site' && (
                        <button
                          type="button"
                          disabled
                          title="Próximamente"
                          className="flex-1 text-sm text-neutral-300 py-2 px-4 rounded-lg border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                          Pagar con tarjeta
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleOpenCancelPrompt}
                        className="flex-1 text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                      >
                        Cancelar cita
                      </button>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
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

            <div className="mb-8">
              <label className="block text-sm text-neutral-400 mb-2">
                Método de pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cash_on_site')}
                  className={`py-2 rounded-lg transition-colors border ${
                    selectedPaymentMethod === 'cash_on_site'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  Efectivo al llegar
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('card_advance')}
                  className={`py-2 rounded-lg transition-colors border ${
                    selectedPaymentMethod === 'card_advance'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  Tarjeta por adelantado
                </button>
              </div>
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
                !selectedPaymentMethod ||
                !daySchedule ||
                daySchedule.is_closed ||
                confirming
              }
              className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
              </div>
            </>
          )}
        </div>

        <StoreReviewsSection storeId={store.id} />
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
