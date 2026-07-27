import { supabase } from '../../../supabase';
import { normalizeError } from '../../domain/appError';
import { traceAsyncOperation } from '../../../engines/observability';

function buildMeta(options = {}, action) {
  return {
    module: options.module || 'app',
    screen: options.screen || '',
    action: options.action || action,
    message: options.message || action,
    payload: options.payload,
    context: options.context
  };
}

export async function rpcCommand(fn, args = {}, options = {}) {
  const meta = buildMeta(options, fn);
  return traceAsyncOperation(
    fn,
    async () => {
      const { data, error } = await supabase.rpc(fn, args);
      if (error) {
        return { ok: false, error: error.message };
      }
      return data ?? { ok: true };
    },
    meta
  );
}

export async function rpcQuery(fn, args = {}, options = {}) {
  const meta = buildMeta(options, fn);
  return traceAsyncOperation(
    fn,
    async () => {
      const { data, error } = await supabase.rpc(fn, args);
      if (error) {
        throw normalizeError(error, {
          module: meta.module,
          action: meta.action,
          context: { fn, args }
        });
      }
      return data;
    },
    meta
  );
}
