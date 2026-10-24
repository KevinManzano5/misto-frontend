'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { storeService, Store, StoreServiceItem } from '@/services/storeService';
import { authService } from '@/services/authService';

function StoreDetailsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [services, setServices] = useState<StoreServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scheduling statuses
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Availability statuses
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // 1. Carga inicial de la tienda y sus servicios
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [storeData, servicesData] = await Promise.all([
          storeService.getById(id),
          storeService.getServices(id),
        ]);

        setStore(storeData);
        setServices(servicesData);
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

  // 2. Carga dinámica de horarios disponibles al seleccionar fecha y servicio
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedServiceId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      setSelectedTime(''); // Resetear la hora si el usuario cambia la fecha o el servicio

      try {
        const slots = await storeService.getAvailability(
          id,
          selectedServiceId,
          selectedDate,
        );
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error al cargar disponibilidad', err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailability();
  }, [id, selectedServiceId, selectedDate]);

  const handleLogout = () => {
    authService.logout();
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
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Cerrar Sesión
        </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-medium text-white mb-6 tracking-tight">
              1. Selecciona un servicio
            </h2>
            <div className="space-y-4">
              {services.length === 0 ? (
                <p className="text-neutral-500">
                  No hay servicios disponibles.
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`bg-neutral-900/50 border p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedServiceId === service.id
                        ? 'border-white'
                        : 'border-neutral-800 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-white font-medium">{service.name}</h3>
                      <span className="text-neutral-400">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-neutral-400 mb-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500">
                      {service.duration_minutes} min
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white mb-6 tracking-tight">
              2. Elige fecha y hora
            </h2>
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
              <div className="mb-6">
                <label className="block text-sm text-neutral-400 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neutral-500 color-scheme-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm text-neutral-400 mb-2">
                  Horas disponibles
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {slotsLoading ? (
                    <p className="text-neutral-500 text-sm col-span-3">
                      Calculando horarios...
                    </p>
                  ) : availableSlots.length === 0 &&
                    selectedServiceId &&
                    selectedDate ? (
                    <p className="text-neutral-500 text-sm col-span-3">
                      No hay horarios disponibles para esta fecha.
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-neutral-500 text-sm col-span-3">
                      Selecciona un servicio y fecha primero.
                    </p>
                  ) : (
                    availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg transition-colors border ${
                          selectedTime === time
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-500'
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                disabled={!selectedServiceId || !selectedDate || !selectedTime}
                className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Cita
              </button>
            </div>
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
