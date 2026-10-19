'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storeService, Store } from '@/services/storeService';
import { authService } from '@/services/authService';

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        // Llama a tu API de Go para obtener las tiendas
        const data = await storeService.getAll();
        setStores(data);
      } catch (err: any) {
        console.error(err);
        setError('No se pudieron cargar las tiendas en este momento.');
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Misto Reservas</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Descubre servicios y agenda tu cita
          </h2>
          <p className="mt-2 text-gray-600">
            Encuentra las mejores peluquerías, escuelas y profesionales cerca de
            ti.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Cargando tiendas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No hay tiendas disponibles por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {store.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {store.description || 'Sin descripción disponible.'}
                </p>

                {/* Enlace a la ruta dinámica de la tienda */}
                <Link
                  href={`/stores/${store.id}`}
                  className="mt-auto w-full text-center bg-blue-50 text-blue-600 font-medium py-2 rounded-md hover:bg-blue-100 transition-colors"
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
