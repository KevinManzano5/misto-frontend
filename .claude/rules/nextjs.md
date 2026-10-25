# Reglas Next.js (v16.4.2 — App Router)

> Antes de aplicar cualquier regla de esta lista, verifica contra `node_modules/next/dist/docs/` si el comportamiento cambió en esta versión. No asumas conocimiento de Next.js 13/14/15.

## Cache Components y Partial Prefetching

Este proyecto tiene `cacheComponents: true` y `partialPrefetching: true` en `next.config.ts`.

- Todo fetch de datos es **dinámico por defecto**. Si algo debe cachearse, márcalo explícitamente con la directiva `'use cache'` a nivel de función/componente. No uses patrones de `getStaticProps`, `revalidate` en route segment config, ni `experimental.ppr` — están eliminados.
- No exportes `runtime = 'nodejs'` ni `runtime = 'edge'` desde páginas o layouts; Cache Components requiere el runtime de Node.js y no soporta ese export.
- Nunca leas `params` o `searchParams` fuera de un límite `<Suspense>` en una página o layout: eso ata el "App Shell" a una URL específica y rompe el prefetch compartido. Pasa la promesa hacia un componente hijo envuelto en `<Suspense>` y resuélvela ahí.
- Si un dato depende de `cookies()`/`headers()` pero debe quedar cacheado en el shell, léelo fuera de la función cacheada y pásalo como argumento a una función con `'use cache'`.
- Usa `<Link prefetch={true}>` solo cuando el destino tiene contenido dependiente de URL que quieres resolver antes del click; en los demás casos deja el `prefetch` por defecto (`"auto"`).

## Server vs. Client Components

- Prefiere Server Components por defecto. Usa `'use client'` solo cuando el componente necesita estado, efectos, listeners del navegador o hooks de React que lo requieran (`useState`, `useEffect`, `useRouter`, etc.).
- Las páginas actuales de este repo (`src/app/**/page.tsx`) son 100% client components que hacen fetch en `useEffect`. Esto es deuda técnica, no el patrón a replicar: cualquier página nueva debe evaluarse primero como Server Component con fetch directo (y cacheado con `'use cache'` si aplica), moviendo solo la interactividad a un componente cliente hijo.
- No pongas `'use client'` en un archivo completo solo porque un botón dentro necesita `onClick`; extrae ese botón a su propio componente cliente.

## Data fetching

- No llames a `axios`/`apiClient` directamente desde un componente de página. Pasa siempre por la capa `src/services/*.ts` (ver [`project-structure.md`](./project-structure.md)).
- En Server Components, el fetch puede ir directo en el cuerpo async del componente; en Client Components, usa un hook de efecto o una librería de data fetching — no dupliques lógica de carga/error entre páginas, extráela a un hook compartido si se repite en más de dos lugares.

## Routing y archivos especiales

- Usa los nombres de archivo de convención del App Router (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) en lugar de manejar estados de carga/error manualmente dentro de cada página cuando el patrón del framework ya lo resuelve.
- Las rutas protegidas se controlan en `src/middleware.ts` vía la cookie `token`. Si agregas una ruta pública nueva (sin autenticación), regístrala en el array `publicRoutes` de ese archivo.
- Usa siempre el alias `@/*` (→ `src/*`) para imports internos; no uses rutas relativas largas (`../../../`).

## Metadata y SEO

- Define `metadata` (o `generateMetadata`) por página/layout en lugar de manipular `<head>` manualmente. Si `generateMetadata` necesita `params`/`searchParams`, ten en cuenta que esa lectura cuenta como "URL data en generateMetadata" y puede bloquear el prerender — revisa la guía correspondiente en `node_modules/next/dist/docs/` antes de implementarlo.

## Variables de entorno

- Cualquier variable consumida en el cliente debe tener el prefijo `NEXT_PUBLIC_` (ver `NEXT_PUBLIC_API_URL` en `apiClient.ts`). No expongas secretos del backend con ese prefijo.
