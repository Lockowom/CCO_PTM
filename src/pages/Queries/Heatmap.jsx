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
import { RACK_CONFIG, TOTAL_POSITIONS, MAX_LEVELS } from '../../constants/warehouse';

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
    // Animación de entrada inicial
    gsap.from(".animate-card", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  // Animación al cambiar de nivel
  useGSAP(() => {
    if (!loading) {
      gsap.from(".rack-row", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: "back.out(1.2)"
      });
    }
  }, [selectedLevel, loading]);

  const heatmapData = useMemo(() => {
    const racks = {};
    const unmapped = [];
    let levelTotalPositions = 0;
    let levelOccupiedPositions = 0;

    Object.entries(RACK_CONFIG).forEach(([rackId, config]) => {
      // Solo procesar racks que existen físicamente en el nivel seleccionado
      if (selectedLevel > config.levels) return;

      levelTotalPositions += config.positions;

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
            if (isOccupied) {
              racks[rackId].stats.occupied++;
              levelOccupiedPositions++;
            }
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

    const levelOccupancyPercent = levelTotalPositions > 0 
      ? Math.round((levelOccupiedPositions / levelTotalPositions) * 100) 
      : 0;

    return { 
      racks, 
      unmapped, 
      levelStats: { 
        total: levelTotalPositions, 
        occupied: levelOccupiedPositions, 
        percent: levelOccupancyPercent 
      } 
    };
  }, [layout, selectedLevel]);

  const { racks, unmapped, levelStats } = heatmapData;
  const totalOccupiedCount = stats.ocupadas || 0;
  const globalOccupancyPercent = stats.ocupacion || 0;

  return (
    <div ref={containerRef} className="bg-slate-50 min-h-screen p-8 space-y-8 font-sans">
      
      {/* Header & Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-card">
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
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
              {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-6 py-2 rounded-lg text-sm font-black transition-all duration-300 ${selectedLevel === lvl ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nivel Seleccionado Stats */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Grid size={120} className="text-slate-900" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Ocupación Nivel {selectedLevel}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{levelStats.percent}%</h2>
              <span className="text-slate-400 font-black text-sm">NIVEL</span>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                  style={{ width: `${levelStats.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>{levelStats.occupied} Usadas</span>
                <span>{levelStats.total} Posiciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats */}
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
                <span>{TOTAL_POSITIONS} Total</span>
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
          <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
             <div className="flex items-center gap-3">
               <div className="w-4 h-4 rounded-md bg-slate-900 shadow-sm" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ocupado</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-4 h-4 rounded-md bg-white border-2 border-slate-200" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponible</span>
             </div>
          </div>
        </div>

        <div className="space-y-12">
          {Object.entries(racks).map(([rackId, data]) => (
            <div key={rackId} className="group/rack rack-row">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs shadow-sm group-hover/rack:bg-orange-500 transition-colors duration-300">RACK {rackId}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/rack:text-slate-600 transition-colors">
                    {data.config.positions} Pos. • {Math.round((data.stats.occupied / data.config.positions) * 100)}% Ocupación Nivel
                  </span>
                </div>
                <div className="h-[1px] flex-1 mx-6 bg-slate-100 group-hover/rack:bg-slate-300 transition-colors duration-500" />
                <Maximize2 size={14} className="text-slate-300 group-hover/rack:text-slate-900 transition-colors cursor-pointer" />
              </div>

              <div className="flex gap-1.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto custom-scrollbar-flat pb-6 group-hover/rack:bg-slate-100/50 transition-colors duration-300">
                {data.positions.map((pos) => (
                  <button 
                    key={pos.posKey}
                    onClick={() => handleLocationClick(pos.locationCode)}
                    className={`flex-shrink-0 w-8 h-12 rounded-md border-2 transition-all duration-300 relative group/cell
                      ${pos.occupied 
                        ? 'bg-slate-900 border-slate-900 shadow-md scale-100 hover:scale-110' 
                        : 'bg-white border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:scale-110'}`}
                  >
                    <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black pointer-events-none transition-colors duration-300
                      ${pos.occupied ? 'text-white' : 'text-slate-400 group-hover/cell:text-orange-600'}`}>
                      {pos.posKey}
                    </span>
                    
                    {/* Status Dot */}
                    {pos.occupied && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    )}
                    
                    {/* Tooltip Pro */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 bg-slate-900 text-white p-3 rounded-xl text-[10px] opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl translate-y-2 group-hover/cell:translate-y-0 border border-white/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${pos.occupied ? 'bg-orange-500' : 'bg-slate-500'}`} />
                        <span className="font-black uppercase tracking-wider">{pos.locationCode}</span>
                      </div>
                      <div className="space-y-1 opacity-80 font-bold">
                        <p>Estado: {pos.occupied ? 'Ocupado' : 'Libre'}</p>
                        <p>SKUs: {pos.items}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 text-[8px] text-orange-400 font-black uppercase">Click para ver detalle</div>
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


    </div>
  );
};

export default Heatmap;

