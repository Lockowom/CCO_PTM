import { db } from './db';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const MAX_RETRIES = 8;
const SYNC_INTERVAL = 15000;
const MAX_QUEUE_SIZE = 500;
const MAX_AGE = 72 * 60 * 60 * 1000; // 72 horas (antes 24h)

export const syncEventEmitter = new EventTarget();

export const emitQueueUpdate = () => {
  syncEventEmitter.dispatchEvent(new Event('queueUpdated'));
};

// PR-011 · usuario actual para la cola offline (user-scoped).
// Devuelve el id del usuario autenticado o `null` si no hay sesión (o falla la
// lectura). La cola queda etiquetada con este valor para que en dispositivos
// compartidos cada usuario solo sincronice SUS operaciones.
export const getCurrentUserId = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
};

// PR-011 · filtra los items de cola del usuario actual.
// En un dispositivo compartido, los items de otros usuarios quedan visibles
// para auditoría (getFailedItems) pero NO se sincronizan por accidente.
export const filterQueueByUser = async (items) => {
  const userId = await getCurrentUserId();
  if (!userId) return items; // sin sesión: comportamiento legacy (global)
  return items.filter((item) => !item.userId || item.userId === userId);
};

// ── ENQUEUE ──
export const enqueueSyncItem = async ({
  type,
  tableName,
  recordId,
  data,
  onConflict,
  conflictResolution = 'client_wins',
  userId
}) => {
  // Protección contra cola infinita
  const currentCount = await db.syncQueue.count();
  if (currentCount >= MAX_QUEUE_SIZE) {
    toast.error(
      `Cola offline llena (${MAX_QUEUE_SIZE} items). Conecta a internet para sincronizar.`,
      {
        id: 'queue-full',
        duration: 10000
      }
    );
    return false;
  }

  await db.syncQueue.add({
    type,
    tableName,
    recordId,
    data,
    onConflict: onConflict || null,
    status: 'pending',
    timestamp: Date.now(),
    retryCount: 0,
    conflictResolution,
    lastAttempt: null,
    lastError: null,
    userId: userId || (await getCurrentUserId())
  });

  emitQueueUpdate();

  toast.warning('Operación guardada offline', {
    description: `Se sincronizará al recuperar conexión. Cola: ${currentCount + 1} pendientes.`,
    duration: 4000
  });

  return true;
};

export const enqueueOfflineAction = async (action, payload) => {
  let type = 'rpc';
  let tableName = action;
  let recordId = 'rpc_call';
  let data = payload;

  if (action === 'update_picking') {
    type = 'update';
    tableName = 'tms_mediciones_tiempos';
    recordId = payload.id;
    data = payload.data;
  }

  return await enqueueSyncItem({ type, tableName, recordId, data });
};

// ── Encolar un UPSERT (para Entry, DataImport, etc.) ──
export const enqueueUpsert = async ({
  tableName,
  data,
  onConflict,
  ignoreDuplicates = false,
  userId
}) => {
  const currentCount = await db.syncQueue.count();
  if (currentCount >= MAX_QUEUE_SIZE) {
    toast.error(`Cola offline llena (${MAX_QUEUE_SIZE} items).`, {
      id: 'queue-full',
      duration: 10000
    });
    return false;
  }

  await db.syncQueue.add({
    type: 'upsert',
    tableName,
    recordId: `batch_${Date.now()}`,
    data,
    onConflict: onConflict || null,
    ignoreDuplicates,
    status: 'pending',
    timestamp: Date.now(),
    retryCount: 0,
    conflictResolution: 'client_wins',
    lastAttempt: null,
    lastError: null,
    userId: userId || (await getCurrentUserId())
  });

  emitQueueUpdate();
  return true;
};

// ── SYNC ──
let isSyncing = false;

