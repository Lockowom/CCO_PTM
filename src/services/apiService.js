// ============================================================================
//  apiService — API de Operaciones v1: gestión de API-keys y log (migración 116/117)
//  La key en claro se devuelve UNA sola vez (api_key_crear); luego solo el prefijo.
// ============================================================================
import { supabase } from '../supabase';

export const SCOPES = ['operaciones:read', 'operaciones:write', 'tms:read', 'tms:write'];

export async function listarApiKeys() {
  const { data } = await supabase.rpc('api_keys_listar');
  return data || [];
}
export async function crearApiKey(nombre, scopes) {
  const { data, error } = await supabase.rpc('api_key_crear', { p_nombre: nombre, p_scopes: scopes });
  if (error) return { ok: false, error: error.message };
  return data || { ok: false };
}
export async function revocarApiKey(id) {
  const { data, error } = await supabase.rpc('api_key_revocar', { p_id: id });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
export async function listarApiLog() {
  const { data } = await supabase.rpc('api_log_listar');
  return data || [];
}

// URL base de la API (para mostrar en el panel).
export const API_BASE = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/api-v1`;
