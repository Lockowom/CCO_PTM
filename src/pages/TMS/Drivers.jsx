// Drivers.jsx - Gestión de Conductores con Realtime
import React, { useState, useRef } from 'react';
import { useConductores } from '../../hooks/useConductores';
import { 
  User, 
  Phone, 
  Car, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check,
  Search,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Drivers = () => {
  const containerRef = useRef(null);
  const {
    conductores,
    loading,
    error,
    crearConductor,
    actualizarConductor,
    eliminarConductor,
  } = useConductores();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    telefono: '',
    vehiculo_patente: '',
    estado: 'DISPONIBLE',
  });

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // Reset form
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      rut: '',
      telefono: '',
      vehiculo_patente: '',
      estado: 'DISPONIBLE',
    });
    setEditingId(null);
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (conductor) => {
    setFormData({
      nombre: conductor.nombre || '',
      apellido: conductor.apellido || '',
      rut: conductor.rut || '',
      telefono: conductor.telefono || '',
      vehiculo_patente: conductor.vehiculo_patente || '',
      estado: conductor.estado || 'DISPONIBLE',
    });
    setEditingId(conductor.id);
    setShowModal(true);
  };

  // Guardar (crear o actualizar)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await actualizarConductor(editingId, formData);
      } else {
        await crearConductor(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Eliminar
  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await eliminarConductor(id);
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  // Cambiar estado rápido
  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await actualizarConductor(id, { estado: nuevoEstado });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filtrar conductores
  const filteredConductores = conductores.filter(c =>
    c.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
    c.apellido?.toLowerCase().includes(filterText.toLowerCase()) ||
    c.rut?.toLowerCase().includes(filterText.toLowerCase()) ||
    c.vehiculo_patente?.toLowerCase().includes(filterText.toLowerCase())
  );

  // Colores de estado
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'OCUPADO':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'EN_RUTA':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'INACTIVO':
        return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen text-slate-700">
        <div className="bg-wms-danger/20 border border-wms-danger/50 text-wms-danger px-4 py-3 rounded-lg shadow-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 text-slate-700 p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
          <div className="bg-wms-neon/10 p-3.5 rounded-2xl border border-wms-neon/20 text-wms-neon shadow-neon-green">
            <User size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Conductores</h2>
            <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
              <Activity size={14} className="text-wms-neon" />
              {conductores.length} conductores registrados • 
              <span className="text-wms-neon ml-1 font-bold">
                {conductores.filter(c => c.estado === 'DISPONIBLE').length} disponibles
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl flex items-center px-4 py-3 shadow-sm focus-within:border-wms-neon focus-within:shadow-neon-green transition-all flex-1 md:flex-none">
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar conductor..."
              className="outline-none text-sm w-full md:w-48 bg-transparent text-slate-900 placeholder-slate-500 font-medium"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-wms-neon text-slate-900 px-5 py-3 rounded-2xl font-black hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-neon-green transition-all w-full sm:w-auto"
          >
            <Plus size={18} strokeWidth={3} />
            Nuevo Conductor
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 flex-1 overflow-hidden flex flex-col relative">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="min-w-full divide-y divide-wms-border">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Conductor
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  RUT
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Vehículo
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wms-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-wms-neon mb-4" size={32} />
                    <p className="text-slate-500 font-medium">Sincronizando conductores...</p>
                  </td>
                </tr>
              ) : filteredConductores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <User size={24} className="text-slate-500" />
                    </div>
                    <p className="font-bold text-lg">No se encontraron conductores</p>
                    <p className="text-sm mt-1">Verifica los filtros o agrega un nuevo registro</p>
                  </td>
                </tr>
              ) : (
                filteredConductores.map((conductor) => (
                  <tr key={conductor.id} className="hover:bg-white/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-wms-neon/50 transition-colors shadow-sm">
                          <User size={20} className="text-slate-500 group-hover:text-wms-neon transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base">
                            {conductor.nombre} {conductor.apellido}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                            ID: {conductor.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono font-medium">
                      {conductor.rut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Phone size={14} className="text-wms-neon" />
                        {conductor.telefono || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-mono font-bold">
                        <Car size={16} className="text-wms-neon" />
                        <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                          {conductor.vehiculo_patente || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={conductor.estado}
                        onChange={(e) => handleEstadoChange(conductor.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border outline-none cursor-pointer transition-all ${getEstadoStyle(conductor.estado)}`}
                      >
                        <option value="DISPONIBLE" className="bg-white text-slate-900">Disponible</option>
                        <option value="OCUPADO" className="bg-white text-slate-900">Ocupado</option>
                        <option value="EN_RUTA" className="bg-white text-slate-900">En Ruta</option>
                        <option value="INACTIVO" className="bg-white text-slate-900">Inactivo</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(conductor)}
                          className="p-2 text-slate-500 hover:text-wms-neon hover:bg-wms-neon/10 rounded-xl transition-all border border-transparent hover:border-wms-neon/20"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(conductor.id, conductor.nombre)}
                          className="p-2 text-slate-500 hover:text-wms-danger hover:bg-wms-danger/10 rounded-xl transition-all border border-transparent hover:border-wms-danger/20"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wms-neon via-emerald-400 to-wms-neon"></div>
            {/* Header Modal */}
            <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {editingId ? <Edit2 size={20} className="text-wms-neon"/> : <Plus size={20} className="text-wms-neon"/>}
                {editingId ? 'Editar Conductor' : 'Nuevo Conductor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all font-medium placeholder-slate-600"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all font-medium placeholder-slate-600"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all font-medium placeholder-slate-600"
                    placeholder="12.345.678-9"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all font-medium placeholder-slate-600"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                    Patente Vehículo
                  </label>
                  <input
                    type="text"
                    value={formData.vehiculo_patente}
                    onChange={(e) => setFormData({ ...formData, vehiculo_patente: e.target.value })}
                    className="w-full bg-slate-900 text-white font-mono rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all uppercase placeholder-slate-600"
                    placeholder="ABCD-12"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 focus:border-wms-neon outline-none transition-all font-black uppercase tracking-widest text-xs cursor-pointer"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADO">Ocupado</option>
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl font-black hover:bg-white transition-all uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-wms-neon text-slate-900 rounded-xl font-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-neon-green uppercase text-xs tracking-widest"
                >
                  <Check size={18} strokeWidth={3} />
                  {editingId ? 'Guardar' : 'Crear'}
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
