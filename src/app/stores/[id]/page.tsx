'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { storeService, Store } from '@/services/storeService';
import { authService } from '@/services/authService';

// 1. Extraemos toda la lógica a un componente interno
function StoreDetailsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const data = await storeService.getById(id);
        setStore(data);
      } catch (err: unknown) {
        console.error(err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail || 'No se pudo cargar la tienda.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar los detalles.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStoreDetails();
  }, [id]);

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
              <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-neutral-500 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-medium">Corte de Cabello</h3>
                  <span className="text-neutral-400">$15.00</span>
                </div>
                <p className="text-sm text-neutral-500">30 min</p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-neutral-500 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-medium">Tinte Completo</h3>
                  <span className="text-neutral-400">$45.00</span>
                </div>
                <p className="text-sm text-neutral-500">90 min</p>
              </div>
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
                  <button className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-2 rounded-lg hover:border-neutral-500 transition-colors">
                    09:00
                  </button>
                  <button className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-2 rounded-lg hover:border-neutral-500 transition-colors">
                    10:30
                  </button>
                  <button className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-2 rounded-lg hover:border-neutral-500 transition-colors opacity-50 cursor-not-allowed">
                    14:00
                  </button>
                </div>
              </div>

              <button className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors">
                Confirmar Cita
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 2. Exportamos el componente principal envolviendo todo en Suspense
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
