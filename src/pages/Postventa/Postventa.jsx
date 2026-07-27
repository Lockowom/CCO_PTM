import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  X,
  Download,
  LayoutDashboard,
  ClipboardList,
  Users,
  Save,
  Trash2,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Pencil,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MailOpen,
  Building2,
  Globe2,
  Paperclip,
  Link2,
  Loader2,
  FileText,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import { signedUrls } from '../../lib/storageUrl';
import { comunasDeRegion } from '../../constants/comunasChile';
import { publicUrl, publicBaseUrl } from '../../lib/publicUrl';
import { fetchNvPanel } from '../../services/panelPtm';
import { puedeVerTab } from '../../constants/permissions';
import {
  PV_REGIONES,
  PV_TIPOS_SOLICITUD,
  PV_PRIORIDADES,
  PV_ESTADOS,
  PV_COTIZAR,
  PV_RESULTADOS,
  PV_FLUJO,
  pvSiguienteEstado,
  pvEstadoCls,
  pvPrioridadCls,
  pvTipoCls,
  pvFolioCls,
  useTecnicos,
  useGuardarTecnico,
  useEliminarTecnico,
  useTickets,
  useCrearTicket,
  useActualizarTicket,
  usePvDashboard,
  useFamiliasStock,
  useCorreosTicket,
  esCorreoInterno,
  useEliminarTicket,
  useEliminarCorreo,
  useReasociarCorreo,
  useAvanzarTicket,
  useCerrarTicket,
  usePvHistorial,
  useInformeCalidadTicket
} from '../../services/postventaService';

const fechaCL = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CL') : '—');
const fechaHoraCL = (d) => {
  try {
    return d
      ? new Date(d).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
      : '—';
  } catch {
    return d || '—';
  }
};
const n = (v) => (Number(v) || 0).toLocaleString('es-CL');
// Chip Interno/Externo según el dominio del correo del remitente.
function OrigenChip({ email }) {
  const interno = esCorreoInterno(email);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${interno ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-teal-100 text-teal-700 border-teal-200'}`}
    >
      {interno ? <Building2 size={11} /> : <Globe2 size={11} />}
      {interno ? 'Interno' : 'Externo'}
    </span>
  );
}
// Opciones del selector Equipo/Modelo = familias del stock (3 primeros chars del código).
// Por ahora solo el nombre de la familia.
const equipoOpciones = (familias) => (familias || []).map((f) => f.familia);

const TABS = [
  { id: 'tickets', label: 'Tickets', icon: ClipboardList },
  { id: 'bandeja', label: 'Bandeja Correos', icon: Mail },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'nuevo', label: 'Nuevo Ticket', icon: Plus },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tecnicos', label: 'Técnicos', icon: Users }
];

export default function Postventa() {
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'tickets');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;

  // Deep-link desde el menú (?tab=dashboard, ?tab=nuevo, ?tab=tecnicos).
  // Sin ?tab (item "Tickets" del menú, botón atrás) se vuelve a Tickets: antes
  // el estado quedaba pegado en la pestaña anterior.
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
    else if (!t && tab !== 'tickets') setTab('tickets');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const irTab = (id) => {
    setTab(id);
    setSearchParams(id === 'tickets' ? {} : { tab: id }, { replace: true });
  };
  const canManage =
    isAdmin || hasPermission('manage_postventa') || hasPermission('supervise_postventa');
  const canSupervise = isAdmin || hasPermission('supervise_postventa');

  const puedeTab = (id) => puedeVerTab(hasPermission, '/postventa/tickets', id);
  const visibleTabs = TABS.filter((t) => {
    if (!puedeTab(t.id)) return false; // control fino por pestaña (Roles)
    if (t.id === 'nuevo') return canManage; // crear requiere gestión
    if (t.id === 'tecnicos') return canSupervise; // técnicos requiere supervisión
    return true;
  });
  // Si el deep-link apunta a una pestaña no autorizada, cae a la primera visible.
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : visibleTabs[0]?.id || 'tickets';

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <Wrench size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Servicio <span className="text-orange-600">Técnico</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Post-Venta · tickets de equipos médicos, técnicos y seguimiento
            </p>
          </div>
        </div>
      </div>

      {activeTab === 'tickets' && <TabTickets canManage={canManage} canSupervise={canSupervise} />}
      {activeTab === 'bandeja' && <TabBandeja canManage={canManage} canSupervise={canSupervise} />}
      {activeTab === 'calendario' && (
        <TabCalendario canManage={canManage} canSupervise={canSupervise} />
      )}
      {activeTab === 'nuevo' && canManage && <TabNuevo onCreated={() => irTab('tickets')} />}
      {activeTab === 'dashboard' && <TabDashboard />}
      {activeTab === 'tecnicos' && canSupervise && <TabTecnicos />}
    </div>
  );
}

