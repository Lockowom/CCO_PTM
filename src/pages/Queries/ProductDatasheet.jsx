import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, X, Camera, ImagePlus, Trash2, Star, StarOff, Package,
  ScanLine, Layers, Clock, Boxes, RefreshCw, ChevronLeft, Ruler, ImageOff, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const BUCKET = 'fichas-productos';

// Comprime/redimensiona la imagen en el cliente (máx 1600px, JPEG 0.82)
// para evitar subir fotos de móvil de 10-15MB y respetar el límite del bucket.
async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 1600;
    let { width, height } = bitmap;
    if (width > MAX || height > MAX) {
      const ratio = Math.min(MAX / width, MAX / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    return blob || file;
  } catch (_) {
    // Si el navegador no soporta createImageBitmap (raro), subimos el original
    return file;
  }
}

const ProductDatasheet = () => {
  const { user, hasPermission } = useAuth();
  const canManage =
    user?.rol === 'ADMIN' || user?.es_admin_delegado || hasPermission('manage_fichas');

  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState(null); // código seleccionado
  const [ficha, setFicha] = useState(null);
  const [loadingFicha, setLoadingFicha] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // url para ver en grande
  const fileRef = useRef(null);

  // ── Búsqueda con debounce ──
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_productos', { p_query: q, p_limit: 30 });
      if (error) { toast.error('Error buscando productos'); setResults([]); }
      else setResults(data || []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [term]);

  // ── Cargar ficha de un código ──
  const loadFicha = useCallback(async (codigo) => {
    setLoadingFicha(true);
    const { data, error } = await supabase.rpc('get_ficha_producto', { p_codigo: codigo });
    if (error) { toast.error('No se pudo cargar la ficha'); setFicha(null); }
    else setFicha(data);
    setLoadingFicha(false);
  }, []);

  const openFicha = (codigo) => {
    setSelected(codigo);
    loadFicha(codigo);
  };

  const closeFicha = () => {
    setSelected(null);
    setFicha(null);
  };

  // ── Subir foto (cámara o galería) ──
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permitir re-seleccionar el mismo archivo
    if (!file || !selected) return;
    if (!file.type.startsWith('image/')) { toast.error('El archivo debe ser una imagen'); return; }

    setUploading(true);
    try {
      const blob = await compressImage(file);
      const path = `${selected}/${crypto.randomUUID()}.jpg`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const esPrimera = (ficha?.imagenes?.length || 0) === 0;
      const { error: insErr } = await supabase.from('tms_fichas_imagenes').insert({
        codigo_producto: selected,
        imagen_url: pub.publicUrl,
        storage_path: path,
        es_principal: esPrimera,
        creado_por: user?.id || null,
        creado_nombre: user?.nombre || null,
      });
      if (insErr) {
        // limpiar el objeto huérfano si la fila falla
        await supabase.storage.from(BUCKET).remove([path]);
        throw insErr;
      }

      toast.success('Foto agregada');
      await loadFicha(selected);
    } catch (err) {
      console.error(err);
      toast.error(err?.message?.includes('row-level security')
        ? 'No tienes permiso para subir fotos'
        : 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const deleteFoto = async (img) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await supabase.storage.from(BUCKET).remove([img.storage_path]);
      const { error } = await supabase.from('tms_fichas_imagenes').delete().eq('id', img.id);
      if (error) throw error;
      toast.success('Foto eliminada');
      await loadFicha(selected);
    } catch (err) {
      toast.error('No se pudo eliminar');
    }
  };

  const setPrincipal = async (img) => {
    try {
      await supabase.from('tms_fichas_imagenes').update({ es_principal: false }).eq('codigo_producto', selected);
      const { error } = await supabase.from('tms_fichas_imagenes').update({ es_principal: true }).eq('id', img.id);
      if (error) throw error;
      await loadFicha(selected);
    } catch (err) {
      toast.error('No se pudo marcar como principal');
    }
  };

  const imagenes = ficha?.imagenes || [];
  const principal = imagenes.find(i => i.es_principal) || imagenes[0] || null;
  const partidas = ficha?.partidas || [];
  const header = ficha?.header || (selected ? { codigo_producto: selected } : null);

  const isExpired = (d) => d && new Date(d) < new Date();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HEADER + BUSCADOR */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <ScanLine size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-none">Ficha Técnica</h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                Presentación del producto
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${searching ? 'animate-pulse text-orange-500' : 'text-slate-400'}`} size={18} />
            <input
              type="text"
              inputMode="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por código o nombre del producto..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white font-mono uppercase text-sm
                         outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:font-sans placeholder:normal-case placeholder:text-slate-300"
              autoFocus
            />
            {term && (
              <button onClick={() => setTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 p-1">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULTADOS DE BÚSQUEDA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {!selected && (
          <>
            {term.trim().length < 2 && (
              <div className="text-center py-20 text-slate-400">
                <Package size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="font-bold">Escribe un código para ver su ficha técnica</p>
              </div>
            )}

            {term.trim().length >= 2 && results.length === 0 && !searching && (
              <div className="text-center py-20 text-slate-400">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="font-bold">Sin resultados para "{term}"</p>
              </div>
            )}

            <div className="grid gap-2.5">
              {results.map((r) => (
                <button
                  key={r.codigo_producto}
                  onClick={() => openFicha(r.codigo_producto)}
                  className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-lg text-left transition-all active:scale-[0.99]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.tiene_foto ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`}>
                    {r.tiene_foto ? <Camera size={22} /> : <ImageOff size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-black text-orange-500 uppercase tracking-wider">{r.codigo_producto}</p>
                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">{r.producto || '—'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mt-0.5">{r.unidad_medida || ''}</p>
                  </div>
                  <ChevronLeft size={18} className="rotate-180 text-slate-300 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* FICHA SELECCIONADA */}
        {selected && (
          <div>
            <button onClick={closeFicha} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 mb-4 transition-colors">
              <ChevronLeft size={18} /> Volver a la búsqueda
            </button>

            {loadingFicha ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <RefreshCw className="animate-spin text-orange-500" size={28} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando ficha...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* CABECERA DEL PRODUCTO */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid sm:grid-cols-2 gap-0">
                    {/* Foto principal */}
                    <div className="relative bg-slate-100 aspect-square sm:aspect-auto sm:min-h-[280px] flex items-center justify-center">
                      {principal ? (
                        <img
                          src={principal.imagen_url}
                          alt={header?.producto || selected}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setLightbox(principal.imagen_url)}
                        />
                      ) : (
                        <div className="text-center text-slate-300 p-8">
                          <ImageOff size={56} className="mx-auto mb-3" />
                          <p className="font-bold text-sm">Sin presentación</p>
                        </div>
                      )}
                    </div>

                    {/* Datos */}
                    <div className="p-5 sm:p-7 flex flex-col justify-center">
                      <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-2">{header?.codigo_producto || selected}</span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-4">{header?.producto || '—'}</h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wide">
                          <Ruler size={13} /> U. Medida: {header?.unidad_medida || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-black uppercase tracking-wide">
                          <Layers size={13} /> {partidas.length} partida{partidas.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GALERÍA DE FOTOS */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 font-black text-slate-900">
                      <Camera size={18} className="text-orange-500" /> Galería de presentación
                    </h3>
                    {canManage && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95"
                      >
                        {uploading ? <RefreshCw size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        {uploading ? 'Subiendo...' : 'Agregar / Tomar foto'}
                      </button>
                    )}
                  </div>

                  {/* input cámara/galería — capture abre la cámara nativa en la WebView/móvil */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFile}
                    className="hidden"
                  />

                  {imagenes.length === 0 ? (
                    <div className="text-center py-12 text-slate-300">
                      <ImageOff size={44} className="mx-auto mb-3" />
                      <p className="font-bold text-sm">
                        {canManage ? 'Aún no hay fotos. Agrega la primera presentación.' : 'Este producto no tiene fotos todavía.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {imagenes.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={img.imagen_url}
                            alt=""
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setLightbox(img.imagen_url)}
                          />
                          {img.es_principal && (
                            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black uppercase">
                              <Star size={10} /> Principal
                            </span>
                          )}
                          {canManage && (
                            <div className="absolute inset-x-0 bottom-0 p-1.5 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              {!img.es_principal && (
                                <button onClick={() => setPrincipal(img)} title="Marcar como principal"
                                  className="p-1.5 rounded-lg bg-white/90 text-amber-600 hover:bg-white active:scale-90">
                                  <StarOff size={14} />
                                </button>
                              )}
                              <button onClick={() => deleteFoto(img)} title="Eliminar"
                                className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white active:scale-90">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PARTIDAS / TALLAS */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <h3 className="flex items-center gap-2 font-black text-slate-900 mb-4">
                    <Boxes size={18} className="text-orange-500" /> Partidas / Tallas
                  </h3>
                  {partidas.length === 0 ? (
                    <p className="text-slate-400 font-bold text-sm py-6 text-center">Sin partidas registradas para este código.</p>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar -mx-1">
                      <table className="w-full text-left border-collapse min-w-[460px]">
                        <thead>
                          <tr className="border-b-2 border-slate-100">
                            <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Partida / Talla</th>
                            <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Venc.</th>
                            <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Disponible</th>
                            <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Stock Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {partidas.map((p, i) => (
                            <tr key={i} className="hover:bg-slate-50/60">
                              <td className="px-3 py-3">
                                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1.5 rounded-lg inline-block">
                                  {p.partida && p.partida.trim() ? p.partida : 'S/P'}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                {p.fecha_vencimiento ? (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black ${isExpired(p.fecha_vencimiento) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                    <Clock size={12} /> {p.fecha_vencimiento}
                                  </span>
                                ) : <span className="text-slate-300 font-bold">—</span>}
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className={`font-black ${(p.disponible || 0) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{p.disponible || 0}</span>
                              </td>
                              <td className="px-3 py-3 text-right font-black text-slate-900">{p.stock_total || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {!canManage && (
                  <p className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 py-2">
                    <ShieldCheck size={14} /> Solo administradores pueden editar las fotos.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2"><X size={28} /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default ProductDatasheet;
