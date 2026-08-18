import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  isOnline,
  isIdle,
  getSessionDuration,
  getLastSeenText,
  HEARTBEAT_MS,
  ONLINE_THRESHOLD_S,
  IDLE_THRESHOLD_S
} from '../lib/presence';
import { usePresenceTracker } from '../hooks/usePresence';

// ── PR-008 B4 · Contrato de presencia ────────────────────────────────────────
// Tracker (usePresenceTracker): heartbeat 90 s → escribe last_seen /
// current_module / current_path / session_start en tms_usuarios.
// Monitor (AdminMonitor): online < 180 s, idle 180–300 s.
// Este test blinda los umbrales y el ciclo de vida del heartbeat para que un
// cambio futuro no rompa la lectura del Admin Monitor ni la carga de escrituras.

const mocks = vi.hoisted(() => {
  const getSession = vi.fn();
  const update = vi.fn();
  const from = vi.fn(() => ({ update }));
  return { getSession, update, from };
});

vi.mock('../supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: mocks.from
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-test', nombre: 'Test', rol: 'OPERADOR' } })
}));

const ISO_ANTES = new Date('2026-08-18T12:00:00.000Z');
const baseNow = () => ISO_ANTES.getTime();

describe('PR-008 B4 · umbrales del Monitor (presence.js)', () => {
  it('isOnline: true bajo 180 s, false a partir de 180 s (3 heartbeats de 90 s)', () => {
    expect(isOnline(new Date(baseNow() - 179000), ISO_ANTES)).toBe(true);
    expect(isOnline(new Date(baseNow() - 180000), ISO_ANTES)).toBe(false);
    expect(isOnline(null, ISO_ANTES)).toBe(false);
  });

  it('isIdle: true entre 180 y 300 s, false fuera de esa ventana', () => {
    expect(isIdle(new Date(baseNow() - 180000), ISO_ANTES)).toBe(true);
    expect(isIdle(new Date(baseNow() - 299000), ISO_ANTES)).toBe(true);
    expect(isIdle(new Date(baseNow() - 300000), ISO_ANTES)).toBe(false);
    expect(isIdle(new Date(baseNow() - 179000), ISO_ANTES)).toBe(false);
  });

  it('los umbrales son compatibles con el heartbeat (ONLINE = 2x HEARTBEAT)', () => {
    expect(ONLINE_THRESHOLD_S).toBe((HEARTBEAT_MS / 1000) * 2);
    expect(IDLE_THRESHOLD_S).toBe(ONLINE_THRESHOLD_S + 120);
  });

  it('getSessionDuration formatea segundos, minutos y horas', () => {
    expect(getSessionDuration(new Date(baseNow() - 45000), ISO_ANTES)).toBe('45s');
    expect(getSessionDuration(new Date(baseNow() - 90000), ISO_ANTES)).toBe('1m');
    expect(getSessionDuration(new Date(baseNow() - 7200000), ISO_ANTES)).toBe('2h 0m');
    expect(getSessionDuration(null, ISO_ANTES)).toBe('-');
  });

  it('getLastSeenText es legible y nunca lanza con null', () => {
    expect(getLastSeenText(null, ISO_ANTES)).toBe('Nunca');
    expect(getLastSeenText(new Date(baseNow() - 5000), ISO_ANTES)).toBe('Ahora');
    expect(getLastSeenText(new Date(baseNow() - 30000), ISO_ANTES)).toBe('Hace 30s');
    expect(getLastSeenText(new Date(baseNow() - 600000), ISO_ANTES)).toBe('Hace 10m');
    expect(getLastSeenText(new Date(baseNow() - 7200000), ISO_ANTES)).toBe('Hace 2h');
  });
});

describe('PR-008 B4 · ciclo de vida del tracker (usePresenceTracker)', () => {
  let originalVisibility;
  let timestamp;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(ISO_ANTES);
    timestamp = ISO_ANTES.toISOString();
    originalVisibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'tok-test' } }
    });
    mocks.update.mockReset();
    mocks.update.mockReturnValue({ eq: vi.fn(() => ({ error: null })) });
  });

  afterEach(() => {
    if (originalVisibility) Object.defineProperty(document, 'visibilityState', originalVisibility);
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('startTracking escribe de inmediato con session_start fijo', async () => {
    const { result } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
    });
    expect(mocks.from).toHaveBeenCalledWith('tms_usuarios');
    expect(mocks.update).toHaveBeenCalledTimes(1);
    const payload = mocks.update.mock.calls[0][0];
    expect(payload.last_seen).toBe(timestamp);
    expect(payload.current_module).toBe('Monitor Tiempo Real');
    expect(payload.current_path).toBe('/admin/monitor');
    expect(payload.session_start).toBe(timestamp);
  });

  it('heartbeat: escribe cada 90 s reutilizando el MISMO session_start', async () => {
    const { result } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
    });
    await act(async () => {
      vi.advanceTimersByTime(HEARTBEAT_MS);
    });
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.update.mock.calls[1][0].session_start).toBe(timestamp);
    await act(async () => {
      vi.advanceTimersByTime(HEARTBEAT_MS);
    });
    expect(mocks.update).toHaveBeenCalledTimes(3);
  });

  it('no escribe si el documento está oculto (visibilityState hidden)', async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    const { result } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('no escribe sin sesión (sin access_token)', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null }
    });
    const { result } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('updatePath refleja la ruta nueva en la siguiente escritura', async () => {
    const { result } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
      result.current.updatePath('/admin/users');
    });
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.update.mock.calls[1][0].current_path).toBe('/admin/users');
    expect(mocks.update.mock.calls[1][0].current_module).toBe('Usuarios');
  });

  it('unmount detiene el heartbeat (no más escrituras)', async () => {
    const { result, unmount } = renderHook(() => usePresenceTracker());
    await act(async () => {
      result.current.startTracking('/admin/monitor');
    });
    const trasStart = mocks.update.mock.calls.length;
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(HEARTBEAT_MS * 3);
    });
    expect(mocks.update.mock.calls.length).toBe(trasStart);
  });
});
