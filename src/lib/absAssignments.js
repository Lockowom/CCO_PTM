/**
 * ABS-LOC-001
 *
 * La clasificación ABS es propia del SKU. Estas utilidades solo presentan la
 * última asignación visual que conserva la bitácora; no calculan ni modifican
 * stock, ERP o ubicaciones.
 */
export function normalizeAbsSku(value) {
  return String(value || '').trim().toUpperCase();
}

export function isAbsSkuSearch(value) {
  const codigo = normalizeAbsSku(value);
  return codigo.length >= 3 && /^[A-Z0-9][A-Z0-9._/-]*$/.test(codigo);
}

export function latestAbsAssignment(rows = []) {
  return [...rows].sort((a, b) => {
    const aDate = new Date(a?.asignada_en || 0).getTime();
    const bDate = new Date(b?.asignada_en || 0).getTime();
    return bDate - aDate;
  })[0] || null;
}

export function absAssignmentCopy(assignment) {
  if (!assignment) return null;
  if (assignment.estado === 'ACTIVA') {
    return {
      title: 'Ubicación ABS activa',
      detail: `El SKU permanece registrado visualmente en ${assignment.ubicacion}.`
    };
  }
  return {
    title: 'Última ubicación ABS',
    detail: `El SKU fue retirado de la vista operativa. Su última ubicación fue ${assignment.ubicacion}; la clasificación ABS se conserva.`
  };
}
