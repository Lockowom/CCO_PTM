import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { 
  MessageSquareWarning, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  RefreshCw,
  User,
  Filter
} from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDIENTE, RESUELTO
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();

    // Realtime subscription
    const subscription = supabase
      .channel('public:tms_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_tickets' }, (payload) => {
        // Simple reload or manual update
        fetchTickets();
        
        // Alerta sonora simple si es nuevo insert
        if (payload.eventType === 'INSERT') {
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
          audio.play().catch(e => console.log('Audio autoplay blocked'));
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

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'ALL' && t.estado !== filter) return false;
    if (searchTerm && !t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) && !t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquareWarning className="text-indigo-600" />
            Tickets de Soporte TI
          </h2>
          <p className="text-slate-500 text-sm">Gestión de reportes de errores de usuarios</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ID o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={fetchTickets}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Todos ({tickets.length})
        </button>
        <button 
          onClick={() => setFilter('PENDIENTE')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'PENDIENTE' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'}`}
        >
          Pendientes ({tickets.filter(t => t.estado === 'PENDIENTE').length})
        </button>
        <button 
          onClick={() => setFilter('RESUELTO')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'RESUELTO' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'}`}
        >
          Resueltos ({tickets.filter(t => t.estado === 'RESUELTO').length})
        </button>
      </div>

      {/* Lista de Tickets */}
      <div className="grid gap-4">
        {filteredTickets.map(ticket => (
          <div 
            key={ticket.id} 
            className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
              ticket.estado === 'PENDIENTE' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {ticket.ticket_id}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  ticket.estado === 'PENDIENTE' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {ticket.estado === 'PENDIENTE' ? <Clock size={12} /> : <CheckCircle size={12} />}
                  {ticket.estado}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <User size={12} /> {ticket.usuario_nombre}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
            
            <p className="text-slate-800 font-medium mb-4 whitespace-pre-wrap">{ticket.descripcion}</p>
            
            <div className="flex justify-end gap-2 border-t pt-3 border-slate-100">
              {ticket.estado === 'PENDIENTE' ? (
                <button 
                  onClick={() => handleStatusChange(ticket.id, 'RESUELTO')}
                  className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <CheckCircle size={14} /> Marcar Resuelto
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusChange(ticket.id, 'PENDIENTE')}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Reabrir Ticket
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <MessageSquareWarning className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">No hay tickets que coincidan con el filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
