import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare, CheckCircle, Clock, AlertTriangle, Search,
  RefreshCw, User, Filter, AlertCircle, Trash2, Send, X,
  ChevronDown, ChevronUp, Eye, MessageCircle, Loader2,
  BarChart3, TrendingUp, Zap, Shield, Calendar, MoreVertical,
  ArrowRight, CircleDot, Hash
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Status & Priority Config ──────────────────────────
const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'amber', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  EN_PROCESO: { label: 'En Proceso', color: 'blue', icon: Zap, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  RESUELTO: { label: 'Resuelto', color: 'emerald', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const PRIORITY_CONFIG = {
  ALTA: { label: 'Alta', color: 'red', icon: '🔴', bg: 'bg-red-50 border-red-200 text-red-700', ring: 'ring-red-200' },
  MEDIA: { label: 'Media', color: 'amber', icon: '🟡', bg: 'bg-amber-50 border-amber-200 text-amber-700', ring: 'ring-amber-200' },
  BAJA: { label: 'Baja', color: 'blue', icon: '🔵', bg: 'bg-blue-50 border-blue-200 text-blue-700', ring: 'ring-blue-200' },
};

const CATEGORIES = [
  'Hardware', 'Software', 'Red/Internet', 'Impresora', 'Sistema CCO', 'Accesos', 'Otro'
];

// ─── KPI Cell ──────────────────────────────────────────
const KpiCell = ({ label, value, sub, icon: Icon, color = 'slate' }) => {
  const colorMap = {
    amber: 'from-amber-500 to-orange-500 shadow-amber-200',
    blue: 'from-blue-500 to-indigo-500 shadow-blue-200',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
    slate: 'from-slate-600 to-slate-800 shadow-slate-200',
    red: 'from-red-500 to-rose-500 shadow-red-200',
  };
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 font-medium mt-1.5">{sub}</p>}
    </div>
  );
};

// ─── Ticket Card ────────────────────────────────────────
const TicketCard = ({ ticket, onStatusChange, onViewDetail, onDelete, isAdmin }) => {
  const status = STATUS_CONFIG[ticket.estado] || STATUS_CONFIG.PENDIENTE;
  const priority = PRIORITY_CONFIG[ticket.prioridad] || PRIORITY_CONFIG.MEDIA;
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all group ${
      ticket.estado === 'RESUELTO' ? 'border-slate-200 opacity-80 hover:opacity-100' : `${status.border} shadow-sm`
    }`}>
      <div className="p-5">
        {/* Top Row: ID + Priority + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Hash size={10} /> {ticket.ticket_id}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${priority.bg}`}>
              {priority.icon} {priority.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <select
                value={ticket.estado}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer transition-colors ${status.badge}`}
              >
                <option value="PENDIENTE">⏳ Pendiente</option>
                <option value="EN_PROCESO">⚡ En Proceso</option>
                <option value="RESUELTO">✅ Resuelto</option>
              </select>
            )}
            {!isAdmin && (
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                {status.label}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">{ticket.asunto || 'Sin Asunto'}</h3>

        {/* Description Preview */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{ticket.descripcion}</p>

        {/* Category tag if exists */}
        {ticket.categoria && (
          <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md mb-3">
            {ticket.categoria}
          </span>
        )}

        {/* Response preview */}
        {ticket.respuesta_admin && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
            <p className="text-[11px] font-bold text-emerald-600 mb-1 flex items-center gap-1">
              <Shield size={11} /> Respuesta TI
            </p>
            <p className="text-sm text-emerald-800 line-clamp-2">{ticket.respuesta_admin}</p>
          </div>
        )}

        {/* Footer: User + Date + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {(ticket.usuario_nombre || 'U').charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{ticket.usuario_nombre}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={9} />
                {ticket.created_at ? formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: es }) : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewDetail(ticket)}
              className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
              title="Ver detalle"
            >
              <Eye size={15} />
            </button>
            {isAdmin && (
              <button
                onClick={() => onDelete(ticket)}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Modal ────────────────────────────────────────
const DetailModal = ({ ticket, onClose, onStatusChange, onRespond, isAdmin }) => {
  const [respuesta, setRespuesta] = useState('');
  const [sending, setSending] = useState(false);
  const status = STATUS_CONFIG[ticket.estado] || STATUS_CONFIG.PENDIENTE;
  const priority = PRIORITY_CONFIG[ticket.prioridad] || PRIORITY_CONFIG.MEDIA;

  const handleRespond = async () => {
    if (!respuesta.trim()) return;
    setSending(true);
    await onRespond(ticket.id, respuesta.trim());
    setSending(false);
    setRespuesta('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}>
              <MessageSquare size={18} className={status.text} />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-400">{ticket.ticket_id}</span>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{ticket.asunto || 'Sin Asunto'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estado</p>
              {isAdmin ? (
                <select
                  value={ticket.estado}
                  onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                  className={`w-full px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer ${status.badge}`}
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="RESUELTO">Resuelto</option>
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border ${status.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                  {status.label}
                </span>
              )}
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prioridad</p>
              <span className={`inline-block text-xs font-bold px-2 py-1 rounded border ${priority.bg}`}>
                {priority.icon} {priority.label}
              </span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reportado por</p>
              <p className="text-sm font-bold text-slate-700">{ticket.usuario_nombre}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</p>
              <p className="text-sm font-bold text-slate-700">
                {ticket.created_at ? format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm', { locale: es }) : '—'}
              </p>
            </div>
          </div>

          {/* Category */}
          {ticket.categoria && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Categoría:</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                {ticket.categoria}
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Descripción del Incidente</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket.descripcion}
            </div>
          </div>

          {/* Response */}
          {ticket.respuesta_admin && (
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1.5">
                <Shield size={12} /> Respuesta del Equipo TI
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 whitespace-pre-wrap leading-relaxed">
                {ticket.respuesta_admin}
              </div>
            </div>
          )}

          {/* Admin Reply */}
          {isAdmin && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <MessageCircle size={12} /> {ticket.respuesta_admin ? 'Actualizar Respuesta' : 'Responder al Ticket'}
              </p>
              <textarea
                rows={3}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe la respuesta o solución..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleRespond}
                  disabled={sending || !respuesta.trim()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Enviar Respuesta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create Modal ────────────────────────────────────────
const CreateModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ asunto: '', descripcion: '', prioridad: 'MEDIA', categoria: '' });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.asunto.trim() || !form.descripcion.trim()) {
      toast.error('Completa asunto y descripción');
      return;
    }
    setCreating(true);
    await onCreate(form);
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <AlertCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Nuevo Ticket</h3>
              <p className="text-xs text-slate-400">Reportar un incidente o solicitud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asunto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asunto</label>
            <input
              required
              type="text"
              value={form.asunto}
              onChange={e => setForm({ ...form, asunto: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Ej: Error al imprimir etiqueta de despacho"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: form.categoria === cat ? '' : cat })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.categoria === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, prioridad: key })}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all ${
                    form.prioridad === key
                      ? `${cfg.bg} ring-2 ${cfg.ring} shadow-md`
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción Detallada</label>
            <textarea
              required
              rows={4}
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed"
              placeholder="Describe qué pasó, dónde ocurrió y qué esperabas que sucediera..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Enviar Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Modal ────────────────────────────────────────
const DeleteModal = ({ ticket, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(ticket.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Eliminar Ticket</h3>
            <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm">
          <p><span className="font-bold text-red-800">ID:</span> {ticket.ticket_id}</p>
          <p><span className="font-bold text-red-800">Asunto:</span> {ticket.asunto}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────
// ═══════════════════════════════════════════════════════
const Tickets = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);

  // ─── Fetch ───────────────────────────────────────────
  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('public:tms_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_tickets' }, (payload) => {
        fetchTickets();
        if (payload.eventType === 'INSERT') {
          toast.info('🎟️ Nuevo ticket recibido');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tms_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      toast.error('Error cargando tickets');
    } finally {
      setLoading(false);
    }
  };

  // ─── Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const pendientes = tickets.filter(t => t.estado === 'PENDIENTE').length;
    const enProceso = tickets.filter(t => t.estado === 'EN_PROCESO').length;
    const resueltos = tickets.filter(t => t.estado === 'RESUELTO').length;
    const alta = tickets.filter(t => t.prioridad === 'ALTA' && t.estado !== 'RESUELTO').length;
    return { pendientes, enProceso, resueltos, total: tickets.length, alta };
  }, [tickets]);

  // ─── Filtered ───────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filter !== 'ALL' && t.estado !== filter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !(t.descripcion || '').toLowerCase().includes(q) &&
          !(t.ticket_id || '').toLowerCase().includes(q) &&
          !(t.asunto || '').toLowerCase().includes(q) &&
          !(t.usuario_nombre || '').toLowerCase().includes(q) &&
          !(t.categoria || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [tickets, filter, searchTerm]);

  // ─── Actions ────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: newStatus } : t));
    if (detailTicket?.id === id) setDetailTicket(prev => ({ ...prev, estado: newStatus }));

    const { error } = await supabase
      .from('tms_tickets')
      .update({ estado: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Error cambiando estado');
      fetchTickets();
    } else {
      toast.success(`Estado → ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    }
  };

  const handleRespond = async (id, respuesta) => {
    const { error } = await supabase
      .from('tms_tickets')
      .update({ respuesta_admin: respuesta, estado: 'EN_PROCESO', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Error al responder');
    } else {
      toast.success('Respuesta enviada');
      setDetailTicket(prev => prev ? { ...prev, respuesta_admin: respuesta, estado: 'EN_PROCESO' } : null);
      fetchTickets();
    }
  };

  const handleCreate = async (form) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      const ticketData = {
        ticket_id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        usuario_id: u?.id || 'anon',
        usuario_nombre: u?.user_metadata?.nombre || user?.nombre || 'Usuario',
        asunto: form.asunto,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        categoria: form.categoria || null,
        estado: 'PENDIENTE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('tms_tickets').insert(ticketData);
      if (error) throw error;

      // Push notification se envía automáticamente via DB trigger → Edge Function (notify-ticket)

      setShowCreate(false);
      toast.success('Ticket creado exitosamente');
      fetchTickets();
    } catch (err) {
      toast.error('Error creando ticket: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('tms_tickets').delete().eq('id', id);
    if (error) {
      toast.error('Error eliminando ticket');
    } else {
      toast.success('Ticket eliminado');
      setDeleteTicket(null);
      fetchTickets();
    }
  };

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <MessageSquare size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Soporte TI</h1>
            <p className="text-sm text-slate-500">Gestión de incidentes y requerimientos técnicos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 transition-colors"
            title="Refrescar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
          >
            <AlertCircle size={16} /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <KpiCell label="Pendientes" value={stats.pendientes} icon={Clock} color="amber" sub="Esperando atención" />
        <KpiCell label="En Proceso" value={stats.enProceso} icon={Zap} color="blue" sub="Siendo atendidos" />
        <KpiCell label="Resueltos" value={stats.resueltos} icon={CheckCircle} color="emerald" sub="Completados" />
        <KpiCell label="Prioridad Alta" value={stats.alta} icon={AlertTriangle} color="red" sub="Requieren acción" />
        <KpiCell label="Total" value={stats.total} icon={BarChart3} color="slate" sub="Todos los tickets" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, asunto, usuario..."
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
            {[
              { key: 'ALL', label: 'Todos', count: stats.total },
              { key: 'PENDIENTE', label: 'Pendientes', count: stats.pendientes },
              { key: 'EN_PROCESO', label: 'En Proceso', count: stats.enProceso },
              { key: 'RESUELTO', label: 'Resueltos', count: stats.resueltos },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                    filter === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="text-xs text-slate-400 font-medium pl-2 md:border-l border-slate-200 ml-auto">
            <span className="font-bold text-slate-700">{filteredTickets.length}</span> resultados
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-lg font-bold text-slate-600 mb-1">No hay tickets</h3>
          <p className="text-sm text-slate-400">
            {searchTerm || filter !== 'ALL' ? 'Intenta cambiar los filtros' : 'Crea el primer ticket de soporte'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
              onViewDetail={setDetailTicket}
              onDelete={setDeleteTicket}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {detailTicket && (
        <DetailModal
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
          onStatusChange={handleStatusChange}
          onRespond={handleRespond}
          isAdmin={isAdmin}
        />
      )}
      {deleteTicket && (
        <DeleteModal
          ticket={deleteTicket}
          onClose={() => setDeleteTicket(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Tickets;
