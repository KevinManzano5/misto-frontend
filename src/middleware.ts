import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_ROUTES } from '@/lib/publicRoutes';

// Esta función se ejecuta antes de renderizar cualquier página
export function middleware(request: NextRequest) {
    // Obtenemos el token de las cookies de la petición
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

  // 1. Definir qué rutas son públicas (no requieren sesión)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 2. Si el usuario NO tiene token y quiere acceder a una ruta privada, lo mandamos al login
  if (!token && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Si el usuario SÍ tiene token e intenta ir al login o registro, lo mandamos al dashboard
  if (token && isPublicRoute && pathname !== '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Si todo está bien, dejamos que la petición continúe
  return NextResponse.next();
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  // Se ejecutará en todas las rutas EXCEPTO archivos estáticos, imágenes y la API interna de Next
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
