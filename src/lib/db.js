import Dexie from 'dexie';

// Configuración de base de datos local para modo Offline
export const wmsDB = new Dexie('WMS_Offline_DB');

wmsDB.version(1).stores({
  offlineQueue: '++id, action, payload, status, createdAt', // Cola de operaciones (ej: move_stock, cycle_count)
  cachedLocations: 'id, name, type', // Caché de ubicaciones para lectura offline
  cachedProducts: 'sku, name, barcode' // Caché de productos
});

/**
 * Añade una acción a la cola offline
 */
export const addToSyncQueue = async (action, payload) => {
  try {
    await wmsDB.offlineQueue.add({
      action,
      payload,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    console.log(`📦 Acción guardada offline: ${action}`);
  } catch (error) {
    console.error('Error guardando en Dexie:', error);
  }
};

/**
 * Procesa la cola cuando vuelve la conexión
 */
export const processSyncQueue = async (syncFunction) => {
  try {
    const pendingItems = await wmsDB.offlineQueue.where('status').equals('PENDING').toArray();
    
    if (pendingItems.length === 0) return;
    
    console.log(`🔄 Sincronizando ${pendingItems.length} operaciones pendientes...`);
    
    for (const item of pendingItems) {
      try {
        await syncFunction(item.action, item.payload);
        // Si tiene éxito, actualiza el estado a completado
        await wmsDB.offlineQueue.update(item.id, { status: 'COMPLETED' });
      } catch (err) {
        console.error(`❌ Error sincronizando item ${item.id}:`, err);
        // Mantener pendiente si falla
      }
    }
    
    // Limpiar completados
    await wmsDB.offlineQueue.where('status').equals('COMPLETED').delete();
    console.log('✅ Sincronización offline completada.');
    
  } catch (error) {
    console.error('Error procesando cola Dexie:', error);
  }
};