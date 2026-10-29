'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { isAxiosError } from 'axios';
import { storeService, Store } from '@/services/storeService';
import { getUserIdFromToken } from '@/lib/jwt';
import StoreSchedulesSection from './StoreSchedulesSection';
import StoreAppointmentsSection from './StoreAppointmentsSection';
import StoreInfoSection from './StoreInfoSection';

type SettingsTab = 'config' | 'management';

function StoreSettingsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('config');

  const [savingAutoConfirm, setSavingAutoConfirm] = useState(false);
  const [autoConfirmError, setAutoConfirmError] = useState('');

  const [savingAllowSameDay, setSavingAllowSameDay] = useState(false);
  const [allowSameDayError, setAllowSameDayError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeService.getById(id);

        const token = Cookies.get('token');
        const userId = token ? getUserIdFromToken(token) : null;

        if (userId && data.user_id !== userId) {
          setForbidden(true);
          return;
        }

        setStore(data);
      } catch (err: unknown) {
        console.error('Error al cargar la tienda', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudo cargar la información de la tienda.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar la tienda.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStore();
  }, [id]);

  const handleToggleAutoConfirm = async () => {
    if (!store) return;

    setSavingAutoConfirm(true);
    setAutoConfirmError('');

    try {
      const updated = await storeService.update(store.id, {
        auto_confirm_appointments: !store.auto_confirm_appointments,
      });
      setStore(updated);
    } catch (err: unknown) {
      console.error('Error al actualizar el autoaceptado', err);
      if (isAxiosError(err)) {
        setAutoConfirmError(
          err.response?.data?.detail ||
            'No se pudo actualizar el autoaceptado de citas.',
        );
      } else {
        setAutoConfirmError(
          'Ocurrió un error inesperado al actualizar el autoaceptado.',
        );
      }
    } finally {
      setSavingAutoConfirm(false);
    }
  };

  const handleToggleAllowSameDay = async () => {
    if (!store) return;

    setSavingAllowSameDay(true);
    setAllowSameDayError('');

    try {
      const updated = await storeService.update(store.id, {
        allow_same_day_appointments: !store.allow_same_day_appointments,
      });
      setStore(updated);
    } catch (err: unknown) {
      console.error('Error al actualizar las citas el mismo día', err);
      if (isAxiosError(err)) {
        setAllowSameDayError(
          err.response?.data?.detail ||
            'No se pudo actualizar la configuración de citas el mismo día.',
        );
      } else {
        setAllowSameDayError(
          'Ocurrió un error inesperado al actualizar la configuración.',
        );
      }
    } finally {
      setSavingAllowSameDay(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
        <p className="text-neutral-500 animate-pulse">
          Cargando configuración...
        </p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-6">
        <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center max-w-md w-full mb-4">
          No tienes permiso para ver la configuración de esta tienda.
        </div>
        <Link href="/" className="text-neutral-400 hover:text-white">
          ← Volver al inicio
        </Link>
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
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-white transition-colors mb-8 flex items-center gap-2"
        >
          ← Volver
        </button>

        <h1 className="text-3xl font-medium text-white tracking-tight mb-8">
          {store.name}
        </h1>

        <nav className="flex gap-6 border-b border-neutral-800 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
              activeTab === 'config'
                ? 'text-white border-white'
                : 'text-neutral-500 border-transparent hover:text-neutral-300'
            }`}
          >
            Configuración
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
              activeTab === 'management'
                ? 'text-white border-white'
                : 'text-neutral-500 border-transparent hover:text-neutral-300'
            }`}
          >
            Gestión
          </button>
        </nav>

        {activeTab === 'config' ? (
          <>
            <StoreInfoSection store={store} onUpdated={setStore} />

            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-6 mt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white">Autoaceptar citas</p>
                  <p className="text-sm text-neutral-500">
                    Las citas nuevas se confirman automáticamente sin revisión
                    manual.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={store.auto_confirm_appointments}
                  aria-label="Autoaceptar citas"
                  onClick={handleToggleAutoConfirm}
                  disabled={savingAutoConfirm}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    store.auto_confirm_appointments
                      ? 'bg-white'
                      : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      store.auto_confirm_appointments
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-neutral-400'
                    }`}
                  />
                </button>
              </div>
              {autoConfirmError && (
                <p className="text-red-400 text-sm">{autoConfirmError}</p>
              )}

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white">Citas el mismo día</p>
                  <p className="text-sm text-neutral-500">
                    Permite que los clientes agenden citas para el día actual.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={store.allow_same_day_appointments}
                  aria-label="Citas el mismo día"
                  onClick={handleToggleAllowSameDay}
                  disabled={savingAllowSameDay}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    store.allow_same_day_appointments
                      ? 'bg-white'
                      : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      store.allow_same_day_appointments
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-neutral-400'
                    }`}
                  />
                </button>
              </div>
              {allowSameDayError && (
                <p className="text-red-400 text-sm">{allowSameDayError}</p>
              )}
            </div>

            <h2 className="text-xl font-medium text-white tracking-tight mt-10 mb-6">
              Horarios por día
            </h2>
            <StoreSchedulesSection
              storeId={store.id}
              schedules={store.schedules}
            />
          </>
        ) : (
          <>
            <h2 className="text-xl font-medium text-white tracking-tight mb-6">
              Citas
            </h2>
            <StoreAppointmentsSection
              storeId={store.id}
              timezone={store.timezone}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default function StoreSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
          <p className="text-neutral-500 animate-pulse">Cargando...</p>
        </div>
      }
    >
      <StoreSettingsContent />
    </Suspense>
  );
}
