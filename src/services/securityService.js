// ============================================================================
//  securityService — Identity & Security · Fase 6 (MFA / TOTP)
//  Envuelve la API MFA nativa de Supabase Auth (auth.mfa.*) + el espejo de estado
//  (iam_mfa_estado / iam_mfa_sync). TOTP funciona sin configuración de proveedor.
// ============================================================================
import { supabase } from '../supabase';

// Estado MFA del usuario (desde el espejo servidor: enabled + factores).
export async function estadoMFA() {
  const { data, error } = await supabase.rpc('iam_mfa_estado');
  if (error) throw error;
  return data || { enabled: false, factors: [] };
}

// Inicia el enrolamiento TOTP → devuelve { factorId, qr, secret, uri }.
export async function enrolarTOTP(friendlyName = 'CCO Authenticator') {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName });
  if (error) throw error;
  return { factorId: data.id, qr: data.totp?.qr_code, secret: data.totp?.secret, uri: data.totp?.uri };
}

// Verifica el código de 6 dígitos para completar el enrolamiento (o un challenge).
export async function verificarTOTP(factorId, code) {
  const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
  if (chErr) throw chErr;
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
  if (error) throw error;
  await supabase.rpc('iam_mfa_sync').catch(() => {});
  return true;
}

// Quita un factor (desactiva MFA de ese autenticador).
export async function quitarFactor(factorId) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
  await supabase.rpc('iam_mfa_sync').catch(() => {});
  return true;
}

// Nivel de aseguramiento actual/próximo (para el desafío en el login).
export async function nivelAAL() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return data; // { currentLevel, nextLevel }
}

// Factores TOTP verificados (para elegir cuál desafiar en el login).
export async function factoresVerificados() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return (data?.totp || []).filter((f) => f.status === 'verified');
}
