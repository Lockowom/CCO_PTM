import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Plus, X, Copy, Ban, RefreshCw, Terminal, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listarApiKeys, crearApiKey, revocarApiKey, listarApiLog, SCOPES, API_BASE } from '../../services/apiService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };

export default function ApiKeys() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_api') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [keys, setKeys] = useState([]);
  const [log, setLog] = useState([]);
  const [nueva, setNueva] = useState(false);
  const [creada, setCreada] = useState(null); // {key, prefijo}
  const [copied, setCopied] = useState('');

  const cargar = useCallback(async () => { setKeys(await listarApiKeys()); setLog(await listarApiLog()); }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const copiar = async (txt, tag) => { try { await navigator.clipboard.writeText(txt); setCopied(tag); setTimeout(() => setCopied(''), 1500); } catch { /* */ } };
  const revocar = async (id) => { if (!window.confirm('¿Revocar esta API key? Dejará de funcionar de inmediato.')) return; const r = await revocarApiKey(id); if (r?.ok) { toast.success('Key revocada'); cargar(); } else toast.error(r?.error || 'Error'); };

  return (
    <div className="anim-fade-up space-y-4 max-w-[1100px] mx-auto pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20"><KeyRound size={22} /></div>
          <div><h1 className="text-xl font-black text-slate-800 leading-tight">API de Operaciones (v1)</h1><p className="text-[13px] text-slate-500">Claves para Portal Cliente / ERP / integraciones · mismas reglas del sistema</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Actualizar</button>
          {puede && <button onClick={() => { setNueva(true); setCreada(null); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"><Plus size={16} /> Nueva key</button>}
        </div>
      </div>

      {/* Endpoint */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><Terminal size={12} /> Endpoint</p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-[12px] font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 break-all">{API_BASE}</code>
          <button onClick={() => copiar(API_BASE, 'url')} className="text-slate-400 hover:text-orange-500">{copied === 'url' ? <Check size={14} /> : <Copy size={14} />}</button>
        </div>
        <pre className="mt-2 text-[11px] font-mono bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto">{`curl "${API_BASE}/operaciones?nv=97281" \\
  -H "x-api-key: cco_xxx..."   # GET → consulta N.V.

curl -X POST "${API_BASE}/operaciones/estado" \\
  -H "x-api-key: cco_xxx..." -H "Content-Type: application/json" \\
  -d '{"id":123,"estado":"En Ruta"}'   # cambia estado`}</pre>
        <p className="text-[10px] text-slate-400 mt-1.5">Contrato completo: <code>GET {API_BASE}/</code> (sin key). Auth por header <code>x-api-key</code>.</p>
      </div>

      {/* Key recién creada (se muestra UNA vez) */}
      {creada && (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-4">
          <p className="text-[12px] font-black text-orange-700 mb-1">⚠ Copia esta clave ahora — no se vuelve a mostrar</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[13px] font-mono bg-white border border-orange-200 rounded-lg px-2 py-1.5 text-slate-800 break-all">{creada.key}</code>
            <button onClick={() => copiar(creada.key, 'key')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[12px] font-bold inline-flex items-center gap-1.5">{copied === 'key' ? <Check size={13} /> : <Copy size={13} />} Copiar</button>
          </div>
        </div>
      )}

      {/* Lista de keys */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase">Claves ({keys.length})</div>
        {keys.length === 0 ? <div className="py-12 text-center text-slate-400 text-sm">Sin claves. Crea una para integrar un sistema externo.</div> : (
          <div className="divide-y divide-slate-100">
            {keys.map((k) => (
              <div key={k.id} className={`flex items-center gap-3 px-4 py-3 ${!k.activo ? 'opacity-50' : ''}`}>
                <span className="font-mono text-[12px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 shrink-0">cco_{k.prefijo}…</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-[13px] text-slate-800">{k.nombre}</span>{!k.activo && <span className="text-[9px] font-black text-red-600 bg-red-50 rounded px-1.5 py-0.5">REVOCADA</span>}</div>
                  <div className="flex items-center gap-1 flex-wrap mt-0.5">{(k.scopes || []).map((s) => <span key={s} className="text-[9px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{s}</span>)}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 text-right">últ. uso<br />{fmt(k.ultimo_uso)}</span>
                {puede && k.activo && <button onClick={() => revocar(k.id)} title="Revocar" className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0"><Ban size={15} /></button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log de llamadas */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase">Últimas llamadas ({log.length})</div>
        {log.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm">Sin llamadas registradas.</div> : (
          <div className="divide-y divide-slate-100 max-h-[45vh] overflow-y-auto">
            {log.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-4 py-2 text-[12px]">
                <span className={`text-[9px] font-black rounded px-1.5 py-0.5 shrink-0 ${l.estado_http < 300 ? 'text-emerald-700 bg-emerald-50' : l.estado_http < 500 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>{l.estado_http}</span>
                <span className="font-mono font-bold text-slate-600 shrink-0">{l.metodo}</span>
                <span className="font-mono text-slate-500 truncate flex-1">{l.ruta}</span>
                {l.prefijo && <span className="font-mono text-[10px] text-slate-400 shrink-0">cco_{l.prefijo}</span>}
                <span className="text-[10px] text-slate-400 shrink-0">{fmt(l.creado_en)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {nueva && <NuevaKeyModal onClose={() => setNueva(false)} onCreada={(r) => { setNueva(false); setCreada(r); cargar(); }} />}
    </div>
  );
}

function NuevaKeyModal({ onClose, onCreada }) {
  const [nombre, setNombre] = useState('');
  const [scopes, setScopes] = useState(['operaciones:read']);
  const [busy, setBusy] = useState(false);
  const toggle = (s) => setScopes((v) => v.includes(s) ? v.filter((x) => x !== s) : [...v, s]);
  const crear = async () => {
    if (!nombre.trim()) { toast.error('Ponle un nombre'); return; }
    setBusy(true); const r = await crearApiKey(nombre.trim(), scopes); setBusy(false);
    if (r?.ok) { toast.success('Key creada'); onCreada(r); } else toast.error(r?.error || 'No se pudo crear');
  };
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">Nueva API key</h3><button onClick={onClose} className="text-slate-400"><X size={18} /></button></div>
        <div className="space-y-3">
          <label className="block"><span className="text-[11px] font-bold text-slate-500 uppercase">Nombre / sistema</span><input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Portal Cliente / ERP Softland" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" /></label>
          <div><span className="text-[11px] font-bold text-slate-500 uppercase">Permisos (scopes)</span>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {SCOPES.map((s) => (
                <label key={s} className={`flex items-center gap-2 text-[12px] font-mono border rounded-lg px-2 py-1.5 cursor-pointer ${scopes.includes(s) ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                  <input type="checkbox" checked={scopes.includes(s)} onChange={() => toggle(s)} /> {s}
                </label>
              ))}
            </div>
          </div>
          <button onClick={crear} disabled={busy || !scopes.length} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">{busy ? 'Creando…' : 'Crear key'}</button>
        </div>
      </div>
    </div>
  );
}
