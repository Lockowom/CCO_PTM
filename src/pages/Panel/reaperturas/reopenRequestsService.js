import { supabase } from '../../../supabase';
import { Logger } from '../../../lib/logger';

function unwrap(data, error) {
  if (error) throw error;
  if (data?.ok === false) throw new Error(data.message || 'La operación no pudo completarse.');
  return data || {};
}

export async function fetchReopenInbox({ status = '', search = '', limit = 200 } = {}) {
  const startedAt = performance.now();
  try {
    const { data, error } = await supabase.rpc('listar_bandeja_reaperturas_nv', {
      p_estado: status || null,
      p_busqueda: search.trim() || null,
      p_limit: limit
    });
    const result = unwrap(data, error);
    const durationMs = Math.round(performance.now() - startedAt);
    if (durationMs >= 900) {
      Logger.performance({
        module: 'panel',
        screen: 'BandejaReaperturas',
        action: 'listar_reaperturas',
        message: 'Carga lenta de la bandeja de reaperturas',
        durationMs,
        status: 'ok',
        payload: { status: status || 'TODAS', resultCount: result.items?.length || 0 }
      });
    }
    return {
      items: Array.isArray(result.items) ? result.items : [],
      stats: result.stats || { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 }
    };
  } catch (error) {
    Logger.error(error, {
      module: 'panel',
      screen: 'BandejaReaperturas',
      action: 'listar_reaperturas',
      message: 'No se pudo cargar la bandeja de reaperturas',
      durationMs: Math.round(performance.now() - startedAt),
      status: 'error'
    });
    throw error;
  }
}

export async function resolveReopenRequest(requestId, approve, observation = '') {
  const { data, error } = await supabase.rpc('resolver_reapertura_nv', {
    p_request_id: requestId,
    p_aprobar: approve,
    p_observacion: observation.trim() || null
  });
  return unwrap(data, error);
}

export function subscribeToReopenRequests(onChange) {
  const channel = supabase
    .channel(`panel-reopen-inbox-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_reaperturas' }, () =>
      onChange?.()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
