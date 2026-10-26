// Rutas que no requieren sesión. Compartida entre el middleware (servidor)
// y la validación de token en el cliente para que no se desincronicen.
export const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];
