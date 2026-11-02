const LOCATION_PATTERN = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/;

const cleanText = (value) => String(value ?? '').trim();

/**
 * Normaliza una ubicación física para el contrato RACK-POS-NIVEL.
 * Ejemplo: E-8-1 -> E-08-01. No consulta ni modifica inventario.
 */
export const normalizePutawayLocation = (value) => {
  const raw = cleanText(value)
    .toUpperCase()
    .replace(/[\s._/]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const parts = raw.split('-').filter(Boolean);
  if (parts.length !== 3) return raw;

  const normalizeSegment = (segment) => {
    if (!/^\d+$/.test(segment)) return segment;
    return String(Number(segment)).padStart(2, '0');
  };

  return [parts[0], normalizeSegment(parts[1]), normalizeSegment(parts[2])].join('-');
};
export const normalizePutawaySku = (value) => cleanText(value).toUpperCase();

export const isPutawayLocationFormat = (value) => LOCATION_PATTERN.test(value);

/**
 * Clasifica una fila previamente enriquecida con maestro de SKU y catálogo de
 * ubicaciones. Una fila inválida se omite, nunca bloquea las demás.
 */
export const classifyPutawayRow = ({ raw, rowNumber, skuByCode, activeLocations }) => {
  const ubicacion = normalizePutawayLocation(raw.ubicacion);
  const codigo = normalizePutawaySku(raw.codigo);
  const master = skuByCode.get(codigo);

  if (!ubicacion || !isPutawayLocationFormat(ubicacion)) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'Formato de ubicación inválido' };
  }
  if (!activeLocations.has(ubicacion)) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'Ubicación no registrada o desactivada' };
  }
  if (!codigo) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'SKU obligatorio' };
  }
  if (!master) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'SKU no encontrado en maestro' };
  }
  if (!cleanText(master.producto)) {
    return {
      rowNumber,
      ubicacion,
      codigo,
      status: 'ERROR',
      reason: 'SKU existente sin descripción en maestro'
    };
  }

  return {
    rowNumber,
    ubicacion,
    codigo,
    descripcion: cleanText(master.producto),
    status: 'READY',
    reason: ''
  };
};

export const putawayRowKey = (ubicacion, codigo) => `${ubicacion}\u001f${codigo}`;

/** Clasifica un retiro sin borrar la fila ni tocar su cantidad. */
export const classifyPutawayRetireRow = ({ raw, rowNumber, activePutawayByKey }) => {
  const ubicacion = normalizePutawayLocation(raw.ubicacion);
  const codigo = normalizePutawaySku(raw.codigo);
  if (!ubicacion || !isPutawayLocationFormat(ubicacion)) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'Formato de ubicación inválido' };
  }
  if (!codigo) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'SKU obligatorio' };
  }
  const existing = activePutawayByKey.get(putawayRowKey(ubicacion, codigo));
  if (!existing) {
    return { rowNumber, ubicacion, codigo, status: 'ERROR', reason: 'No existe como Put Away activo' };
  }
  return {
    rowNumber,
    ubicacion,
    codigo,
    descripcion: cleanText(existing.descripcion),
    status: 'READY',
    reason: ''
  };
};

export const canonicalPutawayHeaders = (header) => {
  const normalized = cleanText(header)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[\s_-]+/g, '');
  if (['UBICACION', 'LOCATION', 'LOCACION'].includes(normalized)) return 'ubicacion';
  if (['CODIGO', 'SKU', 'CODIGOPRODUCTO', 'PRODUCTCODE'].includes(normalized)) return 'codigo';
  return null;
};

export const parsePutawaySheetRows = (sheetRows) => {
  if (!sheetRows.length) return [];
  const headers = sheetRows[0].map(canonicalPutawayHeaders);
  const locationIndex = headers.indexOf('ubicacion');
  const skuIndex = headers.indexOf('codigo');
  if (locationIndex < 0 || skuIndex < 0) {
    throw new Error('El archivo debe incluir las columnas UBICACION y CODIGO (o SKU).');
  }

  return sheetRows.slice(1).reduce((rows, row, index) => {
    const ubicacion = cleanText(row[locationIndex]);
    const codigo = cleanText(row[skuIndex]);
    if (ubicacion || codigo) rows.push({ rowNumber: index + 2, ubicacion, codigo });
    return rows;
  }, []);
};
