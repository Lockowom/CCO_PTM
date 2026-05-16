import Dexie from 'dexie';

// Configuración de base de datos local para modo Offline
export const db = new Dexie('WMS_Offline_DB');

// Version 2 (Legacy) - NUNCA ELIMINAR, solo aditivo
db.version(2).stores({
  syncQueue: '++id, action, status, createdAt, nextRetry', 
  cachedLocations: 'id, name, type', 
  cachedProducts: 'sku, name, barcode'
});

// Version 3 (Actual) - Patrón robusto de Sync Queue
db.version(3).stores({
  // Mantenemos las tablas anteriores
  cachedLocations: 'id, name, type', 
  cachedProducts: 'sku, name, barcode',
  // Nueva estructura de syncQueue
  syncQueue: '++id, type, tableName, recordId, status, timestamp, retryCount'
});

