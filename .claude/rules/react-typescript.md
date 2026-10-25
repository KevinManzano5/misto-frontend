# Reglas de React y TypeScript

## TypeScript

- `strict: true` ya está activo en `tsconfig.json` — no lo desactives ni agregues `// @ts-ignore` para evitar errores de tipos; corrige el tipo real.
- Nunca uses `any`. Para errores de `catch`, tipa como `unknown` y haz narrowing (ver patrón existente con `axios.isAxiosError` / `instanceof Error` en `authService.ts` y las páginas actuales).
- Define `interface`/`type` para cada request/response que toque el backend, junto al servicio que la usa (patrón de `src/services/*.ts`), no inline en el componente.
- Evita castings forzados (`as X`) salvo cuando sea inevitable (p. ej. `useParams() as { id: string }`); documenta por qué es seguro si no es obvio.

## Componentes

- Un componente, una responsabilidad. Si un `page.tsx` mezcla fetch de datos, lógica de formulario y layout visual en más de ~150 líneas, divide en subcomponentes dentro de la misma carpeta de ruta.
- Nombra los componentes y archivos en PascalCase/kebab-case consistente con lo ya usado (`page.tsx`, `layout.tsx` para rutas; componentes compartidos en PascalCase).
- No definas componentes dentro del cuerpo de otro componente (recreación en cada render). Defínelos a nivel de módulo.

## Hooks

- Respeta las reglas de hooks: no los llames condicionalmente ni dentro de loops.
- Declara todas las dependencias reales en los arrays de `useEffect`/`useCallback`/`useMemo`; no las silencies con comentarios `eslint-disable`.
- Si un `useEffect` hace fetch, incluye limpieza o una bandera de cancelación cuando el componente pueda desmontarse antes de que resuelva la petición (evita setState en componente desmontado).
- Extrae lógica de fetch+estado que se repite entre páginas (loading/error/data) a un hook reutilizable (p. ej. `useStoreDetails`) en lugar de copiar el mismo bloque `useState`/`useEffect`/`try-catch` en cada página.

## Manejo de errores

- Sigue el patrón ya establecido: capturar con `unknown`, distinguir `axios.isAxiosError(err)` para extraer `err.response?.data?.detail`, luego `Error`, luego fallback genérico.
- Los mensajes de error mostrados al usuario van en español (ver [`project-structure.md`](./project-structure.md)); los `console.error` de diagnóstico pueden quedarse en español también, para mantener consistencia con el resto del archivo.
- No tragues errores silenciosamente (`catch {}` vacío); como mínimo, loggea y refleja un estado de error en la UI.

## Estado

- Usa `useState` para estado local simple de un componente. Si el estado necesita compartirse entre más de 2 componentes hermanos, sube el estado al padre común en vez de duplicar llamadas a la API, antes de considerar una librería de estado global.
- No guardes en estado derivable de otro estado (p. ej. no dupliques `store.name` en un `useState` separado si ya tienes `store`).