// ─── Tickets (lista + filtros + edición) ─────────────────────────────────────
function TabTickets({ canManage, canSupervise }) {
  const [filtros, setFiltros] = useState({
    estado: '',
    tecnico: '',
    prioridad: '',
    tipo: '',
    origen: '',
    q: ''
  });
  const { data: tickets = [], isLoading } = useTickets(filtros);
  const { data: tecnicos = [] } = useTecnicos();
  const [editar, setEditar] = useState(null);

  // Eliminación (solo supervisión/admin): de a uno o masivo por selección.
  const eliminar = useEliminarTicket();
  const [sel, setSel] = useState(() => new Set());
  const [borrando, setBorrando] = useState(false);
  const toggleSel = (numero) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(numero) ? n.delete(numero) : n.add(numero);
      return n;
    });
  const allSel = tickets.length > 0 && tickets.every((t) => sel.has(t.numero));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(tickets.map((t) => t.numero)));
  const nSel = tickets.filter((t) => sel.has(t.numero)).length;
  const borrarUno = async (t) => {
    if (!confirm(`¿Eliminar el ticket ${t.numero}? No se puede deshacer.`)) return;
    try {
      await eliminar.mutateAsync({ numero: t.numero });
      toast.success(`${t.numero} eliminado`);
      setSel((s) => {
        const n = new Set(s);
        n.delete(t.numero);
        return n;
      });
    } catch (e) {
      toast.error(e.message || 'No se pudo eliminar');
    }
  };
  const borrarMasivo = async () => {
    const objetivo = tickets.filter((t) => sel.has(t.numero));
    if (!objetivo.length) return;
    if (!confirm(`¿Eliminar ${objetivo.length} ticket(s) seleccionado(s)? No se puede deshacer.`))
      return;
    setBorrando(true);
    let ok = 0;
    for (const t of objetivo) {
      try {
        await eliminar.mutateAsync({ numero: t.numero });
        ok++;
      } catch {
        /* continúa */
      }
    }
    setBorrando(false);
    setSel(new Set());
    toast.success(`Eliminados ${ok}/${objetivo.length}`);
  };

  const exportar = () => {
    if (!tickets.length) return toast.info('No hay tickets para exportar');
    exportToExcel({
      filename: 'postventa_tickets',
      sheets: [
        {
          name: 'Tickets',
          rows: tickets.map((t) => ({
            Número: t.numero,
            'ID Tipo': t.folio_tipo || '',
            Fecha: fechaCL(t.fecha_apertura),
            Cliente: t.cliente,
            Región: t.region,
            Comuna: t.comuna || '',
            'N.V.': t.nv || '',
            Vendedor: t.vendedor || '',
            Equipo: t.equipo_modelo,
            'N° Serie': t.numero_serie || '',
            Tipo: t.tipo_solicitud,
            Prioridad: t.prioridad,
            Técnico: t.tecnico_asignado,
            Estado: t.estado,
            Cotizar: t.cotizar,
            Cierre: fechaCL(t.fecha_cierre),
            Resultado: t.resultado || '',
            Origen: t.origen,
            Descripción: t.descripcion,
            Observaciones: t.observaciones || ''
          }))
        }
      ]
    });
  };

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Buscar
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filtros.q}
              onChange={(e) => setF('q', e.target.value)}
              placeholder="N° ticket, cliente, equipo, serie…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>
        <FiltroSelect
          label="Tipo"
          value={filtros.tipo}
          onChange={(v) => setF('tipo', v)}
          options={PV_TIPOS_SOLICITUD}
        />
        <FiltroSelect
          label="Origen"
          value={filtros.origen}
          onChange={(v) => setF('origen', v)}
          options={['Manual', 'Correo', 'Calidad']}
        />
        <FiltroSelect
          label="Estado"
          value={filtros.estado}
          onChange={(v) => setF('estado', v)}
          options={PV_ESTADOS}
        />
        <FiltroSelect
          label="Prioridad"
          value={filtros.prioridad}
          onChange={(v) => setF('prioridad', v)}
          options={PV_PRIORIDADES}
        />
        <FiltroSelect
          label="Técnico"
          value={filtros.tecnico}
          onChange={(v) => setF('tecnico', v)}
          options={tecnicos.map((t) => t.nombre)}
        />
        <button
          onClick={exportar}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <Download size={15} /> Excel
        </button>
        {canSupervise && nSel > 0 && (
          <button
            onClick={borrarMasivo}
            disabled={borrando}
            className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-black hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {borrando ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}{' '}
            Eliminar ({nSel})
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
                {canSupervise && (
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSel}
                      onChange={toggleAll}
                      className="accent-rose-600 w-4 h-4"
                      title="Seleccionar todos"
                    />
                  </th>
                )}
                <th className="text-left font-bold px-4 py-3">Ticket</th>
                <th className="text-left font-bold px-4 py-3">Cliente / Equipo</th>
                <th className="text-left font-bold px-4 py-3">Tipo</th>
                <th className="text-left font-bold px-4 py-3">Técnico</th>
                <th className="text-left font-bold px-4 py-3">Prioridad</th>
                <th className="text-left font-bold px-4 py-3">Estado</th>
                <th className="text-right font-bold px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td
                    colSpan={canSupervise ? 8 : 7}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Cargando…
                  </td>
                </tr>
              )}
              {!isLoading && !tickets.length && (
                <tr>
                  <td
                    colSpan={canSupervise ? 8 : 7}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Sin tickets
                  </td>
                </tr>
              )}
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-orange-50/40 ${sel.has(t.numero) ? 'bg-rose-50/50' : ''}`}
                >
                  {canSupervise && (
                    <td className="px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={sel.has(t.numero)}
                        onChange={() => toggleSel(t.numero)}
                        className="accent-rose-600 w-4 h-4 mt-0.5"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 align-top">
                    <div className="font-black text-slate-800 flex items-center gap-1.5">
                      {t.numero}
                      {t.origen === 'Correo' && (
                        <Mail size={13} className="text-sky-500" title="Creado desde correo" />
                      )}
                      {t.origen === 'Calidad' && (
                        <span
                          title={`Generado desde Acción de Calidad ${t.accion_folio || ''}`}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          <ClipboardList size={10} /> Calidad
                        </span>
                      )}
                    </div>
                    {t.folio_tipo && (
                      <div className="mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${pvFolioCls(t)}`}
                        >
                          {t.folio_tipo}
                        </span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">{fechaCL(t.fecha_apertura)}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-slate-700">{t.cliente}</div>
                    <div className="text-[11px] text-slate-400">
                      {t.comuna ? `${t.comuna}, ` : ''}
                      {t.region}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.equipo_modelo}
                      {t.numero_serie ? ` · ${t.numero_serie}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvTipoCls(t.tipo_solicitud)}`}
                    >
                      {t.tipo_solicitud}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">{t.tecnico_asignado}</td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvPrioridadCls(t.prioridad)}`}
                    >
                      {t.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}
                    >
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setEditar(t)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Pencil size={13} /> {canManage ? 'Editar' : 'Ver'}
                      </button>
                      {canSupervise && (
                        <button
                          onClick={() => borrarUno(t)}
                          title="Eliminar ticket"
                          className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 inline-flex items-center text-xs font-bold"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editar && (
        <ModalEditar
          ticket={editar}
          canManage={canManage}
          canSupervise={canSupervise}
          onClose={() => setEditar(null)}
        />
      )}
    </div>
  );
}

