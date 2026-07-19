import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, Smartphone, KeyRound, Trash2, Check, Loader2, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { estadoMFA, enrolarTOTP, verificarTOTP, quitarFactor } from '../services/securityService';

const fmt = (ts) => { if (!ts) return ''; const d = new Date(ts); return isNaN(d) ? '' : d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' }); };

export default function Seguridad() {
  const { user } = useAuth();
  const [estado, setEstado] = useState({ enabled: false, factors: [] });
  const [loading, setLoading] = useState(true);
  const [enroll, setEnroll] = useState(null); // { factorId, qr, secret }
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setEstado(await estadoMFA()); }
    catch (e) { toast.error(e.message || 'No se pudo cargar'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const iniciar = async () => {
    setBusy(true);
    try { setEnroll(await enrolarTOTP(`CCO · ${user?.nombre || 'usuario'}`)); }
    catch (e) { toast.error(e.message || 'No se pudo iniciar el enrolamiento'); }
    finally { setBusy(false); }
  };

  const confirmar = async () => {
    if (code.length < 6) { toast.error('Ingresa el código de 6 dígitos'); return; }
    setBusy(true);
    try {
      await verificarTOTP(enroll.factorId, code);
      toast.success('Verificación en dos pasos activada');
      setEnroll(null); setCode('');
      cargar();
    } catch (e) { toast.error(e.message || 'Código incorrecto'); }
    finally { setBusy(false); }
  };

  const desactivar = async (factorId) => {
    if (!window.confirm('¿Desactivar la verificación en dos pasos de este autenticador?')) return;
    try { await quitarFactor(factorId); toast.success('Factor eliminado'); cargar(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const cancelarEnroll = async () => {
    if (enroll?.factorId) { try { await quitarFactor(enroll.factorId); } catch { /* noop */ } }
    setEnroll(null); setCode('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Cabecera */}
        <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Seguridad de mi cuenta</h1>
            <p className="text-xs sm:text-sm text-slate-500">Verificación en dos pasos (2FA / TOTP)</p>
          </div>
        </div>

        {/* Estado */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${estado.enabled ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
          {estado.enabled ? <ShieldCheck size={22} className="text-emerald-600 shrink-0" /> : <ShieldAlert size={22} className="text-amber-500 shrink-0" />}
          <div className="min-w-0">
            <p className="font-black text-slate-800 text-[14px]">{estado.enabled ? 'Verificación en dos pasos ACTIVA' : 'Verificación en dos pasos inactiva'}</p>
            <p className="text-[12px] text-slate-500">{estado.enabled ? 'Tu cuenta pide un código de tu app autenticadora al iniciar sesión.' : 'Añade una capa extra: un código temporal desde Google Authenticator, Authy, 1Password, etc.'}</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-400 text-sm">Cargando…</div>
        ) : enroll ? (
          /* Flujo de enrolamiento */
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2"><QrCode size={16} className="text-orange-500" /><h3 className="font-black text-slate-800 text-[14px]">Escanea el código con tu app</h3></div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {enroll.qr && <img src={enroll.qr} alt="QR TOTP" className="w-44 h-44 rounded-xl border border-slate-100 bg-white" />}
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[12px] text-slate-500">¿No puedes escanear? Ingresa esta clave manualmente:</p>
                <code className="block text-[12px] font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 break-all text-slate-700">{enroll.secret}</code>
                <label className="block"><span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Código de 6 dígitos</span>
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric" placeholder="000000"
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-lg font-mono tracking-[0.3em] text-center outline-none focus:border-orange-400" />
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={confirmar} disabled={busy || code.length < 6}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Verificar y activar
              </button>
              <button onClick={cancelarEnroll} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancelar</button>
            </div>
          </div>
        ) : (
          /* Estado normal: activar o listar factores */
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            {estado.factors.filter((f) => f.status === 'verified').length > 0 ? (
              <>
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Autenticadores</h3>
                {estado.factors.filter((f) => f.status === 'verified').map((f) => (
                  <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/60">
                    <Smartphone size={17} className="text-emerald-500 shrink-0" />
                    <div className="min-w-0 flex-1"><div className="font-bold text-slate-800 text-[13px] truncate">{f.nombre || 'Autenticador TOTP'}</div><div className="text-[11px] text-slate-400">Activo desde {fmt(f.created_at)}</div></div>
                    <button onClick={() => desactivar(f.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0"><Trash2 size={15} /></button>
                  </div>
                ))}
                <button onClick={iniciar} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                  <KeyRound size={15} /> Añadir otro autenticador
                </button>
              </>
            ) : (
              <button onClick={iniciar} disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Activar verificación en dos pasos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
