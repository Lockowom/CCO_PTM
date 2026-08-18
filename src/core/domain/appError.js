export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'APP_ERROR';
    this.module = options.module || 'app';
    this.action = options.action || 'unspecified';
    this.status = options.status || 'error';
    this.context = options.context || {};
    this.cause = options.cause || null;
  }
}

export function normalizeError(error, options = {}) {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.message, { ...options, cause: error });
  }
  return new AppError(typeof error === 'string' ? error : 'Operacion fallida', {
    ...options,
    cause: error
  });
}

// ── PR-010 · Códigos de error de negocio (contrato común de la capa de datos) ──
// Únicos códigos estándar. Los servicios pueden añadir códigos específicos de
// módulo, pero estos son los transversales que el resto de la app reconoce.
export const ERROR_CODES = Object.freeze({
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RLS_DENIED: 'RLS_DENIED',
  OFFLINE: 'OFFLINE',
  UNKNOWN: 'APP_ERROR'
});

/**
 * Crea un AppError de negocio con código estándar.
 * Ej: businessError(ERROR_CODES.NOT_FOUND, 'NV no encontrada', { module: 'nv', action: 'get' })
 */
export function businessError(code, message, options = {}) {
  return new AppError(message, { ...options, code });
}

/** Corto-circuito útil para propagar errores ya normalizados en capas de datos. */
export function rethrowAsAppError(error, options = {}) {
  return normalizeError(error, options);
}
