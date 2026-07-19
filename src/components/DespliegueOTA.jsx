import React, { useEffect, useState, useCallback } from 'react';
import {
  Rocket, RefreshCw, FlaskConical, ShieldCheck, CheckCircle2, AlertTriangle, X, Package, Trash2, Smartphone, Lock, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { listarDespliegueOTA, promoverOTA, eliminarBundleOTA, obtenerGobernanzaOTA, guardarGobernanzaOTA, resumenDispositivosOTA } from '../services/otaDeployService';

/**
 * Despliegue OTA a producción DESDE la app (solo admin / permiso `deploy_ota`).
 * Lista los bundles subidos a Capgo, muestra qué versión sirve cada canal
 * (beta/producción) y permite ELEGIR una versión y promoverla a `production`
 * (toda la bodega) con confirmación. La API key de Capgo vive en la Edge
 * Function `capgo-deploy`, no en el cliente. Sirve en web y en la app Android.
 */
const DespliegueOTA = () => {
  const { hasPermission } = useAuth();
  const puede = hasPermission('deploy_ota');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { bundles, channels }
  const [sel, setSel] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [promoviendo, setPromoviendo] = useState(false);
  const [dispos, setDispos] = useState([]);
  const [gob, setGob] = useState({ min_version: '', obligatorio: false, mensaje: '' });
  const [savingGob, setSavingGob] = useState(false);
  const [delVer, setDelVer] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listarDespliegueOTA();
      // Ordenar versiones: más reciente primero (por fecha si hay, si no por nombre).
      const bundles = [...(r.bundles || [])].sort((a, b) => {
        if (a.created_at && b.created_at) return new Date(b.created_at) - new Date(a.created_at);
        return String(b.version).localeCompare(String(a.version), undefined, { numeric: true });
      });
      setData({ ...r, bundles });
    } catch (e) {
      toast.error(`No se pudo consultar Capgo: ${e.message}`);
      setData({ bundles: [], channels: [] });
    } finally { setLoading(false); }
    try { setDispos(await resumenDispositivosOTA()); } catch { /* opcional */ }
    try { const g = await obtenerGobernanzaOTA(); if (g) setGob({ min_version: g.min_version || '', obligatorio: !!g.obligatorio, mensaje: g.mensaje || '' }); } catch { /* opcional */ }
  }, []);

  useEffect(() => { if (puede) cargar(); }, [puede, cargar]);

  const delBundle = async (version) => {
    setDelVer(version);
    try { await eliminarBundleOTA(version); toast.success(`Bundle ${version} eliminado de Capgo.`); await cargar(); }
    catch (e) { toast.error(`No se pudo eliminar: ${e.message}`); }
    finally { setDelVer(null); }
  };
  const guardarGob = async () => {
    setSavingGob(true);
    const r = await guardarGobernanzaOTA(gob);
    setSavingGob(false);
    if (r?.ok) toast.success('Gobernanza de versión guardada.'); else toast.error(r?.error || 'No se pudo guardar');
  };

  if (!puede) return null; // solo admin / permiso

  const canal = (nombre) => (data?.channels || []).find(
    (c) => String(c.name).toLowerCase() === nombre,
  )?.version || null;
  const vProd = canal('production');
  const vBeta = canal('beta');

  const promover = async () => {
    if (!sel) return;
    setPromoviendo(true);
    try {
      await promoverOTA(sel, 'production');
      toast.success(`Versión ${sel} promovida a PRODUCCIÓN. Toda la bodega la recibirá.`);
      setConfirmar(false);
      setSel('');
      await cargar();
    } catch (e) {
      toast.error(`No se pudo promover: ${e.message}`);
    } finally { setPromoviendo(false); }
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-indigo-600" />
          <div>
            <p className="text-sm font-black text-slate-800">Desplegar actualización a la bodega (OTA)</p>
            <p className="text-xs text-slate-500">Elige una versión y promuévela a producción. Sin reinstalar nada.</p>
          </div>
        </div>
        <button onClick={cargar} disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 disabled:opacity-60">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Estado de canales */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white border border-emerald-200 p-2.5">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12} /> Producción (bodega)</p>
          <p className="text-lg font-black text-slate-800">{vProd || '—'}</p>
        </div>
        <div className="rounded-lg bg-white border border-amber-200 p-2.5">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1"><FlaskConical size={12} /> Beta (pruebas)</p>
          <p className="text-lg font-black text-slate-800">{vBeta || '—'}</p>
        </div>
      </div>

      {/* Lista de versiones para elegir */}
      {loading && !data ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4 justify-center"><RefreshCw size={16} className="animate-spin" /> Consultando versiones…</div>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
          {(data?.bundles || []).length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400 flex flex-col items-center gap-1">
              <Package size={22} /> Sin bundles en Capgo
            </div>
          )}
          {(data?.bundles || []).map((b) => {
            const esProd = b.version === vProd;
            const esBeta = b.version === vBeta;
            const activo = sel === b.version;
            return (
              <label key={b.version}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${activo ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                <input type="radio" name="ota-ver" value={b.version} checked={activo}
                  onChange={() => setSel(b.version)} disabled={esProd}
                  className="accent-indigo-600 w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800">{b.version}</span>
                    {esProd && <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">EN PRODUCCIÓN</span>}
                    {esBeta && <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">EN BETA</span>}
                  </div>
                  {b.created_at && <span className="text-[11px] text-slate-400">{new Date(b.created_at).toLocaleString('es-CL')}</span>}
                </div>
                {!esProd && !esBeta && (
                  <button type="button" title="Eliminar bundle de Capgo"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (window.confirm(`¿Eliminar el bundle ${b.version} de Capgo? No afecta a los canales activos.`)) delBundle(b.version); }}
                    disabled={delVer === b.version}
                    className="shrink-0 w-8 h-8 rounded-lg grid place-items-center text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40">
                    {delVer === b.version ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </label>
            );
          })}
        </div>
      )}

      {/* Acción */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[11px] text-slate-500">
          {sel ? <>Vas a promover <b className="text-slate-800">{sel}</b> a producción.</> : 'Selecciona una versión de la lista.'}
        </p>
        <div className="flex items-center gap-2">
          {sel && sel !== vProd && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-1">{data?.bundles?.findIndex((b) => b.version === sel) > data?.bundles?.findIndex((b) => b.version === vProd) ? '↩ rollback' : '↑ avance'}</span>}
          <button onClick={() => setConfirmar(true)} disabled={!sel || promoviendo}
            className="px-4 py-2 rounded-lg text-sm font-black inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            <Rocket size={15} /> Promover a producción
          </button>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">Para <b>rollback</b>, selecciona una versión anterior a la de producción y promuévela: el canal apunta al bundle previo (sin recompilar).</p>

      {/* Gobernanza de versión (mínima / obligatoria) */}
      <div className="mt-4 rounded-lg bg-white border border-slate-200 p-3">
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-2"><Lock size={12} /> Versión mínima requerida</p>
        <div className="flex items-end gap-2 flex-wrap">
          <label className="text-[11px] font-bold text-slate-500">Versión mínima
            <input value={gob.min_version} onChange={(e) => setGob({ ...gob, min_version: e.target.value })} placeholder="1.55.40" className="mt-1 block w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-400" />
          </label>
          <label className="flex items-center gap-2 text-[12px] text-slate-600 pb-1.5"><input type="checkbox" checked={gob.obligatorio} onChange={(e) => setGob({ ...gob, obligatorio: e.target.checked })} /> Obligatoria (bloquea con banner)</label>
          <input value={gob.mensaje} onChange={(e) => setGob({ ...gob, mensaje: e.target.value })} placeholder="Mensaje para el usuario (opcional)" className="flex-1 min-w-[160px] border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-400" />
          <button onClick={guardarGob} disabled={savingGob} className="px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"><Save size={13} /> Guardar</button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">Los dispositivos con versión inferior verán un aviso para actualizar. Deja la versión vacía para desactivar.</p>
      </div>

      {/* Inventario: versiones aplicadas por dispositivo */}
      <div className="mt-3 rounded-lg bg-white border border-slate-200 p-3">
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-2"><Smartphone size={12} /> Versiones en dispositivos ({dispos.reduce((a, d) => a + Number(d.dispositivos || 0), 0)})</p>
        {dispos.length === 0 ? <p className="text-[12px] text-slate-400">Aún sin registros. Se llena cuando los equipos apliquen una actualización.</p> : (
          <div className="divide-y divide-slate-100">
            {dispos.map((d) => (
              <div key={d.version} className="flex items-center gap-3 py-1.5 text-[12px]">
                <span className="font-black text-slate-800 w-20">{d.version}</span>
                <span className="text-slate-500">{d.dispositivos} equipo{Number(d.dispositivos) === 1 ? '' : 's'}</span>
                {d.version === vProd && <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">AL DÍA</span>}
                <span className="ml-auto text-[10px] text-slate-400">{d.ultimo_email} · {d.ultima ? new Date(d.ultima).toLocaleDateString('es-CL') : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmar && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => !promoviendo && setConfirmar(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl anim-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-800">Confirmar despliegue a TODA la bodega</h4>
                <p className="text-sm text-slate-600 mt-1">
                  La versión <b>{sel}</b> se pondrá en el canal <b>producción</b>. Todos los equipos la
                  recibirán automáticamente al abrir la app. ¿Continuar?
                </p>
              </div>
              <button onClick={() => !promoviendo && setConfirmar(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setConfirmar(false)} disabled={promoviendo}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-black border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60">
                Cancelar
              </button>
              <button onClick={promover} disabled={promoviendo}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {promoviendo ? <><RefreshCw size={15} className="animate-spin" /> Promoviendo…</> : <><CheckCircle2 size={15} /> Sí, promover</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespliegueOTA;
