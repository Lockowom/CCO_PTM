import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/db';
import { syncEventEmitter, syncOfflineData } from '../lib/syncManager';

/**
 * Estado de la cola de sincronización offline (Dexie + syncManager).
 * Devuelve cuántas operaciones están pendientes de subir y cuántas fallaron,
 * y una función para forzar la sincronización. Se actualiza al encolar/sincronizar
 * (evento 'queueUpdated'), al reconectar, y con un poll de respaldo.
 */
export default function useSyncQueue() {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const items = await db.syncQueue.toArray();
      setPending(items.filter((i) => i.status === 'pending' || i.status === 'syncing' || i.status === 'failed').length);
      setFailed(items.filter((i) => i.status === 'dead').length);
    } catch {
      /* Dexie no disponible: deja los contadores como están */
    }
  }, []);

  useEffect(() => {
    refresh();
    const onQueue = () => refresh();
    syncEventEmitter.addEventListener('queueUpdated', onQueue);
    window.addEventListener('online', onQueue);
    const poll = setInterval(refresh, 5000);
    return () => {
      syncEventEmitter.removeEventListener('queueUpdated', onQueue);
      window.removeEventListener('online', onQueue);
      clearInterval(poll);
    };
  }, [refresh]);

  const syncNow = useCallback(() => { syncOfflineData(); }, []);

  return { pending, failed, syncNow, refresh };
}
