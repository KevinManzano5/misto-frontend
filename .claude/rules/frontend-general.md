# Buenas prácticas generales de frontend

## Estilos (Tailwind CSS v4)

- Este proyecto usa Tailwind v4 vía el loader de Turbopack configurado en `next.config.ts` (sin `tailwind.config.*`). No crees un archivo de configuración de Tailwind v3 ni agregues un plugin de PostCSS manual.
- Usa clases utilitarias directamente en el JSX, siguiendo la paleta y escala ya usada en las páginas existentes (`neutral-*` para fondos/bordes, `white`/`black` para acentos, `red-*` para errores). No introduzcas una paleta de color nueva sin que el usuario lo pida.
- No dupliques bloques largos de clases repetidas entre componentes; si un patrón visual (ej. tarjeta, botón primario, input) se repite 3+ veces, extrae un componente compartido en lugar de copiar las clases.
- Mantén el soporte de dark-mode implícito actual (la app es oscura por diseño, fondo `neutral-950`); no mezcles con modo claro salvo que se solicite explícitamente.

## Accesibilidad

- Todo elemento interactivo (`button`, `a`, inputs) debe ser navegable por teclado y tener foco visible — no remuevas los `focus:` existentes.
- Usa etiquetas semánticas (`<label>`, `<nav>`, `<main>`, `<button>` vs `<div onClick>`). No uses `<div>` con `onClick` como sustituto de un botón real.
- Los inputs de formulario deben tener `name`/`placeholder` o `<label>` asociado, como en `sign-in`/`sign-up`.

## Manejo de formularios

- Controla el estado de carga (`loading`) para deshabilitar el botón de submit y evitar doble envío, como en los formularios existentes.
- Siempre llama `e.preventDefault()` en `onSubmit` antes de cualquier lógica async.
- Limpia el mensaje de error anterior (`setError('')`) al reintentar un submit.

## Rendimiento

- No hagas fetch de datos que no se van a usar en el render actual (evita over-fetching). Pide solo los campos/recursos necesarios para la vista.
- Evita recrear funciones/objetos inline como props en componentes que se re-renderizan en listas grandes; usa `useCallback`/`useMemo` cuando el perfil de performance lo justifique, no por defecto.
- Las imágenes deben usar `next/image`, no `<img>` plano, salvo en SVGs estáticos simples.

## Calidad de código

- Corre `npm run lint` antes de considerar un cambio terminado; no dejes warnings nuevos de ESLint (`eslint-config-next/core-web-vitals` + `typescript`).
- No comentes código muerto ni dejes `console.log` de depuración en el código final (los `console.error` de manejo de errores sí están permitidos, siguiendo el patrón existente).
- Prioriza la simplicidad: no introduzcas abstracciones (contextos, hooks genéricos, wrappers) para un único caso de uso.
