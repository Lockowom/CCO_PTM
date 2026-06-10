import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Truck, Search, Loader2, MapPin, Crosshair, Route, Download, Calculator,
  AlertCircle, X, Building2, Locate
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { withTimeout } from '../../lib/supabaseQuery';
import { exportToExcel } from '../../lib/exportExcel';
import {
  geocodeAddress, routeDistanceKm, haversineKm, sleep,
} from '../../services/logisticaService';

const ORIGIN_LS_KEY = 'cco_origen_transporte';
const GEO_THROTTLE_MS = 1100; // Nominatim: ~1 req/seg
const OSRM_THROTTLE_MS = 350; // OSRM demo: cortesía entre llamadas

const loadOrigin = () => {
  try { return JSON.parse(localStorage.getItem(ORIGIN_LS_KEY) || 'null'); } catch { return null; }
};

const fmtKm = (v) => (v == null ? '—' : `${v.toFixed(1)} km`);
const fmtMoney = (v) => (v == null ? '—' : '$' + Math.round(v).toLocaleString('es-CL'));

// Ajusta el zoom del mapa para encuadrar todos los puntos.
function FitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) { map.setView(points[0], 12); return; }
    map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

const CostosTransporte = () => {
  const [origin, setOrigin] = useState(loadOrigin);   // { label, lat, lon }
  const [originInput, setOriginInput] = useState('');
  const [settingOrigin, setSettingOrigin] = useState(false);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [rows, setRows] = useState([]);               // clientes cargados (con geo/distancia)

  const [valorKm, setValorKm] = useState(1000);       // $/km

  const [progress, setProgress] = useState(null);     // { label, current, total }
  const abortRef = useRef(null);

  // ── Fijar origen (bodega) ────────────────────────────────────────────────
  const fijarOrigen = async () => {
    const term = originInput.trim();
    if (term.length < 3) { toast.warning('Escribe la dirección del origen (bodega)'); return; }
    setSettingOrigin(true);
    try {
      const geo = await geocodeAddress({ direccion: term });
      if (!geo) { toast.error('No se encontró esa dirección de origen'); return; }
      const o = { label: term, lat: geo.lat, lon: geo.lon };
      setOrigin(o);
      localStorage.setItem(ORIGIN_LS_KEY, JSON.stringify(o));
      toast.success('Origen fijado');
    } catch (e) {
      toast.error('Error geocodificando origen: ' + e.message);
    } finally {
      setSettingOrigin(false);
    }
  };

  // ── Buscar clientes ──────────────────────────────────────────────────────
  const buscar = async () => {
    if (query.trim().length < 2) { toast.warning('Ingrese al menos 2 caracteres'); return; }
    setSearching(true);
    try {
      const { data, error } = await withTimeout(
        supabase.rpc('buscar_direcciones', { p_query: query.trim(), p_limit: 100 }),
        { ms: 12000, label: 'búsqueda de clientes' }
      );
      if (error) throw error;
      setRows((data || []).map((d) => ({
        ...d,
        lat: d.latitud, lon: d.longitud,
        distancia_km: null, estimada: false,
      })));
      if (!data || data.length === 0) toast.info('Sin coincidencias');
    } catch (e) {
      toast.error('Error en la búsqueda: ' + e.message);
    } finally {
      setSearching(false);
    }
  };

  const sinCoords = useMemo(() => rows.filter((r) => r.lat == null || r.lon == null), [rows]);
  const conCoords = useMemo(() => rows.filter((r) => r.lat != null && r.lon != null), [rows]);

  const cancelar = () => { abortRef.current?.abort(); };

  // ── Geocodificar las direcciones que no tienen coordenadas ───────────────
  const geocodificarFaltantes = async () => {
    if (sinCoords.length === 0) { toast.info('Todos los clientes ya tienen coordenadas'); return; }
    const ctrl = new AbortController(); abortRef.current = ctrl;
    let ok = 0, fail = 0;
    setProgress({ label: 'Geocodificando', current: 0, total: sinCoords.length });
    try {
      for (let i = 0; i < sinCoords.length; i++) {
        if (ctrl.signal.aborted) break;
        const r = sinCoords[i];
        try {
          const geo = await geocodeAddress(r, { signal: ctrl.signal });
          if (geo) {
            // Persistir en BD para no repetir el trabajo la próxima vez.
            await supabase.from('tms_direcciones')
              .update({ latitud: geo.lat, longitud: geo.lon }).eq('id', r.id);
            setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, lat: geo.lat, lon: geo.lon } : x));
            ok++;
          } else { fail++; }
        } catch (e) {
          if (e?.name === 'AbortError') break;
          fail++;
        }
        setProgress({ label: 'Geocodificando', current: i + 1, total: sinCoords.length });
        await sleep(GEO_THROTTLE_MS);
      }
      toast.success(`Geocodificación: ${ok} ubicadas${fail ? `, ${fail} sin resultado` : ''}`);
    } finally {
      setProgress(null); abortRef.current = null;
    }
  };

  // ── Calcular distancia real (OSRM) origen → cada cliente ─────────────────
  const calcularDistancias = async () => {
    if (!origin) { toast.warning('Primero fija el origen (bodega)'); return; }
    if (conCoords.length === 0) { toast.warning('No hay clientes con coordenadas. Geocodifica primero.'); return; }
    const ctrl = new AbortController(); abortRef.current = ctrl;
    let ok = 0, est = 0;
    setProgress({ label: 'Calculando distancias', current: 0, total: conCoords.length });
    try {
      for (let i = 0; i < conCoords.length; i++) {
        if (ctrl.signal.aborted) break;
        const r = conCoords[i];
        const dest = { lat: r.lat, lon: r.lon };
        let km, estimada = false;
        try {
          km = await routeDistanceKm(origin, dest, { signal: ctrl.signal });
          ok++;
        } catch (e) {
          if (e?.name === 'AbortError') break;
          km = haversineKm(origin, dest); estimada = true; est++; // fallback línea recta
        }
        setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, distancia_km: km, estimada } : x));
        setProgress({ label: 'Calculando distancias', current: i + 1, total: conCoords.length });
        await sleep(OSRM_THROTTLE_MS);
      }
      toast.success(`Distancias: ${ok} reales${est ? `, ${est} estimadas (línea recta)` : ''}`);
    } finally {
      setProgress(null); abortRef.current = null;
    }
  };

  // ── Exportar Excel ───────────────────────────────────────────────────────
  const exportar = () => {
    if (rows.length === 0) { toast.warning('No hay datos para exportar'); return; }
    const detalle = rows.map((r) => ({
      Razon_Social: r.razon_social, Nombre: r.nombre || '', RUT: r.rut || '',
      Direccion: r.direccion || '', Comuna: r.comuna || '', Ciudad: r.ciudad || '', Region: r.region || '',
      Transporte: r.transporte || '',
      Latitud: r.lat ?? '', Longitud: r.lon ?? '',
      Distancia_km: r.distancia_km != null ? Number(r.distancia_km.toFixed(2)) : '',
      Tipo_Distancia: r.distancia_km == null ? '' : (r.estimada ? 'Estimada (recta)' : 'Real (carretera)'),
      Valor_x_km: valorKm,
      Costo_Total: r.distancia_km != null ? Math.round(r.distancia_km * valorKm) : '',
    }));
    const resumen = [
      { Campo: 'Origen', Valor: origin?.label || '— sin fijar —' },
      { Campo: 'Origen Lat/Lon', Valor: origin ? `${origin.lat}, ${origin.lon}` : '' },
      { Campo: 'Valor por km', Valor: valorKm },
      { Campo: 'Clientes', Valor: rows.length },
      { Campo: 'Con distancia', Valor: rows.filter((r) => r.distancia_km != null).length },
      { Campo: 'Costo total estimado', Valor: Math.round(rows.reduce((s, r) => s + (r.distancia_km != null ? r.distancia_km * valorKm : 0), 0)) },
    ];
    exportToExcel({ filename: 'Costos_Transporte', sheets: [
      { name: 'Resumen', rows: resumen }, { name: 'Detalle', rows: detalle },
    ] });
  };

  // ── Datos para mapa y totales ────────────────────────────────────────────
  const mapPoints = useMemo(() => {
    const pts = conCoords.map((r) => [r.lat, r.lon]);
    if (origin) pts.push([origin.lat, origin.lon]);
    return pts;
  }, [conCoords, origin]);

  const costoTotal = useMemo(
    () => rows.reduce((s, r) => s + (r.distancia_km != null ? r.distancia_km * valorKm : 0), 0),
    [rows, valorKm]
  );

  const busy = !!progress;

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <Truck size={30} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Costos de <span className="text-indigo-600">Transporte</span></h1>
            <p className="text-slate-500 font-bold text-sm">Distancia real origen→cliente × valor/km</p>
          </div>
        </div>
        <button onClick={exportar} disabled={rows.length === 0}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-40">
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      {/* Paso 1: Origen */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Crosshair size={18} className="text-indigo-500" />
          <h3 className="text-sm font-black uppercase tracking-wider">1 · Origen (bodega)</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fijarOrigen()}
            placeholder="Dirección de la bodega de despacho (ej. Av. Américo Vespucio 1200, Pudahuel)"
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
          <button onClick={fijarOrigen} disabled={settingOrigin}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
            {settingOrigin ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />} Fijar origen
          </button>
        </div>
        {origin && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 w-fit">
            <MapPin size={14} className="text-emerald-600" />
            <span className="font-bold">{origin.label}</span>
            <span className="text-slate-400 font-mono">({origin.lat.toFixed(5)}, {origin.lon.toFixed(5)})</span>
          </div>
        )}
      </div>

      {/* Paso 2: Buscar clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Building2 size={18} className="text-indigo-500" />
          <h3 className="text-sm font-black uppercase tracking-wider">2 · Clientes</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              placeholder="Buscar clientes por RUT, razón social, comuna…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button onClick={buscar} disabled={searching}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50">
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
          </button>
        </div>
        {rows.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">{rows.length} clientes</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">{conCoords.length} con coordenadas</span>
            {sinCoords.length > 0 && <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold">{sinCoords.length} sin coordenadas</span>}
          </div>
        )}
      </div>

      {/* Paso 3: Acciones + valor/km */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor por km ($)</label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-slate-400 font-bold">$</span>
                <input type="number" min="0" value={valorKm}
                  onChange={(e) => setValorKm(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400" />
              </div>
            </div>

            <button onClick={geocodificarFaltantes} disabled={busy || sinCoords.length === 0}
              className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-black flex items-center gap-2 hover:bg-amber-100 disabled:opacity-40">
              <MapPin size={16} /> Geocodificar faltantes ({sinCoords.length})
            </button>

            <button onClick={calcularDistancias} disabled={busy || !origin || conCoords.length === 0}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-40">
              <Route size={16} /> Calcular distancias reales
            </button>

            <div className="ml-auto flex items-center gap-2 text-sm">
              <Calculator size={16} className="text-slate-400" />
              <span className="font-bold text-slate-500">Costo total estimado:</span>
              <span className="font-black text-indigo-700 text-lg">{fmtMoney(costoTotal)}</span>
            </div>
          </div>

          {/* Progreso de operaciones por lote */}
          {progress && (
            <div className="mt-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>{progress.label}…</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }} />
                </div>
              </div>
              <button onClick={cancelar} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mapa + Tabla */}
      {conCoords.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="h-[360px] w-full relative z-0">
            <MapContainer center={origin ? [origin.lat, origin.lon] : [-33.4489, -70.6693]} zoom={11} style={{ height: '100%', width: '100%' }} className="z-0">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
              <FitBounds points={mapPoints} />
              {origin && (
                <CircleMarker center={[origin.lat, origin.lon]} radius={9} pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.9 }}>
                  <Popup><b>Origen</b><br />{origin.label}</Popup>
                </CircleMarker>
              )}
              {conCoords.map((r) => (
                <CircleMarker key={r.id} center={[r.lat, r.lon]} radius={6}
                  pathOptions={{ color: r.distancia_km != null ? '#10b981' : '#94a3b8', fillColor: r.distancia_km != null ? '#10b981' : '#cbd5e1', fillOpacity: 0.85 }}>
                  <Popup>
                    <b>{r.razon_social}</b><br />
                    {r.direccion}, {r.comuna}<br />
                    {r.transporte && <>🚚 {r.transporte}<br /></>}
                    {r.distancia_km != null && <>📏 {fmtKm(r.distancia_km)}{r.estimada ? ' (recta)' : ''}<br />💰 {fmtMoney(r.distancia_km * valorKm)}</>}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 w-32">RUT</th>
                  <th className="px-4 py-3">Comuna</th>
                  <th className="px-4 py-3">Transporte</th>
                  <th className="px-4 py-3 text-right">Distancia</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 text-sm">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-800">{r.razon_social}</div>
                      <div className="text-xs text-slate-400">{r.direccion}</div>
                    </td>
                    <td className="px-4 py-2.5"><span className="font-mono text-xs text-slate-500">{r.rut || '-'}</span></td>
                    <td className="px-4 py-2.5 text-slate-600">{r.comuna || '—'}</td>
                    <td className="px-4 py-2.5">
                      {r.transporte ? <span className="text-slate-700 font-medium">{r.transporte}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {r.lat == null ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">sin geo</span>
                      ) : r.distancia_km == null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className="font-bold text-slate-700">{fmtKm(r.distancia_km)}{r.estimada && <span className="text-[9px] text-amber-500 ml-1">recta</span>}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-indigo-700">
                      {r.distancia_km != null ? fmtMoney(r.distancia_km * valorKm) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vacío / ayuda */}
      {rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          <Truck size={44} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-base font-bold text-slate-500 mb-1">Calculadora de costos de reparto</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            1) Fija el origen (bodega). 2) Busca clientes. 3) Geocodifica los que no tengan coordenadas y
            calcula la distancia real de carretera. El costo se obtiene multiplicando km × valor/km, y puedes
            exportar todo a Excel.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> Geocodificación y rutas usan servicios gratuitos de OpenStreetMap (limitados): procesa por lotes.
          </div>
        </div>
      )}
    </div>
  );
};

export default CostosTransporte;