// ─── Bandeja de Correos (triage / derivar) ───────────────────────────────────
function TabBandeja({ canManage, canSupervise }) {
  const [q, setQ] = useState('');
  const [soloPend, setSoloPend] = useState(true);
  const [origen, setOrigen] = useState(''); // '', 'interno', 'externo'
  const { data: todos = [], isLoading } = useTickets(q.trim() ? { q } : {});
  const { data: tecnicos = [] } = useTecnicos(true);
  const derivar = useActualizarTicket();
  const eliminar = useEliminarTicket();
  const [editar, setEditar] = useState(null);
  const [leer, setLeer] = useState(null);

  // Solo tickets que entraron por correo.
  let correos = todos.filter((t) => t.origen === 'Correo');
  if (origen)
    correos = correos.filter(
      (t) => (esCorreoInterno(t.contacto) ? 'interno' : 'externo') === origen
    );
  // "Por asignar": sin técnico. "Por gestionar": además datos por definir / recién abierto.
  const porAsignar = (t) => t.tecnico_asignado === 'Sin Asignar';
  const porGestionar = (t) =>
    porAsignar(t) ||
    t.region === 'Por Definir' ||
    t.equipo_modelo === 'Por Definir' ||
    t.estado === 'Abierto';
  const lista = soloPend ? correos.filter(porGestionar) : correos;
  const nPend = correos.filter(porGestionar).length;
  const nAsignar = correos.filter(porAsignar).length;

  const [vaciando, setVaciando] = useState(false);
  const vaciarBandeja = async () => {
    if (!lista.length) return toast.info('La bandeja ya está en 0');
    if (
      !confirm(
        `¿Descartar los ${lista.length} caso(s) de correo que se muestran? Quedarán descartados y NO volverán a cargarse (deja la bandeja en 0). Tip: reasocia primero los correos correctos a su ticket.`
      )
    )
      return;
    setVaciando(true);
    let ok = 0;
    for (const t of lista) {
      try {
        await eliminar.mutateAsync({ numero: t.numero });
        ok++;
      } catch {
        /* continúa con el resto */
      }
    }
    setVaciando(false);
    toast.success(`Bandeja limpiada: ${ok}/${lista.length} descartado(s)`);
  };

  const asignar = async (t, tecnico) => {
    try {
      await derivar.mutateAsync({
        numero: t.numero,
        campos: {
          tecnico_asignado: tecnico,
          estado: t.estado === 'Abierto' ? 'En Proceso' : t.estado
        }
      });
      toast.success(`${t.numero} derivado a ${tecnico}`);
    } catch (e) {
      toast.error(e.message || 'Error al derivar');
    }
  };
  const borrar = async (t) => {
    if (
      !confirm(
        `¿Eliminar el caso ${t.numero}? El/los correo(s) quedarán descartados y NO volverán a cargarse.`
      )
    )
      return;
    try {
      await eliminar.mutateAsync({ numero: t.numero });
      toast.success(`${t.numero} eliminado y descartado`);
    } catch (e) {
      toast.error(e.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <Mail size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-black text-slate-800">Bandeja de Correos</div>
          <div className="text-xs text-slate-500">
            {correos.length} caso(s) ·{' '}
            <span className="font-bold text-rose-600">{nAsignar} por asignar</span> ·{' '}
            <span className="font-bold text-orange-600">{nPend} por gestionar</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar remitente, asunto…"
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-full sm:w-64"
          />
        </div>
        <div className="flex items-center gap-1">
          {[
            ['', 'Todos'],
            ['interno', 'Internos'],
            ['externo', 'Externos']
          ].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setOrigen(v)}
              className={`px-2.5 py-2 rounded-xl text-xs font-black border ${origen === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSoloPend((v) => !v)}
          className={`px-3 py-2 rounded-xl text-xs font-black border ${soloPend ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          {soloPend ? 'Por gestionar' : 'Todos los correos'}
        </button>
        {canSupervise && (
          <button
            onClick={vaciarBandeja}
            disabled={vaciando || !lista.length}
            title="Descartar los casos mostrados (deja la bandeja en 0)"
            className="px-3 py-2 rounded-xl text-xs font-black border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {vaciando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Dejar
            en 0
          </button>
        )}
      </div>

      {/* Lista de casos */}
      <div className="space-y-2">
        {isLoading && <div className="text-slate-400 text-center py-10">Cargando…</div>}
        {!isLoading && !lista.length && (
          <div className="text-slate-400 text-center py-10 bg-white rounded-2xl border border-slate-200">
            Sin correos {soloPend ? 'por gestionar' : ''}.
          </div>
        )}
        {lista.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-800">{t.numero}</span>
                  {t.folio_tipo && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${pvFolioCls(t)}`}
                    >
                      {t.folio_tipo}
                    </span>
                  )}
                  <Mail size={13} className="text-sky-500" />
                  <OrigenChip email={t.contacto} />
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}
                  >
                    {t.estado}
                  </span>
                  {porGestionar(t) && (
                    <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border bg-amber-100 text-amber-700 border-amber-200">
                      Por gestionar
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{fechaCL(t.fecha_apertura)}</span>
                </div>
                <button
                  onClick={() => setLeer(t)}
                  className="text-left font-semibold text-slate-700 mt-1 hover:text-orange-600"
                >
                  {t.cliente}
                  {t.contacto ? ` · ${t.contacto}` : ''}
                </button>
                <div className="text-xs text-slate-500 line-clamp-2 whitespace-pre-line">
                  {t.descripcion}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => setLeer(t)}
                  className="px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 bg-sky-50 text-xs font-black hover:bg-sky-100 inline-flex items-center gap-1"
                >
                  <MailOpen size={13} /> Leer
                </button>
                {canManage && (
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && asignar(t, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="">Derivar a técnico…</option>
                    {tecnicos.map((tc) => (
                      <option key={tc.id} value={tc.nombre}>
                        {tc.nombre}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-2">
                  {canManage && (
                    <button
                      onClick={() => setEditar(t)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-black hover:bg-orange-700 inline-flex items-center gap-1"
                    >
                      <Pencil size={13} /> Gestionar
                    </button>
                  )}
                  {canSupervise && (
                    <button
                      onClick={() => borrar(t)}
                      title="Eliminar y descartar"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leer && (
        <ThreadReader
          ticket={leer}
          canSupervise={canSupervise}
          onClose={() => setLeer(null)}
          onGestionar={(t) => {
            setLeer(null);
            setEditar(t);
          }}
        />
      )}
      {editar && (
        <ModalEditar
          ticket={editar}
          canManage={canManage}
          canSupervise={canSupervise}
          onClose={() => setEditar(null)}
        />
      )}
    </div>
  );
}

// ─── Lector de correo (hilo estilo Outlook) ──────────────────────────────────
function ThreadReader({ ticket, canSupervise, onClose, onGestionar }) {
  const { data: correos = [], isLoading } = useCorreosTicket(ticket.numero);
  const elimCorreo = useEliminarCorreo();
  const reasociar = useReasociarCorreo();
  const asuntoHilo = correos[0]?.asunto || ticket.descripcion || ticket.numero;
  const borrarCorreo = async (c) => {
    if (!confirm('¿Eliminar este correo del caso? Quedará descartado y no volverá a cargarse.'))
      return;
    try {
      await elimCorreo.mutateAsync({ idCorreo: c.id_correo });
      toast.success('Correo eliminado');
    } catch (e) {
      toast.error(e.message || 'Error al eliminar');
    }
  };
  const reasociarCorreo = async (c) => {
    const destino = (
      window.prompt(
        `Reasociar este correo al ticket N° (ej. ${ticket.numero}).\nEscribe el número del ticket CORRECTO:`
      ) || ''
    ).trim();
    if (!destino) return;
    if (destino === ticket.numero) return toast.info('El correo ya está en este caso');
    try {
      const t = await reasociar.mutateAsync({ idCorreo: c.id_correo, numeroDestino: destino });
      toast.success(`Correo reasociado a ${t?.numero || destino}`);
      onClose();
    } catch (e) {
      toast.error(e.message || 'No se pudo reasociar (¿existe el ticket?)');
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 truncate">{asuntoHilo}</h3>
            <p className="text-xs text-slate-400">
              {ticket.numero} · {correos.length} mensaje(s) en el hilo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto bg-slate-50">
          {isLoading && (
            <div className="text-slate-400 text-center py-8">Cargando conversación…</div>
          )}
          {!isLoading && !correos.length && (
            <div className="text-slate-500 text-sm bg-white rounded-xl border border-slate-200 p-4">
              Este caso no tiene el hilo guardado (es un ticket anterior a la lectura de correos).
              Vuelve a enviarlo desde Outlook y el hilo completo aparecerá aquí.
            </div>
          )}
          {correos.map((c, i) => (
            <div
              key={c.id_correo || i}
              className="bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {c.remitente_nombre || c.remitente_email || 'Remitente'}
                    {c.remitente_email && (
                      <span className="font-normal text-slate-400">
                        &lt;{c.remitente_email}&gt;
                      </span>
                    )}
                    <OrigenChip email={c.remitente_email} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{fechaHoraCL(c.recibido)}</span>
                    {canSupervise && (
                      <button
                        onClick={() => reasociarCorreo(c)}
                        title="Reasociar este correo al ticket correcto"
                        className="p-1 rounded text-indigo-500 hover:bg-indigo-50"
                      >
                        <Link2 size={13} />
                      </button>
                    )}
                    {canSupervise && (
                      <button
                        onClick={() => borrarCorreo(c)}
                        title="Eliminar correo del caso"
                        className="p-1 rounded text-rose-400 hover:bg-rose-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 space-y-0.5">
                  {c.para && (
                    <div>
                      <span className="font-bold text-slate-400">Para:</span> {c.para}
                    </div>
                  )}
                  {c.cc && (
                    <div>
                      <span className="font-bold text-slate-400">CC:</span> {c.cc}
                    </div>
                  )}
                  {c.asunto && (
                    <div>
                      <span className="font-bold text-slate-400">Asunto:</span> {c.asunto}
                    </div>
                  )}
                  {c.adjuntos && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Paperclip size={11} /> {c.adjuntos}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap break-words">
                {c.cuerpo || '(sin cuerpo)'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => onGestionar(ticket)}
            className="px-5 py-2 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 inline-flex items-center gap-2"
          >
            <Pencil size={15} /> Gestionar
          </button>
        </div>
      </div>
    </div>
  );
}

function FiltroSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Formulario de alta ──────────────────────────────────────────────────────
const FORM_VACIO = {
  cliente: '',
  region: '',
  comuna: '',
  contacto: '',
  equipo_modelo: '',
  numero_serie: '',
  tipo_solicitud: '',
  prioridad: 'Media',
  tecnico_asignado: 'Sin Asignar',
  estado: 'Abierto',
  cotizar: 'No',
  descripcion: '',
  observaciones: '',
  fecha_programada: '',
  hora_programada: '',
  nv: '',
  vendedor: '',
  nv_info: null
};

// Banner para compartir el formulario público /soporte. Usa la URL pública real
// (publicUrl) para que el enlace NO salga como localhost en la app nativa/dev.
function SoportePublicoBanner() {
  const base = publicBaseUrl();
  const link = publicUrl('/soporte');
  const absoluto = /^https?:/i.test(link); // false = no hay dominio público configurado
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
          Formulario público de servicio
        </p>
        <p className="text-xs text-slate-600 mt-0.5">
          Comparte este enlace con clientes o vendedores para que creen su solicitud sin necesidad
          de cuenta.
        </p>
        <code className="text-[11px] text-slate-500 break-all">{link}</code>
        {!absoluto && (
          <p className="text-[11px] text-orange-600/90 mt-1">
            Ábrelo desde la web (no desde la app) para ver el dominio real, o configura{' '}
            <code>VITE_PUBLIC_URL</code> con tu dominio público.
          </p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(link);
            toast.success('Enlace copiado');
          }}
          className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
        >
          Copiar enlace
        </button>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg border border-orange-300 text-orange-700 text-xs font-bold hover:bg-orange-100"
        >
          Abrir
        </a>
      </div>
    </div>
  );
}

function TabNuevo({ onCreated }) {
  const crear = useCrearTicket();
  const { data: tecnicos = [] } = useTecnicos(true);
  const { data: familias = [] } = useFamiliasStock();
  const [f, setF] = useState(FORM_VACIO);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const [buscandoNv, setBuscandoNv] = useState(false);

  // Asociar una N.V. del Panel PTM (opcional): trae cliente, vendedor y la
  // trazabilidad del proceso (estado, factura, guía, transportista, fechas).
  const buscarNv = async () => {
    const num = String(f.nv || '').replace(/[^0-9]/g, '');
    if (!num) return toast.error('Escribe el número de N.V.');
    setBuscandoNv(true);
    try {
      const info = await fetchNvPanel(num);
      if (!info) {
        toast.info(`La N.V. ${num} no está en el Panel PTM`);
        setF((p) => ({ ...p, nv_info: null }));
        return;
      }
      setF((p) => ({
        ...p,
        nv: info.nv || num,
        cliente: info.cliente || p.cliente,
        vendedor: info.vendedor || '',
        nv_info: info
      }));
      toast.success(`N.V. ${info.nv} asociada — ${info.cliente || 'sin cliente'}`);
    } catch (e) {
      toast.error(`No se pudo consultar el Panel: ${e.message}`);
    } finally {
      setBuscandoNv(false);
    }
  };
  const quitarNv = () => setF((p) => ({ ...p, nv: '', vendedor: '', nv_info: null }));

  // Solo cliente + descripción son obligatorios; el resto se autocompleta al guardar
  // (igual que los tickets que entran por correo, con "Por Definir"/"Otro"/"Media").
  const OBLIGATORIOS = ['cliente', 'descripcion'];
  const faltan = OBLIGATORIOS.filter((c) => !String(f[c] || '').trim());

  const guardar = async () => {
    if (faltan.length) return toast.error('Falta: cliente y/o descripción');
    try {
      const payload = {
        ...f,
        region: f.region?.trim() || 'Por Definir',
        equipo_modelo: f.equipo_modelo?.trim() || 'Por Definir',
        tipo_solicitud: f.tipo_solicitud?.trim() || 'Otro',
        prioridad: f.prioridad?.trim() || 'Media'
      };
      const t = await crear.mutateAsync(payload);
      toast.success(`Ticket ${t.numero} creado`);
      setF(FORM_VACIO);
      onCreated?.();
    } catch (e) {
      toast.error(e.message || 'Error al crear el ticket');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 max-w-4xl">
      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <Plus size={18} className="text-orange-600" /> Nuevo ticket de servicio
      </h2>

      {/* Formulario público — compartir el link para que clientes/vendedores creen el ticket sin cuenta */}
      <SoportePublicoBanner />

      {/* Asociar a una N.V. del Panel PTM (opcional) */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
          <Link2 size={13} /> Asociar a Nota de Venta (opcional)
        </label>
        <div className="flex gap-2 mt-1.5">
          <input
            value={f.nv}
            onChange={(e) => set('nv', e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscarNv())}
            placeholder="N° de N.V. (solo si aplica)"
            inputMode="numeric"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={buscarNv}
            disabled={buscandoNv || !f.nv}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 disabled:opacity-40 inline-flex items-center gap-2"
          >
            {buscandoNv ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}{' '}
            Traer
          </button>
          {f.nv_info && (
            <button
              type="button"
              onClick={quitarNv}
              title="Quitar asociación"
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {f.nv_info && (
          <div className="mt-3 rounded-lg bg-white border border-indigo-100 p-3 text-xs space-y-2 anim-fade-up">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-black text-slate-800">N.V. {f.nv_info.nv}</span>
              {f.nv_info.estado && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-wide">
                  {f.nv_info.estado}
                </span>
              )}
              {f.nv_info.urgente && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] uppercase">
                  Urgente
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-slate-600">
              <Dato k="Cliente" v={f.nv_info.cliente} />
              <Dato k="Vendedor" v={f.nv_info.vendedor} />
              <Dato k="Factura" v={f.nv_info.factura} icon={FileText} />
              <Dato k="Guía" v={f.nv_info.guia} />
              <Dato k="Transportista" v={f.nv_info.transportista} icon={Truck} />
              <Dato k="Bultos" v={f.nv_info.bultos} />
              <Dato k="Tipo despacho" v={f.nv_info.tipoDespacho} />
              <Dato k="F. compromiso" v={f.nv_info.fechaCompromiso} />
              <Dato k="F. despacho" v={f.nv_info.fechaDespacho} />
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Trazabilidad tomada del Panel PTM al crear el ticket; queda guardada en el ticket.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo
          label="Cliente / Hospital"
          req
          value={f.cliente}
          onChange={(v) => set('cliente', v)}
        />
        <Sel
          label="Región"
          value={f.region}
          onChange={(v) => {
            set('region', v);
            set('comuna', '');
          }}
          options={PV_REGIONES}
        />
        <Sel
          label="Comuna"
          value={f.comuna}
          onChange={(v) => set('comuna', v)}
          options={comunasDeRegion(f.region)}
          disabled={!f.region}
          allowFree
        />
        <Campo label="Contacto" value={f.contacto} onChange={(v) => set('contacto', v)} />
        <SelLibre
          label="Equipo / Modelo"
          value={f.equipo_modelo}
          onChange={(v) => set('equipo_modelo', v)}
          options={equipoOpciones(familias)}
          placeholder="Escribe el modelo o elige familia…"
        />
        <Campo
          label="N° de Serie"
          value={f.numero_serie}
          onChange={(v) => set('numero_serie', v)}
        />
        <Sel
          label="Tipo de Solicitud"
          value={f.tipo_solicitud}
          onChange={(v) => set('tipo_solicitud', v)}
          options={PV_TIPOS_SOLICITUD}
        />
        <Sel
          label="Prioridad"
          value={f.prioridad}
          onChange={(v) => set('prioridad', v)}
          options={PV_PRIORIDADES}
        />
        <Sel
          label="Técnico Asignado"
          value={f.tecnico_asignado}
          onChange={(v) => set('tecnico_asignado', v)}
          options={tecnicos.map((t) => t.nombre)}
        />
        <Sel
          label="Estado"
          value={f.estado}
          onChange={(v) => set('estado', v)}
          options={PV_ESTADOS}
        />
        <Sel
          label="¿Cotizar?"
          value={f.cotizar}
          onChange={(v) => set('cotizar', v)}
          options={PV_COTIZAR}
        />
        <Campo
          label="Fecha de visita (agenda)"
          type="date"
          value={f.fecha_programada}
          onChange={(v) => set('fecha_programada', v)}
        />
        <Campo
          label="Hora de visita"
          type="time"
          value={f.hora_programada}
          onChange={(v) => set('hora_programada', v)}
        />
      </div>
      <Area label="Descripción" req value={f.descripcion} onChange={(v) => set('descripcion', v)} />
      <Area
        label="Observaciones"
        value={f.observaciones}
        onChange={(v) => set('observaciones', v)}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          {faltan.length
            ? 'Obligatorio: cliente y descripción'
            : 'Listo · lo vacío queda "Por Definir"'}
        </span>
        <button
          onClick={guardar}
          disabled={crear.isPending || faltan.length > 0}
          className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-2"
        >
          <Save size={16} /> {crear.isPending ? 'Guardando…' : 'Crear Ticket'}
        </button>
      </div>
    </div>
  );
}

// ─── Visor del Informe de Calidad (adjunto al ticket) ───────────────────────
const DICTAMEN_PV_CLS = {
  LIBERAR: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CUARENTENA: 'bg-orange-100 text-orange-700 border-orange-200',
  BAJA: 'bg-rose-100 text-rose-700 border-rose-200',
  RECHAZAR: 'bg-rose-100 text-rose-700 border-rose-200',
  REPROCESO: 'bg-amber-100 text-amber-700 border-amber-200'
};

function InformeCalidadModal({ numero, onClose }) {
  const { data, isLoading } = useInformeCalidadTicket(numero);
  const inf = data?.informe;
  const item = data?.item;
  const acc = data?.accion;
  const evidencias = data?.evidencias || [];
  // Bucket privado (mig 065): las evidencias se muestran con URLs firmadas.
  const [fotoUrls, setFotoUrls] = useState({});
  useEffect(() => {
    let on = true;
    signedUrls(
      'monitoreo-evidencias',
      evidencias.map((e) => e.storage_path)
    ).then((m) => {
      if (on) setFotoUrls(m);
    });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <ClipboardList size={16} className="text-emerald-600" /> Informe de Calidad{' '}
              {inf?.numero || ''}
            </h3>
            <p className="text-xs text-slate-400">
              {inf?.fecha ? `Fecha ${fechaCL(inf.fecha)}` : ''}
              {inf?.analista_nombre ? ` · Analista: ${inf.analista_nombre}` : ''}
              {inf?.tipo_informe ? ` · ${inf.tipo_informe}` : ''}
              {inf?.periodicidad ? ` (${inf.periodicidad})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {isLoading && <div className="text-slate-400 text-center py-8">Cargando informe…</div>}
          {!isLoading && !data && (
            <div className="text-slate-500 text-sm">
              Este ticket no tiene informe de Calidad asociado.
            </div>
          )}

          {item && (
            <>
              {/* Dictamen */}
              <div className="flex flex-wrap items-center gap-2">
                {item.dictamen && (
                  <span
                    className={`px-3 py-1 rounded-xl text-sm font-black border ${DICTAMEN_PV_CLS[item.dictamen] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                  >
                    Dictamen: {item.dictamen}
                  </span>
                )}
                {acc?.tipo_accion && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-700 border-indigo-200">
                    Acción: {acc.tipo_accion}
                  </span>
                )}
                {acc?.folio && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold border bg-slate-100 text-slate-600 border-slate-200">
                    {acc.folio}
                  </span>
                )}
              </div>

              {/* Producto dictaminado */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="font-black text-slate-800 text-sm mb-2">
                  {item.codigo_producto} — {item.producto}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <Info label="Partida / Lote" value={item.partida || '—'} />
                  <Info label="Ubicación" value={item.ubicacion || '—'} />
                  <Info
                    label="Cantidad"
                    value={`${item.cantidad ?? '—'} ${item.unidad_medida || ''}`}
                  />
                  <Info label="Condición observada" value={item.condicion_observada || '—'} />
                  <Info label="Motivo" value={item.motivo || '—'} />
                  <Info
                    label="Bodega destino"
                    value={item.bodega_destino ? `BD ${item.bodega_destino}` : '—'}
                  />
                  {item.tipo_dano && <Info label="Tipo de daño" value={item.tipo_dano} />}
                  {item.componente_afectado && (
                    <Info label="Componente" value={item.componente_afectado} />
                  )}
                  {item.consecuencia && <Info label="Consecuencia" value={item.consecuencia} />}
                  <Info label="Dictaminó" value={item.calidad_nombre || '—'} />
                  <Info
                    label="Fecha dictamen"
                    value={item.fecha_dictamen ? fechaHoraCL(item.fecha_dictamen) : '—'}
                  />
                  {item.fecha_vencimiento && (
                    <Info label="Vencimiento" value={fechaCL(item.fecha_vencimiento)} />
                  )}
                </div>
                {item.observaciones && (
                  <p className="text-xs text-slate-600 mt-3 italic">“{item.observaciones}”</p>
                )}
                {item.acuse_texto && (
                  <p className="text-xs text-slate-500 mt-1">Acuse: {item.acuse_texto}</p>
                )}
              </div>

              {/* Instrucción de la acción */}
              {acc?.descripcion && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
                  <b>Instrucción de Calidad:</b> {acc.descripcion}
                  {acc.referencia && <div className="mt-1">Ref. ejecución: {acc.referencia}</div>}
                </div>
              )}

              {/* Evidencias fotográficas */}
              {evidencias.length > 0 && (
                <div>
                  <div className="text-xs font-black text-slate-500 uppercase mb-2">
                    Evidencias ({evidencias.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {evidencias.map((e, i) => (
                      <a
                        key={i}
                        href={fotoUrls[e.storage_path] || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90"
                      >
                        <img
                          src={fotoUrls[e.storage_path] || ''}
                          alt={e.descripcion || `Evidencia ${i + 1}`}
                          className="w-full h-28 object-cover"
                          loading="lazy"
                        />
                        {e.descripcion && (
                          <div className="text-[10px] text-slate-500 px-2 py-1 truncate">
                            {e.descripcion}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {inf?.observaciones && (
                <p className="text-xs text-slate-500">
                  Observaciones del informe: {inf.observaciones}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-end px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal editar ────────────────────────────────────────────────────────────
function ModalEditar({ ticket, canManage, canSupervise, onClose }) {
  const actualizar = useActualizarTicket();
  const { data: tecnicos = [] } = useTecnicos(true);
  const { data: familias = [] } = useFamiliasStock();
  const [f, setF] = useState({
    estado: ticket.estado,
    tecnico_asignado: ticket.tecnico_asignado,
    prioridad: ticket.prioridad,
    cotizar: ticket.cotizar || 'No',
    resultado: ticket.resultado || '',
    observaciones: ticket.observaciones || '',
    descripcion: ticket.descripcion || '',
    equipo_modelo: ticket.equipo_modelo || '',
    region: ticket.region || '',
    comuna: ticket.comuna || '',
    fecha_programada: ticket.fecha_programada || '',
    hora_programada: ticket.hora_programada || ''
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const readOnly = !canManage;
  const [verInforme, setVerInforme] = useState(false);

  // Flujo de estados + trazabilidad
  const avanzar = useAvanzarTicket();
  const cerrar = useCerrarTicket();
  const { data: historial = [] } = usePvHistorial(ticket.numero);
  const [verHist, setVerHist] = useState(false);
  const siguiente = pvSiguienteEstado(ticket.estado);
  const esTerminal = ticket.estado === 'Cerrado' || ticket.estado === 'Cancelado';

  const guardar = async () => {
    try {
      await actualizar.mutateAsync({ numero: ticket.numero, campos: f });
      toast.success(`Ticket ${ticket.numero} actualizado`);
      onClose();
    } catch (e) {
      toast.error(e.message || 'Error al actualizar');
    }
  };
  const avanzarEstado = async () => {
    if (!siguiente) return;
    const nota =
      window.prompt(
        `Avanzar de "${ticket.estado}" → "${siguiente}".\nNota de la gestión (opcional):`
      ) ?? '';
    try {
      await avanzar.mutateAsync({ numero: ticket.numero, nota });
      toast.success(`Avanzado a ${siguiente}`);
      onClose();
    } catch (e) {
      toast.error(e.message || 'No se pudo avanzar');
    }
  };
  const terminar = async () => {
    if (
      !confirm(
        `¿Dar por TERMINADO el ticket ${ticket.numero}?\nResultado: ${f.resultado || 'Resuelto'} (cámbialo arriba antes si corresponde).`
      )
    )
      return;
    const nota = window.prompt('Nota de cierre (opcional):') ?? '';
    try {
      await cerrar.mutateAsync({
        numero: ticket.numero,
        resultado: f.resultado || 'Resuelto',
        nota
      });
      toast.success('Ticket cerrado');
      onClose();
    } catch (e) {
      toast.error(e.message || 'No se pudo cerrar');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              {ticket.numero}
              {ticket.folio_tipo && (
                <span
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border ${pvFolioCls(ticket)}`}
                >
                  {ticket.folio_tipo}
                </span>
              )}
              {ticket.origen === 'Correo' && <Mail size={14} className="text-sky-500" />}
              {ticket.origen === 'Calidad' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">
                  <ClipboardList size={10} /> Calidad
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {ticket.cliente} · {ticket.equipo_modelo}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Flujo de estados + acciones + trazabilidad */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {PV_FLUJO.map((e, i) => {
                const idxAct = PV_FLUJO.indexOf(ticket.estado);
                const actual = ticket.estado === e;
                const done = idxAct >= 0 && idxAct >= i;
                return (
                  <React.Fragment key={e}>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${actual ? 'bg-orange-500 text-white border-orange-500' : done ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {e}
                    </span>
                    {i < PV_FLUJO.length - 1 && (
                      <ChevronRight size={11} className="text-slate-300" />
                    )}
                  </React.Fragment>
                );
              })}
              {ticket.estado === 'Cancelado' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black border bg-rose-100 text-rose-700 border-rose-200">
                  Cancelado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {canManage && !esTerminal && siguiente && (
                <button
                  onClick={avanzarEstado}
                  disabled={avanzar.isPending}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-black inline-flex items-center gap-1.5 hover:bg-slate-900 disabled:opacity-50"
                >
                  Siguiente: {siguiente} <ChevronRight size={13} />
                </button>
              )}
              {canManage && !esTerminal && (
                <button
                  onClick={terminar}
                  disabled={cerrar.isPending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black inline-flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Dar por terminado
                </button>
              )}
              {esTerminal && (
                <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {ticket.estado}
                  {ticket.resultado ? ` · ${ticket.resultado}` : ''}
                </span>
              )}
              <button
                type="button"
                onClick={() => setVerHist((v) => !v)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-black inline-flex items-center gap-1.5 hover:border-slate-300"
              >
                <Clock size={13} /> {verHist ? 'Ocultar' : 'Ver'} trazabilidad ({historial.length})
              </button>
            </div>
            {verHist && (
              <div className="mt-3 border-t border-slate-200 pt-3 space-y-2 max-h-56 overflow-y-auto">
                {historial.length === 0 && (
                  <p className="text-xs text-slate-400">Sin movimientos registrados aún.</p>
                )}
                {historial.map((h) => (
                  <div key={h.id} className="flex items-start gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-700">
                        {h.estado_anterior ? `${h.estado_anterior} → ` : ''}
                        {h.estado_nuevo}
                        {h.resultado ? ` · ${h.resultado}` : ''}
                      </div>
                      <div className="text-slate-400">
                        {fechaHoraCL(h.created_at)}
                        {h.usuario_nombre ? ` · ${h.usuario_nombre}` : ''}
                        {h.nota ? ` · "${h.nota}"` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {ticket.nv && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="font-black text-indigo-800 flex items-center gap-1.5">
                  <Link2 size={14} /> N.V. {ticket.nv}
                  {ticket.vendedor ? ` · Vendedor: ${ticket.vendedor}` : ''}
                </span>
                {ticket.nv_info?.estado && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-wide">
                    {ticket.nv_info.estado}
                  </span>
                )}
              </div>
              {ticket.nv_info && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-slate-600 mt-2">
                  <Dato k="Cliente" v={ticket.nv_info.cliente} />
                  <Dato k="Factura" v={ticket.nv_info.factura} icon={FileText} />
                  <Dato k="Guía" v={ticket.nv_info.guia} />
                  <Dato k="Transportista" v={ticket.nv_info.transportista} icon={Truck} />
                  <Dato k="Bultos" v={ticket.nv_info.bultos} />
                  <Dato k="F. despacho" v={ticket.nv_info.fechaDespacho} />
                </div>
              )}
            </div>
          )}
          {(ticket.accion_folio || ticket.informe_numero) && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-black text-emerald-800 flex items-center gap-1.5 mb-1">
                    <ClipboardList size={14} /> Caso derivado de Calidad
                  </div>
                  <div className="text-emerald-800 text-xs space-y-0.5">
                    {ticket.accion_folio && (
                      <div>
                        Acción de Calidad: <b>{ticket.accion_folio}</b>
                      </div>
                    )}
                    {ticket.informe_numero && (
                      <div>
                        Informe adjunto: <b>{ticket.informe_numero}</b>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setVerInforme(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 inline-flex items-center gap-1.5 shrink-0"
                >
                  <ClipboardList size={14} /> Ver informe
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Contacto" value={ticket.contacto || '—'} />
            <Info label="N° Serie" value={ticket.numero_serie || '—'} />
            <Info label="Tipo" value={ticket.tipo_solicitud} />
            <Info label="Apertura" value={fechaCL(ticket.fecha_apertura)} />
            <Info label="Cierre" value={fechaCL(ticket.fecha_cierre)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Sel
              label="Región"
              value={f.region}
              onChange={(v) => {
                set('region', v);
                set('comuna', '');
              }}
              options={PV_REGIONES}
              disabled={readOnly}
              allowFree
            />
            <Sel
              label="Comuna"
              value={f.comuna}
              onChange={(v) => set('comuna', v)}
              options={comunasDeRegion(f.region)}
              disabled={readOnly || !f.region}
              allowFree
            />
            <SelLibre
              label="Equipo / Modelo"
              value={f.equipo_modelo}
              onChange={(v) => set('equipo_modelo', v)}
              options={equipoOpciones(familias)}
              disabled={readOnly}
              placeholder="Escribe el modelo o elige familia…"
            />
            <Sel
              label="Estado"
              value={f.estado}
              onChange={(v) => set('estado', v)}
              options={PV_ESTADOS}
              disabled={readOnly}
            />
            <Sel
              label="Técnico"
              value={f.tecnico_asignado}
              onChange={(v) => set('tecnico_asignado', v)}
              options={tecnicos.map((t) => t.nombre)}
              disabled={readOnly}
            />
            <Sel
              label="Prioridad"
              value={f.prioridad}
              onChange={(v) => set('prioridad', v)}
              options={PV_PRIORIDADES}
              disabled={readOnly}
            />
            <Sel
              label="¿Cotizar?"
              value={f.cotizar}
              onChange={(v) => set('cotizar', v)}
              options={PV_COTIZAR}
              disabled={readOnly}
            />
            <Sel
              label="Resultado"
              value={f.resultado}
              onChange={(v) => set('resultado', v)}
              options={PV_RESULTADOS}
              disabled={readOnly}
            />
            <Campo
              label="Fecha de visita (agenda)"
              type="date"
              value={f.fecha_programada}
              onChange={(v) => set('fecha_programada', v)}
              disabled={readOnly}
            />
            <Campo
              label="Hora de visita"
              type="time"
              value={f.hora_programada}
              onChange={(v) => set('hora_programada', v)}
              disabled={readOnly}
            />
          </div>
          <Area
            label="Descripción"
            value={f.descripcion}
            onChange={(v) => set('descripcion', v)}
            disabled={readOnly}
          />
          <Area
            label="Observaciones"
            value={f.observaciones}
            onChange={(v) => set('observaciones', v)}
            disabled={readOnly}
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
          {canManage && (
            <button
              onClick={guardar}
              disabled={actualizar.isPending}
              className="px-5 py-2 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-2"
            >
              <Save size={15} /> {actualizar.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
        {verInforme && (
          <InformeCalidadModal numero={ticket.numero} onClose={() => setVerInforme(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Calendario / Agenda ─────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const BASES = [
  { id: 'fecha_programada', label: 'Fecha de visita (agenda)' },
  { id: 'fecha_apertura', label: 'Fecha de apertura (todos)' },
  { id: 'fecha_cierre', label: 'Fecha de cierre' }
];

function TabCalendario({ canManage, canSupervise }) {
  const hoy = new Date();
  const [cursor, setCursor] = useState({ y: hoy.getFullYear(), m: hoy.getMonth() });
  const [base, setBase] = useState('fecha_apertura');
  const [tecnico, setTecnico] = useState('');
  const [selDia, setSelDia] = useState(null);
  const [editar, setEditar] = useState(null);
  const { data: tickets = [] } = useTickets(tecnico ? { tecnico } : {});
  const { data: tecnicos = [] } = useTecnicos();

  // Agrupa tickets por su fecha base (YYYY-MM-DD).
  const porDia = {};
  for (const t of tickets) {
    const f = t[base];
    if (!f) continue;
    const k = String(f).slice(0, 10);
    (porDia[k] ||= []).push(t);
  }

  const primero = new Date(cursor.y, cursor.m, 1);
  const offset = (primero.getDay() + 6) % 7; // lunes = 0
  const diasMes = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const tituloMes = primero.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const hoyStr = ymd(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const mover = (delta) =>
    setCursor(({ y, m }) => {
      const nm = m + delta;
      return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
    });
  const irHoy = () => {
    setCursor({ y: hoy.getFullYear(), m: hoy.getMonth() });
    setSelDia(hoyStr);
  };

  const ticketsSel = selDia ? porDia[selDia] || [] : [];

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => mover(-1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => mover(1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={irHoy}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold"
          >
            Hoy
          </button>
        </div>
        <div className="text-lg font-black text-slate-800 capitalize min-w-[160px]">
          {tituloMes}
        </div>
        <div className="flex-1" />
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Ubicar por</label>
          <select
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
          >
            {BASES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Técnico</label>
          <select
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
          >
            <option value="">Todos</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[11px] font-bold text-slate-400 uppercase py-1"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((d, i) => {
              if (d === null)
                return <div key={i} className="min-h-[92px] rounded-lg bg-slate-50/50" />;
              const k = ymd(cursor.y, cursor.m, d);
              const lista = porDia[k] || [];
              const esHoy = k === hoyStr;
              const sel = k === selDia;
              return (
                <button
                  key={i}
                  onClick={() => setSelDia(k)}
                  className={`min-h-[92px] rounded-lg border p-1.5 text-left align-top transition-colors ${sel ? 'border-orange-400 ring-1 ring-orange-300 bg-orange-50/40' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div
                    className={`text-xs font-bold mb-1 ${esHoy ? 'text-white bg-orange-600 rounded-full w-5 h-5 flex items-center justify-center' : 'text-slate-500'}`}
                  >
                    {d}
                  </div>
                  <div className="space-y-0.5">
                    {lista.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className={`truncate px-1 py-0.5 rounded text-[10px] font-semibold border ${pvEstadoCls(t.estado)}`}
                        title={`${t.numero} · ${t.cliente}`}
                      >
                        {t.hora_programada ? `${t.hora_programada} ` : ''}
                        {t.cliente}
                      </div>
                    ))}
                    {lista.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-bold px-1">
                        +{lista.length - 3} más
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalle del día */}
      {selDia && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
            <CalendarDays size={17} className="text-orange-600" />
            {new Date(selDia + 'T00:00:00').toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            <span className="text-sm font-semibold text-slate-400">
              · {ticketsSel.length} ticket(s)
            </span>
          </h3>
          {ticketsSel.length === 0 && (
            <p className="text-slate-400 text-sm">Sin tickets en este día.</p>
          )}
          <div className="divide-y divide-slate-100">
            {ticketsSel.map((t) => (
              <button
                key={t.id}
                onClick={() => setEditar(t)}
                className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-orange-50/40 rounded-lg px-2"
              >
                <div className="min-w-0">
                  <div className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                    {t.hora_programada && (
                      <span className="text-orange-600">{t.hora_programada}</span>
                    )}
                    {t.numero}
                    {t.origen === 'Correo' && <Mail size={12} className="text-sky-500" />}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {t.cliente} · {t.equipo_modelo} · {t.tecnico_asignado}
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}
                >
                  {t.estado}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {editar && (
        <ModalEditar
          ticket={editar}
          canManage={canManage}
          canSupervise={canSupervise}
          onClose={() => setEditar(null)}
        />
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function TabDashboard() {
  const { data: d, isLoading } = usePvDashboard();
  if (isLoading) return <div className="text-slate-400 p-10 text-center">Cargando dashboard…</div>;
  const r = d?.resumen || {};
  const tiempos = d?.tiempos || {};
  const porTecnico = d?.por_tecnico || {};
  const porTipo = d?.por_tipo || {};
  const recientes = d?.tickets_recientes || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Total" value={r.total} icon={ClipboardList} color="text-slate-700" />
        <KPI label="Abiertos" value={r.abiertos} icon={Clock} color="text-sky-600" />
        <KPI label="En Proceso" value={r.en_proceso} icon={Wrench} color="text-indigo-600" />
        <KPI
          label="Pend. Cliente"
          value={r.pendiente_cliente}
          icon={AlertTriangle}
          color="text-amber-600"
        />
        <KPI label="Cerrados" value={r.cerrados} icon={CheckCircle2} color="text-emerald-600" />
        <KPI
          label="Prioridad Alta"
          value={r.prioridad_alta}
          icon={AlertTriangle}
          color="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Tiempos de resolución">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Promedio (días)" value={tiempos.promedio_dias ?? 0} />
            <Stat label="Cerrados este mes" value={tiempos.cerrados_mes ?? 0} />
            <Stat label="Máx (días)" value={tiempos.max_dias ?? 0} />
            <Stat label="Sin técnico" value={tiempos.sin_tecnico ?? 0} />
          </div>
        </Panel>
        <Panel title="Por tipo de solicitud">
          <div className="space-y-1.5">
            {Object.entries(porTipo).length === 0 && (
              <p className="text-slate-400 text-sm">Sin datos</p>
            )}
            {Object.entries(porTipo)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <BarraRow
                  key={k}
                  label={k}
                  value={v}
                  max={Math.max(...Object.values(porTipo), 1)}
                />
              ))}
          </div>
        </Panel>
      </div>

      <Panel title="Carga por técnico">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-[11px] uppercase">
                <th className="text-left font-bold py-2">Técnico</th>
                <th className="text-right font-bold py-2">Total</th>
                <th className="text-right font-bold py-2">Activos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(porTecnico)
                .sort((a, b) => (b[1].abiertos || 0) - (a[1].abiertos || 0))
                .map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 font-semibold text-slate-700">{k}</td>
                    <td className="py-2 text-right text-slate-600">{n(v.total)}</td>
                    <td className="py-2 text-right font-bold text-orange-600">{n(v.abiertos)}</td>
                  </tr>
                ))}
              {Object.keys(porTecnico).length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Tickets recientes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-[11px] uppercase">
                <th className="text-left font-bold py-2">Ticket</th>
                <th className="text-left font-bold py-2">Cliente</th>
                <th className="text-left font-bold py-2">Técnico</th>
                <th className="text-left font-bold py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recientes.slice(0, 15).map((t) => (
                <tr key={t.numero}>
                  <td className="py-2 font-black text-slate-800">{t.numero}</td>
                  <td className="py-2 text-slate-600">{t.cliente}</td>
                  <td className="py-2 text-slate-600">{t.tecnico_asignado}</td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}
                    >
                      {t.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {recientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Sin tickets
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ─── Técnicos (catálogo editable) ────────────────────────────────────────────
function TabTecnicos() {
  const { data: tecnicos = [] } = useTecnicos();
  const guardar = useGuardarTecnico();
  const eliminar = useEliminarTecnico();
  const [nuevo, setNuevo] = useState('');

  const agregar = async () => {
    if (!nuevo.trim()) return;
    try {
      await guardar.mutateAsync({ nombre: nuevo.trim(), orden: tecnicos.length + 1 });
      setNuevo('');
      toast.success('Técnico agregado');
    } catch (e) {
      toast.error(e.message || 'Error');
    }
  };
  const toggle = async (t) => {
    try {
      await guardar.mutateAsync({ id: t.id, nombre: t.nombre, activo: !t.activo, orden: t.orden });
    } catch (e) {
      toast.error(e.message || 'Error');
    }
  };
  const borrar = async (t) => {
    if (!confirm(`¿Eliminar técnico "${t.nombre}"?`)) return;
    try {
      await eliminar.mutateAsync({ id: t.id });
      toast.success('Técnico eliminado');
    } catch (e) {
      toast.error(e.message || 'Error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-2xl space-y-4">
      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <Users size={18} className="text-orange-600" /> Técnicos
      </h2>
      <div className="flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregar()}
          placeholder="Nombre del técnico"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <button
          onClick={agregar}
          disabled={guardar.isPending}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-1.5"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {tecnicos.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2.5">
            <span
              className={`font-semibold ${t.activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}
            >
              {t.nombre}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${t.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
              >
                {t.activo ? 'Activo' : 'Inactivo'}
              </button>
              <button
                onClick={() => borrar(t)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {tecnicos.length === 0 && <p className="text-slate-400 text-sm py-4">Sin técnicos</p>}
      </div>
    </div>
  );
}

// ─── Átomos ──────────────────────────────────────────────────────────────────
// Par clave/valor compacto para la tarjeta de trazabilidad de la N.V.
function Dato({ k, v, icon: Icon }) {
  if (!v) return null;
  return (
    <div className="min-w-0">
      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
        {k}
      </span>
      <span className="flex items-center gap-1 font-bold text-slate-700 truncate">
        {Icon && <Icon size={11} className="text-slate-400 shrink-0" />}
        {v}
      </span>
    </div>
  );
}
function Campo({ label, value, onChange, req, disabled, type = 'text' }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {req && <span className="text-orange-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}
function Sel({ label, value, onChange, options, req, disabled, allowFree }) {
  // options: array de strings o de {value, label}
  const opts = (options || []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const values = opts.map((o) => o.value);
  const known = values.includes(value) || !value;
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {req && <span className="text-orange-500"> *</span>}
      </label>
      <select
        value={known ? value : '__free__'}
        onChange={(e) => onChange(e.target.value === '__free__' ? '' : e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">— Seleccionar —</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {/* Valor fuera de catálogo (p.ej. técnico desactivado): mostrarlo igual;
            sin esta opción el <select> renderizaba "— Seleccionar —" y el usuario
            creía que el campo estaba vacío aunque el ticket conserva el valor. */}
        {!known && (
          <option value="__free__">
            {value}
            {allowFree ? ' (otro)' : ' (no vigente)'}
          </option>
        )}
      </select>
    </div>
  );
}
// Campo LIBRE con sugerencias (input + datalist): permite ESCRIBIR el valor a
// mano (p. ej. el modelo del equipo si el cliente no sabe la familia) y a la vez
// sugiere las opciones del catálogo. Se usa para Equipo/Modelo.
function SelLibre({ label, value, onChange, options, req, disabled, placeholder }) {
  const opts = (options || []).map((o) => (typeof o === 'string' ? o : o.value)).filter(Boolean);
  const listId = React.useMemo(
    () => `dl-${String(label).replace(/\W/g, '')}-${Math.round(opts.length)}`,
    [label, opts.length]
  );
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {req && <span className="text-orange-500"> *</span>}
      </label>
      <input
        list={listId}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Escribe o elige…'}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
      />
      <datalist id={listId}>
        {opts.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}
function Area({ label, value, onChange, req, disabled }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {req && <span className="text-orange-500"> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
      <div className="text-slate-700 font-semibold">{value}</div>
    </div>
  );
}
function KPI({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className={`text-2xl font-black mt-1 ${color}`}>{n(value ?? 0)}</div>
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-black text-slate-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-[11px] font-bold text-slate-400 uppercase">{label}</div>
      <div className="text-xl font-black text-slate-800">{n(value)}</div>
    </div>
  );
}
function BarraRow({ label, value, max }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 shrink-0 text-slate-600 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right font-bold text-slate-700">{n(value)}</span>
    </div>
  );
}
