'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isAxiosError } from 'axios';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';
import { PUBLIC_ROUTES } from '@/lib/publicRoutes';

export default function AuthValidator() {
  const pathname = usePathname();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Valida el token contra el backend en cada carga de página (ruta privada).
  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) return;

    const token = Cookies.get('token');
    if (!token) return;

    let cancelled = false;

    const validate = async () => {
      try {
        const result = await authService.validate();
        if (!cancelled && !result.valid) {
          setSessionExpired(true);
        }
      } catch (err: unknown) {
        console.error('Error al validar la sesión', err);
        if (!cancelled && isAxiosError(err) && err.response?.status === 401) {
          setSessionExpired(true);
        }
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Da tiempo a mostrar el aviso antes de limpiar la sesión y redirigir.
  useEffect(() => {
    if (!sessionExpired) return;

    const timeout = setTimeout(() => {
      authService.logout();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [sessionExpired]);

  if (!sessionExpired) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/90 flex items-center justify-center z-50">
      <p className="text-white text-lg">
        Tu sesión expiró. Redirigiendo...
      </p>
    </div>
  );
}