export const syncOfflineData = async () => {
  if (!navigator.onLine || isSyncing) return;
  isSyncing = true;

  try {
    const allItems = await db.syncQueue.toArray();
    const scopedItems = await filterQueueByUser(allItems);
    const now = Date.now();

    // Recuperación: items marcados 'syncing' por una corrida anterior que murió
    // a mitad (cierre de app/WebView, recarga, crash) quedarían atascados para
    // siempre — el filtro de reintento solo reincluye 'pending'/'failed' y el
    // cleanup los excluye. Los devolvemos a 'pending' para no perder la operación.
    const stuck = scopedItems.filter((it) => it.status === 'syncing');
    if (stuck.length > 0) {
      await Promise.all(
        stuck.map((it) =>
          db.syncQueue.update(it.id, {
            status: 'pending',
            lastError: 'Reintento tras corte a mitad de sync'
          })
        )
      );
      // Reflejar el cambio en el array local para que el filtro los reincluya ya.
      stuck.forEach((it) => {
        it.status = 'pending';
      });
    }

    const pendingItems = scopedItems.filter((item) => {
      if (item.status === 'pending') return true;
      if (item.status === 'failed' && item.retryCount < MAX_RETRIES) {
        // Backoff exponencial con jitter para evitar thundering herd
        const baseDelay = Math.pow(2, item.retryCount || 0) * 1000;
        const jitter = Math.random() * 1000;
        const nextRetry = (item.lastAttempt || item.timestamp) + baseDelay + jitter;
        return now >= nextRetry;
      }
      return false;
    });

    if (pendingItems.length === 0) return;

    toast.info(`Sincronizando ${pendingItems.length} operaciones...`, {
      id: 'offline-sync',
      duration: 3000
    });

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingItems) {
      try {
        await db.syncQueue.update(item.id, { status: 'syncing' });

        if (item.type === 'rpc' || (!item.type && item.action === 'move_stock')) {
          const rpcName = item.tableName === 'move_stock' ? 'wms_move_stock' : item.tableName;
          const { error } = await supabase.rpc(rpcName, item.data || item.payload);
          if (error) throw error;
        } else if (item.type === 'upsert') {
          // Soporte para upsert batch (Entry, DataImport)
          const rows = Array.isArray(item.data) ? item.data : [item.data];
          const upsertOptions = item.onConflict ? { onConflict: item.onConflict } : {};
          if (item.ignoreDuplicates) upsertOptions.ignoreDuplicates = true;
          const { error } = await supabase.from(item.tableName).upsert(rows, upsertOptions);
          if (error) throw error;
        } else if (item.type === 'update') {
          const { error } = await supabase
            .from(item.tableName)
            .update(item.data)
            .eq('id', item.recordId);
          if (error) throw error;
        } else if (item.type === 'create' || item.type === 'insert') {
          const rows = Array.isArray(item.data) ? item.data : [item.data];
          const { error } = await supabase.from(item.tableName).insert(rows);
          if (error) throw error;
        } else if (item.type === 'delete') {
          const { error } = await supabase.from(item.tableName).delete().eq('id', item.recordId);
          if (error) throw error;
        }

        // Éxito → eliminar de cola
        await db.syncQueue.delete(item.id);
        successCount++;
      } catch (error) {
        const newRetryCount = (item.retryCount || 0) + 1;
        const isMaxRetries = newRetryCount >= MAX_RETRIES;

        await db.syncQueue.update(item.id, {
          status: isMaxRetries ? 'dead' : 'failed',
          retryCount: newRetryCount,
          lastAttempt: Date.now(),
          lastError: error.message || 'Error desconocido'
        });

        failCount++;

        // Si agotó reintentos, notificar al usuario
        if (isMaxRetries) {
          console.error(`[SyncManager] Item ${item.id} agotó reintentos:`, {
            type: item.type,
            table: item.tableName,
            error: error.message
          });
        }
      }
    }

    emitQueueUpdate();

    if (successCount > 0) {
      toast.success(
        `${successCount} operacion${successCount > 1 ? 'es' : ''} sincronizada${successCount > 1 ? 's' : ''}.`,
        {
          id: 'offline-sync'
        }
      );
    }

    if (failCount > 0) {
      toast.error(
        `${failCount} operacion${failCount > 1 ? 'es' : ''} fallaron. Se reintentará${failCount > 1 ? 'n' : ''}.`,
        {
          id: 'offline-sync-error'
        }
      );
    }
  } catch (err) {
    console.error('[SyncManager] Error general de sincronización:', err);
  } finally {
    isSyncing = false;
  }
};

