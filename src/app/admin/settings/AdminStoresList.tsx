'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { storeService, Store } from '@/services/storeService';

export default function AdminStoresList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchStores = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await storeService.getAll(page);
        if (cancelled) return;
        setStores(data.stores);
        setTotalCount(data.total_count);
        setPageSize(data.page_size);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error al cargar las tiendas', err);
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
        if (!cancelled) setLoading(false);
      }
    };

    fetchStores();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-neutral-500 animate-pulse">Cargando tiendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center text-neutral-500 mt-10">
        No hay tiendas registradas.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-900/50 text-neutral-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Tienda</th>
              <th scope="col" className="px-4 py-3 font-medium">Categorías</th>
              <th scope="col" className="px-4 py-3 font-medium">Calificación</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="px-4 py-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-neutral-900/30">
                <td className="px-4 py-3 text-white">
                  {store.name}
                  <span className="block text-neutral-500">/{store.slug}</span>
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  {store.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {store.categories.map((category) => (
                        <span
                          key={category.id}
                          className="text-xs text-neutral-300 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-500">Sin categorías</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  {store.rating_count > 0
                    ? `${store.average_rating.toFixed(1)} (${store.rating_count})`
                    : 'Sin calificaciones'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      store.is_active
                        ? 'text-green-400 border-green-900/50 bg-green-950/30'
                        : 'text-neutral-400 border-neutral-700 bg-neutral-800/50'
                    }`}
                  >
                    {store.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(store.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-neutral-400">
        <p>
          Página {page} de {totalPages} · {totalCount} tiendas
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
