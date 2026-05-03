import { db } from './db';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export const syncOfflineData = async () => {
  if (!navigator.onLine) return;

  const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
  
  if (pendingItems.length === 0) return;

  toast.info(`Sincronizando ${pendingItems.length} operaciones pendientes...`, {
    id: 'offline-sync'
  });

  let successCount = 0;
  let failCount = 0;

  for (const item of pendingItems) {
    try {
      if (item.action === 'move_stock') {
        const { error } = await supabase.rpc('move_stock', item.payload);
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
      await db.syncQueue.update(item.id, { status: 'failed' });
      failCount++;
    }
  }

  if (successCount > 0) {
    toast.success(`${successCount} operaciones sincronizadas con éxito.`, {
      id: 'offline-sync'
    });
  }
  
  if (failCount > 0) {
    toast.error(`${failCount} operaciones fallaron al sincronizar. Revisa la consola.`, {
      id: 'offline-sync-error'
    });
  }
};

// Listen to online events globally
window.addEventListener('online', syncOfflineData);

// Add items to queue
export const enqueueOfflineAction = async (action, payload) => {
  await db.syncQueue.add({
    action,
    payload,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  toast.warning('Operación guardada localmente (Modo Offline).', {
    description: 'Se sincronizará automáticamente al recuperar la conexión.'
  });
};
