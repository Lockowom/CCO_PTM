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
