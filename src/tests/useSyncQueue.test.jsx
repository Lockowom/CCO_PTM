import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';

// Cola simulada (Dexie) con distintos estados.
const mockItems = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'syncing' },
  { id: 3, status: 'failed' },
  { id: 4, status: 'dead' },   // agotó reintentos → cuenta como "failed" en la UI
];
vi.mock('../lib/db', () => ({
  db: { syncQueue: { toArray: vi.fn(() => Promise.resolve(mockItems)) } },
}));
vi.mock('../lib/syncManager', () => ({
  syncEventEmitter: new EventTarget(),
  syncOfflineData: vi.fn(),
}));

import useSyncQueue from '../hooks/useSyncQueue';
import { syncOfflineData } from '../lib/syncManager';

describe('useSyncQueue — contador de cola offline del PDA', () => {
  beforeEach(() => cleanup());

  it('cuenta pendientes (pending+syncing+failed) y fallidos (dead) por separado', async () => {
    const { result } = renderHook(() => useSyncQueue());
    await waitFor(() => expect(result.current.pending).toBe(3));
    expect(result.current.failed).toBe(1);
  });

  it('syncNow dispara la sincronización', async () => {
    const { result } = renderHook(() => useSyncQueue());
    await waitFor(() => expect(result.current.pending).toBe(3));
    result.current.syncNow();
    expect(syncOfflineData).toHaveBeenCalled();
  });
});
