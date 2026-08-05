import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../supabase';

const OPERACIONES_READ_VIEW = 'tms_operaciones_vigentes';
import { normEstado, ESTADO_COLOR } from '../dash/dashHelpers';
import { soloFecha } from '../dash/dashHelpers';
import NvDetalle from './NvDetalle';
import CertificadosSalida from './CertificadosSalida';

// ============================================================
//  /info — Buscador universal de NVs  (v1.3)
// ============================================================

const PAGE_SIZE = 50;

const SEARCH_COLUMNS = [
  'id',
  'nv_ptm',
  'nv_orange',
  'nv_farmapack',
  'varios',
  'factura',
  'guia',
  'numero_envio',
  'cliente',
  'vendedor',
  'division',
  'centro_costo',
  'transportista',
  'tipo_despacho',
  'estado',
  'fecha_aprobacion',
  'fecha_aprobacion_real',
  'fecha_compromiso',
  'fecha_facturacion',
  'fecha_despacho',
  'fecha_registro_nv',
  'fecha_en_proceso',
  'fecha_shipping',
  'fecha_en_ruta',
  'fecha_entregado',
  'fecha_estado',
  'valor_factura',
  'bultos',
  'incidencia',
  'estado_incidencia',
  'observaciones_incidencia',
  'dias_incidencia',
  'urgente',
  'costo_flete',
  'valor_nv',
  'fillrate',
  'empresa_transporte'
];

/** Escapa el término del usuario para `.ilike` y `.or()`:
 *  - quita comas/paréntesis (rompen la sintaxis de PostgREST or()),
 *  - escapa los comodines LIKE % y _ para que no actúen como wildcard. */
function sanitizarBusqueda(q) {
  return q
    .replace(/[(),]/g, ' ')
    .replace(/[%_\\]/g, (m) => '\\' + m)
    .trim();
}

const CAMPOS_BUSQUEDA = [
  { label: 'NV PTM', col: 'nv_ptm', numeric: true },
  { label: 'NV Orange', col: 'nv_orange' },
  { label: 'NV Farmapack', col: 'nv_farmapack' },
  { label: 'Factura', col: 'factura' },
  { label: 'Guía', col: 'guia' },
  { label: 'Varios', col: 'varios' },
  { label: 'N° Envío', col: 'numero_envio' }
];

const HISTORIAL_KEY = 'ptm_info_historial';
const HISTORIAL_MAX = 6;

function leerHistorial() {
  try {
    const raw = localStorage.getItem(HISTORIAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter((x) => typeof x === 'string').slice(0, HISTORIAL_MAX)
      : [];
  } catch {
    return [];
  }
}

const sfecha = (v) => soloFecha(v, '—');

const fmtValor = (v) => {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  });
};

function detectarCanal(r) {
  if (r.nv_ptm) return 'PTM';
  if (r.nv_orange) return 'Orange';
  if (r.nv_farmapack) return 'Farmapack';
  if (r.varios) return 'Varios';
  return '—';
}

function detectarNV(r) {
  return String(r.nv_ptm || r.nv_orange || r.nv_farmapack || r.varios || '—');
}

// ============================================================
//  Componente principal
// ============================================================

