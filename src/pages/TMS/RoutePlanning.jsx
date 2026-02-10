import React, { useState, useEffect } from 'react';
import { Search, MapPin, Truck, Calendar, User, CheckSquare, Square, Save, ArrowRight } from 'lucide-react';

const API_URL = 'https://cco-ptm.onrender.com/api';

const RoutePlanning = () => {
  const [entregas, setEntregas] = useState([]);
  const [conductores, setConductores] = useState([]); // En el futuro esto vendrá de API
  const [selectedEntregas, setSelectedEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  // Estado para creación de ruta
  const [rutaNombre, setRutaNombre] = useState(`Ruta-${new Date().toLocaleDateString().replace(/\//g, '-')}`);
  const [selectedConductor, setSelectedConductor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargar entregas pendientes
      const res = await fetch(`${API_URL}/entregas?estado=PENDIENTE&limit=200`);
      const data = await res.json();
      setEntregas(data);

      // Mock conductores (En producción crear endpoint /api/conductores)
      setConductores([
        { id: '1', nombre: 'Juan Pérez', vehiculo: 'Camión A' },
        { id: '2', nombre: 'Carlos Díaz', vehiculo: 'Van B' },
        { id: '3', nombre: 'Roberto Gómez', vehiculo: 'Moto C' }
      ]);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    if (selectedEntregas.includes(id)) {
      setSelectedEntregas(selectedEntregas.filter(sid => sid !== id));
    } else {
      setSelectedEntregas([...selectedEntregas, id]);
    }
  };

  const handleCreateRoute = async () => {
    if (selectedEntregas.length === 0 || !selectedConductor) {
      alert("Selecciona entregas y un conductor");
      return;
    }

    try {
      const payload = {
        nombre: rutaNombre,
        conductor_id: selectedConductor,
        entregas_ids: selectedEntregas
      };

      const res = await fetch(`${API_URL}/rutas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        alert("¡Ruta creada con éxito!");
        // Recargar datos para limpiar los ya asignados
        fetchData();
        setSelectedEntregas([]);
      } else {
        alert("Error creando ruta");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const filteredEntregas = entregas.filter(e => 
    e.nv.toLowerCase().includes(filterText.toLowerCase()) || 
    (e.cliente && e.cliente.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Planificador de Rutas</h2>
          <p className="text-slate-500 text-sm">Asigna entregas pendientes a tus conductores</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Filtrar por Cliente o NV..." 
                    className="outline-none text-sm w-64"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
        
        {/* Panel Izquierdo: Lista de Entregas */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={18} />
              Pendientes ({filteredEntregas.length})
            </h3>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
               {selectedEntregas.length} seleccionados
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
                <div className="text-center py-10 text-slate-400">Cargando entregas...</div>
            ) : filteredEntregas.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No hay entregas pendientes</div>
            ) : (
                filteredEntregas.map(entrega => (
                    <div 
                        key={entrega.id}
                        onClick={() => toggleSelection(entrega.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            selectedEntregas.includes(entrega.id) 
                            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' 
                            : 'bg-white border-slate-100 hover:border-indigo-200'
                        }`}
                    >
                        <div className={`mt-1 ${selectedEntregas.includes(entrega.id) ? 'text-indigo-600' : 'text-slate-300'}`}>
                            {selectedEntregas.includes(entrega.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-700 text-sm">NV: {entrega.nv}</span>
                                <span className="text-xs text-slate-400">{new Date(entrega.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 truncate">{entrega.cliente}</p>
                            <p className="text-xs text-slate-400 truncate">{entrega.direccion || 'Sin dirección'}</p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                    {entrega.bultos} bultos
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Flecha Central */}
        <div className="flex flex-col justify-center items-center text-slate-300">
             <ArrowRight size={32} />
        </div>

        {/* Panel Derecho: Configuración de Ruta */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Truck size={18} />
                    Nueva Ruta
                </h3>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de Ruta</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={rutaNombre}
                            onChange={e => setRutaNombre(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Asignar Conductor</label>
                    <div className="space-y-2">
                        {conductores.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => setSelectedConductor(c.id)}
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center ${
                                    selectedConductor === c.id 
                                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                                    : 'hover:bg-slate-50 border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{c.nombre}</p>
                                        <p className="text-xs text-slate-400">{c.vehiculo}</p>
                                    </div>
                                </div>
                                {selectedConductor === c.id && <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Resumen</h4>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Entregas:</span>
                        <span className="font-bold text-slate-800">{selectedEntregas.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Estado:</span>
                        <span className="text-orange-600 font-medium">Borrador</span>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleCreateRoute}
                    disabled={selectedEntregas.length === 0 || !selectedConductor}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md"
                >
                    <Save size={18} />
                    Crear y Asignar Ruta
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;