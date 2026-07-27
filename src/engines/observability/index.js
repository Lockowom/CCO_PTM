import { Logger } from '../../lib/logger';

export async function traceAsyncOperation(label, fn, meta = {}) {
  return Logger.time(label, fn, meta);
}

export function measureSyncOperation(label, fn, meta = {}) {
  const startedAt = performance.now();
  try {
    const result = fn();
    Logger.performance({
      action: label,
      message: meta.message || label,
      module: meta.module,
      screen: meta.screen,
      durationMs: performance.now() - startedAt,
      status: 'ok',
      payload: meta.payload,
      context: meta.context
    });
    return result;
  } catch (error) {
    Logger.error(error, {
      action: label,
      message: meta.errorMessage || `Fallo en ${label}`,
      module: meta.module,
      screen: meta.screen,
      durationMs: performance.now() - startedAt,
      status: 'error',
      payload: meta.payload,
      context: meta.context
    });
    throw error;
  }
}
