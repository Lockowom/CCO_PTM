import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Layers, Box, AlertTriangle } from 'lucide-react';
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
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
    }
  }, []);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const cards = pageRef.current.querySelectorAll('.pasillo-card');
      const cells = pageRef.current.querySelectorAll('.loc-cell');
      gsap.from(cards, { y: 16, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06 });
      gsap.from(cells, { scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.out', stagger: 0.005 });
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

      // 3. Procesar resumen de inventario
      const resumenInventario = {};
      ubicacionesRows?.forEach(r => {
        if (!r.ubicacion) return;
        const key = r.ubicacion.toUpperCase().trim();
        resumenInventario[key] = (resumenInventario[key] || 0) + (r.cantidad || 0);
      });

      // 4. Construir Mapa del Layout
      const layoutMap = {}; 
      
      // AHORA: El layout se construye EXCLUSIVAMENTE basado en la tabla wms_ubicaciones (Inventario Real)
      // Ya no usamos estructuras fijas ni wms_layout antiguo.
      // La tabla wms_ubicaciones contiene la realidad física actual.

      // Helper para parsear ubicación (Ej: A-01-01)
      const parseUbicacion = (str) => {
        // Normalizamos: A-1-1 => A-01-01 para consistencia
        const parts = str.split('-');
        if (parts.length >= 3) {
          // Detectar formato: Pasillo (letra) - Columna (num) - Nivel (num)
          const pasillo = parts[0].trim().toUpperCase();
          const columna = parseInt(parts[1]);
          const nivel = parseInt(parts[2]);
          
          if (pasillo && !isNaN(columna) && !isNaN(nivel)) {
             return { pasillo, columna, nivel };
          }
        }
        return null;
      };

      Object.keys(resumenInventario).forEach(key => {
          const parsed = parseUbicacion(key);
          if (parsed) {
            layoutMap[key] = {
              ubicacion: key,
              pasillo: parsed.pasillo,
              columna: parsed.columna,
              nivel: parsed.nivel,
              estado: 'DISPONIBLE', // Por defecto disponible
              origen: 'INVENTARIO_REAL',
              cantidad: resumenInventario[key]
            };
          }
      });

      // Si queremos incorporar estados personalizados (ej: NO DISPONIBLE) que NO tienen stock,
      // debemos leer wms_layout y agregarlos también.
      layoutRows?.forEach(r => {
        if (!r.ubicacion) return;
        const key = r.ubicacion.toUpperCase().trim();
        
        // Si ya existe (porque tiene inventario), actualizamos estado
        if (layoutMap[key]) {
            layoutMap[key].estado = r.estado || 'DISPONIBLE';
        } else {
            // Si no tiene inventario pero existe en layout (ej: marcada como NO DISPONIBLE), la agregamos
            const parsed = parseUbicacion(key);
            if (parsed) {
                layoutMap[key] = {
                    ubicacion: key,
                    pasillo: parsed.pasillo,
                    columna: parsed.columna,
                    nivel: parsed.nivel,
                    estado: r.estado || 'DISPONIBLE',
                    origen: 'DB_LAYOUT',
                    cantidad: 0 // No tiene stock
                };
            }
        }
      });

      // 5. Agrupar por Pasillos para renderizar
      // Eliminamos el paso de mezclar con DB antigua o inferencia para limpiar el layout visual
      
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
    <div ref={pageRef} className="space-y-6">
      <div ref={headerRef} className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">Inventario</div>
            <h2 className="text-2xl font-extrabold">Layout de Bodega</h2>
            <p className="text-sm opacity-90">Visualización 2D de pasillos, niveles y estados</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center bg-white/10 rounded-xl px-3 border border-white/20 backdrop-blur">
              <Search size={18} className="text-white/80 mr-2" />
              <input
                className="h-10 outline-none text-sm bg-transparent text-white placeholder:text-white/70"
                placeholder="Buscar ubicación (A-01-01)"
                value={searchText}
                onChange={(e)=>setSearchText(e.target.value)}
                onKeyDown={(e)=> e.key==='Enter' && buscarUbicacion()}
              />
            </div>
            <button onClick={cargarLayout} className="px-4 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 shadow">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Total Ubicaciones</div>
          <div className="text-2xl font-extrabold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Con Productos</div>
          <div className="text-2xl font-extrabold text-indigo-600">{stats.ocupadas}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Vacías</div>
          <div className="text-2xl font-extrabold">{stats.vacias}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Ocupación</div>
          <div className="text-2xl font-extrabold">{stats.ocupacion}%</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <span className="font-extrabold text-slate-800">Seleccionar Pasillo</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>filtrarPasillo('ALL')} className={`px-3 py-1 rounded-lg text-sm font-bold ${pasilloActual==='ALL'?'bg-indigo-600 text-white':'bg-slate-100 text-slate-700'}`}>Todos</button>
            {Object.keys(pasillos).sort().map(p => (
              <button key={p} onClick={()=>filtrarPasillo(p)} className={`px-3 py-1 rounded-lg text-sm font-bold ${pasilloActual===p?'bg-indigo-600 text-white':'bg-slate-100 text-slate-700'}`}>
                Pasillo {p}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 shadow-sm"></span>
              <span className="text-slate-600 font-medium">Con productos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-md bg-slate-400 border border-slate-500 shadow-sm"></span>
              <span className="text-slate-600 font-medium">Vacía</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-md bg-red-500 border border-red-600 shadow-sm"></span>
              <span className="text-slate-600 font-medium">No disponible</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-md bg-yellow-400 border border-yellow-500 shadow-sm"></span>
              <span className="text-slate-600 font-medium">Ocupado</span>
            </div>
          </div>
          {loading ? (
            <div className="text-slate-400 flex items-center gap-2"><AlertTriangle size={18}/> Cargando...</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(pasillos).sort().map((letra) => {
                const pData = pasillos[letra];
                if (!pData) return null;
                if (!(pasilloActual==='ALL' || pasilloActual===letra)) return null;

                let totalPasillo = 0; let ocupadasPasillo = 0;
                Object.values(pData.niveles).forEach(arr => {
                  totalPasillo += arr.length;
                  arr.forEach(x => { if (x.tieneProductos) ocupadasPasillo++; });
                });
                const porcentaje = totalPasillo>0 ? Math.round((ocupadasPasillo/totalPasillo)*100) : 0;

                const nivelesOrden = Object.keys(pData.niveles).sort((a,b)=>parseInt(b)-parseInt(a));
                return (
                  <div key={letra} className="border rounded-2xl overflow-hidden pasillo-card">
                    <div className="p-3 flex items-center justify-between border-b bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 text-white font-extrabold flex items-center justify-center shadow-sm">{letra}</div>
                        <div>
                          <div className="font-extrabold text-slate-800">Pasillo {letra}</div>
                          <div className="text-xs text-slate-500">{ocupadasPasillo} / {totalPasillo} ubicaciones ocupadas</div>
                        </div>
                      </div>
                      <div className="text-sm font-extrabold">{porcentaje}%</div>
                    </div>
                    <div className="p-3 space-y-3">
                      {nivelesOrden.map(nivel => {
                        const ubicaciones = pData.niveles[nivel].slice().sort((a,b)=>a.columna-b.columna);
                        return (
                          <div key={nivel} className="flex items-center gap-3">
                            <div className="w-20 text-right text-xs text-slate-500 flex items-center justify-end gap-1">
                              <Box size={12}/> Nivel {nivel}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {ubicaciones.map(ub => {
                                let bg = 'bg-slate-400';
                                if (ub.estado==='NO DISPONIBLE') bg='bg-red-500';
                                else if (ub.estado==='OCUPADO') bg='bg-yellow-400';
                                else if (ub.tieneProductos) bg='bg-emerald-500';
                                return (
                                  <button
                                    key={ub.ubicacion}
                                    onClick={()=>abrirDetalle(ub.ubicacion)}
                                    title={`${ub.ubicacion}${ub.cantidad>0?` (${ub.cantidad})`:''}`}
                                    className={`w-11 h-11 rounded-lg text-white text-xs font-extrabold flex items-center justify-center ${bg} hover:scale-110 transition-transform relative shadow-sm ring-1 ring-black/10 loc-cell`}
                                  >
                                    {ub.columna}
                                    {ub.cantidad>0 && (
                                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full text-[10px] px-1 shadow">{ub.cantidad>99?'99+':ub.cantidad}</span>
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-indigo-600" size={18}/>
                <span className="font-extrabold text-slate-800">Ubicación: {modal.ubicacion}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>cambiarEstado(modal.ubicacion,'DISPONIBLE')} className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold">Disponible</button>
                <button onClick={()=>cambiarEstado(modal.ubicacion,'NO DISPONIBLE')} className="px-3 py-1 rounded bg-red-600 text-white text-xs font-bold">No Disponible</button>
                <button onClick={()=>cambiarEstado(modal.ubicacion,'OCUPADO')} className="px-3 py-1 rounded bg-yellow-400 text-xs font-bold">Ocupado</button>
                <button onClick={()=>setModal({open:false, ubicacion:'', detalle:null})} className="px-3 py-1 rounded bg-slate-200 text-xs font-bold">Cerrar</button>
              </div>
            </div>
            <div className="p-4">
              {!modal.detalle ? (
                <div className="text-slate-400">Cargando...</div>
              ) : modal.detalle.cantidadTotal === 0 ? (
                <div className="text-slate-600 text-sm">Ubicación vacía</div>
              ) : (
                <div>
                  <div className="text-sm text-slate-600 mb-2">Cantidad total: <span className="font-extrabold">{modal.detalle.cantidadTotal}</span></div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs uppercase">
                          <th className="text-left p-2">Código</th>
                          <th className="text-left p-2">Descripción</th>
                          <th className="text-center p-2">Cant.</th>
                          <th className="text-center p-2">Talla</th>
                          <th className="text-center p-2">Color</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {modal.detalle.registros.map((r)=>(
                          <tr key={r.id}>
                            <td className="p-2 font-mono">{r.codigo}</td>
                            <td className="p-2">{r.descripcion}</td>
                            <td className="p-2 text-center">{r.cantidad}</td>
                            <td className="p-2 text-center">{r.talla || '-'}</td>
                            <td className="p-2 text-center">{r.color || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutPage;
