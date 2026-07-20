import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Tags, UploadCloud, Loader2, CheckCircle, RefreshCw, ListChecks } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { cargarClasificacionGrupos, reclasificarRecepciones } from '../../services/calidadService';

// Clasificación de productos por GRUPO comercial (ERP) para el checklist de
// Calidad. Carga el mapeo producto→grupo (archivo público generado desde el
// Excel del ERP) vía RPC gateada, y reclasifica las recepciones existentes.
export default function ClasificacionProductos() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_quality') || hasPermission('manage_monitoreo') || user?.rol === 'ADMIN';
  const [cargando, setCargando] = useState(false);
  const [prog, setProg] = useState({ hechos: 0, total: 0 });
  const [resumen, setResumen] = useState(null);
  const [stats, setStats] = useState({ clasificados: 0, grupos: 0 });

  const cargarStats = useCallback(async () => {
    try {
      const [{ count: c1 }, { data: g }] = await Promise.all([
        supabase.from('tms_producto_categoria').select('*', { count: 'exact', head: true }),
        supabase.from('tms_categorias_calidad').select('codigo').eq('activo', true),
      ]);
      setStats({ clasificados: c1 || 0, grupos: (g || []).length });
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { cargarStats(); }, [cargarStats]);

  const ejecutar = async () => {
    if (!puede) return;
    if (!window.confirm('Cargar/actualizar la clasificación de productos por grupo comercial y reclasificar las recepciones. ¿Continuar?')) return;
    setCargando(true); setResumen(null); setProg({ hechos: 0, total: 0 });
    try {
      const resp = await fetch('/data/grupos_calidad.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('No se encontró el archivo de clasificación.');
      const rows = await resp.json();
      if (!Array.isArray(rows) || rows.length === 0) throw new Error('El archivo de clasificación está vacío.');
      const BATCH = 1500;
      const lotes = [];
      for (let i = 0; i < rows.length; i += BATCH) lotes.push(rows.slice(i, i + BATCH));
      setProg({ hechos: 0, total: rows.length });
      let procesados = 0;
      for (const lote of lotes) {
        const r = await cargarClasificacionGrupos(lote);
        procesados += r?.procesados || 0;
        setProg((p) => ({ ...p, hechos: Math.min(p.total, p.hechos + lote.length) }));
      }
      const recl = await reclasificarRecepciones();
      setResumen({ procesados, importacion: recl?.importacion || 0, nacional: recl?.nacional || 0, filas: rows.length });
      toast.success(`Clasificación cargada: ${procesados.toLocaleString()} productos · recepciones reclasificadas`);
      cargarStats();
    } catch (e) {
      toast.error(e.message || 'No se pudo cargar la clasificación');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 text-slate-700">
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl grid place-items-center text-emerald-600 shrink-0"><Tags size={22} /></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Clasificación de <span className="text-emerald-600">Productos</span></h1>
          <p className="text-xs sm:text-sm text-slate-500">Grupos comerciales del ERP para el checklist de Calidad</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
          <div className="text-2xl font-black text-slate-800 tabular-nums">{stats.grupos}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Grupos activos</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
          <div className="text-2xl font-black text-slate-800 tabular-nums">{stats.clasificados.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Productos clasificados</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <ListChecks size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <p>Carga el mapeo <b>producto → grupo comercial</b> (desde el maestro del ERP) y <b>reclasifica</b> las recepciones ya registradas. Los productos que no estén en el maestro quedan como <b>Sin clasificar</b> hasta la próxima carga.</p>
        </div>

        {cargando && prog.total > 0 && (
          <div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((prog.hechos / prog.total) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-center">{prog.hechos.toLocaleString()} / {prog.total.toLocaleString()}</p>
          </div>
        )}

        {resumen && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800 flex items-start gap-2">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-500" />
            <span><b>{resumen.procesados.toLocaleString()}</b> productos clasificados. Recepciones reclasificadas: {resumen.importacion.toLocaleString()} importación · {resumen.nacional.toLocaleString()} nacional.</span>
          </div>
        )}

        <button onClick={ejecutar} disabled={!puede || cargando}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-50">
          {cargando ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {cargando ? 'Cargando…' : 'Cargar / actualizar clasificación'}
        </button>
        {!puede && <p className="text-[11px] text-slate-400">Necesitas permiso de gestión de Calidad para cargar la clasificación.</p>}
      </div>
    </div>
  );
}
