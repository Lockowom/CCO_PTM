import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Camera, Trash2, ChevronRight, Package, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from '../../context/AuthContext';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import {
  useSesionesConteo,
  useCrearSesion,
  useConteos,
  useRegistrarConteo,
  useEliminarConteo,
  fetchLotesSeries,
  estadoConteoMeta
} from '../../services/conteoService';

// ============================================================================
// CONTEO CÍCLICO — vista PDA/handheld (reemplaza el placeholder "Próximamente").
// Flujo: elegir/crear sesión → contar por SKU (con lote/serie) validando en vivo
// contra el stock de CCO. Estilo terminal (negro/mono, acento ámbar).
// ============================================================================

const hOk = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) {}
};
const hErr = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (_) {}
};
const n = (v) => (Number(v) || 0).toLocaleString('es-CL');

export default function ConteoPDA({ onHome }) {
  const { user } = useAuth();
  const [sesion, setSesion] = useState(undefined); // undefined = pantalla de sesión

  if (sesion === undefined) {
    return <SelectorSesion onHome={onHome} onPick={setSesion} />;
  }
  return (
    <Contador sesion={sesion} onBack={() => setSesion(undefined)} onHome={onHome} user={user} />
  );
}

// ---------------------------------------------------------------------------
// Pantalla 1: elegir / crear sesión
// ---------------------------------------------------------------------------
function SelectorSesion({ onHome, onPick }) {
  const { data: sesiones = [], isLoading } = useSesionesConteo();
  const crear = useCrearSesion();

  const nueva = async () => {
    const nombre = (window.prompt('Nombre de la sesión de conteo:') || '').trim();
    if (!nombre) return;
    try {
      const s = await crear.mutateAsync({ nombre });
      hOk();
      toast.success(`Sesión "${s.nombre}" creada`);
      onPick(s);
    } catch (e) {
      hErr();
      toast.error(e.message || 'No se pudo crear');
    }
  };

  return (
    <div className="anim-slide-in min-h-dvh bg-black text-white flex flex-col font-mono">
      <div className="p-3 flex justify-between items-center bg-amber-900">
        <div className="flex items-center gap-2">
          <button onClick={onHome} className="text-amber-300 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-bold text-amber-300">CONTEO CÍCLICO</span>
        </div>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        <button
          onClick={nueva}
          disabled={crear.isPending}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 text-black font-black py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          <Plus size={18} /> NUEVA SESIÓN
        </button>
        <button
          onClick={() => onPick({ id: null, nombre: 'Sin sesión', estado: 'abierta' })}
          className="w-full text-amber-400 text-xs font-bold py-2 border border-amber-900 rounded-xl active:scale-95 transition-transform"
        >
          CONTAR SIN SESIÓN
        </button>

        <div className="pt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Sesiones
        </div>
        {isLoading && <div className="text-slate-500 text-sm">Cargando…</div>}
        {!isLoading && sesiones.length === 0 && (
          <div className="text-slate-600 text-sm">No hay sesiones aún.</div>
        )}
        <div className="space-y-2">
          {sesiones.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-2 active:scale-95 transition-transform ${s.estado === 'abierta' ? 'bg-slate-900 border-amber-900' : 'bg-slate-950 border-slate-800 opacity-70'}`}
            >
              <div className="min-w-0">
                <div className="font-bold text-amber-200 truncate">{s.nombre}</div>
                <div className="text-[10px] text-slate-500">
                  {s.estado === 'abierta' ? '● abierta' : '○ cerrada'}
                  {s.semana ? ` · semana ${s.semana}` : ''}
                </div>
              </div>
              {s.estado !== 'abierta' ? (
                <Lock size={14} className="text-slate-600 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-amber-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pantalla 2: contar dentro de una sesión
// ---------------------------------------------------------------------------
function Contador({ sesion, onBack, onHome, user }) {
  const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();
  const registrar = useRegistrarConteo();
  const eliminar = useEliminarConteo();
  const { data: recientes = [] } = useConteos(sesion.id);

  const [ubicacion, setUbicacion] = useState('');
  const [sku, setSku] = useState('');
  const [detalle, setDetalle] = useState(null); // { rows, loading }
  const [sel, setSel] = useState(null); // fila lote/serie elegida
  const [cantidad, setCantidad] = useState('');
  const skuRef = useRef(null);
  const cantRef = useRef(null);

  const cerrada = sesion.estado !== 'abierta';

  useEffect(() => {
    if (skuRef.current) skuRef.current.focus();
  }, []);

  const buscarSku = async (codigo) => {
    const c = (codigo || '').trim().toUpperCase();
    if (!c) return;
    setSku(c);
    setSel(null);
    setDetalle({ rows: [], loading: true });
    try {
      const rows = await fetchLotesSeries(c, '');
      setDetalle({ rows: rows || [], loading: false });
      setTimeout(() => cantRef.current?.focus(), 50);
    } catch (e) {
      setDetalle({ rows: [], loading: false });
      toast.error(e.message || 'Error al buscar el SKU');
    }
  };

  const escanear = async () => {
    const code = await startScan({ onError: () => toast.error('No se pudo escanear') });
    if (code) buscarSku(code);
  };

  // Stock esperado en vivo según lo elegido.
  const esperado = sel ? Number(sel.disponible) || 0 : null;
  const dif = esperado != null && cantidad !== '' ? Number(cantidad) - esperado : null;

  const guardar = async () => {
    if (cerrada) {
      toast.error('La sesión está cerrada');
      return;
    }
    if (!sku) {
      toast.error('Escaneá o escribí el SKU');
      skuRef.current?.focus();
      return;
    }
    if (cantidad === '' || isNaN(Number(cantidad)) || Number(cantidad) < 0) {
      toast.error('Ingresá la cantidad contada');
      cantRef.current?.focus();
      return;
    }
    try {
      const row = await registrar.mutateAsync({
        sesionId: sesion.id,
        codigo: sku,
        cantidad: Number(cantidad),
        ubicacion,
        partida: sel?.tipo === 'P' ? sel.valor : '',
        serie: sel?.tipo === 'S' ? sel.valor : ''
      });
      const m = estadoConteoMeta(row.estado);
      hOk();
      toast[row.estado === 'CUADRADO' ? 'success' : 'info'](
        `${m.emoji} ${row.codigo_producto} — ${m.label} (contado ${n(row.cantidad_contada)} / sistema ${n(row.cantidad_sistema)})`
      );
      setSku('');
      setDetalle(null);
      setSel(null);
      setCantidad('');
      skuRef.current?.focus();
    } catch (e) {
      hErr();
      toast.error(e.message || 'No se pudo registrar');
    }
  };

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar este conteo?')) return;
    try {
      await eliminar.mutateAsync({ id });
      hOk();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="anim-slide-in min-h-dvh bg-black text-white flex flex-col font-mono">
      {/* Header */}
      <div className="p-3 flex justify-between items-center bg-amber-900">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="text-amber-300 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-bold text-amber-200 truncate">{sesion.nombre}</div>
            <div className="text-[10px] text-amber-400/70">
              {cerrada ? '○ cerrada' : '● abierta'} · {recientes.length} conteos
            </div>
          </div>
        </div>
        <button onClick={onHome} className="text-amber-400/70 text-[10px] font-bold">
          MENÚ
        </button>
      </div>

      {cerrada && (
        <div className="bg-rose-950 text-rose-300 text-[11px] font-bold px-3 py-1.5 text-center">
          Sesión cerrada — solo lectura
        </div>
      )}

      {/* Formulario */}
      <div className="p-3 space-y-3">
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Ubicación (opcional)
          </label>
          <input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value.toUpperCase())}
            placeholder="Ej: G-29-03"
            disabled={cerrada}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-amber-100 placeholder-slate-600 focus:border-amber-500 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase">Producto (SKU)</label>
          <div className="flex gap-2">
            <input
              ref={skuRef}
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  buscarSku(sku);
                }
              }}
              placeholder="Escaneá o escribí…"
              disabled={cerrada}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-amber-100 placeholder-slate-600 focus:border-amber-500 outline-none disabled:opacity-50"
            />
            {isSupportedDevice && (
              <button
                onClick={escanear}
                disabled={isScanning || cerrada}
                className="px-3 bg-amber-700 text-black rounded-lg active:scale-95 disabled:opacity-50"
              >
                <Camera size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Lotes / series del SKU */}
        {detalle && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-40 overflow-y-auto">
            {detalle.loading && (
              <div className="text-slate-500 text-xs px-1 py-2">Buscando stock…</div>
            )}
            {!detalle.loading && detalle.rows.length === 0 && (
              <div className="text-slate-600 text-xs px-1 py-2">
                Sin lotes/series en sistema — se contará contra el total del SKU.
              </div>
            )}
            {detalle.rows.map((r, i) => {
              const on = sel && sel.tipo === r.tipo && sel.valor === r.valor;
              return (
                <button
                  key={i}
                  onClick={() => setSel(on ? null : r)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${on ? 'bg-amber-800/40 border border-amber-600' : 'border border-transparent'}`}
                >
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded ${r.tipo === 'P' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}
                  >
                    {r.tipo === 'P' ? 'LOTE' : 'SERIE'}
                  </span>
                  <span className="text-xs text-amber-100 truncate flex-1">{r.valor}</span>
                  {r.ubicacion && <span className="text-[10px] text-slate-500">{r.ubicacion}</span>}
                  <span
                    className={`text-xs font-bold ${Number(r.disponible) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}
                  >
                    {n(r.disponible)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase">Cantidad contada</label>
          <input
            ref={cantRef}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                guardar();
              }
            }}
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="0"
            disabled={cerrada}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-2xl font-black text-amber-100 placeholder-slate-600 focus:border-amber-500 outline-none disabled:opacity-50"
          />
          {dif != null && (
            <div
              className={`mt-1 text-xs font-bold ${dif === 0 ? 'text-emerald-400' : dif < 0 ? 'text-rose-400' : 'text-amber-400'}`}
            >
              {dif === 0
                ? '✅ Cuadrado'
                : dif < 0
                  ? `❌ Faltan ${n(Math.abs(dif))}`
                  : `⚠️ Sobran ${n(dif)}`}{' '}
              (sistema {n(esperado)})
            </div>
          )}
        </div>

        <button
          onClick={guardar}
          disabled={registrar.isPending || cerrada}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-black py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          <Package size={18} /> {registrar.isPending ? 'REGISTRANDO…' : 'REGISTRAR CONTEO'}
        </button>
      </div>

      {/* Recientes */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest py-2">
          Últimos conteos
        </div>
        {recientes.length === 0 && (
          <div className="text-slate-600 text-sm">Aún no hay conteos en esta sesión.</div>
        )}
        <div className="space-y-1.5">
          {recientes.map((c) => {
            const m = estadoConteoMeta(c.estado);
            return (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2"
              >
                <span className={`text-sm ${m.pda}`}>{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-amber-100 truncate">
                    {c.codigo_producto}
                    {c.partida ? ` · ${c.partida}` : ''}
                    {c.serie ? ` · ${c.serie}` : ''}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    contado {n(c.cantidad_contada)} / sistema {n(c.cantidad_sistema)}
                    {c.ubicacion ? ` · ${c.ubicacion}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => borrar(c.id)}
                  className="text-slate-600 hover:text-rose-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
