// Helper de validación de formularios: envuelve schema.safeParse() y muestra los errores
// con sonner (toast). Retorna { ok, data, errors } para que el caller aborte el submit.
import { toast } from 'sonner';

const ERROR_TOAST_STYLE = { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' };

/**
 * @param {import('zod').ZodTypeAny} schema  Esquema zod a aplicar.
 * @param {unknown} values                   Valores del formulario.
 * @param {{ silent?: boolean }} [opts]       silent: no emitir toast (validación inline).
 * @returns {{ ok: boolean, data?: any, errors: Record<string,string> }}
 */
export function validateForm(schema, values, opts = {}) {
  const result = schema.safeParse(values);
  if (result.success) {
    return { ok: true, data: result.data, errors: {} };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    if (!errors[key]) errors[key] = issue.message;
  }

  if (!opts.silent) {
    // Mostrar el primer error (evita inundar al usuario con varios toasts).
    const first = Object.values(errors)[0];
    if (first) toast.error(first, { style: ERROR_TOAST_STYLE });
  }

  return { ok: false, errors };
}
