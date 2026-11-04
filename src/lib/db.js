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

// Version 4 (PR-011) - Cola offline por usuario (user-scoped).
// Solo aditivo: agrega el índice `userId` a syncQueue para poder filtrar los
// items del usuario actual en dispositivos compartidos.
db.version(4).stores({
  cachedLocations: 'id, name, type',
  cachedProducts: 'sku, name, barcode',
  syncQueue: '++id, type, tableName, recordId, status, timestamp, retryCount, userId'
});

// Version 5 (CCO 2.0) - contrato auditable e idempotente. Los campos legacy se
// conservan para que bundles móviles anteriores puedan convivir durante el
// cutover; los nuevos consumidores usan userId + idempotencyKey.
db.version(5).stores({
  cachedLocations: 'id, name, type',
  cachedProducts: 'sku, name, barcode',
  syncQueue:
    '++id, type, tableName, recordId, status, timestamp, retryCount, userId, idempotencyKey, module, action'
});

// Version 6 (QUALITY-OFFLINE-001) - almacén separado de Calidad. Nunca se
// mezcla con la cola genérica de inventario para impedir que un borrador offline
// pueda producir movimientos de stock o ejecuciones RPC ajenas al módulo.
db.version(6).stores({
  cachedLocations: 'id, name, type',
  cachedProducts: 'sku, name, barcode',
  syncQueue:
    '++id, type, tableName, recordId, status, timestamp, retryCount, userId, idempotencyKey, module, action',
  qualityOfflineTasks:
    '++id, [userId+taskKey], userId, taskKey, hito, tareaId, cachedAt, sourceUpdatedAt',
  qualityOfflineCommands:
    '++id, [userId+idempotencyKey], userId, idempotencyKey, hito, tareaId, status, createdAt',
  qualityOfflineEvidence: '++id, [userId+localId], userId, localId, tareaId, createdAt'
});
