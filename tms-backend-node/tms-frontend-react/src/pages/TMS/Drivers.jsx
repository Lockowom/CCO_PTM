// Drivers.jsx - Gestión de Conductores con Realtime
import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

const Drivers = () => {
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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OCUPADO':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'EN_RUTA':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'INACTIVO':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Conductores</h2>
          <p className="text-slate-500 text-sm">
            {conductores.length} conductores registrados • 
            <span className="text-emerald-600 ml-1">
              {conductores.filter(c => c.estado === 'DISPONIBLE').length} disponibles
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar conductor..."
              className="outline-none text-sm w-48"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-md transition-all"
          >
            <Plus size={18} />
            Nuevo Conductor
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Conductor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-400">Cargando conductores...</p>
                  </td>
                </tr>
              ) : filteredConductores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron conductores
                  </td>
                </tr>
              ) : (
                filteredConductores.map((conductor) => (
                  <tr key={conductor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {conductor.nombre} {conductor.apellido}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {conductor.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {conductor.rut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {conductor.telefono || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Car size={14} className="text-slate-400" />
                        {conductor.vehiculo_patente || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={conductor.estado}
                        onChange={(e) => handleEstadoChange(conductor.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${getEstadoStyle(conductor.estado)}`}
                      >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="OCUPADO">Ocupado</option>
                        <option value="EN_RUTA">En Ruta</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(conductor)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(conductor.id, conductor.nombre)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header Modal */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingId ? 'Editar Conductor' : 'Nuevo Conductor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="12.345.678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patente Vehículo
                  </label>
                  <input
                    type="text"
                    value={formData.vehiculo_patente}
                    onChange={(e) => setFormData({ ...formData, vehiculo_patente: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="ABCD-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADO">Ocupado</option>
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {editingId ? 'Guardar Cambios' : 'Crear Conductor'}
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
