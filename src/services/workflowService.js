// ============================================================================
//  workflowService — Workflow Engine (procesos como datos)
//  Lee las tablas workflow_* (RLS select a authenticated) y escribe por RPC
//  gateada (_wf_puede_gestionar → admin o manage_workflows). Migración 108.
// ============================================================================
import { supabase } from '../supabase';
import { rpcCommand, rpcQuery } from '../core/infrastructure/supabase/rpcClient';

export async function listarDefiniciones() {
  const { data, error } = await supabase.from('workflow_definition').select('*').order('orden');
  if (error) throw error;
  return data || [];
}

export async function listarEstados(workflow) {
  const { data } = await supabase
    .from('workflow_state')
    .select('*')
    .eq('workflow', workflow)
    .order('orden');
  return data || [];
}

export async function listarTransiciones(workflow) {
  const { data } = await supabase
    .from('workflow_transition')
    .select('*')
    .eq('workflow', workflow)
    .order('orden');
  return data || [];
}

export async function listarHistorial(workflow, entidadId) {
  let q = supabase
    .from('workflow_history')
    .select('*')
    .eq('workflow', workflow)
    .order('creado_en', { ascending: false })
    .limit(200);
  if (entidadId) q = q.eq('entidad_id', entidadId);
  const { data } = await q;
  return data || [];
}

// Catálogo de permisos (para el selector de la transición).
export async function listarPermisos() {
  const { data } = await supabase
    .from('tms_permisos')
    .select('id,nombre,modulo')
    .order('modulo')
    .order('id');
  return data || [];
}

export const guardarDefinicion = (p) =>
  rpcCommand(
    'wf_guardar_definicion',
    { p },
    { module: 'workflow', action: 'guardar_definicion', payload: { workflow: p?.codigo || null } }
  );
export const eliminarDefinicion = (codigo) =>
  rpcCommand(
    'wf_eliminar_definicion',
    { p_codigo: codigo },
    { module: 'workflow', action: 'eliminar_definicion', payload: { codigo } }
  );
export const guardarEstado = (p) =>
  rpcCommand(
    'wf_guardar_estado',
    { p },
    {
      module: 'workflow',
      action: 'guardar_estado',
      payload: { workflow: p?.workflow || null, codigo: p?.codigo || null }
    }
  );
export const eliminarEstado = (workflow, cod) =>
  rpcCommand(
    'wf_eliminar_estado',
    { p_workflow: workflow, p_codigo: cod },
    { module: 'workflow', action: 'eliminar_estado', payload: { workflow, cod } }
  );
export const guardarTransicion = (p) =>
  rpcCommand(
    'wf_guardar_transicion',
    { p },
    {
      module: 'workflow',
      action: 'guardar_transicion',
      payload: { workflow: p?.workflow || null, accion: p?.accion || null }
    }
  );
export const eliminarTransicion = (id) =>
  rpcCommand(
    'wf_eliminar_transicion',
    { p_id: id },
    { module: 'workflow', action: 'eliminar_transicion', payload: { id } }
  );
export const transicionar = (workflow, entidadId, desde, accion, nota) =>
  rpcCommand(
    'wf_transicionar',
    {
      p_workflow: workflow,
      p_entidad_id: entidadId,
      p_desde: desde || null,
      p_accion: accion,
      p_nota: nota || null
    },
    { module: 'workflow', action: 'transicionar', payload: { workflow, entidadId, desde, accion } }
  );

// Acciones disponibles desde un estado, con flag `permitida` para el usuario en
// sesión (Fase 3 · Workflow Permissions → authz.can_transition). Devuelve
// [{ id, accion, hasta, hasta_etiqueta, permiso_id, permitida }].
export async function accionesDisponibles(workflow, desde) {
  const data = await rpcQuery(
    'wf_acciones_disponibles',
    {
      p_workflow: workflow,
      p_desde: desde || null
    },
    { module: 'workflow', action: 'acciones_disponibles', payload: { workflow, desde } }
  );
  return Array.isArray(data) ? data : [];
}