// ── CLEANUP (sin borrado silencioso) ──
const cleanupStaleItems = async () => {
  try {
    const allItems = await db.syncQueue.toArray();
    const scopedItems = await filterQueueByUser(allItems);
    const now = Date.now();
    let expiredCount = 0;

    for (const item of scopedItems) {
      const age = now - (item.timestamp || 0);

      if (item.status === 'dead') {
        // Items que agotaron reintentos: mantener 72h para auditoría, luego marcar
        if (age > MAX_AGE) {
          // Loguear antes de eliminar
          console.warn('[SyncManager] Eliminando item muerto por antigüedad:', {
            id: item.id,
            type: item.type,
            table: item.tableName,
            error: item.lastError,
            retries: item.retryCount,
            age: Math.round(age / 3600000) + 'h'
          });
          await db.syncQueue.delete(item.id);
          expiredCount++;
        }
      } else if (age > MAX_AGE && item.status !== 'syncing') {
        // Items pendientes/fallidos que llevan > 72h sin resolverse
        console.warn('[SyncManager] Item expirado:', {
          id: item.id,
          type: item.type,
          table: item.tableName,
          status: item.status,
          age: Math.round(age / 3600000) + 'h'
        });
        await db.syncQueue.update(item.id, {
          status: 'dead',
          lastError: 'Expirado por antigüedad (72h)'
        });
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      emitQueueUpdate();
      toast.warning(`${expiredCount} operaciones offline expiraron sin sincronizar.`, {
        description: 'Revisa la cola de sincronización.',
        duration: 10000,
        id: 'sync-expired'
      });
    }
  } catch (err) {
    console.error('[SyncManager] Cleanup error:', err);
  }
};

// ── UTILIDADES ──

// Obtener items fallidos/muertos para UI de auditoría (solo del usuario actual)
export const getFailedItems = async () => {
  try {
    const allItems = await db.syncQueue.toArray();
    const scoped = await filterQueueByUser(allItems);
    return scoped.filter((item) => item.status === 'dead' || item.status === 'failed');
  } catch {
    return [];
  }
};

// Reintentar un item específico manualmente
export const retryItem = async (itemId) => {
  try {
    await db.syncQueue.update(itemId, { status: 'pending', retryCount: 0, lastAttempt: null });
    emitQueueUpdate();
    syncOfflineData();
    return true;
  } catch {
    return false;
  }
};

// Eliminar un item manualmente (con confirmación)
export const removeItem = async (itemId) => {
  try {
    await db.syncQueue.delete(itemId);
    emitQueueUpdate();
    return true;
  } catch {
    return false;
  }
};

// ── LISTENERS ──
let syncDebounceTimer = null;
const debouncedSync = () => {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(syncOfflineData, 1000);
};

window.addEventListener('online', () => {
  toast.success('Conexión recuperada. Sincronizando...', { id: 'online-status', duration: 3000 });
  debouncedSync();
});

window.addEventListener('offline', () => {
  toast.warning('Sin conexión. Las operaciones se guardarán localmente.', {
    id: 'online-status',
    duration: 5000
  });
});

// Cleanup cada 10 minutos (antes 5 min)
setInterval(cleanupStaleItems, 10 * 60 * 1000);
cleanupStaleItems();

// Sync periódico
setInterval(() => {
  if (navigator.onLine) syncOfflineData();
}, SYNC_INTERVAL);
