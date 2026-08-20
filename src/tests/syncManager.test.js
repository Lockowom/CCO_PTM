import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──

// Mock Dexie DB
const mockSyncQueue = {
  count: vi.fn(),
  add: vi.fn(),
  toArray: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

vi.mock('../lib/db', () => ({
  db: { syncQueue: mockSyncQueue }
}));

// Mock Supabase
const mockSupabase = {
  rpc: vi.fn(),
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    upsert: vi.fn(),
    update: vi.fn(() => ({ eq: vi.fn() })),
    insert: vi.fn(),
    delete: vi.fn(() => ({ eq: vi.fn() }))
  }))
};

vi.mock('../supabase', () => ({
  supabase: mockSupabase
}));

// Import after mocks
const {
  enqueueSyncItem,
  enqueueUpsert,
  enqueueOfflineAction,
  syncOfflineData,
  getFailedItems,
  retryItem,
  removeItem
} = await import('../lib/syncManager');

// ── Tests ──

describe('syncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncQueue.count.mockResolvedValue(0);
    mockSyncQueue.add.mockResolvedValue(1);
    mockSyncQueue.toArray.mockResolvedValue([]);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  // ─── enqueueSyncItem ───

  describe('enqueueSyncItem', () => {
    it('encola un item correctamente', async () => {
      const result = await enqueueSyncItem({
        type: 'upsert',
        tableName: 'wms_ubicaciones',
        recordId: 'test-1',
        data: { ubicacion: 'A-01-1', codigo: 'SKU001' },
        onConflict: 'ubicacion,codigo'
      });

      expect(result).toBe(true);
      expect(mockSyncQueue.add).toHaveBeenCalledOnce();
      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.type).toBe('upsert');
      expect(addedItem.tableName).toBe('wms_ubicaciones');
      expect(addedItem.status).toBe('pending');
      expect(addedItem.retryCount).toBe(0);
      expect(addedItem.onConflict).toBe('ubicacion,codigo');
      expect(addedItem.userId).toBe('user-1');
      expect(addedItem.idempotencyKey).toMatch(/^cco:/);
    });

    it('rechaza cuando la cola está llena (500 items)', async () => {
      mockSyncQueue.count.mockResolvedValue(500);

      const result = await enqueueSyncItem({
        type: 'insert',
        tableName: 'tms_nv_diarias',
        recordId: 'nv-1',
        data: { estado: 'PENDIENTE' }
      });

      expect(result).toBe(false);
      expect(mockSyncQueue.add).not.toHaveBeenCalled();
    });

    it('acepta item cuando la cola tiene 499 items', async () => {
      mockSyncQueue.count.mockResolvedValue(499);

      const result = await enqueueSyncItem({
        type: 'insert',
        tableName: 'tms_nv_diarias',
        recordId: 'nv-1',
        data: { estado: 'PENDIENTE' }
      });

      expect(result).toBe(true);
      expect(mockSyncQueue.add).toHaveBeenCalledOnce();
    });

    it('establece conflictResolution por defecto a client_wins', async () => {
      await enqueueSyncItem({
        type: 'upsert',
        tableName: 'test_table',
        recordId: '1',
        data: {}
      });

      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.conflictResolution).toBe('client_wins');
    });
  });

  // ─── enqueueUpsert ───

  describe('enqueueUpsert', () => {
    it('encola upsert batch con onConflict', async () => {
      const rows = [
        { ubicacion: 'A-01-1', codigo: 'SKU001', cantidad: 10 },
        { ubicacion: 'A-01-2', codigo: 'SKU002', cantidad: 5 }
      ];

      const result = await enqueueUpsert({
        tableName: 'wms_ubicaciones',
        data: rows,
        onConflict: 'ubicacion,codigo',
        userId: 'user-123'
      });

      expect(result).toBe(true);
      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.type).toBe('upsert');
      expect(addedItem.data).toHaveLength(2);
      expect(addedItem.userId).toBe('user-123');
      expect(addedItem.ignoreDuplicates).toBe(false);
      expect(addedItem.recordId).toMatch(/^batch_\d+$/);
    });

    it('conserva ignoreDuplicates para reintentos idempotentes', async () => {
      await enqueueUpsert({
        tableName: 'wms_putaway_ubicaciones',
        data: [{ ubicacion: 'A-01-1', codigo: 'SKU001' }],
        onConflict: 'ubicacion_normalizada,codigo_normalizado',
        ignoreDuplicates: true
      });

      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.ignoreDuplicates).toBe(true);
    });

    it('rechaza cuando la cola está llena', async () => {
      mockSyncQueue.count.mockResolvedValue(500);

      const result = await enqueueUpsert({
        tableName: 'test',
        data: [{ foo: 'bar' }]
      });

      expect(result).toBe(false);
    });
  });

  // ─── enqueueOfflineAction ───

  describe('enqueueOfflineAction', () => {
    it('encola update_picking como tipo update', async () => {
      await enqueueOfflineAction('update_picking', {
        id: 'pick-123',
        data: { estado: 'COMPLETADO', cantidad_real: 10 }
      });

      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.type).toBe('update');
      expect(addedItem.tableName).toBe('tms_mediciones_tiempos');
      expect(addedItem.recordId).toBe('pick-123');
    });

    it('encola acción genérica como RPC', async () => {
      await enqueueOfflineAction('move_stock', {
        from: 'A-01-1',
        to: 'B-02-3',
        qty: 5
      });

      const addedItem = mockSyncQueue.add.mock.calls[0][0];
      expect(addedItem.type).toBe('rpc');
      expect(addedItem.tableName).toBe('move_stock');
    });
  });

  // ─── syncOfflineData ───

  describe('syncOfflineData', () => {
    it('no sincroniza cuando está offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });

      await syncOfflineData();

      expect(mockSyncQueue.toArray).not.toHaveBeenCalled();
    });

    it('sincroniza items pendientes exitosamente (upsert)', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 1,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'wms_ubicaciones',
          data: [{ ubicacion: 'A-01-1', codigo: 'SKU001' }],
          onConflict: 'ubicacion,codigo',
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockSupabase.from).toHaveBeenCalledWith('wms_ubicaciones');
      expect(mockUpsert).toHaveBeenCalledWith([{ ubicacion: 'A-01-1', codigo: 'SKU001' }], {
        onConflict: 'ubicacion,codigo'
      });
      expect(mockSyncQueue.delete).toHaveBeenCalledWith(1);
    });

    it('sincroniza RPC (move_stock) correctamente', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 2,
          userId: 'user-1',
          type: 'rpc',
          tableName: 'move_stock',
          data: { from: 'A-01-1', to: 'B-02-3' },
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('wms_move_stock', {
        from: 'A-01-1',
        to: 'B-02-3'
      });
      expect(mockSyncQueue.delete).toHaveBeenCalledWith(2);
    });

    it('sincroniza un upsert idempotente sin actualizar el conflicto', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });
      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 22,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'wms_putaway_ubicaciones',
          data: [{ ubicacion: 'A-01-1', codigo: 'SKU001' }],
          onConflict: 'ubicacion_normalizada,codigo_normalizado',
          ignoreDuplicates: true,
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockUpsert).toHaveBeenCalledWith([{ ubicacion: 'A-01-1', codigo: 'SKU001' }], {
        onConflict: 'ubicacion_normalizada,codigo_normalizado',
        ignoreDuplicates: true
      });
      expect(mockSyncQueue.delete).toHaveBeenCalledWith(22);
    });

    it('marca item como failed en error y respeta backoff exponencial', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 3,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'test',
          data: [{ a: 1 }],
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockSyncQueue.update).toHaveBeenCalledWith(
        3,
        expect.objectContaining({
          status: 'failed',
          retryCount: 1,
          lastError: 'DB error'
        })
      );
      expect(mockSyncQueue.delete).not.toHaveBeenCalledWith(3);
    });

    it('marca item como dead después de MAX_RETRIES (8)', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'persistent error' } });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 4,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'test',
          data: [{ a: 1 }],
          status: 'failed',
          timestamp: Date.now() - 300000,
          retryCount: 7, // next attempt = 8 = MAX_RETRIES
          lastAttempt: Date.now() - 300000 // 5 min ago, well past 2^7=128s backoff
        }
      ]);

      await syncOfflineData();

      // Should have been updated to 'syncing' first, then to 'dead'
      const updateCalls = mockSyncQueue.update.mock.calls;
      const deadCall = updateCalls.find((c) => c[1].status === 'dead');
      expect(deadCall).toBeTruthy();
      expect(deadCall[1].retryCount).toBe(8);
    });

    it('respeta backoff exponencial - no reintenta demasiado pronto', async () => {
      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 5,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'test',
          data: [{ a: 1 }],
          status: 'failed',
          timestamp: Date.now(),
          retryCount: 5,
          lastAttempt: Date.now() // just attempted — backoff should block
        }
      ]);

      await syncOfflineData();

      // Should not attempt sync because backoff hasn't elapsed
      // (2^5 * 1000 = 32 seconds + jitter, lastAttempt is now)
      expect(mockSyncQueue.update).not.toHaveBeenCalled();
    });

    it('no procesa items con status dead', async () => {
      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 6,
          userId: 'user-1',
          type: 'upsert',
          tableName: 'test',
          data: [{ a: 1 }],
          status: 'dead',
          timestamp: Date.now(),
          retryCount: 8
        }
      ]);

      await syncOfflineData();

      expect(mockSyncQueue.update).not.toHaveBeenCalled();
    });

    it('sincroniza update correctamente', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 7,
          userId: 'user-1',
          type: 'update',
          tableName: 'tms_mediciones_tiempos',
          recordId: 'rec-123',
          data: { estado: 'COMPLETADO' },
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockSupabase.from).toHaveBeenCalledWith('tms_mediciones_tiempos');
      expect(mockUpdate).toHaveBeenCalledWith({ estado: 'COMPLETADO' });
      expect(mockEq).toHaveBeenCalledWith('id', 'rec-123');
    });

    it('sincroniza delete correctamente', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ delete: mockDelete });

      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 8,
          userId: 'user-1',
          type: 'delete',
          tableName: 'tms_nv_eliminadas',
          recordId: 'del-1',
          data: {},
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0
        }
      ]);

      await syncOfflineData();

      expect(mockSupabase.from).toHaveBeenCalledWith('tms_nv_eliminadas');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'del-1');
    });
  });

  // ─── Utilidades ───

  describe('getFailedItems', () => {
    it('retorna items dead y failed', async () => {
      mockSyncQueue.toArray.mockResolvedValue([
        { id: 1, userId: 'user-1', status: 'pending' },
        { id: 2, userId: 'user-1', status: 'failed', lastError: 'err1' },
        { id: 3, userId: 'user-1', status: 'dead', lastError: 'err2' },
        { id: 4, userId: 'user-1', status: 'syncing' }
      ]);

      const failed = await getFailedItems();

      expect(failed).toHaveLength(2);
      expect(failed.map((i) => i.id)).toEqual([2, 3]);
    });

    it('retorna array vacío en error', async () => {
      mockSyncQueue.toArray.mockRejectedValue(new Error('DB error'));

      const failed = await getFailedItems();

      expect(failed).toEqual([]);
    });
  });

  describe('retryItem', () => {
    it('resetea item a pending con retryCount 0', async () => {
      mockSyncQueue.update.mockResolvedValue(1);

      const result = await retryItem(42);

      expect(result).toBe(true);
      expect(mockSyncQueue.update).toHaveBeenCalledWith(42, {
        status: 'pending',
        retryCount: 0,
        lastAttempt: null
      });
    });
  });

  describe('PR-011 · user-scoped offline queue', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    });

    it('enqueueSyncItem etiqueta el item con el userId del usuario actual', async () => {
      await enqueueSyncItem({ type: 'rpc', tableName: 'wms_move_stock', recordId: 'x', data: {} });
      const added = mockSyncQueue.add.mock.calls[0][0];
      expect(added.userId).toBe('user-1');
    });

    it('enqueueUpsert etiqueta el item con el userId del usuario actual', async () => {
      await enqueueUpsert({ tableName: 'tms_operaciones', data: {} });
      const added = mockSyncQueue.add.mock.calls[0][0];
      expect(added.userId).toBe('user-1');
    });

    it('syncOfflineData sincroniza SOLO los items del usuario actual', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null });
      mockSyncQueue.toArray.mockResolvedValue([
        {
          id: 1,
          userId: 'user-1',
          type: 'rpc',
          tableName: 'wms_move_stock',
          recordId: 'a',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now()
        },
        {
          id: 2,
          userId: 'user-2',
          type: 'rpc',
          tableName: 'wms_move_stock',
          recordId: 'b',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now()
        },
        {
          id: 3,
          userId: null,
          type: 'rpc',
          tableName: 'wms_move_stock',
          recordId: 'c',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now()
        }
      ]);

      await syncOfflineData();

      const rpcCalls = mockSupabase.rpc.mock.calls.map((c) => c[1] && c[0]);
      expect(rpcCalls.filter(Boolean)).toEqual(['wms_move_stock']);
    });

    it('getFailedItems devuelve solo items del usuario actual', async () => {
      mockSyncQueue.toArray.mockResolvedValue([
        { id: 1, userId: 'user-1', status: 'dead' },
        { id: 2, userId: 'user-2', status: 'dead' },
        { id: 3, userId: null, status: 'failed' }
      ]);

      const failed = await getFailedItems();

      expect(failed.map((i) => i.id)).toEqual([1]);
    });

    it('sin sesión falla cerrado y no revela colas', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockSyncQueue.toArray.mockResolvedValue([
        { id: 1, userId: null, status: 'failed' },
        { id: 2, userId: 'otro', status: 'failed' }
      ]);

      const failed = await getFailedItems();

      expect(failed).toEqual([]);
    });

    it('sin sesión no permite encolar comandos', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await enqueueSyncItem({
        type: 'rpc',
        tableName: 'wms_move_stock',
        recordId: 'x',
        data: {}
      });

      expect(result).toBe(false);
      expect(mockSyncQueue.add).not.toHaveBeenCalled();
    });
  });
});
