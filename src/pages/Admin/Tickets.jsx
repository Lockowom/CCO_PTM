import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { 
  MessageSquare, CheckCircle, Clock, AlertTriangle, Search, 
  RefreshCw, User, Filter, AlertCircle, Trash2, Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDIENTE, EN_PROCESO, RESUELTO
  const [searchTerm, setSearchTerm] = useState('');
  
  // Nuevo Ticket
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ asunto: '', descripcion: '', prioridad: 'MEDIA' });

  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('public:tms_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_tickets' }, (payload) => {
        fetchTickets();
        if (payload.eventType === 'INSERT') {
          // Play sound notification
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
          audio.play().catch(e => {});
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic update
      setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: newStatus } : t));

      await supabase
        .from('tms_tickets')
        .update({ estado: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

    } catch (err) {
      console.error('Error updating status:', err);
      fetchTickets(); // Revert
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.asunto || !newTicket.descripcion) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const ticketData = {
        ticket_id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        usuario_id: user?.id || 'anon',
        usuario_nombre: user?.user_metadata?.nombre || 'Usuario Sistema',
        asunto: newTicket.asunto,
        descripcion: newTicket.descripcion,
        prioridad: newTicket.prioridad,
        estado: 'PENDIENTE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('tms_tickets').insert(ticketData);

      if (error) throw error;

      setIsCreating(false);
      setNewTicket({ asunto: '', descripcion: '', prioridad: 'MEDIA' });
      alert('Ticket creado exitosamente');
      fetchTickets();

    } catch (err) {
      alert('Error creando ticket: ' + err.message);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'ALL' && t.estado !== filter) return false;
    if (searchTerm && 
        !t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !t.asunto?.toLowerCase().includes(searchTerm.toLowerCase())
       ) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA': return 'text-red-600 bg-red-50 border-red-100';
      case 'MEDIA': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'BAJA': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <MessageSquare size={24} />
            </div>
            SOPORTE TI
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Gestión de incidentes y requerimientos técnicos</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <AlertCircle size={20} /> NUEVO TICKET
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pendientes</p>
          <p className="text-2xl font-black text-amber-500">{tickets.filter(t => t.estado === 'PENDIENTE').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">En Proceso</p>
          <p className="text-2xl font-black text-blue-500">{tickets.filter(t => t.estado === 'EN_PROCESO').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Resueltos</p>
          <p className="text-2xl font-black text-emerald-500">{tickets.filter(t => t.estado === 'RESUELTO').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
          <p className="text-2xl font-black text-slate-700">{tickets.length}</p>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar ticket por ID, asunto o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {['ALL', 'PENDIENTE', 'EN_PROCESO', 'RESUELTO'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === status 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'TODOS' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => (
          <div 
            key={ticket.id} 
            className={`bg-white rounded-2xl border p-6 transition-all hover:shadow-lg group ${
              ticket.estado === 'PENDIENTE' ? 'border-amber-200 shadow-amber-50' : 
              ticket.estado === 'RESUELTO' ? 'border-slate-200 opacity-75 hover:opacity-100' : 
              'border-blue-200 shadow-blue-50'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-md ${
                  ticket.prioridad === 'ALTA' ? 'bg-red-500' : 
                  ticket.prioridad === 'MEDIA' ? 'bg-amber-500' : 
                  'bg-blue-500'
                }`}>
                  {ticket.prioridad.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.ticket_id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{ticket.asunto || 'Sin Asunto'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">{ticket.usuario_nombre}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ticket.estado}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                    ticket.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    ticket.estado === 'EN_PROCESO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="RESUELTO">RESUELTO</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
              {ticket.descripcion}
            </div>
            
            {ticket.respuesta && (
               <div className="mt-4 pl-4 border-l-4 border-emerald-200">
                 <p className="text-xs font-bold text-emerald-600 mb-1">Respuesta TI:</p>
                 <p className="text-sm text-slate-600">{ticket.respuesta}</p>
               </div>
            )}
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700">No hay tickets encontrados</h3>
            <p className="text-slate-500 text-sm">Intenta cambiar los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal Crear Ticket */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            <h3 className="text-xl font-black text-slate-800">Nuevo Reporte de Incidente</h3>
            
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asunto</label>
                <input 
                  required
                  type="text" 
                  value={newTicket.asunto}
                  onChange={e => setNewTicket({...newTicket, asunto: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Error al imprimir etiqueta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridad</label>
                <div className="grid grid-cols-3 gap-2">
                  {['BAJA', 'MEDIA', 'ALTA'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTicket({...newTicket, prioridad: p})}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        newTicket.prioridad === p 
                          ? 'bg-slate-800 text-white border-slate-800' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción Detallada</label>
                <textarea 
                  required
                  rows="4"
                  value={newTicket.descripcion}
                  onChange={e => setNewTicket({...newTicket, descripcion: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe qué estabas haciendo y qué error apareció..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Enviar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
