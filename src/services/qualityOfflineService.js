import { db } from '../lib/db';
import { getCurrentUserId } from '../lib/syncManager';
import { withTimeout } from '../lib/supabaseQuery';
import { supabase } from '../supabase';

const HITO_KEYS = ['HITO_1', 'HITO_2', 'HITO_3'];
const COMMAND_LIMIT = 25;

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine;
const taskKey = (hito, tareaId) => `${hito}:${tareaId}`;
const now = () => new Date().toISOString();
const randomId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const LOCAL_EVIDENCE_PREFIX = 'quality-offline://';
const CONNECTION_TIMEOUT_MS = 5000;

// navigator.onLine solo informa el estado que Chrome atribuye al adaptador de
// red. Puede quedar en false en un perfil afectado por VPN, extensiones o una
// PWA vieja aunque Supabase sea alcanzable. Calidad mantiene este resultado
// como señal inicial, pero valida el backend antes de asumir modo offline.
let qualityConnectionStatus = null;
let qualityConnectionProbe = null;

const assertHito = (hito) => {
  if (!HITO_KEYS.includes(hito)) throw new Error('Hito offline de Calidad inválido');
};

const assertUser = async () => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión para usar tareas offline');
  return userId;
};

export const setQualityConnectionStatus = (status) => {
  qualityConnectionStatus = typeof status === 'boolean' ? status : null;
};

export const getQualityConnectionStatus = () => qualityConnectionStatus;

export const isQualityOffline = () =>
  qualityConnectionStatus === false || (qualityConnectionStatus === null && !isOnline());

const isNetworkFailure = (error) => {
  if (!error) return false;
  const message = String(error.message || error.details || '').toLowerCase();
  return (
    error.name === 'AbortError' ||
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('networkerror') ||
    message.includes('timeout') ||
    message.includes('aborted')
  );
};

/**
 * Comprueba una ruta mínima, protegida por RLS y marcada NetworkOnly por la
 * PWA. Una respuesta de permiso también demuestra que el backend respondió;
 * solo un error de red o timeout activa el modo offline.
 */
export async function comprobarConexionCalidad() {
  if (qualityConnectionProbe) return qualityConnectionProbe;

  qualityConnectionProbe = (async () => {
    try {
      const { error } = await withTimeout(
        supabase.from('app_runtime_control').select('id').eq('id', true).limit(1),
        { ms: CONNECTION_TIMEOUT_MS, label: 'conexión de Calidad' }
      );
      const connected = !isNetworkFailure(error);
      setQualityConnectionStatus(connected);
      return connected;
    } catch {
      setQualityConnectionStatus(false);
      return false;
    } finally {
      qualityConnectionProbe = null;
    }
  })();

  return qualityConnectionProbe;
}

export const isLocalQualityEvidencePath = (path) =>
  String(path || '').startsWith(LOCAL_EVIDENCE_PREFIX);

export async function guardarEvidenciaCalidadOffline({ hito, tareaId, tipo, blob }) {
  assertHito(hito);
  const userId = await assertUser();
  if (!blob || !String(blob.type || '').startsWith('image/')) {
    throw new Error('La evidencia offline debe ser una imagen válida');
  }
  const localId = randomId();
  await db.qualityOfflineEvidence.add({
    userId,
    localId,
    hito,
    tareaId,
    tipo,
    blob,
    mime: blob.type,
    createdAt: now()
  });
  return `${LOCAL_EVIDENCE_PREFIX}${localId}`;
}

export async function obtenerUrlEvidenciaCalidadOffline(path) {
  if (!isLocalQualityEvidencePath(path)) return null;
  const userId = await assertUser();
  const localId = String(path).slice(LOCAL_EVIDENCE_PREFIX.length);
  const row = await db.qualityOfflineEvidence.get([userId, localId]);
  return row?.blob ? URL.createObjectURL(row.blob) : null;
}

export async function eliminarEvidenciaCalidadOffline(path) {
  if (!isLocalQualityEvidencePath(path)) return false;
  const userId = await assertUser();
  const localId = String(path).slice(LOCAL_EVIDENCE_PREFIX.length);
  const row = await db.qualityOfflineEvidence.get([userId, localId]);
  if (!row) return false;
  await db.qualityOfflineEvidence.delete(row.id);
  return true;
}

const extensionForMime = (mime) =>
  ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' })[mime] ||
  'jpg';

