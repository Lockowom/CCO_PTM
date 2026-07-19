import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Monitor, RefreshCw, LogOut, Smartphone, Globe, Circle, User as UserIcon, ShieldCheck } from 'lucide-react';
import { sesiones as fetchSesiones, forzarLogout } from '../../services/iamService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };
const esMovil = (ua = '') => /Android|iPhone|iPad|Mobile|CCO|Capacitor/i.test(ua);
const navUA = (ua = '') => {
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad/i.test(ua)) return 'iOS';
  if (/Edg/i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'Navegador';
};

export default function Sesiones() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchSesiones()); }
    catch (e) { toast.error(e.message || 'No autorizado'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const cerrar = async (r) => {
    if (!window.confirm(`¿Forzar el cierre de sesión de ${r.nombre}? Se revocarán sus sesiones activas.`)) return;
    setBusy(r.auth_uid);
    const res = await forzarLogout(r.auth_uid);
    setBusy(null);
    if (res?.ok) { toast.success(`Sesión revocada (${res.revocadas || 0})`); cargar(); }
    else toast.error(res?.error || 'Error');
  };

  const enLinea = (r) => r.estado === 'online' || r.estado === 'conectado';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">Sesiones activas (Supabase Auth) con presencia y último acceso. {rows.length} en total.</p>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No hay sesiones activas.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.session_id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 grid place-items-center text-slate-400">
                    {esMovil(r.user_agent) ? <Smartphone size={17} /> : <Globe size={17} />}
                  </div>
                  <Circle size={9} className={`absolute -bottom-0.5 -right-0.5 rounded-full ${enLinea(r) ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800 truncate">{r.nombre}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{r.rol}</span>
                    {r.mfa && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5"><ShieldCheck size={9} />2FA</span>}
                    {r.aal === 'aal2' && <span className="text-[10px] font-bold text-sky-600 bg-sky-50 rounded px-1.5 py-0.5">AAL2</span>}
                    {r.modulo && <span className="text-[10px] text-slate-400">· {r.modulo}</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {navUA(r.user_agent)} · {r.ip || 's/IP'} · visto {fmt(r.refreshed_at || r.created_at)}
                  </div>
                </div>
                <button onClick={() => cerrar(r)} disabled={busy === r.auth_uid}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-50 disabled:opacity-50">
                  <LogOut size={13} /> {busy === r.auth_uid ? '…' : 'Cerrar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <UserIcon size={12} /> «Cerrar» revoca las sesiones (refresh tokens) y avisa al equipo por realtime para el cierre inmediato.
      </p>
    </div>
  );
}
