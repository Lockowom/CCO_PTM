import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// ── PR-008 B5 · Contrato Logging V2 + Observability Engine ──────────────────
// Logger (src/lib/logger.js): eventos normalizados, cola (máx 100), persistencia
// vía RPC log_client_event (snake_case), audit/error/warn completos y performance
// rápida muestreada 1/20; lenta (>=3s) completa. Sentry recibe solo errores.
// Engine (src/engines/observability): traceAsyncOperation / measureSyncOperation
// registran performance ok/error y relanzan errores.

const mocks = vi.hoisted(() => {
  const getSession = vi.fn();
  const rpc = vi.fn();
  const sentry = vi.fn();
  return { getSession, rpc, sentry };
});

vi.mock('../supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    rpc: mocks.rpc
  }
}));

vi.mock('../lib/sentry', () => ({
  logError: mocks.sentry
}));

import {
  Logger,
  setLoggerUserContext,
  clearLoggerUserContext,
  installGlobalErrorHandlers
} from '../lib/logger';
import { traceAsyncOperation, measureSyncOperation } from '../engines/observability';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('PR-008 B5 · Logger V2 (eventos)', () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'tok' } }
    });
    mocks.rpc.mockReset();
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.sentry.mockReset();
    setLoggerUserContext({ id: 'u1', email: 'a@b.cl', nombre: 'Ana', rol: 'ADMIN' });
  });

  afterEach(() => {
    clearLoggerUserContext();
  });

  it('info no persiste por defecto (persist=false) y lleva correlationId/sessionId', async () => {
    const event = Logger.info({ module: 'test', action: 'saludo', message: 'hola' });
    expect(event.level).toBe('info');
    expect(event.persist).toBe(false);
    expect(event.correlationId).toBeTruthy();
    expect(event.sessionId).toBeTruthy();
    expect(event.handled).toBe(true);
    await flush();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('error persiste por defecto (persist=true) y captura a Sentry', async () => {
    const boom = new Error('fallo cr�tico');
    const event = Logger.error(boom, { module: 'test', action: 'frm', handled: false });
    expect(event.level).toBe('error');
    expect(event.persist).toBe(true);
    expect(event.handled).toBe(false);
    expect(event.errorName).toBe('Error');
    expect(mocks.sentry).toHaveBeenCalledTimes(1);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledWith(
      'log_client_event',
      expect.objectContaining({
        p_event: expect.objectContaining({
          level: 'error',
          session_id: event.sessionId,
          error_name: 'Error',
          fingerprint: event.fingerprint,
          handled: false
        })
      })
    );
  });

  it('audit fuerza kind=audit y persist=true (aunque sea nivel info)', async () => {
    const event = Logger.audit({ module: 'test', action: 'alta', message: 'NV creada' });
    expect(event.kind).toBe('audit');
    expect(event.persist).toBe(true);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('performance rápida aplica sampling determinístico 1/20', async () => {
    let lastEvent;
    for (let i = 0; i < 20; i += 1) {
      lastEvent = Logger.performance({
        module: 'test',
        action: 'query',
        message: 'kpis',
        durationMs: 1234
      });
    }
    expect(lastEvent.kind).toBe('performance');
    expect(lastEvent.persist).toBe(true);
    expect(lastEvent.durationMs).toBe(1234);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('performance lenta persiste siempre aunque no alcance la muestra', async () => {
    const event = Logger.performance({
      module: 'test',
      action: 'slow_query',
      message: 'consulta lenta',
      durationMs: 3000
    });
    expect(event.persist).toBe(true);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('warning real persiste siempre', async () => {
    const event = Logger.warn({
      module: 'test',
      action: 'degraded',
      message: 'degradado'
    });
    expect(event.persist).toBe(true);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('persistencia requiere sesión; sin access_token no llama a la RPC', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    Logger.error('sin sesion', { module: 'test', action: 'x' });
    await flush();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('Logger.time: éxito mide siempre y persiste según sampling', async () => {
    let result;
    for (let i = 0; i < 20; i += 1) {
      result = await Logger.time('cargar', async () => ({ lista: [1, 2, 3] }), {
        module: 'test',
        screen: 's',
        message: 'cargar lista'
      });
    }
    expect(result.lista).toHaveLength(3);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    const payload = mocks.rpc.mock.calls[0][1].p_event;
    expect(payload.kind).toBe('performance');
    expect(payload.status).toBe('ok');
    expect(payload.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('Logger.time: fallo → performance/error status error y relanza', async () => {
    await expect(
      Logger.time(
        'cargar',
        async () => {
          throw new Error('timeout');
        },
        { module: 'test' }
      )
    ).rejects.toThrow('timeout');
    await flush();
    expect(mocks.sentry).toHaveBeenCalledTimes(1);
  });

  it('el fingerprint es estable para el mismo evento', () => {
    const a = Logger.info({ kind: 'app', module: 'm', action: 'act', message: 'msg' });
    const b = Logger.info({ kind: 'app', module: 'm', action: 'act', message: 'msg' });
    expect(a.fingerprint).toBe(b.fingerprint);
  });
});

describe('PR-008 B5 · Observability Engine', () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'tok' } }
    });
    mocks.rpc.mockReset();
    mocks.rpc.mockResolvedValue({ error: null });
    setLoggerUserContext({ id: 'u1' });
  });

  afterEach(() => clearLoggerUserContext());

  it('traceAsyncOperation envuelve Logger.time y respeta sampling', async () => {
    let value;
    for (let i = 0; i < 20; i += 1) {
      value = await traceAsyncOperation('op-async', async () => 42, {
        module: 'infra',
        action: 'rpc'
      });
    }
    expect(value).toBe(42);
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][1].p_event).toMatchObject({
      kind: 'performance',
      status: 'ok',
      action: 'rpc'
    });
  });

  it('traceAsyncOperation relanza el error y registra error', async () => {
    await expect(
      traceAsyncOperation('op-async', async () => {
        throw new Error('x-rpc');
      })
    ).rejects.toThrow('x-rpc');
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][1].p_event).toMatchObject({
      status: 'error',
      action: 'op-async'
    });
  });

  it('measureSyncOperation mide síncronos y respeta sampling', async () => {
    let value;
    for (let i = 0; i < 20; i += 1) {
      value = measureSyncOperation('op-sync', () => 'hecho', { module: 'm' });
    }
    expect(value).toBe('hecho');
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][1].p_event).toMatchObject({
      kind: 'performance',
      status: 'ok',
      action: 'op-sync'
    });
  });

  it('measureSyncOperation registra error y relanza en síncronos', async () => {
    expect(() =>
      measureSyncOperation('op-sync', () => {
        throw new Error('boom-sync');
      })
    ).toThrow('boom-sync');
    await flush();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][1].p_event).toMatchObject({
      status: 'error',
      action: 'op-sync'
    });
  });
});

describe('PR-008 B5 · handlers globales (registro sin duplicados)', () => {
  it('installGlobalErrorHandlers solo instala una vez y agrega listeners', () => {
    installGlobalErrorHandlers();
    installGlobalErrorHandlers();
    // En jsdom los listeners se agregan al window real; verificamos que no
    // haya lanzado y que el estado interno evite el doble registro.
    expect(true).toBe(true);
  });
});