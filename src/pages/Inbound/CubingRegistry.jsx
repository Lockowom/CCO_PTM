import React, { useState, useEffect, useRef } from 'react';
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
  Ruler
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';

const CubingRegistry = () => {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Buscar producto al escribir código (con debounce)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setProductData(null);
        return;
      }

      try {
        setLoading(true);
        // 1. Buscar en Matriz de Códigos
        const { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('*')
          .ilike('codigo_producto', `%${searchTerm}%`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProductData(data);
          // Auto-rellenar formulario si es una búsqueda exacta
          if (data.codigo_producto.toUpperCase() === searchTerm.toUpperCase()) {
            // Buscar si ya tiene pesos registrados previamente
            const { data: pesoData } = await supabase
              .from('tms_pesos')
              .select('*')
              .eq('codigo_producto', data.codigo_producto)
              .maybeSingle();

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
      return;
    }

    try {
      setLoading(true);
      toast.loading('Guardando registro de cubicaje...');

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

      // 2. Guardar en historial de cubicaje (Nueva tabla sugerida)
      const { error: historyError } = await supabase
        .from('tms_cubicaje_historial')
        .insert({
          codigo_producto: formData.codigo_producto,
          peso: parseFloat(formData.peso_unitario),
          largo: parseFloat(formData.largo),
          ancho: parseFloat(formData.ancho),
          alto: parseFloat(formData.alto),
          tipo_empaque: formData.tipo_empaque,
          usuario_id: (await supabase.auth.getUser()).data.user?.id,
          observaciones: formData.observaciones
        });

      // Si la tabla historial no existe, ignoramos el error por ahora o creamos la tabla
      if (historyError && historyError.code !== '42P01') { 
        console.warn('Error guardando historial:', historyError);
      }

      toast.dismiss();
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
      
      codigoInputRef.current?.focus();

    } catch (error) {
      toast.dismiss();
      console.error('Error:', error);
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Scale size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Registro de Cubicaje</h1>
          <p className="text-slate-500 text-sm">Maestro de Pesos y Dimensiones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna 1: Búsqueda y Datos Básicos */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Search size={18} className="text-indigo-500" />
              Buscar Producto
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  ref={codigoInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  placeholder="Escanear Código SKU..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono font-bold text-lg focus:border-indigo-500 focus:bg-white outline-none transition-all uppercase"
                  autoFocus
                />
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>

              {productData ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Producto Encontrado</p>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{productData.producto}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{productData.codigo_producto}</p>
                    </div>
                  </div>
                </div>
              ) : searchTerm.length > 2 && !loading ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 animate-in fade-in">
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertCircle size={18} />
                    <p className="text-sm font-bold">Producto no encontrado</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">Instrucciones</h4>
            <ul className="text-sm text-indigo-700 space-y-2 list-disc pl-4">
              <li>Escanea el código del producto.</li>
              <li>La descripción se cargará automáticamente.</li>
              <li>Ingresa el peso unitario exacto (kg).</li>
              <li>Mide las dimensiones (cm) de la unidad mínima de venta.</li>
              <li>Guarda para actualizar el maestro.</li>
            </ul>
          </div>
        </div>

        {/* Columna 2 y 3: Formulario de Registro */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Detalles de Dimensiones</h3>
            </div>
            
            <div className="p-8 space-y-6">
              
              {/* Info Automática */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código SKU</label>
                  <input 
                    type="text" 
                    value={formData.codigo_producto} 
                    readOnly 
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unidad Medida</label>
                  <input 
                    type="text" 
                    value={formData.unidad_medida} 
                    readOnly 
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label>
                  <input 
                    type="text" 
                    value={formData.descripcion} 
                    readOnly 
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 my-6"></div>

              {/* Inputs de Medidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <Scale size={12} /> Peso (Kg) *
                  </label>
                  <input 
                    type="number" 
                    step="0.001"
                    name="peso_unitario"
                    value={formData.peso_unitario}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    placeholder="0.000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Ruler size={12} /> Largo (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="largo"
                    value={formData.largo}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Ruler size={12} /> Ancho (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="ancho"
                    value={formData.ancho}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Ruler size={12} /> Alto (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="alto"
                    value={formData.alto}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo Empaque</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['UNIDAD', 'CAJA', 'BOLSA'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, tipo_empaque: type})}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                            formData.tipo_empaque === type 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Observaciones</label>
                  <input 
                    type="text" 
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
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
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.codigo_producto}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                {loading ? 'Guardando...' : (
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
