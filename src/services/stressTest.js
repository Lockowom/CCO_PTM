// Script para simular carga masiva (Stress Test)
// Ejecutar en consola del navegador o como script Node.js
import { supabase } from '../supabase';

export const StressTest = {
  async runPickingSimulation(users = 50, durationSeconds = 30) {
    console.log(`🚀 Iniciando simulación de carga: ${users} usuarios durante ${durationSeconds}s`);
    
    let successes = 0;
    let failures = 0;
    const startTime = Date.now();

    // Crear promesas para simular usuarios concurrentes
    const userAgents = Array.from({ length: users }).map(async (_, i) => {
      const userId = `stress-user-${i}`;
      
      while (Date.now() - startTime < durationSeconds * 1000) {
        try {
          // Intentar tomar stock del mismo producto (Alta contención)
          const { error } = await supabase.rpc('wms_move_stock', {
            p_sku: 'TEST-PRODUCT-001',
            p_batch: 'BATCH-A',
            p_from_location: 'PICK-01',
            p_to_location: 'OUT-01',
            p_qty: 1,
            p_user_id: userId,
            p_reason: 'STRESS_TEST'
          });

          if (error) throw error;
          successes++;
        } catch (err) {
          failures++; // Esperamos fallos por bloqueo (Row Locking), eso es bueno
        }
        
        // Pequeña pausa aleatoria
        await new Promise(r => setTimeout(r, Math.random() * 500));
      }
    });

    await Promise.all(userAgents);

    console.log('🏁 Simulación finalizada');
    console.log(`✅ Éxitos: ${successes}`);
    console.log(`🛑 Bloqueos/Fallos (Esperado en alta concurrencia): ${failures}`);
    return { successes, failures };
  }
};
