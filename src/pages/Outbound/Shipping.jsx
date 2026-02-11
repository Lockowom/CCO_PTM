import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Filter, MapPin, User, 
  Calendar, CheckCircle, MoreVertical, 
  FileText, ArrowRight, Layers
} from 'lucide-react';
import { supabase } from '../../supabase';

const Shipping = () => {
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Deliveries (Ready for Dispatch)
      const { data: deliveriesData, error: delError } = await supabase
        .from('tms_entregas')
        .select('*')
        .eq('estado', 'PENDIENTE') // Waiting for assignment
        .order('fecha_creacion', { ascending: false });

      if (delError) throw delError;
      setDeliveries(deliveriesData || []);

      // 2. Fetch Drivers (Simulated or from Table)
      const { data: driversData, error: drvError } = await supabase
        .from('tms_conductores')
        .select('*')
        .eq('estado', 'DISPONIBLE');
      
      if (drvError) {
          // If table doesn't exist yet, use dummy data
          setDrivers([
              { id: '1', nombre: 'Juan Pérez', vehiculo_patente: 'AB-1234' },
              { id: '2', nombre: 'Carlos Ruiz', vehiculo_patente: 'CD-5678' },
              { id: '3', nombre: 'Transporte Externo', vehiculo_patente: 'EXT-001' }
          ]);
      } else {
          setDrivers(driversData || []);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDeliveries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDeliveries.map(d => d.id));
    }
  };

  const assignToRoute = async () => {
    if (selectedIds.length === 0) {
      alert("Seleccione al menos un pedido.");
      return;
    }
    if (!selectedDriver) {
      alert("Seleccione un conductor.");
      return;
    }

    try {
      setLoading(true);
      
      // Get driver info
      const driverInfo = drivers.find(d => d.id === selectedDriver);
      const driverName = driverInfo ? driverInfo.nombre : 'Desconocido';

      // 1. Create Route (Optional, simplified here directly to assignment)
      // We update the deliveries with the driver and change status to 'EN_RUTA'
      
      const { error } = await supabase
        .from('tms_entregas')
        .update({ 
            estado: 'EN_RUTA',
            conductor_id: selectedDriver, // If UUID
            // If we store name directly in legacy column:
            // transportista: driverName 
            fecha_asignacion: new Date()
        })
        .in('id', selectedIds);

      if (error) throw error;

      // 2. Update NV Status to 'DESPACHADO'
      // We need to find the NVs associated with these deliveries
      const selectedDeliveries = deliveries.filter(d => selectedIds.includes(d.id));
      const nvs = selectedDeliveries.map(d => d.nv);

      await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'DESPACHADO' })
        .in('nv', nvs);

      alert(`Asignados ${selectedIds.length} pedidos a ${driverName}`);
      setSelectedIds([]);
      setSelectedDriver('');
      fetchData();

    } catch (err) {
      alert("Error asignando ruta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.cliente && d.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Despachos</h2>
          <p className="text-slate-500 text-sm">Planificación de rutas y asignación de conductores</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 w-full md:w-auto">
            <div className="bg-slate-50 border rounded-lg flex items-center px-3 py-2 flex-1">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar N.V, Cliente, Comuna..." 
                    className="bg-transparent outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-600 hidden md:inline">Asignar a:</span>
                <select 
                    className="bg-slate-50 border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-200"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                >
                    <option value="">-- Seleccionar Conductor --</option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre} ({d.vehiculo_patente})</option>
                    ))}
                </select>
            </div>
            
            <button 
                onClick={assignToRoute}
                disabled={selectedIds.length === 0 || !selectedDriver || loading}
                className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                    selectedIds.length > 0 && selectedDriver
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                <Truck size={18} /> Asignar ({selectedIds.length})
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 w-10">
                            <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                checked={filteredDeliveries.length > 0 && selectedIds.length === filteredDeliveries.length}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="px-6 py-4">N.V</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Dirección / Comuna</th>
                        <th className="px-6 py-4 text-center">Bultos</th>
                        <th className="px-6 py-4 text-center">Peso</th>
                        <th className="px-6 py-4">Fecha Prep.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredDeliveries.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No hay despachos pendientes</p>
                            </td>
                        </tr>
                    ) : (
                        filteredDeliveries.map((delivery) => (
                            <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedIds.includes(delivery.id)}
                                        onChange={() => handleSelect(delivery.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-black text-slate-700">{delivery.nv}</td>
                                <td className="px-6 py-4 font-medium text-slate-600">{delivery.cliente}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <MapPin size={14} /> 
                                        <span>{delivery.comuna || 'Sin Comuna'}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 pl-5 truncate max-w-[200px]">
                                        {delivery.direccion || 'Sin Dirección'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold text-xs border border-slate-200">
                                        {delivery.bultos}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-500">
                                    {delivery.peso_kg > 0 ? `${delivery.peso_kg} kg` : '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                    {new Date(delivery.fecha_creacion).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
