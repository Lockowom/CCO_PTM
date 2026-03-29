import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Layers, Box, AlertTriangle, ChevronRight, Filter, Edit2, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

const LayoutPage = () => {
  const [pasillos, setPasillos] = useState({});
  const [stats, setStats] = useState({ total: 0, ocupadas: 0, vacias: 0, ocupacion: 0 });
  const [pasilloActual, setPasilloActual] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modal, setModal] = useState({ open: false, ubicacion: '', detalle: null });
  const [editingRow, setEditingRow] = useState(null); // ID del registro en edición
  const [editForm, setEditForm] = useState({ cantidad: '', ubicacion: '' }); // Estado del formulario de edición
  const [savingItem, setSavingItem] = useState(false);
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
    setEditingRow(null); // Limpiar cualquier edición previa al abrir
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

  const startInlineEdit = (row) => {
    setEditingRow(row.id);
    setEditForm({ cantidad: row.cantidad, ubicacion: row.ubicacion });
  };

  const cancelInlineEdit = () => {
    setEditingRow(null);
    setEditForm({ cantidad: '', ubicacion: '' });
  };

  const saveInlineEdit = async (id, codigo) => {
    if (isNaN(editForm.cantidad) || Number(editForm.cantidad) < 0) {
      alert("Por favor ingrese una cantidad válida");
      return;
    }
    
    if (!editForm.ubicacion || !editForm.ubicacion.trim()) {
      alert("La ubicación no puede estar vacía");
      return;
    }

    setSavingItem(true);
    try {
      const newUbicacion = editForm.ubicacion.toUpperCase().trim();
      
      const { error } = await supabase
        .from('wms_ubicaciones')
        .update({ 
            cantidad: Number(editForm.cantidad),
            ubicacion: newUbicacion
        })
        .eq('id', id);

      if (error) throw error;

      // Si la ubicación cambió, recargamos el layout completo para que el producto "viaje" visualmente
      // Si solo cambió la cantidad, solo actualizamos los datos locales del modal y el layout general en background
      if (newUbicacion !== modal.ubicacion) {
        alert(`Producto movido a ${newUbicacion}`);
        abrirDetalle(modal.ubicacion); // Recargar modal actual (el item desaparecerá de aquí)
      } else {
        // Actualizar datos del modal localmente
        const nuevosRegistros = modal.detalle.registros.map(r => 
          r.id === id ? { ...r, cantidad: Number(editForm.cantidad) } : r
        );
        const nuevaCantidadTotal = nuevosRegistros.reduce((acc, r) => acc + (r.cantidad || 0), 0);
        setModal(prev => ({
          ...prev,
          detalle: { registros: nuevosRegistros, cantidadTotal: nuevaCantidadTotal }
        }));
      }

      setEditingRow(null);
      cargarLayout(); // Recargar el mapa en background para actualizar colores/badges

    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al actualizar: " + err.message);
    } finally {
      setSavingItem(false);
    }
  };

  const deleteInlineItem = async (id, codigo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto ${codigo} de esta ubicación?`)) {
      return;
    }

    setSavingItem(true);
    try {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar datos del modal localmente
      const nuevosRegistros = modal.detalle.registros.filter(r => r.id !== id);
      const nuevaCantidadTotal = nuevosRegistros.reduce((acc, r) => acc + (r.cantidad || 0), 0);
      setModal(prev => ({
        ...prev,
        detalle: { registros: nuevosRegistros, cantidadTotal: nuevaCantidadTotal }
      }));

      cargarLayout(); // Recargar el mapa general
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    } finally {
      setSavingItem(false);
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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30 transform hover:scale-105 transition-transform">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  WMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Master Map</span>
                </h1>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Inventario en Tiempo Real
                </div>
              </div>
            </div>

            {/* Global Stats */}
            <div className="hidden md:flex items-center gap-8 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</div>
                <div className="text-xl font-black text-slate-700">{stats.total}</div>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ocupadas</div>
                <div className="text-xl font-black text-orange-600">{stats.ocupadas}</div>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Libres</div>
                <div className="text-xl font-black text-emerald-500">{stats.vacias}</div>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="flex flex-col justify-center gap-1.5 w-32">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Ocupación</span>
                  <span className={stats.ocupacion > 85 ? 'text-rose-500' : 'text-slate-700'}>{stats.ocupacion}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      stats.ocupacion > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-orange-400 to-amber-500'
                    }`}
                    style={{ width: `${stats.ocupacion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm font-bold uppercase transition-all outline-none placeholder:normal-case placeholder:font-medium"
                  placeholder="Buscar ubicación..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarUbicacion()}
                />
              </div>
              <button 
                onClick={cargarLayout}
                className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 rounded-xl transition-all active:scale-95 shadow-sm"
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
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                pasilloActual === 'ALL'
                  ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              TODOS
            </button>
            {Object.keys(pasillos).sort().map(p => (
              <button
                key={p}
                onClick={() => filtrarPasillo(p)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm font-black flex items-center justify-center transition-all border ${
                  pasilloActual === p
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-transparent text-white shadow-lg shadow-orange-500/30 transform scale-105'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
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
              <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers size={20} className="text-orange-500" />
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
                <div key={letra} className="pasillo-card bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Card Header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-slate-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-slate-700">
                        {letra}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-slate-800 tracking-tight">Pasillo {letra}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-1">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            {ocupadasP} activos
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{totalP} ubicaciones</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end relative z-10">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ocupación</div>
                      <div className={`text-2xl font-black ${ocupacionP > 85 ? 'text-rose-500' : 'text-orange-600'}`}>
                        {ocupacionP}%
                      </div>
                    </div>
                  </div>

                  {/* Rack Visualization */}
                  <div className="p-6 bg-slate-50/50">
                    <div className="space-y-4">
                      {nivelesOrden.map(nivel => {
                        const ubicaciones = pData.niveles[nivel].slice().sort((a, b) => a.columna - b.columna);
                        return (
                          <div key={nivel} className="flex gap-4 items-center">
                            {/* Nivel Label */}
                            <div className="w-8 flex items-center justify-center bg-slate-200/50 py-2 rounded-lg border border-slate-200 h-full">
                              <span className="text-[10px] font-black text-slate-500 -rotate-90 whitespace-nowrap tracking-widest">NVL {nivel}</span>
                            </div>
                            
                            {/* Cells Track */}
                            <div className="flex-1 flex gap-1.5 p-2 bg-slate-200/60 rounded-xl border border-slate-200/80 shadow-inner">
                              {ubicaciones.map(ub => {
                                // Determinar estado visual
                                let statusClass = 'bg-white border-slate-200 text-slate-400 hover:border-orange-400 hover:text-orange-500';
                                if (ub.estado === 'NO DISPONIBLE') {
                                  statusClass = 'bg-slate-800 border-slate-900 text-slate-400 cursor-not-allowed opacity-50';
                                } else if (ub.estado === 'OCUPADO') {
                                  statusClass = 'bg-amber-100 border-amber-300 text-amber-600';
                                } else if (ub.tieneProductos) {
                                  // Gradiente según cantidad
                                  if (ub.cantidad > 50) {
                                    statusClass = 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-600 text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500';
                                  } else {
                                    statusClass = 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200';
                                  }
                                }

                                return (
                                  <button
                                    key={ub.ubicacion}
                                    onClick={() => abrirDetalle(ub.ubicacion)}
                                    className={`
                                      loc-cell relative flex-1 min-w-[2.5rem] h-12 rounded-lg 
                                      border-[1px] flex flex-col items-center justify-center 
                                      transition-all duration-200 text-[11px] font-black
                                      ${statusClass}
                                      active:scale-95 hover:-translate-y-0.5
                                    `}
                                    title={`Ubicación: ${ub.ubicacion}\nCantidad: ${ub.cantidad}`}
                                  >
                                    <span>{ub.columna}</span>
                                    {ub.cantidad > 0 && (
                                      <div className={`absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black shadow-sm ${ub.cantidad > 50 ? 'bg-slate-900 text-white' : 'bg-orange-500 text-white'}`}>
                                        {ub.cantidad > 99 ? '+99' : ub.cantidad}
                                      </div>
                                    )}
                                    {ub.estado === 'NO DISPONIBLE' && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-px bg-slate-400 rotate-45 absolute"></div>
                                        <div className="w-full h-px bg-slate-400 -rotate-45 absolute"></div>
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-slate-50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200/60">
            {/* Header */}
            <div className="px-6 py-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-start justify-between relative overflow-hidden">
              {/* Decorative elements in header */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500/20 blur-2xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest mb-2">
                  <MapPin size={14} />
                  Detalle de Posición
                </div>
                <h2 className="text-4xl font-black tracking-tight">{modal.ubicacion}</h2>
              </div>
              <button 
                onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
                className="p-2 bg-white/10 hover:bg-orange-500 hover:text-white rounded-full text-slate-300 transition-all z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Controls */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cambiar Estado Físico</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => cambiarEstado(modal.ubicacion, 'DISPONIBLE')} className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-sm">
                  Disponible
                </button>
                <button onClick={() => cambiarEstado(modal.ubicacion, 'NO DISPONIBLE')} className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:border-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold transition-all shadow-sm">
                  Bloquear
                </button>
                <button onClick={() => cambiarEstado(modal.ubicacion, 'OCUPADO')} className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 rounded-xl text-xs font-bold transition-all shadow-sm">
                  Ocupado
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {!modal.detalle ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                  <span className="text-sm font-medium animate-pulse">Consultando inventario...</span>
                </div>
              ) : modal.detalle.cantidadTotal === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Box className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl text-slate-800 font-black mb-2">Ubicación Vacía</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">No hay productos registrados en esta posición del almacén actualmente.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Total Card */}
                  <div className="flex items-center justify-between p-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
                    <div>
                      <span className="text-orange-100 font-bold text-xs uppercase tracking-wider block mb-1">Total Unidades</span>
                      <span className="text-sm font-medium text-orange-50">En esta ubicación</span>
                    </div>
                    <span className="text-4xl font-black tracking-tight">{modal.detalle.cantidadTotal}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Detalle de Productos</h4>
                      <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {modal.detalle.registros.length} SKUs
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {modal.detalle.registros.map((r) => (
                        <div key={r.id} className={`bg-white p-5 rounded-2xl border shadow-sm transition-all group ${editingRow === r.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200 hover:shadow-md hover:border-orange-300'}`}>
                          
                          {/* Header de la tarjeta (Código y Acciones/Cantidad) */}
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{r.codigo}</span>
                            
                            {editingRow === r.id ? (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => saveInlineEdit(r.id, r.codigo)} 
                                  disabled={savingItem}
                                  className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                                  title="Guardar"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={cancelInlineEdit} 
                                  disabled={savingItem}
                                  className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                  title="Cancelar"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                  <button onClick={() => startInlineEdit(r)} className="p-1 text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded" title="Editar">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => deleteInlineItem(r.id, r.codigo)} className="p-1 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded" title="Eliminar">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1">
                                  {r.cantidad} unds
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Cuerpo de la tarjeta */}
                          {editingRow === r.id ? (
                            <div className="space-y-3 mb-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mover a Ubicación:</label>
                                <input 
                                  type="text" 
                                  value={editForm.ubicacion} 
                                  onChange={(e) => setEditForm({...editForm, ubicacion: e.target.value})}
                                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold uppercase focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nueva Cantidad:</label>
                                <input 
                                  type="number" 
                                  value={editForm.cantidad} 
                                  onChange={(e) => setEditForm({...editForm, cantidad: e.target.value})}
                                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <h4 className="font-bold text-slate-800 text-sm whitespace-normal leading-relaxed mb-3" title={r.descripcion}>
                              {r.descripcion || 'Sin descripción'}
                            </h4>
                          )}

                          {/* Footer de la tarjeta (Talla, Color, Lote) */}
                          <div className="flex gap-2 text-xs font-medium text-slate-600">
                            {r.talla && <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1"><span className="text-slate-400">T:</span> {r.talla}</span>}
                            {r.color && <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1"><span className="text-slate-400">C:</span> {r.color}</span>}
                            {r.lote && <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1"><span className="text-slate-400">L:</span> {r.lote}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Action */}
            <div className="p-5 border-t border-slate-200 bg-white">
               <button 
                onClick={() => setModal({ open: false, ubicacion: '', detalle: null })}
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
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
