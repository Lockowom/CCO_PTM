import Dexie from 'dexie';

// Configuración de base de datos local para modo Offline
export const db = new Dexie('WMS_Offline_DB');

db.version(2).stores({
  syncQueue: '++id, action, status, createdAt, nextRetry', // Cola de operaciones
  cachedLocations: 'id, name, type', // Caché de ubicaciones para lectura offline
  cachedProducts: 'sku, name, barcode' // Caché de productos
});
