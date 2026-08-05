// Port fiel del Dashboard del repo panel- (app/page.tsx) a CCO nativo.
// Copia 1:1 de la estructura, estilos y secciones del original, leyendo datos
// reales de tms_operaciones vía dashData.js. Estilos en dash.css (scoped a
// .dash-root para no colisionar con el resto del Panel).
import { useEffect, useState, useCallback, useRef } from 'react';
import EstadoTable from './components/EstadoTable';
import WeeklyChart from './components/WeeklyChart';
import LeadTimeChart from './components/LeadTimeChart';
import DateFilter from './components/DateFilter';
import EstadoDetalleModal from './components/EstadoDetalleModal';
import IncidenciasModal from './components/IncidenciasModal';
import AlertasRiesgoModal from './components/AlertasRiesgoModal';
import CalidadDatosModal from './components/CalidadDatosModal';
import NotasVentaSummary from './components/NotasVentaSummary';
import KpiGrid from './components/KpiGrid';
import CalidadBanner from './components/CalidadBanner';
import TiemposCicloSection from './components/TiemposCicloSection';
import AlertasOperacionalesSection from './components/AlertasOperacionalesSection';
import RankingsSection from './components/RankingsSection';
import IncidenciasPorVendedorSection from './components/IncidenciasPorVendedorSection';
import OperadoresSection from './components/OperadoresSection';
import DivisionsSection from './components/DivisionsSection';
import TendenciaSection from './components/TendenciaSection';
import {
  fetchDashboardData,
  getOperacionesPorEstado,
  getIncidenciasActivas,
  fetchAuditStats,
  fetchTendenciaHistorica
} from './dashData';
import { supabase } from '../../../supabase';
import { hoyChile } from './dashHelpers';
import { printPanelDashboard } from '../../../lib/printPanelDashboard';
import { toast } from 'sonner';
import './dash.css';

const defaultFrom = '2026-01-01';
const defaultTo = hoyChile();

function getInitialFilter() {
  if (typeof window === 'undefined') return { from: defaultFrom, to: defaultTo };
  return {
    from: localStorage.getItem('panel_filter_from') || defaultFrom,
    to: localStorage.getItem('panel_filter_to') || defaultTo
  };
}

