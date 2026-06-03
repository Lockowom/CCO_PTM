import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardCheck, Plus, ArrowLeft, Search, Loader2, Trash2, Download,
  Send, FileSearch, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import {
  useInformes, useInformeItems, useCrearInforme, useActualizarEstadoInforme,
  useDictaminar, fetchCandidatos,
  DICTAMENES, BODEGAS_DESTINO, CONDICIONES, MOTIVOS,
} from '../../services/calidadService';
import CalidadBadge from '../../components/ui/CalidadBadge';

const SEMAFORO_CLS = {
  ROJO: 'bg-rose-500', NARANJA: 'bg-amber-500', VERDE: 'bg-emerald-500', NA: 'bg-slate-300',
};
const ESTADO_INFORME_CLS = {
  BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
  ENVIADO_CALIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
  DICTAMINADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CERRADO: 'bg-slate-800 text-white border-slate-800',
};

// ── Constructor de informe nuevo ───────────────────────────────────────────
const InformeBuilder = ({ onCancel, onSaved }) => {
  const { user } = useAuth();
  const crear = useCrearInforme();

  const [bodega, setBodega] = useState('');
  const [periodicidad, setPeriodicidad] = useState('SEMANAL');
  const [observaciones, setObservaciones] = useState('');
  const [query, setQuery] = useState('');
  const [soloVenc, setSoloVenc] = useState(false);
  const [candidatos, setCandidatos] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [items, setItems] = useState([]);

  const buscar = useCallback(async () => {
    setBuscando(true);
    try {
      const data = await fetchCandidatos(query, soloVenc);
      setCandidatos(data);
    } catch (e) {
      toast.error(`Error buscando stock: ${e.message}`);
    } finally {
      setBuscando(false);
    }
  }, [query, soloVenc]);

  const addItem = (c) => {
    const key = `${c.codigo_producto}|${c.partida || ''}|${c.ubicacion || ''}`;
    if (items.some(it => it._key === key)) {
      toast.info('Ese ítem ya está en el informe');
      return;
    }
    setItems(prev => [...prev, {
      _key: key,
      codigo_producto: c.codigo_producto,
      partida: c.partida || '',
      ubicacion: c.ubicacion || '',
      producto: c.producto || '',
      unidad_medida: c.unidad_medida || '',
      cantidad: Number(c.disponible) || 0,
      estado_inventario: 'Disponible',
      tipo: c.tipo || 'NO_PERECIBLE',
      fecha_vencimiento: c.fecha_vencimiento || null,
      semaforo: c.semaforo || 'NA',
      condicion_observada: 'OK',
      motivo: 'Rutina',
      observaciones: '',
    }]);
  };

  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(it => it._key === key ? { ...it, [field]: value } : it));
  };
  const removeItem = (key) => setItems(prev => prev.filter(it => it._key !== key));

  const guardar = async (estado) => {
    if (items.length === 0) { toast.error('Agrega al menos un ítem'); return; }
    const cabecera = {
      fecha: new Date().toISOString().slice(0, 10),
      analista_id: user?.id || null,
      analista_nombre: user?.nombre || null,
      bodega: bodega || null,
      periodicidad,
      estado,
      observaciones: observaciones || null,
    };
    // Quitar la clave interna _key antes de insertar.
    const cleanItems = items.map(({ _key, ...rest }) => rest);
    try {
      await crear.mutateAsync({ cabecera, items: cleanItems });
      toast.success(estado === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado');
      onSaved();
    } catch (e) {
      toast.error(`Error al guardar: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-900">Nuevo Informe de Monitoreo</h2>
      </div>

      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bodega</label>
          <input value={bodega} onChange={e => setBodega(e.target.value)} placeholder="Ej. BD 21"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodicidad</label>
          <select value={periodicidad} onChange={e => setPeriodicidad(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400">
            <option value="SEMANAL">Semanal</option>
            <option value="MENSUAL">Mensual</option>
            <option value="ADHOC">Ad-hoc</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones</label>
          <input value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas generales del informe"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400" />
        </div>
      </div>

      {/* Buscador de candidatos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Buscar SKU o descripción en stock..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 px-2">
            <input type="checkbox" checked={soloVenc} onChange={e => setSoloVenc(e.target.checked)} />
            Solo 🔴/🟠 (próx. a vencer)
          </label>
          <button onClick={buscar} disabled={buscando}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50">
            {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
          </button>
        </div>

        {candidatos.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
            {candidatos.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-emerald-50/40">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_CLS[c.semaforo] || 'bg-slate-300'}`} />
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">{c.codigo_producto}</span>
                  <span className="text-slate-600 truncate">{c.producto}</span>
                  {c.partida && <span className="text-[10px] text-slate-400">lote {c.partida}</span>}
                  {c.ubicacion && <span className="text-[10px] text-slate-400">· {c.ubicacion}</span>}
                </div>
                <button onClick={() => addItem(c)} className="ml-3 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0">
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ítems seleccionados */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-black text-slate-700 mb-3">Ítems del informe ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Busca y agrega productos al informe.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left border-b border-slate-100">
                  <th className="py-2 pr-3">SKU / Lote / Ubic.</th>
                  <th className="py-2 pr-3">Cant.</th>
                  <th className="py-2 pr-3">Vence</th>
                  <th className="py-2 pr-3">Condición</th>
                  <th className="py-2 pr-3">Motivo</th>
                  <th className="py-2 pr-3">Obs.</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it._key} className="border-b border-slate-50">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${SEMAFORO_CLS[it.semaforo] || 'bg-slate-300'}`} />
                        <span className="font-bold text-slate-800">{it.codigo_producto}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{it.partida || '—'} · {it.ubicacion || 's/ubic'}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{it.cantidad}</td>
                    <td className="py-2 pr-3 text-xs text-slate-500">{it.fecha_vencimiento || '—'}</td>
                    <td className="py-2 pr-3">
                      <select value={it.condicion_observada} onChange={e => updateItem(it._key, 'condicion_observada', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-400">
                        {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select value={it.motivo} onChange={e => updateItem(it._key, 'motivo', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-400">
                        {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input value={it.observaciones} onChange={e => updateItem(it._key, 'observaciones', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-400 w-40" />
                    </td>
                    <td className="py-2">
                      <button onClick={() => removeItem(it._key)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => guardar('BORRADOR')} disabled={crear.isPending}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50">
            Guardar borrador
          </button>
          <button onClick={() => guardar('ENVIADO_CALIDAD')} disabled={crear.isPending}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50">
            {crear.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar a Calidad
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detalle + dictamen ──────────────────────────────────────────────────────
const InformeDetail = ({ informe, onBack }) => {
  const { hasPermission } = useAuth();
  const canDictar = hasPermission('manage_quality');
  const { data: items = [], isLoading } = useInformeItems(informe.id);
  const dictaminar = useDictaminar();
  const actualizarEstado = useActualizarEstadoInforme();
  const [dictForm, setDictForm] = useState({});

  const setForm = (id, patch) => setDictForm(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const enviarDictamen = async (item) => {
    const f = dictForm[item.id] || {};
    if (!f.dictamen) { toast.error('Selecciona un dictamen'); return; }
    const def = DICTAMENES.find(d => d.id === f.dictamen);
    if (def?.mueve && !f.bodegaDestino) { toast.error('Indica la bodega destino'); return; }
    try {
      await dictaminar.mutateAsync({
        itemId: item.id,
        dictamen: f.dictamen,
        bodegaDestino: f.bodegaDestino,
        acuse: f.acuse,
      });
      toast.success(`Dictamen registrado: ${def?.label}${def?.mueve ? ' · aviso enviado a Inventario' : ''}`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const exportar = () => {
    const detalle = items.map(it => ({
      SKU: it.codigo_producto, Lote: it.partida, Ubicacion: it.ubicacion,
      Producto: it.producto, UM: it.unidad_medida, Cantidad: it.cantidad,
      Estado_Inv: it.estado_inventario, Tipo: it.tipo, Vence: it.fecha_vencimiento,
      Semaforo: it.semaforo, Condicion: it.condicion_observada, Motivo: it.motivo,
      Observaciones: it.observaciones,
      Dictamen: it.dictamen || '', Bodega_Destino: it.bodega_destino || '',
      Acuse: it.acuse_texto || '', Calidad: it.calidad_nombre || '',
      Fecha_Dictamen: it.fecha_dictamen || '',
    }));
    const porSemaforo = ['ROJO', 'NARANJA', 'VERDE', 'NA'].map(s => ({
      Semaforo: s, Items: items.filter(i => i.semaforo === s).length,
    }));
    const resumen = [
      { Campo: 'Informe', Valor: informe.numero },
      { Campo: 'Fecha', Valor: informe.fecha },
      { Campo: 'Bodega', Valor: informe.bodega || '—' },
      { Campo: 'Analista', Valor: informe.analista_nombre || '—' },
      { Campo: 'Estado', Valor: informe.estado },
      { Campo: 'Total ítems', Valor: items.length },
      { Campo: 'Dictaminados', Valor: items.filter(i => i.dictamen).length },
      ...porSemaforo.map(r => ({ Campo: `Semáforo ${r.Semaforo}`, Valor: r.Items })),
    ];
    exportToExcel({
      filename: `Monitoreo_${informe.numero}`,
      sheets: [{ name: 'Resumen', rows: resumen }, { name: 'Detalle', rows: detalle }],
    });
  };

  const pendientes = useMemo(() => items.filter(i => !i.dictamen).length, [items]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{informe.numero}</h2>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${ESTADO_INFORME_CLS[informe.estado] || ''}`}>
                {informe.estado?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {informe.fecha} · {informe.bodega || 'Sin bodega'} · {informe.analista_nombre || '—'} · {pendientes} pendientes
            </p>
          </div>
        </div>
        <button onClick={exportar} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700">
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {items.map(it => {
            const f = dictForm[it.id] || {};
            const def = DICTAMENES.find(d => d.id === f.dictamen);
            return (
              <div key={it.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_CLS[it.semaforo] || 'bg-slate-300'}`} />
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{it.codigo_producto}</span>
                    <span className="text-slate-600 truncate">{it.producto}</span>
                    <span className="text-[10px] text-slate-400">lote {it.partida || '—'} · {it.ubicacion || 's/ubic'} · {it.cantidad} uds</span>
                  </div>
                  {it.dictamen ? (
                    <div className="flex items-center gap-2">
                      <CalidadBadge estado={def_estado(it.dictamen)} />
                      <span className="text-xs font-bold text-slate-500">
                        {it.dictamen}{it.bodega_destino ? ` → BD ${it.bodega_destino}` : ''} · {it.calidad_nombre}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Condición: <b className="text-slate-700">{it.condicion_observada || '—'}</b></span>
                  <span>Motivo: <b className="text-slate-700">{it.motivo || '—'}</b></span>
                  {it.observaciones && <span>Obs: <b className="text-slate-700">{it.observaciones}</b></span>}
                </div>

                {canDictar && !it.dictamen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dictamen</label>
                      <select value={f.dictamen || ''} onChange={e => setForm(it.id, { dictamen: e.target.value })}
                        className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400">
                        <option value="">— Elegir —</option>
                        {DICTAMENES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </div>
                    {def?.mueve && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bodega destino</label>
                        <select value={f.bodegaDestino || ''} onChange={e => setForm(it.id, { bodegaDestino: e.target.value })}
                          className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400">
                          <option value="">— Elegir —</option>
                          {BODEGAS_DESTINO.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acuse / nota</label>
                      <input value={f.acuse || ''} onChange={e => setForm(it.id, { acuse: e.target.value })}
                        placeholder="Justificación del dictamen"
                        className="block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
                    </div>
                    <button onClick={() => enviarDictamen(it)} disabled={dictaminar.isPending}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50">
                      <ShieldCheck size={16} /> Dictaminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canDictar && informe.estado === 'ENVIADO_CALIDAD' && pendientes === 0 && items.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={async () => {
              try { await actualizarEstado.mutateAsync({ informeId: informe.id, estado: 'DICTAMINADO' }); toast.success('Informe marcado como dictaminado'); onBack(); }
              catch (e) { toast.error(e.message); }
            }}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700">
            <CheckCircle2 size={16} /> Cerrar dictamen del informe
          </button>
        </div>
      )}
    </div>
  );
};

// Mapeo auxiliar dictamen → estado de calidad (para el badge en detalle).
function def_estado(dictamen) {
  const d = DICTAMENES.find(x => x.id === dictamen);
  return d?.estado || 'LIBERADO';
}

// ── Página principal ────────────────────────────────────────────────────────
const Monitoreo = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('manage_monitoreo') || hasPermission('manage_quality');
  const { data: informes = [], isLoading } = useInformes();
  const [mode, setMode] = useState('list'); // list | new | detail
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (mode === 'detail' && selected) {
      const fresh = informes.find(i => i.id === selected.id);
      if (fresh) setSelected(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informes]);

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <ClipboardCheck size={30} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Monitoreo a <span className="text-emerald-600">Calidad</span></h1>
            <p className="text-slate-500 font-bold text-sm">Informes de inventario, dictámenes y estado de producto</p>
          </div>
        </div>
        {mode === 'list' && canCreate && (
          <button onClick={() => setMode('new')}
            className="px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
            <Plus size={22} /> Nuevo Informe
          </button>
        )}
      </div>

      {mode === 'new' && (
        <InformeBuilder onCancel={() => setMode('list')} onSaved={() => setMode('list')} />
      )}

      {mode === 'detail' && selected && (
        <InformeDetail informe={selected} onBack={() => { setMode('list'); setSelected(null); }} />
      )}

      {mode === 'list' && (
        isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>
        ) : informes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileSearch size={44} className="text-slate-200 mb-4" />
            <h3 className="text-base font-bold text-slate-400">Sin informes de monitoreo</h3>
            <p className="text-xs text-slate-300">{canCreate ? 'Crea el primero con “Nuevo Informe”.' : 'Aún no hay informes generados.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {informes.map(inf => (
              <button key={inf.id} onClick={() => { setSelected(inf); setMode('detail'); }}
                className="text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-slate-900">{inf.numero}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${ESTADO_INFORME_CLS[inf.estado] || ''}`}>
                    {inf.estado?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{inf.fecha} · {inf.bodega || 'Sin bodega'}</p>
                <p className="text-xs text-slate-400 mt-1">{inf.analista_nombre || '—'} · {inf.total_items} ítems · {inf.periodicidad}</p>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Monitoreo;
