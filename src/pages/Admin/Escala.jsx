import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Database, RefreshCw, Users, UploadCloud, Check, AlertTriangle, Copy, Loader2, Gauge } from 'lucide-react';
import { permisosStats, refrescarPermisos, bulkUsuarios } from '../../services/iamService';

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">
    <div className="text-lg font-black text-slate-800 tabular-nums">{value ?? '—'}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
);

// Parsea líneas "nombre,email,rol[,password]" (coma o tab) → filas.
function parse(text) {
  const rows = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[,\t;]/).map((s) => s.trim());
    const [nombre, email, rol, password] = parts;
    if (!nombre && !email) continue;
    rows.push({ nombre: nombre || '', email: email || '', rol: rol || '', password: password || undefined });
  }
  return rows;
}

export default function Escala() {
  const [stats, setStats] = useState({});
  const [refrescando, setRefrescando] = useState(false);
  const [texto, setTexto] = useState('');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cargar = useCallback(async () => {
    try { setStats(await permisosStats()); } catch (e) { toast.error(e.message || 'No autorizado'); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const filas = useMemo(() => parse(texto), [texto]);

  const recalcular = async () => {
    setRefrescando(true);
    const r = await refrescarPermisos();
    setRefrescando(false);
    if (r?.ok) { toast.success(`Permisos recalculados (${r.filas} filas)`); cargar(); }
    else toast.error(r?.error || 'Error');
  };

  const importar = async () => {
    if (filas.length === 0) { toast.error('Pega al menos una fila (nombre, email, rol)'); return; }
    if (!window.confirm(`¿Cargar ${filas.length} usuario(s)? Se crearán identidades reales de acceso.`)) return;
    setImportando(true); setResultado(null);
    const r = await bulkUsuarios(filas);
    setImportando(false);
    if (r?.ok) {
      setResultado(r);
      toast.success(`${r.creados} creados · ${r.actualizados} actualizados${r.errores?.length ? ` · ${r.errores.length} con error` : ''}`);
      cargar();
    } else toast.error(r?.error || 'Error en la carga');
  };

  const copiarPass = () => {
    const lineas = (resultado?.detalle || []).filter((d) => d.password).map((d) => `${d.email}\t${d.password}`).join('\n');
    if (!lineas) { toast.info('No hay contraseñas generadas'); return; }
    navigator.clipboard?.writeText(lineas);
    toast.success('Credenciales copiadas');
  };

  return (
    <div className="space-y-4">
      {/* MV de permisos efectivos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Gauge size={16} className="text-orange-500" /><h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Permisos efectivos (escala)</h3></div>
          <button onClick={recalcular} disabled={refrescando}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {refrescando ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Recalcular ahora
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          <Stat label="Usuarios" value={stats.usuarios} />
          <Stat label="Roles" value={stats.roles} />
          <Stat label="Permisos" value={stats.permisos} />
          <Stat label="Asignaciones" value={stats.asignaciones} />
          <Stat label="Con ámbito" value={stats.con_ambito} />
          <Stat label="Filas MV" value={stats.filas_mv} />
          <Stat label="Pares efect." value={stats.pares_efectivos} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
          <Database size={12} /> La vista materializada <code className="font-mono">iam.mv_user_permissions</code> se refresca automáticamente cada 5 min (pg_cron) y aquí a demanda. El gate de permisos usa la vista viva (sin retraso en revocaciones).
        </p>
      </div>

      {/* Carga masiva de usuarios */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-2"><Users size={16} className="text-orange-500" /><h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Carga masiva de usuarios</h3></div>
        <p className="text-[12px] text-slate-500">Una línea por usuario: <code className="font-mono bg-slate-50 border border-slate-200 rounded px-1">nombre, email, rol[, contraseña]</code>. Si omites la contraseña, se genera y se te muestra para distribuirla. El email existente <b>actualiza</b> (no duplica).</p>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={7}
          placeholder={'Juan Pérez, juan@ptm.cl, OPERADOR\nMaría Soto, maria@ptm.cl, SUPERVISOR_, Clave123'}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-mono outline-none focus:border-orange-400 resize-y" />
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-slate-400">{filas.length} fila(s) detectada(s)</span>
          <button onClick={importar} disabled={importando || filas.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
            {importando ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} Cargar usuarios
          </button>
        </div>

        {resultado && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center gap-3 text-[13px] font-bold">
              <span className="inline-flex items-center gap-1 text-emerald-600"><Check size={14} /> {resultado.creados} creados</span>
              <span className="inline-flex items-center gap-1 text-sky-600"><RefreshCw size={13} /> {resultado.actualizados} actualizados</span>
              {resultado.errores?.length > 0 && <span className="inline-flex items-center gap-1 text-red-500"><AlertTriangle size={13} /> {resultado.errores.length} error(es)</span>}
              {(resultado.detalle || []).some((d) => d.password) && (
                <button onClick={copiarPass} className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-orange-600 hover:text-orange-700"><Copy size={12} /> Copiar credenciales</button>
              )}
            </div>
            {resultado.errores?.length > 0 && (
              <ul className="text-[12px] text-red-500 space-y-0.5">
                {resultado.errores.map((e, i) => <li key={i} className="font-mono">{e.email}: {e.error}</li>)}
              </ul>
            )}
            {(resultado.detalle || []).filter((d) => d.password).length > 0 && (
              <div className="text-[12px] text-slate-600">
                <p className="font-bold mb-1">Contraseñas generadas (distribúyelas de forma segura):</p>
                <ul className="font-mono space-y-0.5">
                  {resultado.detalle.filter((d) => d.password).map((d, i) => <li key={i}>{d.email} → {d.password}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
