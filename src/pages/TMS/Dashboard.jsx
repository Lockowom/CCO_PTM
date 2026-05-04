import React, { useState, useEffect } from 'react';
import { Activity, Truck, MapPin, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const fetchTmsData = async () => {
  // Simulamos consultas a la base de datos para obtener datos reales
  // En un entorno real, estas serían consultas a tus tablas:
  // tms_rutas, tms_entregas, tms_usuarios (con rol CONDUCTOR)
  
  const { count: vehiculosEnRuta } = await supabase
    .from('tms_usuarios_activos')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'CONDUCTOR')
    .eq('estado', 'ONLINE');

  const { count: entregasPendientes } = await supabase
    .from('tms_nv_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'EN RUTA'); // o el estado que defina entregas pendientes en TMS

  const { data: conductoresActivos } = await supabase
    .from('tms_usuarios_activos')
    .select('nombre, usuario_id, modulo_actual')
    .eq('rol', 'CONDUCTOR')
    .eq('estado', 'ONLINE')
    .limit(5);

  // Simular posiciones GPS para los conductores (en un sistema real vendrían de la BD)
  const santiagoCenter = [-33.4489, -70.6693];
  const conductoresConGPS = (conductoresActivos || []).map((driver, index) => ({
    ...driver,
    lat: santiagoCenter[0] + (Math.random() - 0.5) * 0.1,
    lng: santiagoCenter[1] + (Math.random() - 0.5) * 0.1,
    eta: `${15 + Math.floor(Math.random() * 30)} min`
  }));

  // Timeline de entregas (Simulado para gráfica)
  const timelineData = [
    { hora: '08:00', entregas: 5 },
    { hora: '09:00', entregas: 12 },
    { hora: '10:00', entregas: 25 },
    { hora: '11:00', entregas: 18 },
    { hora: '12:00', entregas: 30 },
    { hora: '13:00', entregas: 45 },
    { hora: '14:00', entregas: 22 },
  ];

  return {
    vehiculosEnRuta: vehiculosEnRuta || 0,
    entregasPendientes: entregasPendientes || 0,
    alertasRetraso: 0, // Placeholder
    tiempoPromedio: '45m', // Placeholder
    conductoresActivos: conductoresConGPS,
    timelineData
  };
};

const DashboardTMS = () => {
  const container = React.useRef(null);

  const { data: tmsData, isLoading } = useQuery({
    queryKey: ['tms-dashboard-stats'],
    queryFn: fetchTmsData,
    refetchInterval: 30000 // Refrescar cada 30 segundos
  });

  useGSAP(() => {
    if (!isLoading) {
      gsap.from('.tms-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [isLoading] });

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-orange-500 animate-pulse font-bold tracking-widest">CARGANDO TELEMETRÍA TMS...</div>
      </div>
    );
  }

  return (
    <div ref={container} className="p-6 bg-slate-950 min-h-screen text-slate-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">TMS Control Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Vehículos en Ruta', value: tmsData?.vehiculosEnRuta || '0', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { title: 'Entregas Pendientes', value: tmsData?.entregasPendientes || '0', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { title: 'Alertas de Retraso', value: tmsData?.alertasRetraso || '0', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { title: 'Tiempo Promedio', value: tmsData?.tiempoPromedio || '--', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`tms-card ${stat.bg} ${stat.border} border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group`}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 tms-card bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4">Mapa de Operaciones en Vivo</h2>
          <div className="flex-1 min-h-[400px] bg-slate-800/50 rounded-xl border border-slate-700/50 relative overflow-hidden z-0">
             <MapContainer 
               center={[-33.4489, -70.6693]} 
               zoom={11} 
               style={{ height: '100%', width: '100%' }}
               className="z-0"
             >
               <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               />
               {tmsData?.conductoresActivos?.map((driver) => (
                 <Marker key={driver.usuario_id} position={[driver.lat, driver.lng]}>
                   <Popup className="bg-slate-900 text-slate-300 border-slate-800">
                     <div className="p-1">
                       <strong className="text-white block mb-1">{driver.nombre}</strong>
                       <span className="text-emerald-400 block text-xs">ONLINE</span>
                       <span className="text-slate-400 block text-xs mt-1">ETA: {driver.eta}</span>
                     </div>
                   </Popup>
                 </Marker>
               ))}
             </MapContainer>
             <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               GPS Activo
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="tms-card bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex-1">
            <h2 className="text-lg font-bold text-white mb-4">Conductores Activos ({tmsData?.conductoresActivos?.length || 0})</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {tmsData?.conductoresActivos?.length > 0 ? (
                tmsData.conductoresActivos.map((driver, index) => (
                  <div key={driver.usuario_id || index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase">
                        {driver.nombre ? driver.nombre.substring(0, 2) : 'C'}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm capitalize">{driver.nombre || 'Desconocido'}</p>
                        <p className="text-emerald-400 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En Ruta
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl text-slate-500">
                  No hay conductores activos (ONLINE) en este momento.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Gráfica */}
      <div className="tms-card bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Timeline de Entregas
          </h2>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tmsData?.timelineData}>
              <defs>
                <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hora" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="entregas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntregas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardTMS;
