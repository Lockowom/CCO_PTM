import React, { useState, useEffect } from 'react';
import { Search, MapPin, Layers, Box, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';

const LayoutPage = () => {
  const [pasillos, setPasillos] = useState({});
  const [stats, setStats] = useState({ total: 0, ocupadas: 0, vacias: 0, ocupacion: 0 });
  const [pasilloActual, setPasilloActual] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modal, setModal] = useState({ open: false, ubicacion: '', detalle: null });

  useEffect(() => {
    cargarLayout();
  }, []);

  const cargarLayout = async () => {
    try {
      setLoading(true);
      const { data: layoutRows, error: layoutErr } = await supabase
        .from('wms_layout')
        .select('*');
      if (layoutErr) throw layoutErr;

      const { data: ubicacionesRows, error: ubErr } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion, cantidad');
      if (ubErr) throw ubErr;

      const resumen = {};
      ubicacionesRows?.forEach(r => {
        const key = (r.ubicacion || '').toUpperCase();
        resumen[key] = (resumen[key] || 0) + (r.cantidad || 0);
      });

      const pasillosMap = {};
      let totalUbicaciones = 0;
      let ocupadas = 0;

      layoutRows?.forEach(r => {
        const pasillo = r.pasillo;
        const nivel = String(r.nivel);
        const ubicacion = r.ubicacion.toUpperCase();
        const cantidad = resumen[ubicacion] || 0;
        const tieneProductos = cantidad > 0;
        if (!pasillosMap[pasillo]) pasillosMap[pasillo] = { niveles: {} };
        if (!pasillosMap[pasillo].niveles[nivel]) pasillosMap[pasillo].niveles[nivel] = [];
        pasillosMap[pasillo].niveles[nivel].push({
          ubicacion,
          columna: r.columna,
          nivel: r.nivel,
          estado: r.estado,
          cantidad,
          tieneProductos
        });
        totalUbicaciones++;
        if (tieneProductos) ocupadas++;
      });

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
    const { error } = await supabase
      .from('wms_layout')
      .update({ estado: nuevoEstado, updated_at: new Date() })
      .eq('ubicacion', ubicacion);
    if (!error) {
      cargarLayout();
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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Layout de Bodega</h2>
          <p className="text-slate-500 text-sm">Mapa 2D de ubicaciones, estados y productos</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border rounded-lg px-3">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              className="h-10 outline-none text-sm"
              placeholder="Buscar ubicación (A-01-01)"
              value={searchText}
              onChange={(e)=>setSearchText(e.target.value)}
              onKeyDown={(e)=> e.key==='Enter' && buscarUbicacion()}
            />
          </div>
          <button onClick={cargarLayout} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-slate-400 text-xs">Total Ubicaciones</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-slate-400 text-xs">Con Productos</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.ocupadas}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-slate-400 text-xs">Vacías</div>
          <div className="text-2xl font-bold">{stats.vacias}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-slate-400 text-xs">Ocupación</div>
          <div className="text-2xl font-bold">{stats.ocupacion}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <span className="font-bold text-slate-700">Seleccionar Pasillo</span>
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
                  <div key={letra} className="border rounded-xl">
                    <div className="p-3 flex items-center justify-between border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 text-white font-extrabold flex items-center justify-center">{letra}</div>
                        <div>
                          <div className="font-bold text-slate-700">Pasillo {letra}</div>
                          <div className="text-xs text-slate-500">{ocupadasPasillo} / {totalPasillo} ubicaciones ocupadas</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold">{porcentaje}%</div>
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
                                    className={`w-11 h-11 rounded-lg text-white text-xs font-bold flex items-center justify-center ${bg} hover:scale-110 transition-transform relative`}
                                  >
                                    {ub.columna}
                                    {ub.cantidad>0 && (
                                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full text-[10px] px-1">{ub.cantidad>99?'99+':ub.cantidad}</span>
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
                <span className="font-bold text-slate-700">Ubicación: {modal.ubicacion}</span>
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
                  <div className="text-sm text-slate-600 mb-2">Cantidad total: <span className="font-bold">{modal.detalle.cantidadTotal}</span></div>
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
