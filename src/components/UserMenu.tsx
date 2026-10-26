'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { isAxiosError } from 'axios';
import { getUserIdFromToken } from '@/lib/jwt';
import { userService, User } from '@/services/userService';
import { authService } from '@/services/authService';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || user) return;

    const fetchUser = async () => {
      const token = Cookies.get('token');
      const userId = token ? getUserIdFromToken(token) : null;

      if (!userId) {
        setError('No se pudo identificar al usuario.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await userService.getById(userId);
        setUser(data);
      } catch (err: unknown) {
        console.error('Error al cargar el usuario', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail || 'No se pudo cargar el usuario.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar el usuario.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [open, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir menú de usuario"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:border-neutral-500 transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-neutral-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.76-3.58-5-8-5Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg z-20">
          {loading ? (
            <p className="text-sm text-neutral-500 animate-pulse">
              Cargando...
            </p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : user ? (
            <>
              <p className="text-white font-medium">{user.username}</p>
              <p className="text-sm text-neutral-400 mb-4 break-all">
                {user.email}
              </p>

              {user.has_store && user.store_id ? (
                <Link
                  href={`/stores/${user.store_id}/settings`}
                  className="block w-full text-center bg-white text-black font-medium py-2 rounded-lg hover:bg-neutral-200 transition-colors mb-3"
                >
                  Configuración de mi tienda
                </Link>
              ) : (
                <Link
                  href="/stores/new"
                  className="block w-full text-center bg-white text-black font-medium py-2 rounded-lg hover:bg-neutral-200 transition-colors mb-3"
                >
                  Crear mi tienda
                </Link>
              )}
            </>
          ) : null}

          {(user || error) && (
            <button
              type="button"
              onClick={() => authService.logout()}
              className="block w-full text-center text-sm text-neutral-400 hover:text-white transition-colors pt-3 border-t border-neutral-800"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      )}
    </div>
  );
}
