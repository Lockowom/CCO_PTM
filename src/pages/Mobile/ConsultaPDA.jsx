import React, { useState, useRef, useEffect } from 'react';
import {
  Search, ArrowLeft, Camera, Package, MapPin, Boxes, Loader2, WifiOff, X,
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import useOnlineStatus from '../../hooks/useOnlineStatus';

// Consulta de stock desde el PDA: busca por SKU, descripción o ubicación en
// wms_ubicaciones (stock físico ubicado) y agrupa por producto mostrando dónde
// está y cuánto hay. Reemplaza el antiguo placeholder "Próximamente".
const ConsultaPDA = ({ onHome }) => {
  const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();
  const online = useOnlineStatus();
  const [q, setQ] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [grupos, setGrupos] = useState(null); // null = aún no busca
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const buscar = async (termRaw) => {
    const term = (termRaw ?? q).trim();
    if (!term) return;
    setBuscando(true);
    try {
      const like = term.replace(/[%_]/g, ''); // evita comodines accidentales
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion, codigo, descripcion, cantidad')
        .or(`codigo.ilike.%${like}%,ubicacion.ilike.%${like}%,descripcion.ilike.%${like}%`)
        .limit(300);
      if (error) throw error;

      // Agrupar por código: total + lista de ubicaciones.
      const map = new Map();
      (data || []).forEach((r) => {
        const key = r.codigo || r.ubicacion || '—';
        const g = map.get(key) || { codigo: r.codigo || '', descripcion: r.descripcion || '', total: 0, ubicaciones: [] };
        g.total += Number(r.cantidad) || 0;
        if (r.ubicacion) g.ubicaciones.push({ ubicacion: r.ubicacion, cantidad: Number(r.cantidad) || 0 });
        if (!g.descripcion && r.descripcion) g.descripcion = r.descripcion;
        map.set(key, g);
      });
      const res = [...map.values()].sort((a, b) => b.total - a.total);
      setGrupos(res);
      if (!res.length) toast.info('Sin resultados para esa búsqueda');
    } catch (err) {
      toast.error(`Error al consultar: ${err.message || 'desconocido'}`);
      setGrupos([]);
    } finally { setBuscando(false); }
  };

  const escanear = async () => {
    await startScan({
      onScan: (value) => {
        try { Haptics.impact({ style: ImpactStyle.Light }); } catch (_) { /* noop */ }
        const v = value.trim();
        setQ(v);
        buscar(v);
      },
      onError: (msg) => toast.error(msg),
    });
  };

  const onSubmit = (e) => { e.preventDefault(); buscar(); };

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col font-mono">
      {/* Header (respeta el notch/barra de estado) */}
      <div className="bg-blue-900 p-3 flex justify-between items-center" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          <button onClick={onHome} className="text-blue-300 hover:text-white" aria-label="Volver">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-bold text-blue-300">CONSULTA DE STOCK</span>
        </div>
        {!online && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-1 rounded-md">
            <WifiOff size={11} /> SIN SEÑAL
          </span>
        )}
      </div>

      {/* Buscador */}
      <form onSubmit={onSubmit} className="p-3 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SKU, descripción o ubicación…"
              autoComplete="off"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 pr-9 text-white font-bold outline-none focus:border-blue-400 min-h-[44px]"
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); setGrupos(null); inputRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1" aria-label="Limpiar">
                <X size={16} />
              </button>
            )}
          </div>
          {isSupportedDevice && (
            <button type="button" onClick={escanear} disabled={isScanning}
              className="px-4 min-w-[44px] bg-blue-600 active:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50" aria-label="Escanear">
              <Camera size={20} />
            </button>
          )}
          <button type="submit" disabled={buscando || !q.trim()}
            className="px-4 min-w-[44px] bg-blue-500 active:bg-blue-600 text-black font-bold rounded-lg flex items-center justify-center disabled:opacity-40">
            {buscando ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </div>
      </form>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {grupos === null && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-600">
            <Search size={40} />
            <p className="text-sm">Escanea o escribe para consultar el stock</p>
          </div>
        )}
        {grupos !== null && !buscando && grupos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-600">
            <Package size={40} />
            <p className="text-sm">Sin resultados</p>
          </div>
        )}
        {grupos?.map((g) => (
          <div key={g.codigo || g.descripcion} className="anim-fade-up bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-800/60 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-blue-400 font-black text-lg truncate">{g.codigo || '—'}</div>
                <div className="text-slate-300 text-xs truncate">{g.descripcion || 'Sin descripción'}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-500 uppercase">Total</div>
                <div className="text-2xl font-black text-white flex items-center gap-1"><Boxes size={16} className="text-slate-500" />{g.total}</div>
              </div>
            </div>
            <div className="divide-y divide-slate-800">
              {g.ubicaciones.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">Sin ubicación registrada</div>
              ) : g.ubicaciones.map((u, i) => (
                <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><MapPin size={13} />{u.ubicacion}</span>
                  <span className="text-white font-black">{u.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultaPDA;
