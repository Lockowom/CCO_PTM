import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouseStore } from '../../store/warehouseStore';
import { 
  Activity, 
  Map as MapIcon, 
  Warehouse,
  Info,
  ChevronRight,
  Layout,
  PieChart,
  Grid,
  Maximize2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const RACK_MATRICES = {
  'A': { levels: 4, positions: 28, color: 'indigo' },
  'B': { levels: 4, positions: 28, color: 'purple' },
  'C': { levels: 4, positions: 50, color: 'emerald' },
  'D': { levels: 4, positions: 50, color: 'orange' },
  'E': { levels: 4, positions: 50, color: 'rose' },
  'F': { levels: 4, positions: 50, color: 'fuchsia' },
  'G': { levels: 4, positions: 50, color: 'blue' },
  'H': { levels: 4, positions: 50, color: 'slate' },
  'I': { levels: 4, positions: 36, color: 'zinc' }
};

const Heatmap = () => {
  const containerRef = useRef();
  const navigate = useNavigate();
  const { layout, stats, loading, fetchWarehouseData } = useWarehouseStore();
  const [selectedLevel, setSelectedLevel] = useState(1);

  const handleLocationClick = (locCode) => {
    navigate(`/queries/locations?search=${locCode}`);
  };

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  useGSAP(() => {
    gsap.from(".animate-card", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  const heatmapData = useMemo(() => {
    const racks = {};
    const unmapped = [];

    Object.entries(RACK_MATRICES).forEach(([rackId, config]) => {
      racks[rackId] = {
        config,
        positions: [],
        stats: { total: config.positions, occupied: 0 }
      };
      
      for (let p = 1; p <= config.positions; p++) {
        const posKey = p.toString().padStart(2, '0');
        racks[rackId].positions.push({
          posKey,
          occupied: false,
          items: 0,
          locationCode: `${rackId}-${selectedLevel.toString().padStart(2, '0')}-${posKey}`
        });
      }
    });

    Object.values(layout).forEach(node => {
      const parts = node.ubicacion.split('-');
      if (parts.length < 3) return;
      const rackId = parts[0];
      const level = parseInt(parts[1]);
      const posKey = parts[2];

      if (level === selectedLevel) {
        if (racks[rackId]) {
          const position = racks[rackId].positions.find(p => p.posKey === posKey);
          if (position) {
            const isOccupied = node.cantidad > 0 || node.estado === 'OCUPADA';
            position.occupied = isOccupied;
            position.items = node.cantidad;
            if (isOccupied) racks[rackId].stats.occupied++;
          } else {
            // Posición fuera de matriz
            unmapped.push(node.ubicacion);
          }
        } else {
          // Rack no definido en matriz
          unmapped.push(node.ubicacion);
        }
      }
    });
    return { racks, unmapped };
  }, [layout, selectedLevel]);

  const { racks, unmapped } = heatmapData;

  // Usar las estadísticas globales calculadas en el Store para mayor precisión
  const totalSystemPositions = stats.total || 1031;
  const totalOccupiedCount = stats.ocupadas || 0;
  const globalOccupancyPercent = stats.ocupacion || 0;
  const totalLoadedLocations = Object.keys(layout).length;

  return (
    <div ref={containerRef} className="bg-slate-50 min-h-screen p-8 space-y-8 font-sans">
      
      {/* Header & Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-card">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Layout size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Dashboard de Ocupación</h1>
                <p className="text-slate-500 font-bold text-sm">Vista Plana Analítica • Warehouse DNA</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-xl">
              Monitoreo en tiempo real de la capacidad instalada. La visualización actual muestra la disponibilidad en el **Nivel {selectedLevel}**.
            </p>
          </div>
          
          <div className="mt-8 flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nivel de Rack:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[1, 2, 3, 4].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${selectedLevel === lvl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <PieChart size={160} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Ocupación Total Bodega</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-black text-white tracking-tighter">{globalOccupancyPercent}%</h2>
              <span className="text-orange-500 font-black text-lg">USADO</span>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000"
                  style={{ width: `${globalOccupancyPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>{totalOccupiedCount} Ubic. Usadas</span>
                <span>{totalSystemPositions} Total ({totalLoadedLocations} detectadas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {unmapped.length > 0 && (
        <div className="animate-card bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <Info size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-rose-900 uppercase">Aviso de Datos Fuera de Rango</p>
            <p className="text-[10px] font-bold text-rose-600 leading-tight">
              Se detectaron {unmapped.length} ubicaciones en el Nivel {selectedLevel} que no coinciden con la matriz física (ej: {unmapped.slice(0, 3).join(', ')}).
            </p>
          </div>
        </div>
      )}

      {/* Racks Grid Container */}
      <div className="animate-card bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <Grid size={22} className="text-orange-500" />
            Mapa de Celdas • Nivel {selectedLevel}
          </h3>
          <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ocupado</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponible</span>
             </div>
          </div>
        </div>

        <div className="space-y-12">
          {Object.entries(racks).map(([rackId, data]) => (
            <div key={rackId} className="group/rack">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs">RACK {rackId}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {data.config.positions} Pos. • {Math.round((data.stats.occupied / data.config.positions) * 100)}% Ocupación Nivel
                  </span>
                </div>
                <div className="h-[1px] flex-1 mx-6 bg-slate-100 group-hover/rack:bg-slate-200 transition-colors" />
                <Maximize2 size={14} className="text-slate-300 group-hover/rack:text-slate-900 transition-colors cursor-pointer" />
              </div>

              <div className="flex gap-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto custom-scrollbar-flat pb-4">
                {data.positions.map((pos) => (
                  <button 
                    key={pos.posKey}
                    onClick={() => handleLocationClick(pos.locationCode)}
                    className={`flex-shrink-0 w-7 h-10 rounded-sm border transition-all duration-200 relative group/cell
                      ${pos.occupied 
                        ? 'bg-rose-500 border-rose-600 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className={`absolute inset-0 flex items-center justify-center text-[7px] font-black pointer-events-none
                      ${pos.occupied ? 'text-white/90' : 'text-slate-300 group-hover/cell:text-slate-500'}`}>
                      {pos.posKey}
                    </span>
                    
                    {/* Tooltip Minimalista */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-28 bg-slate-900 text-white p-2 rounded-lg text-[9px] opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                      <p className="font-black mb-1">{pos.locationCode}</p>
                      <p className="opacity-70">Stock: {pos.items} un.</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda y Ayuda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-card pb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 flex-shrink-0">
            <Info size={28} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Sistema de Normalización</h4>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Las ubicaciones se procesan automáticamente para corregir espacios y ceros. El stock en <span className="text-slate-900">G 28-03</span> se contabiliza correctamente en la celda <span className="text-slate-900">G-28-03</span>.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
            <Warehouse size={28} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Capacidad Instalada</h4>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              El cálculo de ocupación total se basa en las 1,031 posiciones físicas de la bodega. Este KPI ayuda a planificar recepciones masivas y optimizar el slotting.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar-flat::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar-flat::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar-flat::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar-flat::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  );
};

export default Heatmap;

