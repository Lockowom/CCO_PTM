import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Box, 
  Search, 
  Scale, 
  Save, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Package,
  QrCode,
  Ruler,
  Info,
  Loader2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import gsap from 'gsap';

const CubingRegistry = () => {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const inputRef = useRef(null);

  // Formulario de Cubicaje
  const [formData, setFormData] = useState({
    codigo_producto: '',
    descripcion: '',
    unidad_medida: '',
    peso_unitario: '',
    largo: '',
    ancho: '',
    alto: '',
    tipo_empaque: 'UNIDAD', // UNIDAD, CAJA, BOLSA, PALLET
    observaciones: ''
  });

  const codigoInputRef = useRef(null);

  // Initial Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { opacity: 0, duration: 0.5 });
      gsap.from(".anim-stagger", { 
        y: 20, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out" 
      });
    });
    return () => ctx.revert();
  }, []);

  // Efecto inicial para leer parámetros de URL una sola vez
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setSearchTerm(codeFromUrl);
      // Limpiar URL
      window.history.replaceState({}, '', '/inbound/cubing');
    }
  }, []);

  // Buscar producto al escribir código (con debounce)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setProductData(null);
        return;
      }
      
      let termToSearch = searchTerm;

      try {
        setLoading(true);
        // 1. Buscar en Matriz de Códigos
        const { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('*')
          .ilike('codigo_producto', `%${termToSearch}%`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProductData(data);
          
          // Animate success find
          gsap.fromTo(".product-card", 
            { scale: 0.95, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
          );

          // Auto-rellenar formulario si es una búsqueda exacta
          if (data.codigo_producto.toUpperCase() === termToSearch.toUpperCase()) {
            // Buscar si ya tiene pesos registrados previamente
            const { data: pesoData } = await supabase
              .from('tms_pesos')
              .select('*')
              .eq('codigo_producto', data.codigo_producto)
              .maybeSingle();

            // NOTIFICAR SI YA EXISTE
            if (pesoData) {
              toast.info(`⚠️ Este producto ya tiene cubicaje registrado. Editando valores actuales.`, {
                duration: 5000,
                style: { border: '2px solid #f59e0b', color: '#b45309' }
              });
            }

            setFormData(prev => ({
              ...prev,
              codigo_producto: data.codigo_producto,
              descripcion: data.producto || '',
              unidad_medida: data.unidad_medida || 'UNI',
              peso_unitario: pesoData?.peso_unitario || '',
              largo: pesoData?.largo || '',
              ancho: pesoData?.ancho || '',
              alto: pesoData?.alto || '',
              tipo_empaque: 'UNIDAD'
            }));
            
            // Highlight form
            gsap.to(formRef.current, { 
              boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)", 
              duration: 0.3, 
              yoyo: true, 
              repeat: 1 
            });
          }
        }
      } catch (error) {
        console.error('Error buscando producto:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProduct, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo_producto || !formData.peso_unitario) {
      toast.error('Código y Peso son obligatorios');
      gsap.to(formRef.current, { x: [-5, 5, -5, 5, 0], duration: 0.4 });
      return;
    }

    try {
      setLoading(true);
      
      // 1. Guardar en tms_pesos (Actualizar o Insertar)
      const { error: pesoError } = await supabase
        .from('tms_pesos')
        .upsert({
          codigo_producto: formData.codigo_producto,
          descripcion: formData.descripcion,
          peso_unitario: parseFloat(formData.peso_unitario),
          largo: parseFloat(formData.largo) || 0,
          ancho: parseFloat(formData.ancho) || 0,
          alto: parseFloat(formData.alto) || 0,
          updated_at: new Date()
        }, { onConflict: 'codigo_producto' });

      if (pesoError) throw pesoError;

          // 2. Guardar en historial de cubicaje (Si existe la tabla)
          try {
            const { error: historyError } = await supabase
              .from('tms_cubicaje_historial')
              .insert({
                codigo_producto: formData.codigo_producto,
                peso: parseFloat(formData.peso_unitario),
                largo: parseFloat(formData.largo) || 0,
                ancho: parseFloat(formData.ancho) || 0,
                alto: parseFloat(formData.alto) || 0,
                tipo_empaque: formData.tipo_empaque,
                // usuario_id: user?.id, // Descomentar si usas Auth de Supabase real
                observaciones: formData.observaciones
              });
              
            if (historyError) {
               console.warn('Advertencia: No se pudo guardar el historial (la tabla podría no existir):', historyError.message);
            }
          } catch (histErr) {
             console.warn('Error silencioso al guardar historial:', histErr);
          }

      setSaveSuccess(true);
      toast.success(`Cubicaje guardado para ${formData.codigo_producto}`);
      
      // Reset parcial
      setSearchTerm('');
      setProductData(null);
      setFormData({
        codigo_producto: '',
        descripcion: '',
        unidad_medida: '',
        peso_unitario: '',
        largo: '',
        ancho: '',
        alto: '',
        tipo_empaque: 'UNIDAD',
        observaciones: ''
      });
      
      setTimeout(() => setSaveSuccess(false), 2000);
      codigoInputRef.current?.focus();

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-[1600px] mx-auto pb-20 space-y-8">
      {/* Header Moderno */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6 anim-stagger">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white transform transition-transform hover:scale-105">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registro de Cubicaje</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <Ruler size={16} /> Maestro de Pesos y Dimensiones
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm border border-indigo-100">
          <Zap size={16} className="fill-indigo-600" />
          Actualización en Tiempo Real
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna 1: Búsqueda y Contexto (4 cols) */}
        <div className="lg:col-span-4 space-y-6 anim-stagger">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Search size={20} />
              </div>
              BUSCAR PRODUCTO
            </h3>
            
            <div className="space-y-6">
              <div className="relative group/input">
                <input
                  ref={codigoInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  placeholder="Escanear Código SKU..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono font-bold text-xl text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all uppercase placeholder:text-slate-400"
                  autoFocus
                />
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={24} />
                
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-indigo-500" size={24} />
                  </div>
                )}
              </div>

              {productData ? (
                <div className="product-card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Producto Identificado</p>
                      <p className="font-bold text-slate-800 text-lg leading-tight mb-1">{productData.producto}</p>
                      <span className="inline-block bg-white/80 px-2 py-1 rounded text-xs font-mono font-bold text-slate-500 border border-emerald-100">
                        {productData.codigo_producto}
                      </span>
                    </div>
                  </div>
                </div>
              ) : searchTerm.length > 2 && !loading ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-3 text-amber-700">
                    <AlertCircle size={24} />
                    <div>
                      <p className="font-bold">Producto no encontrado</p>
                      <p className="text-xs opacity-80">Verifique el código o registre uno nuevo</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                  <Package size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 font-bold text-sm">Escanee un código para comenzar</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div ref={infoRef} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Box size={120} />
            </div>
            <h4 className="font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <Info size={18} /> GUÍA RÁPIDA
            </h4>
            <ul className="text-sm space-y-3 opacity-90 relative z-10">
              <li className="flex gap-3 items-start">
                <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Escanea el código SKU del producto físico.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>La descripción se carga automáticamente.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Pesa el producto unitario (Kg).</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Mide Largo, Ancho y Alto (cm).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna 2: Formulario Principal (8 cols) */}
        <div className="lg:col-span-8 anim-stagger">
          <form 
            ref={formRef} 
            onSubmit={handleSave} 
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                <Ruler className="text-indigo-500" />
                DETALLES DE DIMENSIONES
              </h3>
              {formData.codigo_producto && (
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold font-mono">
                  EDITANDO: {formData.codigo_producto}
                </span>
              )}
            </div>
            
            <div className="p-8 space-y-8 flex-1">
              
              {/* Bloque 1: Información Read-Only */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Código SKU</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.codigo_producto} 
                      readOnly 
                      className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-mono text-slate-700 font-bold"
                      placeholder="---"
                    />
                    {formData.codigo_producto && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Unidad</label>
                  <input 
                    type="text" 
                    value={formData.unidad_medida} 
                    readOnly 
                    className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-600 text-center"
                    placeholder="-"
                  />
                </div>
                <div className="md:col-span-7">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Descripción del Producto</label>
                  <input 
                    type="text" 
                    value={formData.descripcion} 
                    readOnly 
                    className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-medium text-slate-700"
                    placeholder="Esperando selección..."
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Bloque 2: Inputs de Medidas (Destacados) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* PESO - Campo Principal */}
                <div className="md:col-span-2 lg:col-span-1 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 group focus-within:border-indigo-400 focus-within:bg-indigo-50 transition-colors">
                  <label className="block text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center gap-2">
                    <Scale size={16} /> Peso Unitario (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.001"
                    name="peso_unitario"
                    value={formData.peso_unitario}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white border-2 border-indigo-200 rounded-xl text-2xl font-black text-indigo-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-indigo-200"
                    placeholder="0.000"
                    required
                  />
                </div>

                {/* Dimensiones */}
                {['largo', 'ancho', 'alto'].map((dim) => (
                  <div key={dim} className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1 group-focus-within:text-indigo-500 transition-colors">
                      <Ruler size={14} /> {dim} (cm)
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      name={dim}
                      value={formData[dim]}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold text-lg text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>

              {/* Bloque 3: Extras */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Tipo de Empaque</label>
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      {['UNIDAD', 'CAJA', 'BOLSA'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, tipo_empaque: type})}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            formData.tipo_empaque === type 
                              ? 'bg-white text-indigo-600 shadow-md shadow-slate-200 transform scale-100' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Observaciones</label>
                  <input 
                    type="text" 
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => {
                   setSearchTerm('');
                   setFormData({
                    codigo_producto: '', descripcion: '', unidad_medida: '', peso_unitario: '',
                    largo: '', ancho: '', alto: '', tipo_empaque: 'UNIDAD', observaciones: ''
                   });
                   setProductData(null);
                }}
                className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors text-sm uppercase tracking-wider"
              >
                Cancelar / Limpiar
              </button>
              
              <button 
                type="submit"
                disabled={loading || !formData.codigo_producto}
                className={`
                  px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all shadow-xl
                  ${saveSuccess 
                    ? 'bg-emerald-500 text-white scale-105' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95'
                  }
                  disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                `}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Cubicaje
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CubingRegistry;
