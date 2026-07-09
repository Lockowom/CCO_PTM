import React, { useState } from 'react';
import {
  Wrench, Plus, Search, X, Download, LayoutDashboard, ClipboardList, Users,
  Save, Trash2, Mail, AlertTriangle, Clock, CheckCircle2, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import {
  PV_REGIONES, PV_TIPOS_SOLICITUD, PV_PRIORIDADES, PV_ESTADOS, PV_EQUIPOS,
  PV_COTIZAR, PV_RESULTADOS, PV_CAMPOS_OBLIGATORIOS, pvEstadoCls, pvPrioridadCls,
  useTecnicos, useGuardarTecnico, useEliminarTecnico,
  useTickets, useCrearTicket, useActualizarTicket, usePvDashboard,
} from '../../services/postventaService';

const fechaCL = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CL') : '—';
const n = (v) => (Number(v) || 0).toLocaleString('es-CL');

const TABS = [
  { id: 'tickets', label: 'Tickets', icon: ClipboardList },
  { id: 'nuevo', label: 'Nuevo Ticket', icon: Plus },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tecnicos', label: 'Técnicos', icon: Users },
];

export default function Postventa() {
  const { user, hasPermission } = useAuth();
  const [tab, setTab] = useState('tickets');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canManage = isAdmin || hasPermission('manage_postventa') || hasPermission('supervise_postventa');
  const canSupervise = isAdmin || hasPermission('supervise_postventa');

  const visibleTabs = TABS.filter((t) => {
    if (t.id === 'nuevo') return canManage;
    if (t.id === 'tecnicos') return canSupervise;
    return true;
  });

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
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Servicio <span className="text-orange-600">Técnico</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Post-Venta · tickets de equipos médicos, técnicos y seguimiento</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${tab === id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'tickets' && <TabTickets canManage={canManage} canSupervise={canSupervise} />}
      {tab === 'nuevo' && canManage && <TabNuevo onCreated={() => setTab('tickets')} />}
      {tab === 'dashboard' && <TabDashboard />}
      {tab === 'tecnicos' && canSupervise && <TabTecnicos />}
    </div>
  );
}

// ─── Tickets (lista + filtros + edición) ─────────────────────────────────────
function TabTickets({ canManage, canSupervise }) {
  const [filtros, setFiltros] = useState({ estado: '', tecnico: '', prioridad: '', q: '' });
  const { data: tickets = [], isLoading } = useTickets(filtros);
  const { data: tecnicos = [] } = useTecnicos();
  const [editar, setEditar] = useState(null);

  const exportar = () => {
    if (!tickets.length) return toast.info('No hay tickets para exportar');
    exportToExcel({
      filename: 'postventa_tickets',
      sheets: [{
        name: 'Tickets',
        rows: tickets.map((t) => ({
          Número: t.numero, Fecha: fechaCL(t.fecha_apertura), Cliente: t.cliente, Región: t.region,
          Equipo: t.equipo_modelo, 'N° Serie': t.numero_serie || '', Tipo: t.tipo_solicitud,
          Prioridad: t.prioridad, Técnico: t.tecnico_asignado, Estado: t.estado,
          Cotizar: t.cotizar, Cierre: fechaCL(t.fecha_cierre), Resultado: t.resultado || '',
          Origen: t.origen, Descripción: t.descripcion, Observaciones: t.observaciones || '',
        })),
      }],
    });
  };

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Buscar</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filtros.q} onChange={(e) => setF('q', e.target.value)} placeholder="N° ticket, cliente, equipo, serie…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>
        </div>
        <FiltroSelect label="Estado" value={filtros.estado} onChange={(v) => setF('estado', v)} options={PV_ESTADOS} />
        <FiltroSelect label="Prioridad" value={filtros.prioridad} onChange={(v) => setF('prioridad', v)} options={PV_PRIORIDADES} />
        <FiltroSelect label="Técnico" value={filtros.tecnico} onChange={(v) => setF('tecnico', v)} options={tecnicos.map((t) => t.nombre)} />
        <button onClick={exportar} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
          <Download size={15} /> Excel
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
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
              {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Cargando…</td></tr>}
              {!isLoading && !tickets.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Sin tickets</td></tr>}
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-orange-50/40">
                  <td className="px-4 py-3 align-top">
                    <div className="font-black text-slate-800 flex items-center gap-1.5">
                      {t.numero}
                      {t.origen === 'Correo' && <Mail size={13} className="text-sky-500" title="Creado desde correo" />}
                    </div>
                    <div className="text-[11px] text-slate-400">{fechaCL(t.fecha_apertura)}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-slate-700">{t.cliente}</div>
                    <div className="text-[11px] text-slate-400">{t.region}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.equipo_modelo}{t.numero_serie ? ` · ${t.numero_serie}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">{t.tipo_solicitud}</td>
                  <td className="px-4 py-3 align-top text-slate-600">{t.tecnico_asignado}</td>
                  <td className="px-4 py-3 align-top"><span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvPrioridadCls(t.prioridad)}`}>{t.prioridad}</span></td>
                  <td className="px-4 py-3 align-top"><span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}>{t.estado}</span></td>
                  <td className="px-4 py-3 align-top text-right">
                    <button onClick={() => setEditar(t)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 text-xs font-bold">
                      <Pencil size={13} /> {canManage ? 'Editar' : 'Ver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editar && <ModalEditar ticket={editar} canManage={canManage} canSupervise={canSupervise} onClose={() => setEditar(null)} />}
    </div>
  );
}

function FiltroSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white">
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Formulario de alta ──────────────────────────────────────────────────────
const FORM_VACIO = {
  cliente: '', region: '', contacto: '', equipo_modelo: '', numero_serie: '',
  tipo_solicitud: '', prioridad: 'Media', tecnico_asignado: 'Sin Asignar',
  estado: 'Abierto', cotizar: 'No', descripcion: '', observaciones: '',
};

function TabNuevo({ onCreated }) {
  const crear = useCrearTicket();
  const { data: tecnicos = [] } = useTecnicos(true);
  const [f, setF] = useState(FORM_VACIO);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const faltan = PV_CAMPOS_OBLIGATORIOS.filter((c) => !String(f[c] || '').trim());

  const guardar = async () => {
    if (faltan.length) return toast.error('Faltan campos obligatorios');
    try {
      const t = await crear.mutateAsync(f);
      toast.success(`Ticket ${t.numero} creado`);
      setF(FORM_VACIO);
      onCreated?.();
    } catch (e) { toast.error(e.message || 'Error al crear el ticket'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 max-w-4xl">
      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Plus size={18} className="text-orange-600" /> Nuevo ticket de servicio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Cliente / Hospital" req value={f.cliente} onChange={(v) => set('cliente', v)} />
        <Sel label="Región" req value={f.region} onChange={(v) => set('region', v)} options={PV_REGIONES} />
        <Campo label="Contacto" value={f.contacto} onChange={(v) => set('contacto', v)} />
        <Sel label="Equipo / Modelo" req value={f.equipo_modelo} onChange={(v) => set('equipo_modelo', v)} options={PV_EQUIPOS} allowFree />
        <Campo label="N° de Serie" value={f.numero_serie} onChange={(v) => set('numero_serie', v)} />
        <Sel label="Tipo de Solicitud" req value={f.tipo_solicitud} onChange={(v) => set('tipo_solicitud', v)} options={PV_TIPOS_SOLICITUD} />
        <Sel label="Prioridad" req value={f.prioridad} onChange={(v) => set('prioridad', v)} options={PV_PRIORIDADES} />
        <Sel label="Técnico Asignado" value={f.tecnico_asignado} onChange={(v) => set('tecnico_asignado', v)} options={tecnicos.map((t) => t.nombre)} />
        <Sel label="Estado" value={f.estado} onChange={(v) => set('estado', v)} options={PV_ESTADOS} />
        <Sel label="¿Cotizar?" value={f.cotizar} onChange={(v) => set('cotizar', v)} options={PV_COTIZAR} />
      </div>
      <Area label="Descripción" req value={f.descripcion} onChange={(v) => set('descripcion', v)} />
      <Area label="Observaciones" value={f.observaciones} onChange={(v) => set('observaciones', v)} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">{faltan.length ? `Faltan: ${faltan.join(', ')}` : 'Listo para guardar'}</span>
        <button onClick={guardar} disabled={crear.isPending || faltan.length > 0}
          className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-2">
          <Save size={16} /> {crear.isPending ? 'Guardando…' : 'Crear Ticket'}
        </button>
      </div>
    </div>
  );
}

// ─── Modal editar ────────────────────────────────────────────────────────────
function ModalEditar({ ticket, canManage, canSupervise, onClose }) {
  const actualizar = useActualizarTicket();
  const { data: tecnicos = [] } = useTecnicos(true);
  const [f, setF] = useState({
    estado: ticket.estado, tecnico_asignado: ticket.tecnico_asignado, prioridad: ticket.prioridad,
    cotizar: ticket.cotizar || 'No', resultado: ticket.resultado || '', observaciones: ticket.observaciones || '',
    descripcion: ticket.descripcion || '',
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const readOnly = !canManage;

  const guardar = async () => {
    try {
      await actualizar.mutateAsync({ numero: ticket.numero, campos: f });
      toast.success(`Ticket ${ticket.numero} actualizado`);
      onClose();
    } catch (e) { toast.error(e.message || 'Error al actualizar'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2">{ticket.numero}
              {ticket.origen === 'Correo' && <Mail size={14} className="text-sky-500" />}
            </h3>
            <p className="text-xs text-slate-400">{ticket.cliente} · {ticket.equipo_modelo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Región" value={ticket.region} />
            <Info label="Contacto" value={ticket.contacto || '—'} />
            <Info label="N° Serie" value={ticket.numero_serie || '—'} />
            <Info label="Tipo" value={ticket.tipo_solicitud} />
            <Info label="Apertura" value={fechaCL(ticket.fecha_apertura)} />
            <Info label="Cierre" value={fechaCL(ticket.fecha_cierre)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Sel label="Estado" value={f.estado} onChange={(v) => set('estado', v)} options={PV_ESTADOS} disabled={readOnly} />
            <Sel label="Técnico" value={f.tecnico_asignado} onChange={(v) => set('tecnico_asignado', v)} options={tecnicos.map((t) => t.nombre)} disabled={readOnly} />
            <Sel label="Prioridad" value={f.prioridad} onChange={(v) => set('prioridad', v)} options={PV_PRIORIDADES} disabled={readOnly} />
            <Sel label="¿Cotizar?" value={f.cotizar} onChange={(v) => set('cotizar', v)} options={PV_COTIZAR} disabled={readOnly} />
            <Sel label="Resultado" value={f.resultado} onChange={(v) => set('resultado', v)} options={PV_RESULTADOS} disabled={readOnly} />
          </div>
          <Area label="Descripción" value={f.descripcion} onChange={(v) => set('descripcion', v)} disabled={readOnly} />
          <Area label="Observaciones" value={f.observaciones} onChange={(v) => set('observaciones', v)} disabled={readOnly} />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cerrar</button>
          {canManage && (
            <button onClick={guardar} disabled={actualizar.isPending}
              className="px-5 py-2 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-2">
              <Save size={15} /> {actualizar.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
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
        <KPI label="Pend. Cliente" value={r.pendiente_cliente} icon={AlertTriangle} color="text-amber-600" />
        <KPI label="Cerrados" value={r.cerrados} icon={CheckCircle2} color="text-emerald-600" />
        <KPI label="Prioridad Alta" value={r.prioridad_alta} icon={AlertTriangle} color="text-rose-600" />
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
            {Object.entries(porTipo).length === 0 && <p className="text-slate-400 text-sm">Sin datos</p>}
            {Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <BarraRow key={k} label={k} value={v} max={Math.max(...Object.values(porTipo), 1)} />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Carga por técnico">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-slate-500 text-[11px] uppercase"><th className="text-left font-bold py-2">Técnico</th><th className="text-right font-bold py-2">Total</th><th className="text-right font-bold py-2">Activos</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(porTecnico).sort((a, b) => (b[1].abiertos || 0) - (a[1].abiertos || 0)).map(([k, v]) => (
                <tr key={k}><td className="py-2 font-semibold text-slate-700">{k}</td><td className="py-2 text-right text-slate-600">{n(v.total)}</td><td className="py-2 text-right font-bold text-orange-600">{n(v.abiertos)}</td></tr>
              ))}
              {Object.keys(porTecnico).length === 0 && <tr><td colSpan={3} className="py-6 text-center text-slate-400">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Tickets recientes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-slate-500 text-[11px] uppercase"><th className="text-left font-bold py-2">Ticket</th><th className="text-left font-bold py-2">Cliente</th><th className="text-left font-bold py-2">Técnico</th><th className="text-left font-bold py-2">Estado</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recientes.slice(0, 15).map((t) => (
                <tr key={t.numero}>
                  <td className="py-2 font-black text-slate-800">{t.numero}</td>
                  <td className="py-2 text-slate-600">{t.cliente}</td>
                  <td className="py-2 text-slate-600">{t.tecnico_asignado}</td>
                  <td className="py-2"><span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${pvEstadoCls(t.estado)}`}>{t.estado}</span></td>
                </tr>
              ))}
              {recientes.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">Sin tickets</td></tr>}
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
    try { await guardar.mutateAsync({ nombre: nuevo.trim(), orden: (tecnicos.length + 1) }); setNuevo(''); toast.success('Técnico agregado'); }
    catch (e) { toast.error(e.message || 'Error'); }
  };
  const toggle = async (t) => {
    try { await guardar.mutateAsync({ id: t.id, nombre: t.nombre, activo: !t.activo, orden: t.orden }); }
    catch (e) { toast.error(e.message || 'Error'); }
  };
  const borrar = async (t) => {
    if (!confirm(`¿Eliminar técnico "${t.nombre}"?`)) return;
    try { await eliminar.mutateAsync({ id: t.id }); toast.success('Técnico eliminado'); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-2xl space-y-4">
      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Users size={18} className="text-orange-600" /> Técnicos</h2>
      <div className="flex gap-2">
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregar()}
          placeholder="Nombre del técnico" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
        <button onClick={agregar} disabled={guardar.isPending} className="px-4 py-2 rounded-xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 disabled:opacity-40 flex items-center gap-1.5"><Plus size={15} /> Agregar</button>
      </div>
      <div className="divide-y divide-slate-100">
        {tecnicos.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2.5">
            <span className={`font-semibold ${t.activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{t.nombre}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(t)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${t.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{t.activo ? 'Activo' : 'Inactivo'}</button>
              <button onClick={() => borrar(t)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {tecnicos.length === 0 && <p className="text-slate-400 text-sm py-4">Sin técnicos</p>}
      </div>
    </div>
  );
}

// ─── Átomos ──────────────────────────────────────────────────────────────────
function Campo({ label, value, onChange, req, disabled }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}{req && <span className="text-orange-500"> *</span>}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-400" />
    </div>
  );
}
function Sel({ label, value, onChange, options, req, disabled, allowFree }) {
  const known = options.includes(value) || !value;
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}{req && <span className="text-orange-500"> *</span>}</label>
      <select value={known ? value : '__free__'} onChange={(e) => onChange(e.target.value === '__free__' ? '' : e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400">
        <option value="">— Seleccionar —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        {allowFree && !known && <option value="__free__">{value} (otro)</option>}
      </select>
    </div>
  );
}
function Area({ label, value, onChange, req, disabled }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}{req && <span className="text-orange-500"> *</span>}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-400" />
    </div>
  );
}
function Info({ label, value }) {
  return <div><div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div><div className="text-slate-700 font-semibold">{value}</div></div>;
}
function KPI({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-slate-400 uppercase">{label}</span><Icon size={16} className={color} /></div>
      <div className={`text-2xl font-black mt-1 ${color}`}>{n(value ?? 0)}</div>
    </div>
  );
}
function Panel({ title, children }) {
  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><h3 className="font-black text-slate-800 mb-3">{title}</h3>{children}</div>;
}
function Stat({ label, value }) {
  return <div className="bg-slate-50 rounded-xl p-3"><div className="text-[11px] font-bold text-slate-400 uppercase">{label}</div><div className="text-xl font-black text-slate-800">{n(value)}</div></div>;
}
function BarraRow({ label, value, max }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 shrink-0 text-slate-600 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(value / max) * 100}%` }} /></div>
      <span className="w-8 text-right font-bold text-slate-700">{n(value)}</span>
    </div>
  );
}
