// ============================================================================
//  tmsService — TMS (Transporte) Fase 2
//  Órdenes de transporte propio: torre de control, asignación, transiciones de
//  estado, POD e incidencias. Lectura directa (RLS authenticated); escrituras
//  por RPC gateada (_tms_puede_gestionar → admin o manage_tms/manage_panel).
// ============================================================================
import { supabase } from '../supabase';

const OPERACIONES_READ_VIEW = 'tms_operaciones_vigentes';

// Máquina de estados (orden y metadatos visuales).
export const ESTADOS = [
  { id: 'pendiente_asignacion', label: 'Pendiente Asignación', color: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
  { id: 'programado',           label: 'Programado',           color: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' },
  { id: 'en_carga',             label: 'En Carga',             color: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
  { id: 'despachado',           label: 'Despachado',           color: '#0891b2', bg: '#ecfeff', text: '#0e7490' },
  { id: 'en_ruta',              label: 'En Ruta',              color: '#06b6d4', bg: '#ecfeff', text: '#0e7490' },
  { id: 'entregado',            label: 'Entregado',            color: '#10b981', bg: '#ecfdf5', text: '#047857' },
  { id: 'cerrado',              label: 'Cerrado',              color: '#64748b', bg: '#f8fafc', text: '#475569' },
  { id: 'cancelado',            label: 'Cancelado',            color: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
];
export const ESTADO_META = Object.fromEntries(ESTADOS.map((e) => [e.id, e]));

// La transición "hacia adelante" disponible desde cada estado (para el botón).
export const SIGUIENTE = {
  programado: { to: 'en_carga', label: 'Marcar En Carga' },
  en_carga: { to: 'despachado', label: 'Marcar Despachado' },
  despachado: { to: 'en_ruta', label: 'Salir a Ruta' },
  entregado: { to: 'cerrado', label: 'Cerrar orden' },
};

export const TIPOS_INCIDENCIA = ['Retraso', 'Accidente', 'Cliente Ausente', 'Dirección Incorrecta', 'Producto Dañado'];

export async function listarOrdenes() {
  const { data, error } = await supabase.from('tms_transporte_ordenes')
    .select('*, vehiculo:tms_vehiculos(patente,tipo)')
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listarVehiculos() {
  const { data } = await supabase.from('tms_vehiculos').select('*').eq('activo', true).order('patente');
  return data || [];
}

export async function listarConductores() {
  const { data } = await supabase.from('tms_conductores').select('id,nombre,apellido').order('nombre');
  return (data || []).map((c) => ({ id: c.id, nombre: [c.nombre, c.apellido].filter(Boolean).join(' ') || `#${c.id}` }));
}

export async function listarIncidencias(ordenId) {
  const { data } = await supabase.from('tms_transporte_incidencias')
    .select('*').eq('orden_id', ordenId).order('id', { ascending: false });
  return data || [];
}

// Crea una orden desde una N.V.: busca la operación por número y llama la RPC.
export async function crearOrdenDesdeNV(nv) {
  const t = String(nv || '').trim();
  if (!t) return { ok: false, error: 'Ingresa el número de N.V.' };
  const ors = [];
  if (/^\d+$/.test(t)) ors.push(`nv_ptm.eq.${Number(t)}`);
  ors.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.eq.${t}`);
  const { data } = await supabase.from(OPERACIONES_READ_VIEW).select('id').or(ors.join(',')).limit(1);
  if (!data || !data.length) return { ok: false, error: `No existe la N.V. ${t}` };
  const { data: res, error } = await supabase.rpc('tms_orden_crear_desde_nv', { p_oper_id: data[0].id });
  if (error) return { ok: false, error: error.message };
  return res || { ok: true };
}

export async function asignarOrden(id, payload) {
  const { data, error } = await supabase.rpc('tms_orden_asignar', { p_id: id, p: payload });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function transicionOrden(id, estado) {
  const { data, error } = await supabase.rpc('tms_orden_transicion', { p_id: id, p_estado: estado });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function registrarPOD(id, payload) {
  const { data, error } = await supabase.rpc('tms_orden_pod', { p_id: id, p: payload });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function crearIncidencia(ordenId, tipo, detalle) {
  const { data, error } = await supabase.rpc('tms_incidencia_crear', { p_orden_id: ordenId, p_tipo: tipo, p_detalle: detalle || null });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function resolverIncidencia(id, resolucion) {
  const { data, error } = await supabase.rpc('tms_incidencia_resolver', { p_id: id, p_resolucion: resolucion });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// ── Fase 3: evidencia POD en Storage privado (bucket tms-pod) ────────────────
const POD_BUCKET = 'tms-pod';
// Sube un File/Blob y devuelve su path (para guardar en la orden).
export async function subirEvidencia(ordenId, tipo, fileOrBlob, ext) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `ordenes/${ordenId}/${tipo}-${stamp}.${ext || 'jpg'}`;
  const { error } = await supabase.storage.from(POD_BUCKET).upload(path, fileOrBlob, { upsert: true, contentType: fileOrBlob.type || 'image/jpeg' });
  if (error) throw error;
  return path;
}
// URL firmada temporal para mostrar una evidencia.
export async function urlEvidencia(path, seg = 3600) {
  if (!path) return null;
  const { data } = await supabase.storage.from(POD_BUCKET).createSignedUrl(path, seg);
  return data?.signedUrl || null;
}
// Id del conductor ligado al usuario actual (para "Mi Ruta"); null si no aplica.
// tms_conductores.user_id referencia tms_usuarios.id (no el auth_uid), así que
// se resuelve el puente auth.uid() → tms_usuarios.id → conductor.
export async function miConductorId() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;
  const { data: usr } = await supabase.from('tms_usuarios').select('id').eq('auth_uid', uid).limit(1);
  const usuarioId = usr && usr.length ? usr[0].id : null;
  if (!usuarioId) return null;
  const { data } = await supabase.from('tms_conductores').select('id').eq('user_id', usuarioId).limit(1);
  return data && data.length ? data[0].id : null;
}
