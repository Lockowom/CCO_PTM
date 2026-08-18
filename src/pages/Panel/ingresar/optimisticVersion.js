// PR-016 · Optimistic version (locking optimista) del módulo Ingresar N.V.
//
// Regla (TXT 05 §22 "Optimistic version"): cada N.V. lleva `row_version`
// (bigint) como token de concurrencia DEDICADO. El trigger
// `tms_operaciones_bump_version` lo incrementa en CADA UPDATE (cualquier
// campo), así que es un token real de edición — a diferencia de `fecha_estado`,
// que solo cambia cuando cambia el estado y truncado a día colisiona.
//
// El cliente envía la versión que cargó; el server compara contra el
// `row_version` actual (RPC `guardar_nv`/`cambiar_estado_nv` con
// `version`/`p_expected_version`). Si difieren → `{ ok:false, conflict:true,
// version }`. La RPC devuelve la NUEVA versión tras cada escritura.
//
// COMPATIBILITY MODE: sin `version` la RPC no activa el gate (fase A→D del
// PR; la fase D fuerza `version` en UPDATE vía `app.nv_require_version`).

import { ERROR_CODES } from '../../../core/domain/appError';

// Identificador de la versión dentro del payload de guardado.
export const VERSION_FIELD = 'version';

// Lee la versión desde una fila (lookup). row_version es bigint (1, 2, 3…).
export function versionDeRow(row) {
  if (!row) return null;
  const v = row?.row_version ?? row?.version ?? null;
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

// Lee la versión desde el payload (bigint).
export function versionDePayload(payload) {
  return payload?.[VERSION_FIELD] ?? null;
}

// ¿La versión enviada por el cliente coincide con la actual del server?
// Retrocompatible: si falta cualquiera de las dos, no hay gate (compat mode).
export function versionEsActual(enviada, actual) {
  if (enviada === null || enviada === undefined || enviada === '') return true;
  if (actual === null || actual === undefined || actual === '') return true;
  return Number(enviada) === Number(actual);
}

// Tipifica la respuesta de una RPC de guardado: devuelve true si es conflicto.
export function esConflicto(result) {
  return Boolean(result && (result.conflict === true || result.code === ERROR_CODES.CONFLICT));
}

// ¿La RPC pide la versión obligatoria (fase D / clientes legacy bloqueados)?
export function esVersionRequerida(result) {
  return Boolean(result && result.version_required === true);
}

// Mensaje amigable para un conflicto.
export function mensajeConflicto(result) {
  return (
    result?.message ||
    result?.error ||
    'Otra persona modificó esta N.V. mientras la editabas. Se cargó la versión actual: revisa los datos e intenta guardar de nuevo.'
  );
}

/**
 * Decora el resultado de una mutación fallida por conflicto para que el
 * screen lo detecte y recargue el lookup (sin cerrar el modal).
 */
export function resultadoConflicto(result) {
  return {
    ok: false,
    conflict: true,
    code: ERROR_CODES.CONFLICT,
    message: mensajeConflicto(result),
    version: result?.version ?? null
  };
}

// Mensaje amigable para un error de versión requerida (fase D).
export function mensajeVersionRequerida(result) {
  return (
    result?.message ||
    result?.error ||
    'Esta N.V. requiere la versión actual para editarse. Recarga la ficha e inténtalo de nuevo.'
  );
}
