// ============================================================================
//  flujoService — Mapa de Procesos editable (tms_flujo_modelos)
//  Lectura directa (RLS authenticated); guardado por RPC gateada
//  (_wf_puede_gestionar → admin o manage_workflows). Migración 113.
// ============================================================================
import { supabase } from '../supabase';

export async function obtenerFlujo(codigo = 'maestro') {
  const { data } = await supabase.from('tms_flujo_modelos').select('modelo,titulo,updated_at,updated_by').eq('codigo', codigo).maybeSingle();
  return data; // null si aún no existe (usar seed empaquetado)
}

export async function guardarFlujo(codigo, titulo, modelo) {
  const { data, error } = await supabase.rpc('flujo_guardar', { p_codigo: codigo, p_titulo: titulo, p_modelo: modelo });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
