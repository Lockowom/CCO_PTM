// ============================================================================
//  workflowService — Workflow Engine (procesos como datos)
//  Lee las tablas workflow_* (RLS select a authenticated) y escribe por RPC
//  gateada (_wf_puede_gestionar → admin o manage_workflows). Migración 108.
// ============================================================================
import { supabase } from '../supabase';

export async function listarDefiniciones() {
  const { data, error } = await supabase.from('workflow_definition').select('*').order('orden');
  if (error) throw error;
  return data || [];
}

export async function listarEstados(workflow) {
  const { data } = await supabase.from('workflow_state').select('*').eq('workflow', workflow).order('orden');
  return data || [];
}

export async function listarTransiciones(workflow) {
  const { data } = await supabase.from('workflow_transition').select('*').eq('workflow', workflow).order('orden');
  return data || [];
}

export async function listarHistorial(workflow, entidadId) {
  let q = supabase.from('workflow_history').select('*').eq('workflow', workflow).order('creado_en', { ascending: false }).limit(200);
  if (entidadId) q = q.eq('entidad_id', entidadId);
  const { data } = await q;
  return data || [];
}

// Catálogo de permisos (para el selector de la transición).
export async function listarPermisos() {
  const { data } = await supabase.from('tms_permisos').select('id,nombre,modulo').order('modulo').order('id');
  return data || [];
}

const rpc = async (fn, args) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
};

export const guardarDefinicion  = (p)             => rpc('wf_guardar_definicion', { p });
export const eliminarDefinicion = (codigo)        => rpc('wf_eliminar_definicion', { p_codigo: codigo });
export const guardarEstado      = (p)             => rpc('wf_guardar_estado', { p });
export const eliminarEstado     = (workflow, cod) => rpc('wf_eliminar_estado', { p_workflow: workflow, p_codigo: cod });
export const guardarTransicion  = (p)             => rpc('wf_guardar_transicion', { p });
export const eliminarTransicion = (id)            => rpc('wf_eliminar_transicion', { p_id: id });
export const transicionar = (workflow, entidadId, desde, accion, nota) =>
  rpc('wf_transicionar', { p_workflow: workflow, p_entidad_id: entidadId, p_desde: desde || null, p_accion: accion, p_nota: nota || null });
