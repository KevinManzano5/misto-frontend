# Convenciones propias de Misto Frontend

## Capa de servicios

- Todo acceso al backend (Go API) pasa por `src/services/*.ts`. No importes `apiClient` ni `axios` directamente en un componente o página.
- Cada recurso del backend tiene su propio archivo de servicio (`authService`, `storeService`, `appointmentService`, ...). Si agregas un recurso nuevo, crea `src/services/<recurso>Service.ts` con el mismo patrón:
  - Interfaces TypeScript para request/response, nombradas igual que los structs de Go cuando sea posible.
  - Un objeto exportado con métodos async que llaman a `apiClient` y devuelven `response.data` ya tipado.
- No pongas lógica de negocio (validaciones complejas, transformación de datos) dentro de los servicios; son wrappers delgados de HTTP. La lógica de UI vive en los componentes/hooks.

## Cliente HTTP (`src/lib/apiClient.ts`)

- Hay una única instancia de `axios` compartida (`apiClient`). No crees instancias de axios adicionales en otros archivos.
- El token de autenticación se inyecta vía interceptores (cookie `token` primero, luego `localStorage` si existe `window`). Si modificas la lógica de auth, mantén ambos mecanismos sincronizados — el middleware (`src/middleware.ts`) solo puede leer la cookie, no `localStorage`.
- `baseURL` viene de `NEXT_PUBLIC_API_URL`. No hardcodees URLs del backend en los servicios.

## Autenticación

- `authService.setToken` guarda el token en cookie (7 días) y en `localStorage`. `authService.logout` debe limpiar ambos y redirigir.
- `src/middleware.ts` controla qué rutas requieren sesión vía el array `publicRoutes`. Cualquier página nueva sin autenticación debe agregarse ahí; cualquier página privada nueva no necesita cambios (el middleware ya la protege por defecto).
- No implementes verificación de sesión duplicada dentro de cada página (`useEffect` que redirige si no hay token) — eso ya lo resuelve el middleware a nivel de servidor.

## Idioma

- Los comentarios de código, mensajes de error mostrados al usuario y textos de UI están en español en todo el proyecto. Mantén ese idioma al editar archivos existentes o crear nuevos; no mezcles inglés en comentarios/UI salvo nombres de variables/funciones (que sí van en inglés, siguiendo convención de código).

## Estructura de carpetas

- Páginas y rutas: `src/app/**` (App Router).
- Servicios de API: `src/services/`.
- Cliente HTTP compartido: `src/lib/`.
- No crees una carpeta `src/components/` nueva sin agruparla por dominio si el proyecto crece; por ahora, componentes compartidos pueden vivir junto a la página que los usa hasta que se reutilicen en 2+ rutas.