export default function DashboardReal() {
  const [kpis, setKpis] = useState(null);
  const [estadoTable, setEstadoTable] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [leadTime, setLeadTime] = useState([]);
  const [tiemposCiclo, setTiemposCiclo] = useState(null);
  const [rankTransp, setRankTransp] = useState([]);
  const [rankVend, setRankVend] = useState([]);
  const [incidenciasPorVendedor, setIncidenciasPorVendedor] = useState([]);
  const [alertasOp, setAlertasOp] = useState([]);
  const [auditKpis, setAuditKpis] = useState([]);
  const [tendencia, setTendencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [range, setRange] = useState(getInitialFilter);
  const dashboardPrintRef = useRef(null);

  const [detalleEstado, setDetalleEstado] = useState(null);
  const [detalleData, setDetalleData] = useState([]);
  const [detalleLoading, setDetalleLoading] = useState(false);

  const [incidenciasOpen, setIncidenciasOpen] = useState(false);
  const [incidenciasData, setIncidenciasData] = useState([]);
  const [incidenciasLoading, setIncidenciasLoading] = useState(false);

  const [alertasOpen, setAlertasOpen] = useState(false);
  const [alertasData, setAlertasData] = useState({
    vencidos: 0,
    hoy: 0,
    manana: 0,
    total: 0,
    detalle: []
  });

  const [calidadOpen, setCalidadOpen] = useState(false);
  const [calidadData, setCalidadData] = useState({ total: 0, porTipo: {}, detalle: [] });

  const abrirDetalle = useCallback(
    async (estado) => {
      setDetalleEstado(estado);
      setDetalleLoading(true);
      try {
        const rows = await getOperacionesPorEstado(estado, range.from, range.to);
        setDetalleData(rows);
      } catch (err) {
        console.error('Error cargando detalle:', err);
        setDetalleData([]);
      }
      setDetalleLoading(false);
    },
    [range]
  );

  const abrirIncidencias = useCallback(async () => {
    setIncidenciasOpen(true);
    setIncidenciasLoading(true);
    try {
      const rows = await getIncidenciasActivas(range.from, range.to);
      setIncidenciasData(rows);
    } catch (err) {
      console.error('Error cargando incidencias:', err);
      setIncidenciasData([]);
    }
    setIncidenciasLoading(false);
  }, [range]);

  const loadData = useCallback(async (from, to) => {
    setLoading(true);
    setFetchError(null);
    setRange({ from, to });
    try {
      const result = await fetchDashboardData(from, to);
      setKpis(result.kpis);
      setEstadoTable(result.estadoTable);
      setDivisions(result.divisions);
      setWeekly(result.weeklyTrend);
      setResumen(result.estadoResumen);
      setLeadTime(result.leadTimeSemanal);
      setTiemposCiclo(result.tiemposCiclo);
      setRankTransp(result.rankingTransportistas);
      setRankVend(result.rankingVendedores);
      setIncidenciasPorVendedor(result.incidenciasPorVendedor || []);
      setAlertasOp(result.alertasOperacionales);
      setAlertasData(result.alertas);
      setCalidadData(result.calidad);
      setLastUpdate(new Date().toLocaleString('es-CL'));
    } catch (err) {
      console.error('Error loading data:', err);
      setFetchError('Error al cargar los datos. Verifica tu conexión e intenta de nuevo.');
    }
    setLoading(false);
  }, []);

  const downloadPdf = useCallback(() => {
    if (!kpis) return;
    try {
      printPanelDashboard(dashboardPrintRef.current, range);
      toast.info(
        'En la ventana abierta, selecciona “Guardar como PDF” para descargar el Dashboard tal como se ve.'
      );
    } catch (error) {
      console.error('Error exportando PDF del panel:', error);
      toast.error(error.message || 'No se pudo preparar el PDF. Intenta nuevamente.');
    }
  }, [kpis, range]);

  useEffect(() => {
    const init = getInitialFilter();
    loadData(init.from, init.to);
    fetchAuditStats()
      .then((d) => {
        if (d.operadores.length > 0) setAuditKpis(d.operadores);
      })
      .catch(() => {});
    fetchTendenciaHistorica(6)
      .then((d) => setTendencia(d))
      .catch(() => {});
  }, [loadData]);

  const rangeRef = useRef(range);
  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  // Realtime: refresca al instante cuando cambia una N.V. (ingreso/edición en
  // `tms_operaciones`) o al terminar un sync cron/import (`tms_operaciones_sync`).
  // Se DEBOUNCE 2.5s para agrupar ráfagas (ej. carga masiva) en un solo refresco.
  useEffect(() => {
    if (!supabase) return undefined;
    let t = null;
    const refrescar = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (t) clearTimeout(t);
      t = setTimeout(() => loadData(rangeRef.current.from, rangeRef.current.to), 2500);
    };
    const canal = supabase
      .channel('tms-oper-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, refrescar)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
        refrescar
      )
      .subscribe();
    return () => {
      if (t) clearTimeout(t);
      supabase.removeChannel(canal);
    };
  }, [loadData]);

  const [countdown, setCountdown] = useState(120);
  const countdownRef = useRef(120);
  useEffect(() => {
    countdownRef.current = 120;
    setCountdown(120);
    const tick = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        countdownRef.current = 120;
        setCountdown(120);
        if (typeof document !== 'undefined' && document.hidden) return;
        loadData(range.from, range.to);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [loadData, range]);

  useEffect(() => {
    const onVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        countdownRef.current = 120;
        setCountdown(120);
        loadData(rangeRef.current.from, rangeRef.current.to);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [loadData]);

  if (loading && !kpis) {
    return (
      <div className="dash-root min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (fetchError && !kpis) {
    return (
      <div className="dash-root min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-2">Error de carga</p>
          <p className="text-gray-500 mb-4">{fetchError}</p>
          <button
            onClick={() => loadData(range.from, range.to)}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardPrintRef} className="dash-root min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #f57c00, #e65100)' }}
            >
              PTM
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">PANEL DASHBOARD</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Resumen Operacional</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DateFilter onFilter={loadData} defaultFrom={defaultFrom} defaultTo={defaultTo} />
            <button
              onClick={downloadPdf}
              disabled={loading || !kpis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50"
              title="Descargar informe PDF del período filtrado"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v12m0 0 4-4m-4 4-4-4m-5 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"
                />
              </svg>
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={() => {
                countdownRef.current = 120;
                setCountdown(120);
                loadData(range.from, range.to);
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 transition-colors disabled:opacity-50"
              title="Actualizar ahora"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </span>
            </button>
            {lastUpdate && (
              <span className="text-[10px] text-gray-400 hidden sm:inline">{lastUpdate}</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-orange-100 z-[100]">
            <div className="h-full bg-orange-500 animate-pulse w-1/2" />
          </div>
        )}

        <NotasVentaSummary kpis={kpis} onSelect={abrirDetalle} />
        <KpiGrid kpis={kpis} onDetalle={abrirDetalle} />
        <CalidadBanner calidadData={calidadData} onOpen={() => setCalidadOpen(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EstadoTable data={estadoTable} onSelectEstado={abrirDetalle} />
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Estado</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((r) => (
                    <tr
                      key={r.estado}
                      onClick={() => abrirDetalle(r.estado)}
                      className="cursor-pointer hover:bg-orange-50"
                    >
                      <td className="font-medium text-left">{r.estado}</td>
                      <td className="font-bold">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-4">
            <WeeklyChart data={weekly} />
            <LeadTimeChart data={leadTime} />
          </div>
        </div>

        <TiemposCicloSection tiemposCiclo={tiemposCiclo} />
        <AlertasOperacionalesSection alertasOp={alertasOp} />
        <IncidenciasPorVendedorSection
          data={incidenciasPorVendedor}
          onOpenIncidencias={abrirIncidencias}
        />
        <RankingsSection rankTransp={rankTransp} rankVend={rankVend} />
        <OperadoresSection auditKpis={auditKpis} />
        <DivisionsSection divisions={divisions} />
        <TendenciaSection tendencia={tendencia} />

        <div className="text-center text-xs text-gray-400 py-4">
          Fecha de la última actualización: {lastUpdate}
        </div>
      </main>

      {detalleEstado && (
        <EstadoDetalleModal
          estado={detalleEstado}
          data={detalleData}
          loading={detalleLoading}
          onClose={() => setDetalleEstado(null)}
        />
      )}
      {incidenciasOpen && (
        <IncidenciasModal
          open={incidenciasOpen}
          data={incidenciasData}
          loading={incidenciasLoading}
          onClose={() => setIncidenciasOpen(false)}
        />
      )}
      {alertasOpen && (
        <AlertasRiesgoModal
          open={alertasOpen}
          data={alertasData}
          onClose={() => setAlertasOpen(false)}
        />
      )}
      {calidadOpen && (
        <CalidadDatosModal
          open={calidadOpen}
          data={calidadData}
          onClose={() => setCalidadOpen(false)}
        />
      )}
    </div>
  );
}
