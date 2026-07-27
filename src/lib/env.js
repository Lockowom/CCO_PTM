import { parseAppEnv } from '../core/contracts/env';

let cachedEnv = null;

export function getAppEnv() {
  if (cachedEnv) return cachedEnv;
  cachedEnv = parseAppEnv(import.meta.env);
  return cachedEnv;
}

/**
 * Validación temprana de variables de entorno al arrancar la aplicación.
 */
export const validateEnv = () => {
  getAppEnv();
};