export default function PanelInfoReal() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [limite, setLimite] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sesión global: el botón "Volver a /ingresar" solo aparece con sesión activa.
  const sesionActiva = false;

  useEffect(() => {
    setHistorial(leerHistorial());
  }, []);

  // Las notificaciones de Hito 3 abren directamente la N.V. correspondiente.
  useEffect(() => {
    const nv = searchParams.get('nv')?.trim();
    if (nv && nv !== query) setQuery(nv);
  }, [query, searchParams]);

  const guardarHistorial = useCallback((term) => {
    const t = term.trim();
    if (t.length < 2) return;
    setHistorial((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
        0,
        HISTORIAL_MAX
      );
      try {
        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const borrarHistorial = useCallback(() => {
    setHistorial([]);
    try {
      localStorage.removeItem(HISTORIAL_KEY);
    } catch {}
  }, []);

  // `lim` = cuántas filas traer (paginación por "Cargar más" re-consultando).
  const buscar = useCallback(
    async (lim = PAGE_SIZE) => {
      const q = query.trim();
      if (!q && !fechaDesde && !fechaHasta) {
        setError('Ingresa un término de búsqueda o un rango de fechas.');
        return;
      }
      if (!supabase) {
        setError('Supabase no configurado.');
        return;
      }
      const append = lim > PAGE_SIZE;
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setExpandedId(null);
      }
      setError('');
      setSearched(true);
      setLimite(lim);

      try {
        let sb = supabase.from(OPERACIONES_READ_VIEW).select(SEARCH_COLUMNS.join(','));

        if (fechaDesde) sb = sb.gte('fecha_registro_nv', fechaDesde + 'T00:00:00');
        if (fechaHasta) sb = sb.lte('fecha_registro_nv', fechaHasta + 'T23:59:59');

        if (q) {
          const qs = sanitizarBusqueda(q); // escapa wildcards y comas/paréntesis
          const esNumero = /^\d+$/.test(q);
          const orFilters = [];
          for (const campo of CAMPOS_BUSQUEDA) {
            if (campo.numeric) {
              if (esNumero) orFilters.push(`${campo.col}.eq.${q}`); // q solo dígitos → seguro
            } else if (qs) {
              orFilters.push(`${campo.col}.ilike.%${qs}%`);
            }
          }
          if (orFilters.length > 0) sb = sb.or(orFilters.join(','));
        }

        sb = sb.order('fecha_registro_nv', { ascending: false }).limit(lim);
        const { data, error: err } = await sb;

        if (err) {
          setError('Error en la búsqueda: ' + err.message);
          setResultados([]);
        } else {
          setResultados(data || []);
          if (q && (data?.length ?? 0) > 0) guardarHistorial(q);
        }
      } catch (e) {
        setError('Error: ' + (e instanceof Error ? e.message : 'desconocido'));
        setResultados([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, fechaDesde, fechaHasta, guardarHistorial]
  );

  // Búsqueda instantánea (debounce 300ms) — tipo Google. Reinicia paginación.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 && !fechaDesde && !fechaHasta) return;
    const t = setTimeout(() => {
      buscar(PAGE_SIZE);
    }, 300);
    return () => clearTimeout(t);
  }, [query, fechaDesde, fechaHasta, buscar]);

  const verMas = useCallback(() => {
    buscar(limite + PAGE_SIZE);
  }, [buscar, limite]);
  const hayMas = resultados.length >= limite;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') buscar(PAGE_SIZE);
    },
    [buscar]
  );

  const usarHistorial = useCallback((term) => {
    setQuery(term);
  }, []);

  const handleQueryChange = useCallback(
    (val) => {
      setQuery(val);
      if (val.trim() === '' && !fechaDesde && !fechaHasta) {
        setResultados([]);
        setSearched(false);
        setError('');
        setExpandedId(null);
      }
    },
    [fechaDesde, fechaHasta]
  );

  const conteoEstados = useMemo(() => {
    const m = {};
    resultados.forEach((r) => {
      const est = normEstado(r.estado) || 'Sin estado';
      m[est] = (m[est] || 0) + 1;
    });
    return m;
  }, [resultados]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              PTM
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Info NV</h1>
              <p className="text-xs text-slate-500">Buscador universal de notas de venta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sesionActiva && (
              <a
                href="/ingresar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver
              </a>
            )}
            <span className="text-xs text-slate-400 font-mono">v1.1</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input principal */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por NV PTM, Orange, Farmapack, Factura, Guía, Varios, N° Envío..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition"
              />
            </div>

            {/* Filtros de fecha */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">Desde</label>
                <input
                  type="date"
                  aria-label="Fecha desde (registro de NV)"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-2 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">Hasta</label>
                <input
                  type="date"
                  aria-label="Fecha hasta (registro de NV)"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-2 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={() => buscar(PAGE_SIZE)}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
                Buscar
              </button>
            </div>
          </div>

          {/* Campos de búsqueda info */}
          <p className="mt-2 text-xs text-slate-400">
            Busca por: NV PTM, NV Orange, NV Farmapack, Factura, Guía, Varios o N° de Envío. La
            búsqueda es instantánea mientras escribes.
          </p>

          {/* Historial de búsquedas */}
          {historial.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-400 inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recientes:
              </span>
              {historial.map((h) => (
                <button
                  key={h}
                  onClick={() => usarHistorial(h)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-xs font-medium transition border border-slate-200"
                >
                  {h}
                </button>
              ))}
              <button
                onClick={borrarHistorial}
                className="text-xs text-slate-400 hover:text-red-500 transition ml-1"
                title="Borrar historial"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Resumen de estados */}
        {resultados.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </span>
            <span className="text-slate-300">|</span>
            {Object.entries(conteoEstados).map(([est, cnt]) => (
              <span
                key={est}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: ESTADO_COLOR[est] || '#6b7280' }}
              >
                {est} ({cnt})
              </span>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {searched && !loading && resultados.length === 0 && !error && (
          <div className="text-center py-16">
            <svg
              className="mx-auto w-16 h-16 text-slate-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-500 text-sm">No se encontraron resultados</p>
            <p className="text-slate-400 text-xs mt-1">
              Intenta con otro término o ajusta las fechas
            </p>
          </div>
        )}

        {/* Estado inicial */}
        {!searched && !loading && (
          <div className="text-center py-20">
            <svg
              className="mx-auto w-20 h-20 text-blue-200 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-slate-500">
              Ingresa un término para buscar información de notas de venta
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Puedes buscar por cualquier número de NV, factura, guía o N° de envío
            </p>
          </div>
        )}

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="space-y-3">
            {resultados.map((r) => {
              const est = normEstado(r.estado) || 'Sin estado';
              const canal = detectarCanal(r);
              const nv = detectarNV(r);
              const isExpanded = expandedId === r.id;
              const color = ESTADO_COLOR[est] || '#6b7280';

              const esUrgente = r.urgente === true || String(r.urgente) === 'true';

              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${esUrgente ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  {/* Fila resumen (siempre visible) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    aria-expanded={isExpanded}
                    aria-label={`NV ${nv} — ${est}. ${isExpanded ? 'Contraer' : 'Expandir'} detalle`}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer"
                  >
                    {/* Estado badge */}
                    <span
                      className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {est}
                    </span>

                    {/* Canal + NV */}
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                      <span className="text-xs font-medium text-slate-400">{canal}</span>
                      <span className="font-bold text-slate-800 text-sm">{nv}</span>
                    </div>

                    {/* Cliente + vendedor/transportista */}
                    <div className="hidden sm:flex flex-col min-w-0 flex-1">
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {r.cliente || '—'}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {[r.vendedor, r.transportista].filter((x) => x && x !== '—').join(' · ') ||
                          ' '}
                      </span>
                    </div>

                    {/* Fecha registro */}
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {sfecha(r.fecha_registro_nv)}
                    </span>

                    {/* Urgente badge */}
                    {esUrgente && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded animate-pulse">
                        🚨 URGENTE
                      </span>
                    )}

                    {/* Chevron */}
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Detalle expandido — vista rica (Hero + KPIs + Timeline + Activity) */}
                  {isExpanded && (
                    <NvDetalle
                      r={r}
                      est={est}
                      color={color}
                      nv={nv}
                      canal={canal}
                      certificados={<CertificadosSalida operacionId={r.id} />}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        <InfoSection titulo="Identificación">
                          <InfoRow label="Canal" value={canal} />
                          <InfoRow label="NV PTM" value={r.nv_ptm} />
                          <InfoRow label="NV Orange" value={r.nv_orange} />
                          <InfoRow label="NV Farmapack" value={r.nv_farmapack} />
                          <InfoRow label="Varios" value={r.varios} />
                          <InfoRow label="Factura" value={r.factura} />
                          <InfoRow label="Guía" value={r.guia} />
                          <InfoRow label="N° Envío" value={r.numero_envio} />
                        </InfoSection>

                        <InfoSection titulo="Comercial">
                          <InfoRow label="Cliente" value={r.cliente} />
                          <InfoRow label="Vendedor" value={r.vendedor} />
                          <InfoRow label="División" value={r.division} />
                          <InfoRow label="Centro Costo" value={r.centro_costo} />
                          <InfoRow label="Tipo Despacho" value={r.tipo_despacho} />
                          <InfoRow label="Transportista" value={r.transportista} />
                          <InfoRow label="Emp. Transporte" value={r.empresa_transporte} />
                        </InfoSection>

                        <InfoSection titulo="Valores">
                          <InfoRow label="Valor Factura" value={fmtValor(r.valor_factura)} />
                          <InfoRow label="Valor NV" value={fmtValor(r.valor_nv)} />
                          <InfoRow label="Costo Flete" value={fmtValor(r.costo_flete)} />
                          <InfoRow label="Bultos" value={r.bultos} />
                          <InfoRow label="Fill Rate" value={r.fillrate} />
                        </InfoSection>

                        <InfoSection titulo="Estado">
                          <InfoRow label="Estado" value={est} highlight color={color} />
                          <InfoRow
                            label="Urgente"
                            value={r.urgente === true || String(r.urgente) === 'true' ? 'Sí' : 'No'}
                          />
                          <InfoRow label="Incidencia" value={r.incidencia} />
                          <InfoRow label="Estado Incidencia" value={r.estado_incidencia} />
                          <InfoRow label="Obs. Incidencia" value={r.observaciones_incidencia} />
                          <InfoRow label="Días Incidencia" value={r.dias_incidencia} />
                        </InfoSection>

                        <InfoSection titulo="Fechas Clave">
                          <InfoRow label="Registro NV" value={sfecha(r.fecha_registro_nv)} />
                          <InfoRow
                            label="Fecha de Creación de N.V"
                            value={sfecha(r.fecha_aprobacion)}
                          />
                          <InfoRow label="Aprob. Real" value={sfecha(r.fecha_aprobacion_real)} />
                          <InfoRow label="Compromiso" value={sfecha(r.fecha_compromiso)} />
                          <InfoRow label="Facturación" value={sfecha(r.fecha_facturacion)} />
                        </InfoSection>

                        <InfoSection titulo="Fechas Logística">
                          <InfoRow label="En Proceso" value={sfecha(r.fecha_en_proceso)} />
                          <InfoRow label="Shipping" value={sfecha(r.fecha_shipping)} />
                          <InfoRow label="Despacho" value={sfecha(r.fecha_despacho)} />
                          <InfoRow label="En Ruta" value={sfecha(r.fecha_en_ruta)} />
                          <InfoRow label="Entregado" value={sfecha(r.fecha_entregado)} />
                          <InfoRow label="Últ. cambio estado" value={sfecha(r.fecha_estado)} />
                        </InfoSection>
                      </div>
                    </NvDetalle>
                  )}
                </div>
              );
            })}

            {/* Paginación: cargar más resultados */}
            {hayMas && (
              <div className="text-center pt-2">
                <button
                  onClick={verMas}
                  disabled={loadingMore}
                  className="px-4 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingMore ? 'Cargando…' : `Cargar más (${resultados.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
//  Componentes auxiliares
// ============================================================

function InfoSection({ titulo, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
        {titulo}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight, color }) {
  const display = value == null || value === '' ? '—' : String(value);
  if (display === '—') return null;

  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-slate-400 text-xs w-28 shrink-0">{label}</span>
      {highlight ? (
        <span
          className="font-semibold px-1.5 py-0.5 rounded text-white text-xs"
          style={{ backgroundColor: color }}
        >
          {display}
        </span>
      ) : (
        <span className="text-slate-700 font-medium">{display}</span>
      )}
    </div>
  );
}
