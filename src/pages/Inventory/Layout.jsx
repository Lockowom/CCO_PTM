import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Layers, Box, AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

const LayoutPage = () => {
  const [pasillos, setPasillos] = useState({});
  const [stats, setStats] = useState({ total: 0, ocupadas: 0, vacias: 0, ocupacion: 0 });
  const [pasilloActual, setPasilloActual] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modal, setModal] = useState({ open: false, ubicacion: '', detalle: null });
  const pageRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    cargarLayout();
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const cards = pageRef.current.querySelectorAll('.pasillo-card');
      const cells = pageRef.current.querySelectorAll('.loc-cell');
      
      gsap.fromTo(cards, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)', stagger: 0.1 }
      );
      
      gsap.fromTo(cells, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)', stagger: 0.005 }
      );
    }
  }, [loading, pasillos, pasilloActual]);

  const cargarLayout = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener estructura definida (si existe)
      const { data: layoutRows, error: layoutErr } = await supabase
        .from('wms_layout')
        .select('*');
      
      if (layoutErr) console.warn("Aviso: No se pudo cargar wms_layout", layoutErr);

      // 2. Obtener inventario real
      const { data: ubicacionesRows, error: ubErr } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion, cantidad');
        
      if (ubErr) throw ubErr;

      // Helper para parsear ubicación (Ej: A-01-01 o A-1-1)
      const parseUbicacion = (str) => {
        if (!str) return null;
        
        // Normalización agresiva: A-1-1 => A-01-01
        const parts = str.split('-');
        if (parts.length >= 3) {
          const pasillo = parts[0].trim().toUpperCase();
          const columna = parseInt(parts[1]);
          const nivel = parseInt(parts[2]);
          
          if (pasillo && !isNaN(columna) && !isNaN(nivel)) {
             // Retornamos también la versión normalizada para usar como clave
             const colStr = columna.toString().padStart(2, '0');
             const nivStr = nivel.toString().padStart(2, '0');
             const normalizedKey = `${pasillo}-${colStr}-${nivStr}`;
             
             return { pasillo, columna, nivel, normalizedKey };
          }
        }
        return null;
      };

      // 3. Procesar resumen de inventario (Normalizando claves)
      const resumenInventario = {};
      
      if (ubicacionesRows && ubicacionesRows.length > 0) {
        ubicacionesRows.forEach(r => {
          if (!r.ubicacion) return;
          const parsed = parseUbicacion(r.ubicacion);
          if (parsed) {
              // Usamos la clave normalizada (A-01-01) para sumar cantidades
              // así A-1-1 y A-01-01 se suman en el mismo lugar
              resumenInventario[parsed.normalizedKey] = (resumenInventario[parsed.normalizedKey] || 0) + (r.cantidad || 0);
          }
        });
      }

      // 4. Construir Mapa del Layout
      const layoutMap = {}; 
      
      // AHORA: El layout se construye EXCLUSIVAMENTE basado en la tabla wms_ubicaciones (Inventario Real)
      // Recorremos las ubicaciones encontradas en el inventario
      Object.keys(resumenInventario).forEach(key => {
          const parsed = parseUbicacion(key);
          if (parsed) {
            layoutMap[key] = {
              ubicacion: key, // Usamos la versión normalizada (A-01-01)
              pasillo: parsed.pasillo,
              columna: parsed.columna,
              nivel: parsed.nivel,
              estado: 'DISPONIBLE',
              origen: 'INVENTARIO_REAL',
              cantidad: resumenInventario[key]
            };
          }
      });

      // Si queremos incorporar estados personalizados (ej: NO DISPONIBLE)
      layoutRows?.forEach(r => {
        if (!r.ubicacion) return;
        const parsed = parseUbicacion(r.ubicacion);
        
        if (parsed) {
            const key = parsed.normalizedKey; // Clave normalizada
            
            if (layoutMap[key]) {
                layoutMap[key].estado = r.estado || 'DISPONIBLE';
            } else {
                layoutMap[key] = {
                    ubicacion: key,
                    pasillo: parsed.pasillo,
                    columna: parsed.columna,
                    nivel: parsed.nivel,
                    estado: r.estado || 'DISPONIBLE',
                    origen: 'DB_LAYOUT',
                    cantidad: 0
                };
            }
        }
      });

      // 5. Agrupar por Pasillos para renderizar
      const pasillosMap = {};
      let totalUbicaciones = 0;
      let ocupadas = 0;

      Object.values(layoutMap).forEach(node => {
        const pasillo = node.pasillo;
        const nivel = String(node.nivel);
        
        if (!pasillo || !nivel) return;

        if (!pasillosMap[pasillo]) pasillosMap[pasillo] = { niveles: {} };
        if (!pasillosMap[pasillo].niveles[nivel]) pasillosMap[pasillo].niveles[nivel] = [];

        // Verificar si tiene productos cruzando con el inventario real
        const cantidadReal = resumenInventario[node.ubicacion] || 0;
        const tieneProductos = cantidadReal > 0;
        
        // Actualizamos nodo con cantidad real
        node.cantidad = cantidadReal;

        pasillosMap[pasillo].niveles[nivel].push({
          ...node,
          tieneProductos
        });

        totalUbicaciones++;
        if (tieneProductos) ocupadas++;
      });

      // Ordenar columnas
      for (const p in pasillosMap) {
        for (const n in pasillosMap[p].niveles) {
          pasillosMap[p].niveles[n].sort((a,b) => a.columna - b.columna);
        }
      }

      setPasillos(pasillosMap);
      setStats({
        total: totalUbicaciones,
        ocupadas,
        vacias: totalUbicaciones - ocupadas,
        ocupacion: totalUbicaciones > 0 ? Math.round((ocupadas/totalUbicaciones)*100) : 0
      });

    } catch (e) {
      console.error('Error cargando layout:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPasillo = (p) => {
    setPasilloActual(p);
  };

  const abrirDetalle = async (ubicacion) => {
    setModal({ open: true, ubicacion, detalle: null });
    const { data, error } = await supabase
      .from('wms_ubicaciones')
      .select('*')
      .eq('ubicacion', ubicacion)
      .order('updated_at', { ascending: false });
    if (!error) {
      const cantidadTotal = data.reduce((acc, r) => acc + (r.cantidad || 0), 0);
      setModal({ open: true, ubicacion, detalle: { registros: data, cantidadTotal } });
    }
  };

  const cambiarEstado = async (ubicacion, nuevoEstado) => {
    try {
      // Upsert: Si existe actualiza, si no crea
      const parsed = ubicacion.split('-');
      const payload = {
        ubicacion: ubicacion,
        estado: nuevoEstado,
        pasillo: parsed[0],
        columna: parseInt(parsed[1]) || 0,
        nivel: parseInt(parsed[2]) || 0,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('wms_layout')
        .upsert(payload, { onConflict: 'ubicacion' });

      if (error) throw error;
      
      cargarLayout(); // Recargar para reflejar cambios
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al actualizar estado");
    }
  };

  const buscarUbicacion = () => {
    const codigo = searchText.trim().toUpperCase();
    if (!codigo) return;
    for (const p in pasillos) {
      const niveles = pasillos[p].niveles;
      for (const n in niveles) {
        const ub = niveles[n].find(x => x.ubicacion === codigo);
        if (ub) {
          setPasilloActual(p);
          setTimeout(() => abrirDetalle(codigo), 200);
          return;
        }
      }
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Navigation & Header */}
      <header ref={headerRef} className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            
            {/* Title Section */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Layers size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">WMS Master Map</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Inventario en Tiempo Real
                </div>
              </div>
            </div>

            {/* Global Stats */}
            <div className="hidden md:flex items-center gap-8 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</div>
                <div className="text-lg font-black text-slate-700">{stats.total}</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ocupadas</div>
                <div className="text-lg font-black text-indigo-600">{stats.ocupadas}</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Libres</div>
                <div className="text-lg font-black text-emerald-500">{stats.vacias}</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col justify-center gap-1 w-24">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Ocupación</span>
                  <span>{stats.ocupacion}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${stats.ocupacion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all outline-none"
                  placeholder="Buscar ubicación..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarUbicacion()}
                />
              </div>
              <button 
                onClick={cargarLayout}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all active:scale-95 shadow-sm"
                title="Actualizar datos"
              >
                <Box size={20} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 sticky left-0 bg-white/80 backdrop-blur-xl pl-2">Pasillos:</span>
            <button
              onClick={() => filtrarPasillo('ALL')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                pasilloActual === 'ALL'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              TODOS
            </button>
            {Object.keys(pasillos).sort().map(p => (
              <button
                key={p}
                onClick={() => filtrarPasillo(p)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all border ${
                  pasilloActual === p
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers size={20} className="text-indigo-500" />
              </div>
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">Sincronizando mapa...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.keys(pasillos).sort().map((letra) => {
              const pData = pasillos[letra];
              if (!pData || !(pasilloActual === 'ALL' || pasilloActual === letra)) return null;

              const nivelesOrden = Object.keys(pData.niveles).sort((a, b) => parseInt(b) - parseInt(a));
              
              // Stats locales
              let totalP = 0, ocupadasP = 0;
              Object.values(pData.niveles).forEach(arr => {
                totalP += arr.length;
                arr.forEach(x => { if (x.tieneProductos) ocupadasP++; });
              });
              const ocupacionP = totalP > 0 ? Math.round((ocupadasP / totalP) * 100) : 0;

              return (
                <div key={letra} className="pasillo-card bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-900/20 group-hover:scale-110 transition-transform">
                        {letra}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Pasillo {letra}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold">{ocupadasP} activos</span>
                          <span>•</span>
                          <span>{totalP} total</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ocupación</div>
                      <div className={`text-xl font-black ${ocupacionP > 80 ? 'text-amber-500' : 'text-indigo-600'}`}>
                        {ocupacionP}%
                      </div>
                    </div>
                  </div>

                  {/* Rack Visualization */}
                  <div className="p-6 bg-slate-50/50">
                    <div className="space-y-3">
                      {nivelesOrden.map(nivel => {
                        const ubicaciones = pData.niveles[nivel].slice().sort((a, b) => a.columna - b.columna);
                        return (
                          <div key={nivel} className="flex gap-3">
                            {/* Nivel Label */}
                            <div className="w-6 flex items-center justify-center">
                              <span className="text-[10px] font-black text-slate-300 -rotate-90 whitespace-nowrap">NIVEL {nivel}</span>
                            </div>
                            
                            {/* Cells Track */}
                            <div className="flex-1 flex gap-1 p-1.5 bg-slate-200/50 rounded-lg border border-slate-200/50 shadow-inner">
                              {ubicaciones.map(ub => {
                                // Determinar estado visual
                                let statusClass = 'bg-white border-slate-200 text-slate-300 hover:border-indigo-400 hover:text-indigo-500';
                                if (ub.estado === 'NO DISPONIBLE') {
                                  statusClass = 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed';
                                } else if (ub.estado === 'OCUPADO') {
                                  statusClass = 'bg-amber-50 border-amber-200 text-amber-500';
                                } else if (ub.tieneProductos) {
                                  statusClass = 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500';
                                }

                                return (
                                  <button
                                    key={ub.ubicacion}
                                    onClick={() => abrirDetalle(ub.ubicacion)}
                                    className={`
                                      loc-cell relative flex-1 min-w-[2rem] h-10 rounded 
                                      border-[1px] flex flex-col items-center justify-center 
                                      transition-all duration-200 text-[10px] font-bold
                                      ${statusClass}
                                      active:scale-95
                                    `}
                                    title={`Ubicación: ${ub.ubicacion}\nCantidad: ${ub.cantidad}`}
                                  >
                                    <span>{ub.columna}</span>
                                    {ub.cantidad > 0 && (
                                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white flex items-center justify-center">
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Detalle - Slide Over Style */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <MapPin size={12} />
                  Detalle de Ubicación
                </div>
                <h2 className="text-3xl font-black">{modal.ubicacion}</h2>
              </div>
              <button 
                onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Controls */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => cambiarEstado(modal.ubicacion, 'DISPONIBLE')} className="py-2 px-3 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg text-xs font-bold transition-all shadow-sm">
                  Disponible
                </button>
                <button onClick={() => cambiarEstado(modal.ubicacion, 'NO DISPONIBLE')} className="py-2 px-3 bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 rounded-lg text-xs font-bold transition-all shadow-sm">
                  Bloquear
                </button>
                <button onClick={() => cambiarEstado(modal.ubicacion, 'OCUPADO')} className="py-2 px-3 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded-lg text-xs font-bold transition-all shadow-sm">
                  Ocupado
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!modal.detalle ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-sm">Cargando datos...</span>
                </div>
              ) : modal.detalle.cantidadTotal === 0 ? (
                <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-900 font-bold mb-1">Ubicación Vacía</h3>
                  <p className="text-slate-500 text-sm">No hay productos registrados en esta ubicación actualmente.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-indigo-900 font-bold text-sm">Total Inventario</span>
                    <span className="text-2xl font-black text-indigo-600">{modal.detalle.cantidadTotal}</span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos ({modal.detalle.registros.length})</h4>
                    {modal.detalle.registros.map((r) => (
                      <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{r.codigo}</span>
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Cant: {r.cantidad}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-indigo-600 transition-colors">
                          {r.descripcion || 'Sin descripción'}
                        </h4>
                        <div className="flex gap-2 text-xs text-slate-500">
                          {r.talla && <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">T: {r.talla}</span>}
                          {r.color && <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">C: {r.color}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
               <button 
                onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
                className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
               >
                 Cerrar Panel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutPage;
