import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { syncEventEmitter } from '../lib/syncManager';

export const useSyncQueueCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      try {
        const c = await db.syncQueue.count();
        setCount(c);
      } catch (_) {}
    };

    // Initial count
    updateCount();

    // Listen for updates
    const handleUpdate = () => updateCount();
    syncEventEmitter.addEventListener('queueUpdated', handleUpdate);

    // Also update on online/offline events
    window.addEventListener('online', handleUpdate);
    window.addEventListener('offline', handleUpdate);

    return () => {
      syncEventEmitter.removeEventListener('queueUpdated', handleUpdate);
      window.removeEventListener('online', handleUpdate);
      window.removeEventListener('offline', handleUpdate);
    };
  }, []);

  return count;
};
