import { db } from './db';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const MAX_RETRIES = 5;

// Emitter for queue updates
export const syncEventEmitter = new EventTarget();

export const emitQueueUpdate = () => {
  syncEventEmitter.dispatchEvent(new Event('queueUpdated'));
};

export const syncOfflineData = async () => {
  if (!navigator.onLine) return;

  const allItems = await db.syncQueue.toArray();
  const now = Date.now();
  
  // Filter items that are pending, or failed but ready for retry
  const pendingItems = allItems.filter(item => {
    if (item.status === 'pending') return true;
    if (item.status === 'failed' && item.retryCount < MAX_RETRIES) {
      // Exponential backoff: 2^retryCount * 1000 ms (1s, 2s, 4s, 8s, 16s)
      const backoffDelay = Math.pow(2, item.retryCount || 0) * 1000;
      const nextRetry = (item.lastAttempt || item.createdAt) + backoffDelay;
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
      if (item.action === 'move_stock') {
        const { error } = await supabase.rpc('wms_move_stock', item.payload);
        if (error) throw error;
      } else if (item.action === 'update_picking') {
        const { error } = await supabase.from('tms_mediciones_tiempos').update(item.payload.data).eq('id', item.payload.id);
        if (error) throw error;
      }
      // Add other actions here as needed...

      // Mark as completed
      await db.syncQueue.delete(item.id);
      successCount++;
    } catch (error) {
      console.error('Error syncing item:', item, error);
      const newRetryCount = (item.retryCount || 0) + 1;
      
      await db.syncQueue.update(item.id, { 
        status: 'failed',
        retryCount: newRetryCount,
        lastAttempt: Date.now()
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
};

// Listen to online events globally
window.addEventListener('online', syncOfflineData);

// Set interval to retry failed items periodically
setInterval(() => {
  if (navigator.onLine) {
    syncOfflineData();
  }
}, 10000); // Check every 10 seconds

// Add items to queue
export const enqueueOfflineAction = async (action, payload) => {
  await db.syncQueue.add({
    action,
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
    lastAttempt: null
  });
  
  emitQueueUpdate();
  
  toast.warning('Operación guardada localmente (Modo Offline).', {
    description: 'Se sincronizará automáticamente al recuperar la conexión.'
  });
};
