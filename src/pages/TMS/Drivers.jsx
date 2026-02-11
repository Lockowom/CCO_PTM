import React, { useState, useEffect } from 'react';
import { 
  User, Search, Plus, Edit2, Trash2, 
  Phone, Truck, CheckCircle, XCircle 
} from 'lucide-react';
import { supabase } from '../../supabase';

const Drivers = () => {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    telefono: '',
    vehiculo_patente: '',
    estado: 'DISPONIBLE'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setDrivers(data || []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('tms_conductores')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('tms_conductores')
          .insert(formData);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        nombre: '', apellido: '', rut: '', telefono: '', vehiculo_patente: '', estado: 'DISPONIBLE'
      });
      fetchDrivers();

    } catch (err) {
      alert("Error guardando conductor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingId(driver.id);
    setFormData({
      nombre: driver.nombre || '',
      apellido: driver.apellido || '',
      rut: driver.rut || '',
      telefono: driver.telefono || '',
      vehiculo_patente: driver.vehiculo_patente || '',
      estado: driver.estado || 'DISPONIBLE'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este conductor?")) return;
    try {
      const { error } = await supabase
        .from('tms_conductores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      alert("Error eliminando: " + err.message);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.apellido && d.apellido.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Conductores</h2>
          <p className="text-slate-500 text-sm">Administración de flota y personal de transporte</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: '', apellido: '', rut: '', telefono: '', vehiculo_patente: '', estado: 'DISPONIBLE' });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={18} /> Nuevo Conductor
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="bg-slate-50 border rounded-lg flex items-center px-3 py-2 max-w-md">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="bg-transparent outline-none text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map(driver => (
          <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(driver)} className="text-slate-400 hover:text-indigo-600 bg-slate-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(driver.id)} className="text-slate-400 hover:text-red-600 bg-slate-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                {driver.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{driver.nombre} {driver.apellido}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${driver.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {driver.estado}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-slate-400" />
                <span className="font-mono bg-slate-50 px-1 rounded">{driver.vehiculo_patente || 'Sin Vehículo'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <span>{driver.telefono || 'Sin Teléfono'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span>RUT: {driver.rut || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Editar Conductor' : 'Nuevo Conductor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input required type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellido</label>
                  <input type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RUT</label>
                <input type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                <input type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patente Vehículo</label>
                  <input type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 font-mono" value={formData.vehiculo_patente} onChange={e => setFormData({...formData, vehiculo_patente: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                  <select className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADO">Ocupado</option>
                    <option value="FUERA_SERVICIO">Fuera de Servicio</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
