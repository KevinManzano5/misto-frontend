'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { storeService, Store } from '@/services/storeService';
import { authService } from '@/services/authService';

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await storeService.getAll();
        setStores(data);
      } catch (err: unknown) {
        console.error(err);

        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar las tiendas en este momento.',
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar las tiendas.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans">
      {/* Navbar Superior */}
      <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Misto
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-medium text-white tracking-tight">
            Descubre servicios y agenda tu cita
          </h2>
          <p className="mt-3 text-neutral-400">
            Encuentra las mejores peluquerías, escuelas y profesionales cerca de
            ti.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-neutral-500 animate-pulse">
              Cargando tiendas...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center text-neutral-500 mt-10">
            No hay tiendas disponibles por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-neutral-900/50 border border-neutral-800 p-6 flex flex-col hover:border-neutral-600 transition-colors rounded-xl"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {store.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                  {store.description || 'Sin descripción disponible.'}
                </p>

                {/* Enlace a la ruta dinámica de la tienda */}
                <Link
                  href={`/stores/${store.id}`}
                  className="mt-auto w-full text-center bg-white text-black font-medium py-2.5 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Ver servicios
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
