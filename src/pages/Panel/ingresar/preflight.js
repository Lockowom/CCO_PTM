// PR-016 · Preflight del módulo Ingresar N.V. (TXT 05 §22).
//
// Centraliza TODAS las reglas de validación previas al guardado que vivían
// inline en `PanelIngresar.handleSubmit`. Cada regla devuelve un problema
// (`{ field, message, code }`) o nada. `preflightGuardar` ejecuta todas las
// reglas relevantes según el contexto y devuelve la lista de bloqueos.
//
// 100% puro y testeable: el screen solo adapta el contexto del store a estos
// argumentos.

// ── Reglas individuales ────────────────────────────────────────────────────

// 1. El estado es obligatorio.
export function requiereEstado(st) {
  if (!st?.estado) return { field: 'estado', message: 'Falta el Estado', code: 'ESTADO_REQUERIDO' };
  return null;
}

// 2. Pausa Shipping: si se cambia el subestado y hay subestado, el motivo es
//    obligatorio.
export function pausaShippingRequiereMotivo(st, originalShippingSubestado = '') {
  const shippingPauseChanged =
    st?.mode === 'update' &&
    String(st?.shippingSubestado || '') !== String(originalShippingSubestado || '');
  if (
    shippingPauseChanged &&
    st?.shippingSubestado &&
    !String(st?.shippingPausaMotivo || '').trim()
  ) {
    return {
      field: 'shippingPausaMotivo',
      message: 'Debes indicar el motivo de la pausa Shipping.',
      code: 'SHIPPING_PAUSA_SIN_MOTIVO'
    };
  }
  return null;
}

// 3. Si la N.V. tenía una pausa Shipping activa y se va a sacar de Shipping,
//    hay que reactivarla antes de avanzar.
export function pausaShippingBloqueaAvance(
  st,
  originalShippingSubestado = '',
  estadoOriginal = ''
) {
  if (originalShippingSubestado && st?.estado && st?.estado !== 'Shipping') {
    if (String(st.estado).toUpperCase() !== String(estadoOriginal || 'Shipping').toUpperCase()) {
      return {
        field: 'estado',
        message: 'Reactiva la N.V. en Shipping y guarda antes de avanzar a En Ruta.',
        code: 'SHIPPING_PAUSA_ACTIVA'
      };
    }
  }
  return null;
}

// 4. Acceso IAM: sin permiso de edición (salvo la transición restringida).
export function requiereAccesoIAM(st, { editAccess, canSubmitRestrictedUpdate }) {
  if (st?.mode === 'update' && editAccess?.permitida === false && !canSubmitRestrictedUpdate) {
    return {
      field: 'iam',
      message: editAccess?.message || 'No tienes permisos IAM para editar esta N.V.',
      code: 'IAM_DENEGADO'
    };
  }
  return null;
}

// 5. N.V. entregada → bloqueada; solo reapertura.
export function entregadaBloquea(st) {
  if (st?.lookupResult?.found && st?.lookupResult?.data?.estado === 'Entregado') {
    return {
      field: 'estado',
      message: 'La N.V. está entregada y bloqueada. Solicita reapertura para volver a gestionarla.',
      code: 'NV_ENTREGADA'
    };
  }
  return null;
}

// 6. Asociación Orange obligatoria para clientes PTM Orange.
export function requiereAsociacionOrange(st) {
  if (st?.orangeAssociationRequired && (!st?.orangeAssociationNv || !st?.orangeAssociationData)) {
    return {
      field: 'orangeAssociationNv',
      message: 'Debes asociar una N.V. Orange válida para este cliente PTM.',
      code: 'ORANGE_ASSOCIATION_REQUERIDA'
    };
  }
  return null;
}

// 7. Preflight de datos: campos no vacíos y tipos correctos (data quality).
export function calidadDatos(st, { autoFill }) {
  if (st?.mode === 'create' && st?.canal === 'varios') return null; // varios usa cliente manual
  const cliente = autoFill?.cliente || st?.variosCliente || '';
  if (!String(cliente || '').trim()) {
    return { field: 'cliente', message: 'Falta el cliente', code: 'CLIENTE_REQUERIDO' };
  }
  return null;
}

// ── Orquestador ─────────────────────────────────────────────────────────────

/**
 * Ejecuta todas las reglas de preflight según el contexto del guardado.
 * @param {object} st        estado del store (useFormNVStore).
 * @param {object} ctx       contexto externo:
 *   - originalShippingSubestado {string}
 *   - estadoOriginal {string}
 *   - editAccess {object|null}    resultado de puedeEditarOperacion
 *   - canSubmitRestrictedUpdate {boolean}
 *   - autoFill {object}           lookupResult.data | lookupResult.autoFill
 * @returns {{ ok: boolean, problems: Array<{field,message,code}> }}
 */
export function preflightGuardar(st, ctx = {}) {
  const rules = [
    () => requiereEstado(st),
    () => pausaShippingRequiereMotivo(st, ctx.originalShippingSubestado),
    () => pausaShippingBloqueaAvance(st, ctx.originalShippingSubestado, ctx.estadoOriginal),
    () => requiereAccesoIAM(st, ctx),
    () => entregadaBloquea(st),
    () => requiereAsociacionOrange(st),
    () => calidadDatos(st, ctx)
  ];

  const problems = rules.map((fn) => fn()).filter((p) => Boolean(p));

  return { ok: problems.length === 0, problems };
}

// Primer problema (para mensaje único, igual que el handleSubmit original).
export function primerProblema(preflight) {
  return preflight?.problems?.[0] || null;
}