const materializarEvidencias = async (userId, command) => {
  const sourcePayload = command.payload || {};
  const payload = globalThis.structuredClone
    ? globalThis.structuredClone(sourcePayload)
    : JSON.parse(JSON.stringify(sourcePayload));
  const evidencias = payload?.checklist?._extras?.evidencias;
  if (!Array.isArray(evidencias)) return { payload, evidenceIds: [] };

  const evidenceIds = [];
  for (const evidence of evidencias) {
    if (!isLocalQualityEvidencePath(evidence?.path)) continue;
    const localId = String(evidence.path).slice(LOCAL_EVIDENCE_PREFIX.length);
    const local = await db.qualityOfflineEvidence.get([userId, localId]);
    if (!local?.blob) throw new Error('No se encontró una evidencia local pendiente');
    const folder = command.hito === 'HITO_3' ? 'salida' : 'ingreso';
    const remotePath = `${folder}/${command.tareaId}/offline-${local.localId}.${extensionForMime(local.mime)}`;
    const { error } = await supabase.storage
      .from('monitoreo-evidencias')
      .upload(remotePath, local.blob, { contentType: local.mime || 'image/jpeg', upsert: true });
    if (error) throw error;
    evidence.path = remotePath;
    evidence.subido_en = evidence.subido_en || now();
    evidenceIds.push(local.id);
  }
  return { payload, evidenceIds };
};

export async function descargarTareasCalidadOffline() {
  if (!isOnline()) throw new Error('Conéctate para descargar tus tareas de Calidad');
  const userId = await assertUser();
  const { data, error } = await supabase.rpc('descargar_tareas_calidad_offline');
  if (error) throw error;

  const rows = HITO_KEYS.flatMap((hito) =>
    (Array.isArray(data?.[hito.toLowerCase()]) ? data[hito.toLowerCase()] : []).map((task) => ({
      userId,
      taskKey: taskKey(hito, task.id),
      hito,
      tareaId: task.id,
      sourceUpdatedAt: task.updated_at || null,
      cachedAt: now(),
      task
    }))
  );

  await db.transaction('rw', db.qualityOfflineTasks, async () => {
    await db.qualityOfflineTasks.where('userId').equals(userId).delete();
    await db.qualityOfflineTasks.bulkPut(rows);
  });
  return { downloaded: rows.length, downloadedAt: data?.downloaded_at || now() };
}

export async function listarTareasCalidadOffline(hito) {
  assertHito(hito);
  const userId = await assertUser();
  const rows = await db.qualityOfflineTasks
    .where('[userId+taskKey]')
    .between([userId, `${hito}:`], [userId, `${hito}:\uffff`])
    .toArray();
  return rows.map((row) => ({
    ...row.task,
    offline_version: row.task?.offline_version,
    offline_cached: true
  }));
}

export async function obtenerTareaCalidadOffline(hito, tareaId) {
  assertHito(hito);
  const userId = await assertUser();
  const row = await db.qualityOfflineTasks.get([userId, taskKey(hito, tareaId)]);
  return row?.task ? { ...row.task, offline_cached: true } : null;
}

export async function encolarComandoCalidadOffline({ hito, tareaId, accion, payload }) {
  assertHito(hito);
  if (!['GUARDAR', 'FINALIZAR', 'PROGRESO'].includes(accion)) {
    throw new Error('Acción offline de Calidad inválida');
  }
  const userId = await assertUser();
  const cached = await db.qualityOfflineTasks.get([userId, taskKey(hito, tareaId)]);
  if (!cached?.task?.offline_version) {
    throw new Error(
      'Esta tarea no fue descargada para uso offline. Conéctate y descárgala primero.'
    );
  }

  const pending = await db.qualityOfflineCommands
    .where('userId')
    .equals(userId)
    .filter(
      (command) =>
        command.hito === hito &&
        command.tareaId === tareaId &&
        (command.status === 'PENDING' || command.status === 'RETRY')
    )
    .first();
  if (pending) {
    // Una finalización ya preparada no puede ser reemplazada por un autosave
    // que se dispare tarde desde el formulario.
    if (pending.accion === 'FINALIZAR' && accion !== 'FINALIZAR') {
      return {
        queued_offline: true,
        idempotencyKey: pending.idempotencyKey,
        merged: true,
        ignoredAfterFinalize: true
      };
    }
    const nextAction =
      pending.accion === 'FINALIZAR' || accion === 'FINALIZAR' ? 'FINALIZAR' : accion;
    await db.qualityOfflineCommands.update(pending.id, {
      accion: nextAction,
      payload: payload || {},
      updatedAt: now()
    });
    return { queued_offline: true, idempotencyKey: pending.idempotencyKey, merged: true };
  }

  const idempotencyKey = `quality:${hito}:${tareaId}:${randomId()}`;
  await db.qualityOfflineCommands.add({
    userId,
    idempotencyKey,
    hito,
    tareaId,
    accion,
    baseVersion: cached.task.offline_version,
    payload: payload || {},
    status: 'PENDING',
    createdAt: now(),
    lastError: null
  });
  return { queued_offline: true, idempotencyKey };
}

