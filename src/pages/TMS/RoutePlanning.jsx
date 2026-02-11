import React, { useState, useEffect } from 'react';
import { Search, MapPin, Truck, Calendar, User, CheckSquare, Square, Save, ArrowRight, Layers } from 'lucide-react';
import { supabase } from '../../supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const iconPending = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconSelected = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Componente para centrar el mapa en los puntos
const MapBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const group = new L.FeatureGroup(markers.map(m => L.marker([m.lat, m.lng])));
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }, [markers, map]);
    return null;
};

const RoutePlanning = () => {
  const [entregas, setEntregas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [selectedEntregas, setSelectedEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [showMap, setShowMap] = useState(true);

  // Estado para creación de ruta
  const [rutaNombre, setRutaNombre] = useState(`Ruta-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}`);
  const [selectedConductor, setSelectedConductor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: entregasData, error: entError } = await supabase
        .from('tms_entregas')
        .select('*')
        .is('ruta_id', null)
        .in('estado', ['PENDIENTE', 'LISTO_DESPACHO'])
        .order('fecha_creacion', { ascending: false });

      if (entError) throw entError;
      setEntregas(entregasData || []);

      const { data: conductoresData, error: condError } = await supabase
        .from('tms_conductores')
        .select('*')
        .eq('estado', 'DISPONIBLE')
        .order('nombre', { ascending: true });

      if (condError) throw condError;
      setConductores(conductoresData || []);

    } catch (error) {
      console.error("Error cargando datos:", error);
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
      setLoading(true);

      const { data: ruta, error: rutaError } = await supabase
        .from('tms_rutas')
        .insert({
            nombre: rutaNombre,
            conductor_id: selectedConductor,
            fecha_inicio: new Date(),
            estado: 'PLANIFICADA',
            total_entregas: selectedEntregas.length
        })
        .select()
        .single();

      if (rutaError) throw rutaError;

      const { error: updateError } = await supabase
        .from('tms_entregas')
        .update({
            ruta_id: ruta.id,
            estado: 'EN_RUTA',
            conductor_id: selectedConductor,
            fecha_asignacion: new Date()
        })
        .in('id', selectedEntregas);

      if (updateError) throw updateError;

      const entregasSeleccionadas = entregas.filter(e => selectedEntregas.includes(e.id));
      const nvs = entregasSeleccionadas.map(e => e.nv);
      
      await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'EN_RUTA' })
        .in('nv', nvs);

      alert(`¡Ruta "${rutaNombre}" creada con éxito!`);
      
      setSelectedEntregas([]);
      setSelectedConductor('');
      setRutaNombre(`Ruta-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}`);
      fetchData();

    } catch (e) {
      console.error(e);
      alert("Error creando ruta: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntregas = entregas.filter(e => 
    e.nv.toLowerCase().includes(filterText.toLowerCase()) || 
    (e.cliente && e.cliente.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Filtrar entregas con coordenadas válidas para el mapa
  const mapEntregas = filteredEntregas.filter(e => e.latitud && e.longitud);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Planificador de Rutas</h2>
          <p className="text-slate-500 text-sm">Mapa interactivo y asignación de flota</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${showMap ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600'}`}
            >
                <Layers size={18} /> {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </button>
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
            <button 
                onClick={fetchData} 
                className="bg-white border p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
                <ArrowRight size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="flex gap-4 h-full overflow-hidden">
        
        {/* Panel Izquierdo: Lista de Entregas */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Truck size={16} /> Entregas ({filteredEntregas.length})
            </h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
               {selectedEntregas.length} Sel.
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredEntregas.map(entrega => (
                <div 
                    key={entrega.id}
                    onClick={() => toggleSelection(entrega.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        selectedEntregas.includes(entrega.id) 
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' 
                        : 'bg-white border-slate-100 hover:border-indigo-200'
                    }`}
                >
                    <div className={`mt-1 ${selectedEntregas.includes(entrega.id) ? 'text-indigo-600' : 'text-slate-300'}`}>
                        {selectedEntregas.includes(entrega.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-700 text-xs">NV: {entrega.nv}</span>
                            {!entrega.latitud && <span className="text-[10px] text-red-500 font-bold">Sin GPS</span>}
                        </div>
                        <p className="text-xs font-medium text-slate-600 truncate">{entrega.cliente}</p>
                        <p className="text-[10px] text-slate-400 truncate">{entrega.direccion || 'Sin dirección'}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Panel Central: Mapa */}
        {showMap && (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-0">
                {mapEntregas.length > 0 ? (
                    <MapContainer center={[-33.4489, -70.6693]} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapBounds markers={mapEntregas.map(e => ({ lat: e.latitud, lng: e.longitud }))} />
                        
                        {mapEntregas.map(entrega => (
                            <Marker 
                                key={entrega.id} 
                                position={[entrega.latitud, entrega.longitud]}
                                icon={selectedEntregas.includes(entrega.id) ? iconSelected : iconPending}
                                eventHandlers={{
                                    click: () => toggleSelection(entrega.id),
                                }}
                            >
                                <Popup>
                                    <div className="text-xs">
                                        <strong className="block mb-1">NV: {entrega.nv}</strong>
                                        <p>{entrega.cliente}</p>
                                        <p>{entrega.direccion}</p>
                                        <button 
                                            className="mt-2 text-indigo-600 underline"
                                            onClick={() => toggleSelection(entrega.id)}
                                        >
                                            {selectedEntregas.includes(entrega.id) ? 'Deseleccionar' : 'Seleccionar'}
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MapPin size={48} className="mb-2 opacity-20" />
                        <p>No hay entregas geocodificadas para mostrar en el mapa</p>
                    </div>
                )}
            </div>
        )}

        {/* Panel Derecho: Configuración */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Truck size={16} /> Configurar Ruta
                </h3>
            </div>
            
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Ruta</label>
                    <div className="relative">
                        <Calendar className="absolute left-2 top-2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            className="w-full pl-8 pr-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={rutaNombre}
                            onChange={e => setRutaNombre(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conductor</label>
                    {conductores.length === 0 ? (
                         <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                             Sin conductores disponibles.
                         </div>
                    ) : (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {conductores.map(c => (
                                <div 
                                    key={c.id}
                                    onClick={() => setSelectedConductor(c.id)}
                                    className={`p-2 rounded border cursor-pointer flex justify-between items-center transition-all ${
                                        selectedConductor === c.id 
                                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                                        : 'hover:bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                                            <User size={12} className="text-slate-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-700 truncate">{c.nombre}</p>
                                            <p className="text-[10px] text-slate-400 font-mono truncate">{c.vehiculo_patente}</p>
                                        </div>
                                    </div>
                                    {selectedConductor === c.id && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleCreateRoute}
                    disabled={selectedEntregas.length === 0 || !selectedConductor || loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all"
                >
                    <Save size={16} />
                    Crear Ruta
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
