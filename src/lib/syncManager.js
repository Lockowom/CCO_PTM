import { db } from './db';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const MAX_RETRIES = 5;
const SYNC_INTERVAL = 15000;

export const syncEventEmitter = new EventTarget();

export const emitQueueUpdate = () => {
  syncEventEmitter.dispatchEvent(new Event('queueUpdated'));
};

export const enqueueSyncItem = async ({ type, tableName, recordId, data, conflictResolution = 'client_wins' }) => {
  await db.syncQueue.add({
    type,
    tableName,
    recordId,
    data,
    status: 'pending',
    timestamp: Date.now(),
    retryCount: 0,
    conflictResolution,
    lastAttempt: null
  });

  emitQueueUpdate();

  toast.warning('Operación guardada localmente (Modo Offline).', {
    description: 'Se sincronizará automáticamente al recuperar la conexión.'
  });
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

  await enqueueSyncItem({ type, tableName, recordId, data });
};

let isSyncing = false;

export const syncOfflineData = async () => {
  if (!navigator.onLine || isSyncing) return;
  isSyncing = true;

  try {
    const allItems = await db.syncQueue.toArray();
    const now = Date.now();

    const pendingItems = allItems.filter(item => {
      if (item.status === 'pending') return true;
      if (item.status === 'failed' && item.retryCount < MAX_RETRIES) {
        const backoffDelay = Math.pow(2, item.retryCount || 0) * 1000;
        const nextRetry = (item.lastAttempt || item.timestamp || item.createdAt) + backoffDelay;
        return now >= nextRetry;
      }
      return false;
    });

    if (pendingItems.length === 0) return;

    toast.info(`Sincronizando ${pendingItems.length} operaciones pendientes...`, {
      id: 'offline-sync'
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
        } else if (item.type === 'update') {
          const { error } = await supabase.from(item.tableName).update(item.data).eq('id', item.recordId);
          if (error) throw error;
        } else if (item.type === 'create') {
          const { error } = await supabase.from(item.tableName).insert(item.data);
          if (error) throw error;
        } else if (item.type === 'delete') {
          const { error } = await supabase.from(item.tableName).delete().eq('id', item.recordId);
          if (error) throw error;
        }

        await db.syncQueue.delete(item.id);
        successCount++;
      } catch (error) {
        const newRetryCount = (item.retryCount || 0) + 1;
        await db.syncQueue.update(item.id, {
          status: 'failed',
          retryCount: newRetryCount,
          lastAttempt: Date.now(),
          lastError: error.message
        });
        failCount++;
      }
    }

    emitQueueUpdate();

    if (successCount > 0) {
      toast.success(`${successCount} operaciones sincronizadas con éxito.`, {
        id: 'offline-sync'
      });
    }

    if (failCount > 0) {
      toast.error(`${failCount} operaciones fallaron al sincronizar. Reintentando luego...`, {
        id: 'offline-sync-error'
      });
    }
  } finally {
    isSyncing = false;
  }
};

let syncDebounceTimer = null;
const debouncedSync = () => {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(syncOfflineData, 1000);
};

window.addEventListener('online', debouncedSync);

setInterval(() => {
  if (navigator.onLine) {
    syncOfflineData();
  }
}, SYNC_INTERVAL);