export async function encolarChecklistCalidadOffline({
  tareaId,
  checklist,
  observaciones,
  finalizar,
  resultado,
  disposicion
}) {
  const userId = await assertUser();
  for (const hito of ['HITO_1', 'HITO_3']) {
    const cached = await db.qualityOfflineTasks.get([userId, taskKey(hito, tareaId)]);
    if (!cached) continue;
    return encolarComandoCalidadOffline({
      hito,
      tareaId,
      accion: finalizar ? 'FINALIZAR' : 'GUARDAR',
      payload: { checklist, observaciones, finalizar: !!finalizar, resultado, disposicion }
    });
  }
  throw new Error('Esta tarea no fue descargada para uso offline. Conéctate y descárgala primero.');
}

export async function sincronizarCalidadOffline() {
  if (!isOnline()) throw new Error('No hay conexión para sincronizar Calidad');
  const userId = await assertUser();
  const pending = await db.qualityOfflineCommands
    .where('userId')
    .equals(userId)
    .filter((command) => command.status === 'PENDING' || command.status === 'RETRY')
    .limit(COMMAND_LIMIT)
    .toArray();
  if (pending.length === 0) return { applied: 0, conflicts: 0, rejected: 0 };

  const materialized = await Promise.all(
    pending.map(async (command) => ({
      command,
      ...(await materializarEvidencias(userId, command))
    }))
  );
  const { data, error } = await supabase.rpc('sincronizar_calidad_offline', {
    p_comandos: materialized.map(({ command, payload }) => ({
      idempotency_key: command.idempotencyKey,
      hito: command.hito,
      tarea_id: command.tareaId,
      accion: command.accion,
      base_version: command.baseVersion,
      payload
    }))
  });
  if (error) throw error;

  const results = Array.isArray(data?.results) ? data.results : [];
  let applied = 0;
  let conflicts = 0;
  let rejected = 0;
  await db.transaction('rw', db.qualityOfflineCommands, async () => {
    for (const result of results) {
      const command = pending.find((item) => item.idempotencyKey === result.idempotency_key);
      if (!command) continue;
      const status = result.estado_sync || 'RECHAZADO';
      if (status === 'APLICADO') {
        const prepared = materialized.find((item) => item.command.id === command.id);
        if (prepared?.evidenceIds?.length) {
          await db.qualityOfflineEvidence.bulkDelete(prepared.evidenceIds);
        }
        await db.qualityOfflineCommands.delete(command.id);
        applied += 1;
      } else {
        await db.qualityOfflineCommands.update(command.id, {
          status: status === 'CONFLICTO' ? 'CONFLICT' : 'REJECTED',
          lastError: result.message || 'No se pudo sincronizar el comando'
        });
        if (status === 'CONFLICTO') conflicts += 1;
        else rejected += 1;
      }
    }
  });
  return { applied, conflicts, rejected };
}

export async function estadoCalidadOffline() {
  const userId = await assertUser();
  const commands = await db.qualityOfflineCommands.where('userId').equals(userId).toArray();
  const tasks = await db.qualityOfflineTasks.where('userId').equals(userId).count();
  return {
    tasks,
    pending: commands.filter(
      (command) => command.status === 'PENDING' || command.status === 'RETRY'
    ).length,
    conflicts: commands.filter((command) => command.status === 'CONFLICT').length,
    rejected: commands.filter((command) => command.status === 'REJECTED').length
  };
}

export async function limpiarCalidadOfflineUsuario() {
  const userId = await assertUser();
  await db.transaction(
    'rw',
    db.qualityOfflineTasks,
    db.qualityOfflineCommands,
    db.qualityOfflineEvidence,
    async () => {
      await db.qualityOfflineTasks.where('userId').equals(userId).delete();
      await db.qualityOfflineCommands.where('userId').equals(userId).delete();
      await db.qualityOfflineEvidence.where('userId').equals(userId).delete();
    }
  );
}
