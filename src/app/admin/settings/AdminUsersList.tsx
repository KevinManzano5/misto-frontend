'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { userService, PlatformUser } from '@/services/userService';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  member: 'Miembro',
};

export default function AdminUsersList() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await userService.getAll(page);
        if (cancelled) return;
        setUsers(data.users);
        setTotalCount(data.total_count);
        setPageSize(data.page_size);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error al cargar los usuarios', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar los usuarios en este momento.',
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar los usuarios.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-neutral-500 animate-pulse">Cargando usuarios...</p>
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

  if (users.length === 0) {
    return (
      <div className="text-center text-neutral-500 mt-10">
        No hay usuarios registrados.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-900/50 text-neutral-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Rol</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="px-4 py-3 font-medium">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-900/30">
                <td className="px-4 py-3 text-white">
                  {user.first_name} {user.last_name}
                  <span className="block text-neutral-500">@{user.username}</span>
                </td>
                <td className="px-4 py-3 text-neutral-300 break-all">{user.email}</td>
                <td className="px-4 py-3 text-neutral-300">
                  {ROLE_LABELS[user.role] ?? user.role}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      user.is_active
                        ? 'text-green-400 border-green-900/50 bg-green-950/30'
                        : 'text-neutral-400 border-neutral-700 bg-neutral-800/50'
                    }`}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
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
          Página {page} de {totalPages} · {totalCount} usuarios
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
