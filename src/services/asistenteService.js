// ============================================================================
//  asistenteService — cliente del Asistente IA (v1, solo lectura).
//  Manda el historial de conversación al proxy same-origin /api/asistente; la
//  clave de Anthropic vive SOLO en el servidor. Se envía el access_token de la
//  sesión CCO para que el servidor valide y para que las herramientas (RPCs)
//  se ejecuten con los permisos/ámbito reales del usuario.
// ============================================================================
import { supabase } from '../supabase';

// messages: [{ role:'user'|'assistant', content:string }] → texto de respuesta.
export async function preguntarAsistente(messages) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');

  const r = await fetch('/api/asistente', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages }),
  });
  let data = {};
  try { data = await r.json(); } catch { /* respuesta no-JSON */ }
  if (!r.ok) throw new Error(data?.error?.message || 'No se pudo consultar el asistente.');
  return (data.text || '').trim();
}
