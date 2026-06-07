// ── Helper de timeout/abort para llamadas a Supabase ───────────────────────
// Centraliza el patrón AbortController + timeout (ya probado en
// `services/calidadService.js#fetchCandidatos` y `pages/Inbound/Entry.jsx`)
// para que ninguna búsqueda ni carga masiva deje el spinner "cargando
// eternamente" si la promesa de supabase-js no se resuelve (auth-lock en
// WebView, socket caído, query sin límite). Si vence el plazo, aborta la
// petición (cuando es posible) y lanza un Error localizado que la UI puede
// mostrar con un botón "Reintentar".

const DEFAULT_TIMEOUT_MS = 12000;

const timeoutMessage = (ms, label) =>
  `La operación tardó demasiado (timeout ${Math.round(ms / 1000)}s)` +
  `${label ? ` — ${label}` : ''}. Revisa tu conexión e inténtalo de nuevo.`;

// Detecta un query builder de supabase-js por su capacidad de adjuntar una
// AbortSignal. Es un "thenable" reutilizable solo una vez, así que hay que
// llamar `.abortSignal()` ANTES de await.
const isAbortableBuilder = (x) =>
  x != null && typeof x.abortSignal === 'function';

/**
 * Envuelve un query builder de supabase-js o una promesa cruda con un timeout.
 *
 * - Builder (tiene `.abortSignal`): adjunta una AbortSignal y aborta la
 *   petición al vencer el plazo (cancelación real de la red).
 * - Promesa cruda (RPC encadenada, `Promise.all`, `auth.getSession()`): corre
 *   contra una promesa de timeout que rechaza con el mismo error localizado.
 *
 * @param {object|Promise} builderOrPromise
 * @param {{ ms?: number, label?: string }} [opts]
 * @returns {Promise<any>} el resultado original (p. ej. `{ data, error }`).
 */
export async function withTimeout(builderOrPromise, { ms = DEFAULT_TIMEOUT_MS, label } = {}) {
  if (isAbortableBuilder(builderOrPromise)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await builderOrPromise.abortSignal(controller.signal);
    } catch (e) {
      if (e?.name === 'AbortError' || controller.signal.aborted) {
        throw new Error(timeoutMessage(ms, label));
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  // Promesa cruda: no se puede abortar la red, pero sí acotar la espera.
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage(ms, label))), ms);
  });
  try {
    return await Promise.race([Promise.resolve(builderOrPromise), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Conveniencia: dado un resultado `{ data, error }` de supabase-js, lanza el
 * error si existe o devuelve `data`. Reduce el boilerplate en los call sites.
 */
export function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}
