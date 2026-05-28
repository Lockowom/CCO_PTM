import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Search, Scale, Save, CheckCircle,
  AlertCircle, Package, QrCode, Ruler, Info, Loader2, Zap
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { logUpload } from '../../utils/logUpload';

const CubingRegistry = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  // Formulario de Cubicaje
  const [formData, setFormData] = useState({
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

  const codigoInputRef = useRef(null);

  // Initial Animation
  useGSAP(() => {
    gsap.from(containerRef.current, { opacity: 0, duration: 0.5 });
    gsap.from(".anim-stagger", { 
      y: 20, 
      opacity: 0, 
      duration: 0.6, 
      stagger: 0.1, 
      ease: "power2.out",
      clearProps: 'all'
    });
  }, { scope: containerRef });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setSearchTerm(codeFromUrl);
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
        const { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('*')
          .ilike('codigo_producto', `%${termToSearch}%`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProductData(data);
          
          gsap.fromTo(".product-card", 
            { scale: 0.95, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
          );

          if (data.codigo_producto.toUpperCase() === termToSearch.toUpperCase()) {
            const { data: pesoData } = await supabase
              .from('tms_pesos')
              .select('*')
              .eq('codigo_producto', data.codigo_producto)
              .maybeSingle();

            if (pesoData) {
              toast.info(`⚠️ Este producto ya tiene cubicaje registrado. Editando valores actuales.`);
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
              tipo_empaque: pesoData?.tipo_empaque || 'UNIDAD'
            }));
            
            gsap.to(formRef.current, { 
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)", 
              duration: 0.3, 
              yoyo: true, 
              repeat: 1 
            });
          }
        }
      } catch (_) {
        console.error('Cubing data load error:', _);
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

  const saveMutation = useMutation({
    mutationFn: async () => {
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

      try {
        await supabase
          .from('tms_cubicaje_historial')
          .insert({
            codigo_producto: formData.codigo_producto,
            peso: parseFloat(formData.peso_unitario),
            largo: parseFloat(formData.largo) || 0,
            ancho: parseFloat(formData.ancho) || 0,
            alto: parseFloat(formData.alto) || 0,
            tipo_empaque: formData.tipo_empaque,
            observaciones: formData.observaciones
          });
      } catch (_) { console.error('Cubing save error:', _); }
    },
    onSuccess: () => {
      toast.success(`Cubicaje guardado para ${formData.codigo_producto}`);
      logUpload({ modulo: 'Cubicaje', tablaDestino: 'tms_pesos', totalRegistros: 1, actualizados: 1 });
      
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
      
      codigoInputRef.current?.focus();
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.codigo_producto || !formData.peso_unitario) {
      toast.error('Código y Peso son obligatorios');
      gsap.to(formRef.current, { x: [-5, 5, -5, 5, 0], duration: 0.4 });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div ref={containerRef} className="max-w-[1600px] mx-auto pb-20 space-y-4 sm:space-y-8 min-h-screen bg-slate-50 p-3 sm:p-6 text-slate-700">
      {/* Header Moderno Glassmorphism */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-6 anim-stagger bg-white backdrop-blur-xl p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-slate-50 border border-blue-500/50 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.4)] text-blue-400">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Registro de Cubicaje</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <Ruler size={16} /> Maestro de Pesos y Dimensiones
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-bold text-sm border border-blue-500/30 relative z-10">
          <Zap size={16} className="fill-blue-400" />
          Actualización en Tiempo Real
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
        
        <div className="lg:col-span-4 space-y-6 anim-stagger">
          <div className="bg-white backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-lg">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono font-bold text-xl text-slate-900 focus:border-blue-500 outline-none transition-all uppercase placeholder:text-slate-600"
                  autoFocus
                />
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-500 transition-colors" size={24} />
                
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  </div>
                )}
              </div>

              {productData ? (
                <div className="product-card bg-wms-neon/10 border border-wms-neon/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-wms-neon/20 p-2 rounded-xl text-wms-neon">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-wms-neon uppercase tracking-widest mb-1">Producto Identificado</p>
                      <p className="font-bold text-slate-900 text-lg leading-tight mb-1">{productData.producto}</p>
                      <span className="inline-block bg-slate-50 px-2 py-1 rounded text-xs font-mono font-bold text-slate-500 border border-slate-200">
                        {productData.codigo_producto}
                      </span>
                    </div>
                  </div>
                </div>
              ) : searchTerm.length > 2 && !loading ? (
                <div className="bg-wms-alert/10 border border-wms-alert/30 rounded-2xl p-5 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-3 text-wms-alert">
                    <AlertCircle size={24} />
                    <div>
                      <p className="font-bold">Producto no encontrado</p>
                      <p className="text-xs opacity-80">Verifique el código o registre uno nuevo</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-8 text-center">
                  <Package size={48} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-500 font-bold text-sm">Escanee un código para comenzar</p>
                </div>
              )}
            </div>
          </div>

          <div ref={infoRef} className="bg-white p-6 rounded-3xl text-slate-700 shadow-xl relative overflow-hidden border border-slate-200">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box size={120} />
            </div>
            <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Info size={18} /> GUÍA RÁPIDA
            </h4>
            <ul className="text-sm space-y-3 opacity-90 relative z-10">
              <li className="flex gap-3 items-start">
                <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Escanea el código SKU del producto físico.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>La descripción se carga automáticamente.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Pesa el producto unitario (Kg).</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Mide Largo, Ancho y Alto (cm).</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 anim-stagger">
          <form 
            ref={formRef} 
            onSubmit={handleSave} 
            className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full"
          >
            <div className="p-4 sm:p-6 md:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                <Ruler className="text-blue-400" />
                DETALLES DE DIMENSIONES
              </h3>
              {formData.codigo_producto && (
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold font-mono border border-blue-500/30">
                  EDITANDO: {formData.codigo_producto}
                </span>
              )}
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Código SKU</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.codigo_producto} 
                      readOnly 
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
                      placeholder="---"
                    />
                    {formData.codigo_producto && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-wms-neon" size={16} />}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Unidad</label>
                  <input 
                    type="text" 
                    value={formData.unidad_medida} 
                    readOnly 
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-500 text-center"
                    placeholder="-"
                  />
                </div>
                <div className="md:col-span-7">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Descripción del Producto</label>
                  <input 
                    type="text" 
                    value={formData.descripcion} 
                    readOnly 
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-900"
                    placeholder="Esperando selección..."
                  />
                </div>
              </div>

              <div className="h-px bg-wms-border w-full"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="md:col-span-2 lg:col-span-1 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/30 group focus-within:border-blue-500 transition-colors">
                  <label className="block text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                    <Scale size={16} /> Peso Unitario (Kg) <span className="text-wms-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.001"
                    name="peso_unitario"
                    value={formData.peso_unitario}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-slate-50 border-2 border-blue-500/50 rounded-xl text-2xl font-black text-blue-400 focus:border-blue-400 outline-none transition-all placeholder:text-slate-600"
                    placeholder="0.000"
                    required
                  />
                </div>

                {['largo', 'ancho', 'alto'].map((dim) => (
                  <div key={dim} className="group">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1 group-focus-within:text-blue-400 transition-colors">
                      <Ruler size={14} /> {dim} (cm)
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      name={dim}
                      value={formData[dim]}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Tipo de Empaque</label>
                   <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                      {['UNIDAD', 'CAJA', 'BOLSA'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, tipo_empaque: type})}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            formData.tipo_empaque === type 
                              ? 'bg-white text-blue-400 shadow-md border border-slate-200 transform scale-100' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Observaciones</label>
                  <input 
                    type="text" 
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

            </div>

            <div className="p-4 sm:p-6 bg-slate-50/40 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
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
                className="px-6 py-4 text-slate-500 font-bold hover:bg-white hover:text-slate-900 rounded-xl transition-colors text-sm uppercase tracking-wider"
              >
                Cancelar / Limpiar
              </button>
              
              <button 
                type="submit"
                disabled={saveMutation.isPending || !formData.codigo_producto}
                className={`
                  px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all shadow-xl
                  ${saveMutation.isSuccess 
                    ? 'bg-wms-neon text-wms-dark scale-105 shadow-neon-green' 
                    : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:-translate-y-1 active:scale-95'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                `}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : saveMutation.isSuccess ? (
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
