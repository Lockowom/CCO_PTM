function count(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

/**
 * Normaliza la respuesta de bulk_upsert.
 *
 * La RPC actual responde accepted/skipped/total. Se mantiene compatibilidad
 * con inserted/errors para clientes desplegados contra una versión anterior.
 * Una respuesta sin contadores reconocibles se convierte en error visible para
 * evitar volver a mostrar una carga de cero cuando el servidor sí trabajó.
 */
export function normalizeBulkUpsertResult(data, chunkLength = 0) {
  const hasCurrentShape = data && ('accepted' in data || 'skipped' in data);
  const hasLegacyShape = data && ('inserted' in data || 'errors' in data);

  if (!hasCurrentShape && !hasLegacyShape) {
    const total = count(chunkLength);
    return {
      accepted: 0,
      skipped: total,
      total,
      error: 'Respuesta inesperada de bulk_upsert: faltan los contadores de resultado.'
    };
  }

  const accepted = count(data.accepted ?? data.inserted);
  const skipped = count(data.skipped ?? data.errors);
  const total = count(data.total) || accepted + skipped || count(chunkLength);

  return {
    accepted,
    skipped,
    total,
    error: data.error || null
  };
}
