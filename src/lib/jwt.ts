// Decodifica el payload de un JWT en el cliente, sin verificar la firma.
// Solo se usa para leer claims (ej. el id del usuario); la verificación real la hace el backend.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const candidate = payload.sub ?? payload.user_id ?? payload.id;
  return typeof candidate === 'string' ? candidate : null;
}
