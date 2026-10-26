'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { isAxiosError } from 'axios';
import { storeService, Store } from '@/services/storeService';
import { getUserIdFromToken } from '@/lib/jwt';
import StoreSchedulesSection from './StoreSchedulesSection';

function StoreSettingsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

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
          Configuración de tu tienda
        </h1>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-6">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Nombre</p>
            <p className="text-white">{store.name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Descripción</p>
            <p className="text-neutral-300 leading-relaxed">
              {store.description || 'Sin descripción.'}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Estado</p>
            <p className="text-neutral-300">
              {store.is_active ? 'Activa' : 'Inactiva'}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-medium text-white tracking-tight mt-10 mb-6">
          Horarios por día
        </h2>
        <StoreSchedulesSection storeId={store.id} />
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
