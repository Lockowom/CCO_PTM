import { d as f, u, c as _ } from './query-vendor-BNjBrM5A.js';
import { s as r, u as v, L as h, w as A } from './index-Cl3qi7_W.js';
const C = () => {
    var e;
    return (e = globalThis.crypto) != null && e.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },
  G = [
    { id: 'LIBERAR', label: 'Liberar', estado: 'LIBERADO', mueve: !1 },
    { id: 'CUARENTENA', label: 'Cuarentena', estado: 'CUARENTENA', mueve: !0 },
    { id: 'REPROCESO', label: 'Reproceso', estado: 'EN_AUDITORIA', mueve: !0 },
    { id: 'RECHAZAR', label: 'Rechazar', estado: 'MALO', mueve: !0 },
    { id: 'BAJA', label: 'Baja', estado: 'MALO', mueve: !0 }
  ],
  j = [
    { id: '5', label: 'BD 5 — Servicio Técnico' },
    { id: '99', label: 'BD 99 — Basura / Baja definitiva' }
  ],
  k = [
    'OK',
    'Próximo a vencer',
    'Vencido',
    'Daño de empaque',
    'Daño de producto',
    'Faltante',
    'Sobrante',
    'Sin rotación'
  ],
  Q = {
    EN_AUDITORIA: { label: 'En Auditoría', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    CUARENTENA: { label: 'Cuarentena', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    MALO: { label: 'Malo', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    LIBERADO: { label: 'Liberado', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  };
function S() {
  const { user: e, loading: o, hasPermission: a } = v(),
    t =
      (e == null ? void 0 : e.rol) === 'ADMIN' ||
      (e == null ? void 0 : e.es_admin_delegado) === !0 ||
      ['manage_quality', 'manage_monitoreo', 'view_acciones_calidad', 'manage_inventory'].some(
        (n) => a(n)
      );
  return !o && t;
}
function N(e) {
  const o = typeof e == 'string' ? e.trim() : e;
  return o === '' ? null : (o ?? null);
}
function w(e = {}) {
  return {
    ...e,
    fecha: N(e.fecha),
    periodo_desde: N(e.periodo_desde),
    periodo_hasta: N(e.periodo_hasta)
  };
}
function R(e) {
  const o = String((e == null ? void 0 : e.code) || '').trim(),
    a = String((e == null ? void 0 : e.message) || '').toLowerCase();
  return (
    o === '42501' ||
    a.includes('permission denied') ||
    a.includes('row-level security') ||
    a.includes('not allowed')
  );
}
function V() {
  const e = S();
  return f({
    queryKey: ['monitoreo_informes'],
    enabled: e,
    meta: {
      module: 'quality',
      action: 'monitoreo_informes_query',
      table: 'tms_monitoreo_informes'
    },
    queryFn: async () => {
      const { data: o, error: a } = await A(
        r.from('tms_monitoreo_informes').select('*').order('created_at', { ascending: !1 }),
        { ms: 12e3, label: 'informes de monitoreo' }
      );
      if (a) throw a;
      return o || [];
    }
  });
}
function z(e) {
  return f({
    queryKey: ['monitoreo_items', e],
    enabled: !!e,
    meta: { module: 'quality', action: 'monitoreo_items_query', table: 'tms_monitoreo_items' },
    queryFn: async () => {
      const { data: o, error: a } = await A(
        r
          .from('tms_monitoreo_items')
          .select('*')
          .eq('informe_id', e)
          .order('created_at', { ascending: !0 }),
        { ms: 12e3, label: 'ítems del informe' }
      );
      if (a) throw a;
      return o || [];
    }
  });
}
async function $(e, o = !1) {
  const a = new AbortController(),
    i = setTimeout(() => a.abort(), 15e3);
  try {
    const { data: t, error: n } = await r
      .rpc('monitoreo_candidatos', { p_query: e || '', p_solo_vencimiento: o })
      .abortSignal(a.signal);
    if (n) throw n;
    return t || [];
  } catch (t) {
    throw (t == null ? void 0 : t.name) === 'AbortError' || a.signal.aborted
      ? new Error(
          'La búsqueda tardó demasiado (timeout 15s). Revisa tu conexión e inténtalo de nuevo.'
        )
      : t;
  } finally {
    clearTimeout(i);
  }
}
async function J(e, o = '') {
  const { data: a, error: i } = await r.rpc('calidad_lotes_series', {
    p_codigo: e,
    p_query: o || '',
    p_limit: 300
  });
  if (i) throw i;
  return a || [];
}
async function D({ title: e, body: o, payload: a }) {
  try {
    await r.functions.invoke('notify-inventario', {
      body: { rol: 'ADMIN', title: e, body: o, payload: a || {} }
    });
  } catch (i) {
    h.error(i, {
      module: 'quality',
      screen: 'calidadService',
      action: 'push_admin_inventario',
      message: 'Fallo el envio push de Calidad a ADMIN',
      payload: { title: e, hasPayload: !!a }
    });
  }
}
function H(e, o) {
  return D({
    title: '🚨 SKU no registrado en auditoría',
    body: `${e} SKU no registrado(s) hallados en auditoría de Calidad. Requieren alta/ajuste por Inventario.`,
    payload: { informe_id: o, tipo: 'CALIDAD_NO_REGISTRADO' }
  });
}
function Y({ codigo: e, ubicacion: o, estadoLabel: a, tipo: i }) {
  return D({
    title: `⚠️ Calidad: ${a}`,
    body: `${e}${o ? ` en ${o}` : ''} dictaminado como ${a}. Requiere movimiento/gestión por Inventario.`,
    payload: { codigo_producto: e, ubicacion: o || '', tipo: i }
  });
}
async function W(e) {
  const { data: o, error: a } = await r.rpc('monitoreo_marcar_preliminar', { p_informe_id: e });
  if (a) throw a;
  return o;
}
function X() {
  const e = u();
  return _({
    mutationFn: async ({ cabecera: o, items: a }) => {
      const { data: i, error: t } = await r.rpc('crear_informe_monitoreo', {
        p_cabecera: w(o),
        p_items: a
      });
      if (t) throw t;
      return i;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['monitoreo_informes'] })
  });
}
function Z() {
  const e = u();
  return _({
    mutationFn: async ({ informeId: o, estado: a }) => {
      const { error: i } = await r.from('tms_monitoreo_informes').update({ estado: a }).eq('id', o);
      if (i) throw i;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['monitoreo_informes'] })
  });
}
function ee() {
  const e = u();
  return _({
    mutationFn: async ({ informeId: o, cabecera: a, items: i }) => {
      const { data: t, error: n } = await r.rpc('actualizar_informe_monitoreo', {
        p_informe_id: o,
        p_cabecera: w(a),
        p_items: i
      });
      if (n) throw n;
      return t;
    },
    onSuccess: (o, a) => {
      (e.invalidateQueries({ queryKey: ['monitoreo_informes'] }),
        e.invalidateQueries({ queryKey: ['monitoreo_items', a.informeId] }));
    }
  });
}
function ae() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { error: a } = await r.from('tms_monitoreo_informes').delete().eq('id', o);
      if (a) throw a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['monitoreo_informes'] })
  });
}
const oe = [
  'Informe de No Conformidad / Daño en Transporte',
  'Daño en Recepción',
  'Daño en Almacenamiento',
  'Daño por Manipulación',
  'Producto Vencido / Deteriorado'
];
function ie() {
  const e = u();
  return _({
    mutationFn: async ({ informeId: o, cabecera: a, reporte: i, hallazgos: t }) => {
      let n = o;
      if (n) {
        const { error: s } = await r
          .from('tms_monitoreo_informes')
          .update({ ...a, reporte: i, total_items: t.length })
          .eq('id', n);
        if (s) throw s;
      } else {
        const { data: s, error: p } = await r.rpc('monitoreo_next_numero');
        if (p) throw p;
        const { data: E, error: b } = await r
          .from('tms_monitoreo_informes')
          .insert({ ...a, numero: s, tipo_informe: 'DANOS', reporte: i, total_items: t.length })
          .select()
          .single();
        if (b) throw b;
        n = E.id;
      }
      const { data: c } = await r.from('tms_monitoreo_items').select('id').eq('informe_id', n),
        l = new Set((c || []).map((s) => s.id)),
        d = new Set(),
        m = [];
      for (const s of t) {
        const p = {
          codigo_producto: s.codigo_producto || '',
          partida: s.partida || '',
          ubicacion: s.ubicacion || '',
          producto: s.producto || '',
          unidad_medida: s.unidad_medida || '',
          cantidad: Number(s.cantidad) || 0,
          estado_inventario: s.estado_inventario || 'Disponible',
          tipo: s.tipo || 'NO_PERECIBLE',
          semaforo: s.semaforo || 'NA',
          condicion_observada: s.condicion_observada || 'Daño de producto',
          motivo: s.motivo || 'Hallazgo',
          observaciones: s.observaciones || '',
          tipo_dano: s.tipo_dano || '',
          componente_afectado: s.componente_afectado || '',
          consecuencia: s.consecuencia || ''
        };
        if (s.id && l.has(s.id)) {
          const { error: E } = await r.from('tms_monitoreo_items').update(p).eq('id', s.id);
          if (E) throw E;
          (d.add(s.id), m.push({ ...s, id: s.id }));
        } else {
          const { data: E, error: b } = await r
            .from('tms_monitoreo_items')
            .insert({ ...p, informe_id: n })
            .select('id')
            .single();
          if (b) throw b;
          (d.add(E.id), m.push({ ...s, id: E.id }));
        }
      }
      const y = [...l].filter((s) => !d.has(s));
      if (y.length) {
        const { data: s } = await r
            .from('tms_monitoreo_evidencias')
            .select('storage_path')
            .in('item_id', y),
          p = (s || []).map((b) => b.storage_path).filter(Boolean);
        p.length && (await r.storage.from(g).remove(p));
        const { error: E } = await r.from('tms_monitoreo_items').delete().in('id', y);
        if (E) throw E;
      }
      return { id: n, hallazgos: m };
    },
    onSuccess: (o) => {
      (e.invalidateQueries({ queryKey: ['monitoreo_informes'] }),
        e.invalidateQueries({ queryKey: ['monitoreo_items', o == null ? void 0 : o.id] }));
    }
  });
}
const g = 'monitoreo-evidencias';
function te(e) {
  return f({
    queryKey: ['monitoreo_evidencias', e],
    enabled: !!e,
    queryFn: async () => {
      const { data: o, error: a } = await r
        .from('tms_monitoreo_evidencias')
        .select('*')
        .eq('informe_id', e)
        .order('orden', { ascending: !0 })
        .order('created_at', { ascending: !0 });
      if (a) throw a;
      return o || [];
    }
  });
}
async function re({ informeId: e, itemId: o, blob: a, descripcion: i, user: t }) {
  if ((a == null ? void 0 : a.size) > 7864320)
    throw new Error(
      'La foto pesa demasiado y no se pudo comprimir en este navegador. Prueba con otra foto (JPG/PNG).'
    );
  const c = a != null && a.type && a.type.startsWith('image/') ? a.type : 'image/jpeg',
    l =
      {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/heic': 'heic',
        'image/gif': 'gif'
      }[c] || 'jpg',
    d = `${e}/${o || 'general'}/${C()}.${l}`,
    { error: m } = await r.storage.from(g).upload(d, a, { contentType: c, upsert: !1 });
  if (m) throw m;
  const { data: y } = r.storage.from(g).getPublicUrl(d),
    { data: s, error: p } = await r
      .from('tms_monitoreo_evidencias')
      .insert({
        informe_id: e,
        item_id: o || null,
        imagen_url: y.publicUrl,
        storage_path: d,
        descripcion: i || null,
        creado_por: (t == null ? void 0 : t.id) || null,
        creado_nombre: (t == null ? void 0 : t.nombre) || null
      })
      .select()
      .single();
  if (p) throw (await r.storage.from(g).remove([d]), p);
  return s;
}
async function ne(e) {
  const { error: o } = await r.storage.from(g).remove([e.storage_path]);
  if (o) throw new Error(`No se pudo borrar la imagen del almacenamiento: ${o.message}`);
  const { error: a } = await r.from('tms_monitoreo_evidencias').delete().eq('id', e.id);
  if (a) throw a;
}
function se() {
  const e = u();
  return _({
    mutationFn: async ({
      itemId: o,
      dictamen: a,
      bodegaDestino: i,
      accion: t,
      fechaLimite: n,
      acuse: c
    }) => {
      const { data: l, error: d } = await r.rpc('monitoreo_dictaminar', {
        p_item_id: o,
        p_dictamen: a,
        p_bodega_destino: i || null,
        p_accion: t || null,
        p_fecha_limite: n || null,
        p_acuse: c || null
      });
      if (d) throw d;
      return l;
    },
    onSuccess: (o, a) => {
      (e.invalidateQueries({ queryKey: ['monitoreo_items'] }),
        e.invalidateQueries({ queryKey: ['calidad_flags'] }));
    }
  });
}
const T = [
  {
    nivel: 1,
    titulo: 'Nivel 1 — Revisión documental (Packing List)',
    params: [
      { id: 'pl_adjunto', label: 'Packing list / factura adjunta y legible' },
      { id: 'pl_proveedor_oc', label: 'Proveedor y OC coinciden con lo esperado' },
      { id: 'pl_cantidad', label: 'Cantidad recibida coincide con la declarada (packing list)' },
      { id: 'pl_lote_serie', label: 'Lote/serie identificado y documentado' },
      { id: 'pl_vencimiento', label: 'Fecha de vencimiento vigente y registrada' },
      {
        id: 'pl_registro_sanitario',
        label: 'Registro sanitario / certificado del producto disponible'
      },
      {
        id: 'pl_cadena_frio',
        label: 'Condiciones de transporte / cadena de frío documentadas (si aplica)'
      }
    ]
  },
  {
    nivel: 2,
    titulo: 'Nivel 2 — Inspección física de embalajes',
    params: [
      {
        id: 'fis_embalaje',
        label: 'Embalaje externo íntegro (sin golpes, roturas o aplastamiento)'
      },
      { id: 'fis_sellos', label: 'Sellos / precintos íntegros' },
      { id: 'fis_humedad', label: 'Sin señales de humedad o mojado' },
      {
        id: 'fis_etiquetado',
        label: 'Etiquetado correcto y legible (producto, lote, vencimiento)'
      },
      { id: 'fis_bultos', label: 'N° de bultos coincide con lo declarado' },
      { id: 'fis_dano_visible', label: 'Producto sin daño visible' },
      { id: 'fis_empaque_primario', label: 'Empaque primario / unidades de venta en buen estado' }
    ]
  }
];
T.flatMap((e) => e.params);
const ce = {
  EQUIPO_ACTIVO: { cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  INSUMO_ESTERIL: { cls: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  MOBILIARIO: { cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  AYUDA_TECNICA: { cls: 'bg-lime-100 text-lime-700 border-lime-200' },
  BIENESTAR: { cls: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  EMPAQUE: { cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  SIN_CLASIFICAR: { cls: 'bg-rose-100 text-rose-700 border-rose-200' }
};
function de(e) {
  return f({
    queryKey: ['calidad_categorias_tarea', e],
    enabled: !!e,
    staleTime: 6e4,
    queryFn: async () => {
      const { data: o, error: a } = await r.rpc('calidad_categorias_tarea', { p_tarea_id: e });
      if (a) throw a;
      return o || { categorias: [], total_items: 0 };
    }
  });
}
async function le(e) {
  const { data: o, error: a } = await r.rpc('calidad_cargar_clasificacion', { p_rows: e });
  if (a) throw a;
  return o;
}
async function ue() {
  const { data: e, error: o } = await r.rpc('calidad_reclasificar_recepciones');
  if (o) throw o;
  return e;
}
const _e = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  EN_PROCESO: { label: 'En proceso', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  CONFORME: { label: 'Conforme', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  NO_CONFORME: { label: 'No conforme', cls: 'bg-rose-100 text-rose-700 border-rose-200' }
};
function q() {
  const e = S();
  return f({
    queryKey: ['calidad_tareas'],
    enabled: e,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: !0,
    refetchInterval: 2e4,
    refetchIntervalInBackground: !1,
    retry: !1,
    meta: { module: 'quality', action: 'calidad_tareas_query', table: 'tms_calidad_tareas' },
    queryFn: async () => {
      try {
        const { data: o, error: a } = await A(
          r
            .from('tms_calidad_tareas')
            .select('*')
            .eq('tipo', 'CHECKLIST_INGRESO')
            .order('created_at', { ascending: !1 }),
          { ms: 12e3, label: 'tareas de checklist' }
        );
        if (a) throw a;
        const i = { PENDIENTE: 0, EN_PROCESO: 1, NO_CONFORME: 2, CONFORME: 3 };
        return (o || []).sort((t, n) => (i[t.estado] ?? 9) - (i[n.estado] ?? 9));
      } catch (o) {
        if (R(o))
          return (
            h.warn(o, {
              module: 'quality',
              screen: 'ChecklistIngreso',
              action: 'calidad_tareas_query_denied',
              message: 'Lectura de tareas de checklist bloqueada por permisos o RLS',
              context: { table: 'tms_calidad_tareas', tipo: 'CHECKLIST_INGRESO' },
              persist: !1
            }),
            []
          );
        throw o;
      }
    }
  });
}
function me() {
  const { data: e = [] } = q();
  return e.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length;
}
function pe() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('firmar_certificado', { p_tarea_id: o });
      if (i) throw i;
      return a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_tareas'] })
  });
}
async function fe(e) {
  const { data: o, error: a } = await r.rpc('verificar_certificado', { p_folio: e });
  if (a) throw a;
  return o;
}
const Ee = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  EN_PROCESO: { label: 'En proceso', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  RESUELTA: { label: 'Resuelta', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ANULADA: { label: 'Anulada', cls: 'bg-slate-100 text-slate-500 border-slate-200' }
};
function P() {
  const e = S();
  return f({
    queryKey: ['calidad_asignaciones'],
    enabled: e,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: !0,
    refetchInterval: 2e4,
    refetchIntervalInBackground: !1,
    meta: {
      module: 'quality',
      action: 'calidad_asignaciones_query',
      table: 'tms_calidad_asignaciones'
    },
    queryFn: async () => {
      const { data: o, error: a } = await A(
        r.from('tms_calidad_asignaciones').select('*').order('created_at', { ascending: !1 }),
        { ms: 12e3, label: 'asignaciones de calidad' }
      );
      if (a) throw a;
      const i = { PENDIENTE: 0, EN_PROCESO: 1, RESUELTA: 2, ANULADA: 3 };
      return (o || []).sort((t, n) => (i[t.estado] ?? 9) - (i[n.estado] ?? 9));
    }
  });
}
function ge() {
  const { data: e = [] } = P();
  return e.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length;
}
function be() {
  const e = u();
  return _({
    mutationFn: async ({ skus: o, motivo: a, prioridad: i }) => {
      const { data: t, error: n } = await r.rpc('crear_asignacion_calidad', {
        p_skus: o || [],
        p_motivo: a ?? null,
        p_prioridad: i || 'NORMAL'
      });
      if (n) throw n;
      return t;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_asignaciones'] })
  });
}
function Ae() {
  const e = u();
  return _({
    mutationFn: async ({ asignacionId: o, informeId: a, estado: i }) => {
      const { data: t, error: n } = await r.rpc('resolver_asignacion_calidad', {
        p_asignacion_id: o,
        p_informe_id: a ?? null,
        p_estado: i || 'RESUELTA'
      });
      if (n) throw n;
      return t;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_asignaciones'] })
  });
}
function ye() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('anular_asignacion_calidad', {
        p_asignacion_id: o
      });
      if (i) throw i;
      return a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_asignaciones'] })
  });
}
const L = [
    {
      nivel: 1,
      titulo: 'Nivel 1 — Documentación de salida',
      params: [
        { id: 'sal_nv', label: 'Nota de Venta / pedido coincide con lo preparado' },
        { id: 'sal_factura', label: 'Factura / guía de despacho emitida y adjunta' },
        { id: 'sal_cliente', label: 'Cliente y dirección de destino correctos' },
        { id: 'sal_transportista', label: 'Transportista / empresa de transporte asignada' }
      ]
    },
    {
      nivel: 2,
      titulo: 'Nivel 2 — Verificación física de la carga',
      params: [
        { id: 'sal_producto', label: 'Producto despachado coincide con la NV (SKU y descripción)' },
        { id: 'sal_cantidad', label: 'Cantidades coinciden con la NV' },
        { id: 'sal_lote_serie', label: 'Lote/serie registrado para trazabilidad de salida' },
        { id: 'sal_embalaje', label: 'Embalaje de salida íntegro y adecuado para transporte' },
        { id: 'sal_rotulado', label: 'Rotulado / etiqueta de despacho correcta' },
        { id: 'sal_bultos', label: 'N° de bultos coincide con la guía' },
        {
          id: 'sal_condiciones',
          label: 'Condiciones de transporte adecuadas (cadena de frío si aplica)'
        }
      ]
    },
    {
      nivel: 3,
      titulo: 'Nivel 3 — Trazabilidad del producto',
      params: [
        { id: 'sal_tz_lote', label: 'SKU corresponde al lote/partida despachado' },
        { id: 'sal_tz_serie', label: 'Serie coincide (si aplica)' },
        { id: 'sal_tz_venc', label: 'Fecha de vencimiento validada' },
        { id: 'sal_tz_bloqueo', label: 'Producto no posee bloqueo de calidad' },
        { id: 'sal_tz_cuarentena', label: 'Producto no posee cuarentena vigente' },
        { id: 'sal_tz_liberado', label: 'Producto fue liberado para despacho' }
      ]
    }
  ],
  Oe = L.flatMap((e) => e.params),
  Ie = [
    'Retener / no despachar',
    'Reacondicionar y reinspeccionar',
    'Corregir documentación',
    'Despachar con salvedades (autorizado)'
  ],
  Se = [
    { id: 'BEBES_Y_MATERNAL', label: 'Bebés y Maternal' },
    { id: 'CUIDADO_HERIDAS', label: 'Cuidado Heridas' },
    { id: 'DEPORTE_Y_SALUD', label: 'Deporte y Salud' },
    { id: 'EQUIPOS_DE_DIAGNOSTICO', label: 'Equipos de Diagnóstico' },
    { id: 'EQUIPOS_MEDICOS', label: 'Equipos Médicos' },
    { id: 'HOME_CARE', label: 'Home Care' },
    { id: 'IMPOPLANET', label: 'Impoplanet' },
    { id: 'INSTRUMENTAL_QUIRURGICO', label: 'Instrumental Quirúrgico' },
    { id: 'INSUMOS_MEDICOS', label: 'Insumos Médicos' },
    { id: 'KINESIOLOGIA', label: 'Kinesiología' },
    { id: 'MATERIAS_PRIMA', label: 'Materias Prima' },
    { id: 'MOVILIDAD', label: 'Movilidad' },
    { id: 'MUEBLES_CLINICOS', label: 'Muebles Clínicos' },
    { id: 'ODONTOLOGIA', label: 'Odontología' },
    { id: 'ORTOPEDIA_Y_TRAUMATOLOGIA', label: 'Ortopedia y Traumatología' },
    { id: 'OSTOMIA', label: 'Ostomía' },
    { id: 'PODOLOGIA', label: 'Podología' },
    { id: 'PRODUCTOS_BEURER', label: 'Productos Beurer' },
    { id: 'PSICOMOTRICIDAD', label: 'Psicomotricidad' },
    { id: 'PUBLICIDAD', label: 'Publicidad' },
    { id: 'RESCATE', label: 'Rescate' },
    { id: 'VARIOS', label: 'Varios' }
  ],
  I = 'No aplica',
  Ne = [
    {
      id: 'pallet',
      label: 'Estado del pallet',
      opciones: ['Excelente', 'Bueno', 'Regular', 'Malo', I]
    },
    { id: 'film', label: 'Film stretch', opciones: ['Correcto', 'Incorrecto', I] },
    { id: 'golpes', label: 'Golpes visibles', opciones: ['No', 'Sí'] },
    { id: 'deformada', label: 'Caja deformada', opciones: ['No', 'Sí'] },
    { id: 'humedad', label: 'Humedad', opciones: ['No', 'Sí'] }
  ],
  he = {
    conforme: { pallet: 'Bueno', film: 'Correcto', golpes: 'No', deformada: 'No', humedad: 'No' },
    sinPallet: { pallet: I, film: I, golpes: 'No', deformada: 'No', humedad: 'No' }
  },
  Ce = [
    'Recepción aceptada',
    'Recepción parcial',
    'Cuarentena',
    'Rechazo proveedor',
    'Devuelto',
    'Pendiente evaluación'
  ],
  we = ['Documento', 'Conteo', 'Inspección visual', 'Medición', 'Registro fotográfico', 'Sistema'],
  M = {
    BAJO: {
      emoji: '🟢',
      label: 'RIESGO BAJO',
      color: '#047857',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    MEDIO: {
      emoji: '🟠',
      label: 'RIESGO MEDIO',
      color: '#c2410c',
      cls: 'bg-orange-100 text-orange-800 border-orange-300'
    },
    ALTO: {
      emoji: '🔴',
      label: 'RIESGO ALTO',
      color: '#be123c',
      cls: 'bg-rose-100 text-rose-800 border-rose-300'
    }
  };
function Re(e) {
  const a = ((e || {})._extras || {}).embalaje || {};
  let i = 0;
  (a.pallet === 'Malo' ? (i += 2) : a.pallet === 'Regular' && (i += 1),
    a.film === 'Incorrecto' && (i += 1),
    ['golpes', 'deformada', 'humedad'].forEach((n) => {
      a[n] === 'Sí' && (i += 2);
    }),
    Object.entries(e || {}).forEach(([n, c]) => {
      n !== '_extras' && (c == null ? void 0 : c.estado) === 'NO' && (i += 2);
    }));
  const t = i >= 4 ? 'ALTO' : i >= 1 ? 'MEDIO' : 'BAJO';
  return { key: t, score: i, ...M[t] };
}
function De(e) {
  const o = (e == null ? void 0 : e.checklist) || {};
  let a = 0,
    i = 0,
    t = 0;
  Object.entries(o).forEach(([d, m]) => {
    d !== '_extras' &&
      ((m == null ? void 0 : m.estado) === 'OK'
        ? (a += 1)
        : (m == null ? void 0 : m.estado) === 'NO'
          ? (i += 1)
          : (m == null ? void 0 : m.estado) === 'NA' && (t += 1));
  });
  const n = a + i,
    c = e != null && e.created_at ? new Date(e.created_at) : null,
    l = e != null && e.completado_en ? new Date(e.completado_en) : null;
  return {
    items: a + i + t,
    ok: a,
    no: i,
    na: t,
    pct: n ? Math.round((a / n) * 1e3) / 10 : null,
    minutos: c && l ? Math.max(0, Math.round((l - c) / 6e4)) : null,
    inspector: (e == null ? void 0 : e.realizado_nombre) || null
  };
}
const ve = [
    { id: 'ESTERIL', label: 'Producto estéril' },
    { id: 'FRAGIL', label: 'Producto frágil' },
    { id: 'VERTICAL', label: 'Mantener vertical' },
    { id: 'NO_APILAR', label: 'No apilar' },
    { id: 'FRIO', label: 'Cadena de frío' },
    { id: 'PELIGROSO', label: 'Material peligroso' },
    { id: 'NINGUNO', label: 'Ninguno' }
  ],
  Te = [
    { id: 'PALLET', label: 'Foto del pallet' },
    { id: 'EMBALAJE', label: 'Foto del embalaje' },
    { id: 'CAMION', label: 'Foto dentro del camión' }
  ],
  F = 0.02,
  qe = (e, o) => {
    const a = Number(String(e ?? '').replace(',', '.')),
      i = Number(String(o ?? '').replace(',', '.'));
    return !Number.isFinite(a) || !Number.isFinite(i) || a <= 0
      ? null
      : Math.abs(i - a) / a <= F
        ? 'CONFORME'
        : 'REVISAR';
  },
  O = {
    VERDE: {
      emoji: '🟢',
      label: 'LIBERADO PARA DESPACHO',
      color: '#047857',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    NARANJA: {
      emoji: '🟠',
      label: 'DESPACHO CON OBSERVACIONES',
      color: '#c2410c',
      cls: 'bg-orange-100 text-orange-800 border-orange-300'
    },
    ROJO: {
      emoji: '🔴',
      label: 'NO DESPACHAR',
      color: '#be123c',
      cls: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    PENDIENTE: {
      emoji: '⚪',
      label: 'EN EVALUACIÓN',
      color: '#64748b',
      cls: 'bg-slate-100 text-slate-600 border-slate-300'
    }
  };
function Pe(e) {
  return (e == null ? void 0 : e.resultado) === 'CONFORME'
    ? { key: 'VERDE', ...O.VERDE }
    : (e == null ? void 0 : e.resultado) === 'NO_CONFORME'
      ? (e.disposicion || '') === 'Despachar con salvedades (autorizado)'
        ? { key: 'NARANJA', ...O.NARANJA }
        : { key: 'ROJO', ...O.ROJO }
      : { key: 'PENDIENTE', ...O.PENDIENTE };
}
async function Le({ tareaId: e, tipo: o, blob: a }) {
  if ((a == null ? void 0 : a.size) > 7864320)
    throw new Error('La foto pesa demasiado y no se pudo comprimir. Prueba con otra (JPG/PNG).');
  const t = a != null && a.type && a.type.startsWith('image/') ? a.type : 'image/jpeg',
    n =
      {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/heic': 'heic',
        'image/gif': 'gif'
      }[t] || 'jpg',
    c = `salida/${e}/${o.toLowerCase()}-${C()}.${n}`,
    { error: l } = await r.storage.from(g).upload(c, a, { contentType: t, upsert: !1 });
  if (l) throw l;
  return c;
}
async function Me(e) {
  const { error: o } = await r.storage.from(g).remove([e]);
  if (o) throw o;
}
const Fe = [
  { id: 'PRODUCTO', label: 'Producto' },
  { id: 'EMBALAJE', label: 'Embalaje / Pallet' },
  { id: 'DOCUMENTO', label: 'Documentación' },
  { id: 'GENERAL', label: 'General' }
];
async function xe({ tareaId: e, tipo: o, blob: a }) {
  if ((a == null ? void 0 : a.size) > 7864320)
    throw new Error('La foto pesa demasiado y no se pudo comprimir. Prueba con otra (JPG/PNG).');
  const t = a != null && a.type && a.type.startsWith('image/') ? a.type : 'image/jpeg',
    n =
      {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/heic': 'heic',
        'image/gif': 'gif'
      }[t] || 'jpg',
    c = `ingreso/${e}/${String(o).toLowerCase()}-${C()}.${n}`,
    { error: l } = await r.storage.from(g).upload(c, a, { contentType: t, upsert: !1 });
  if (l) throw l;
  return c;
}
function x() {
  const e = S();
  return f({
    queryKey: ['calidad_tareas_salida'],
    enabled: e,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: !0,
    refetchInterval: 2e4,
    refetchIntervalInBackground: !1,
    retry: !1,
    meta: { module: 'quality', action: 'calidad_tareas_salida_query', table: 'tms_calidad_tareas' },
    queryFn: async () => {
      try {
        const { data: o, error: a } = await A(
          r
            .from('tms_calidad_tareas')
            .select('*')
            .eq('tipo', 'CERTIFICADO_SALIDA')
            .order('created_at', { ascending: !1 }),
          { ms: 12e3, label: 'certificaciones de salida' }
        );
        if (a) throw a;
        const i = { PENDIENTE: 0, EN_PROCESO: 1, NO_CONFORME: 2, CONFORME: 3 };
        return (o || []).sort((t, n) => (i[t.estado] ?? 9) - (i[n.estado] ?? 9));
      } catch (o) {
        if (R(o))
          return (
            h.warn(o, {
              module: 'quality',
              screen: 'SalidaCertificacion',
              action: 'calidad_tareas_salida_query_denied',
              message: 'Lectura de certificaciones de salida bloqueada por permisos o RLS',
              context: { table: 'tms_calidad_tareas', tipo: 'CERTIFICADO_SALIDA' },
              persist: !1
            }),
            []
          );
        throw o;
      }
    }
  });
}
function Be() {
  const { data: e = [] } = x();
  return e.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length;
}
function Ke() {
  const e = u();
  return _({
    mutationFn: async ({
      nv: o,
      skus: a,
      cliente: i,
      guia: t,
      factura: n,
      transportista: c,
      bultos: l
    }) => {
      const { data: d, error: m } = await r.rpc('crear_tarea_salida_manual', {
        p_nv: o,
        p_skus: a || [],
        p_cliente: i ?? null,
        p_guia: t ?? null,
        p_factura: n ?? null,
        p_transportista: c ?? null,
        p_bultos: l ?? null
      });
      if (m) throw m;
      return d;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_tareas_salida'] })
  });
}
function Ue() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('eliminar_tarea_calidad', { p_tarea_id: o });
      if (i) throw i;
      return a;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ['calidad_tareas'] }),
        e.invalidateQueries({ queryKey: ['calidad_tareas_salida'] }));
    }
  });
}
function Ge() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('eliminar_asignacion_calidad', {
        p_asignacion_id: o
      });
      if (i) throw i;
      return a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_asignaciones'] })
  });
}
const je = [
    { id: 'AJUSTE', label: 'Ajuste de inventario', area: 'BODEGA' },
    { id: 'BAJA', label: 'Dar de baja', area: 'BODEGA' },
    { id: 'TRANSITORIO', label: 'Enviar a transitorio', area: 'BODEGA' },
    { id: 'REACONDICIONAR', label: 'Reacondicionar / reproceso', area: 'BODEGA' },
    { id: 'POST_VENTA', label: 'Post-venta', area: 'VENTAS' },
    { id: 'REPARACION', label: 'Reparación / servicio técnico', area: 'CALIDAD' },
    { id: 'OPINION_EXPERTA', label: 'Opinión experta', area: 'CALIDAD' }
  ],
  ke = {
    PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    EN_PROCESO: { label: 'En proceso', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
    RESUELTA: { label: 'Resuelta', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    ANULADA: { label: 'Anulada', cls: 'bg-slate-100 text-slate-500 border-slate-200' }
  };
function B() {
  return f({
    queryKey: ['bodegas_softland'],
    staleTime: 5 * 60 * 1e3,
    queryFn: async () => {
      const { data: e, error: o } = await r.from('tms_bodegas_softland').select('*').order('orden');
      if (o) throw o;
      return e || [];
    }
  });
}
function Qe() {
  const e = B();
  return { ...e, data: (e.data || []).filter((o) => o.es_destino_dictamen && o.activo) };
}
function Ve() {
  const e = u();
  return _({
    mutationFn: async ({ codigo: o, nombre: a, estado: i, esDestino: t, activo: n, orden: c }) => {
      const { data: l, error: d } = await r.rpc('guardar_bodega_softland', {
        p_codigo: o,
        p_nombre: a,
        p_estado: i || 'DISPONIBLE',
        p_es_destino: !!t,
        p_activo: n !== !1,
        p_orden: c ?? 100
      });
      if (d) throw d;
      return l;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['bodegas_softland'] })
  });
}
function ze() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('eliminar_bodega_softland', { p_codigo: o });
      if (i) throw i;
      return a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['bodegas_softland'] })
  });
}
const $e = {
  RECEPCION: { label: 'Recepción', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  ESTANCIA: { label: 'Estancia', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ACCION: { label: 'Acción', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  SALIDA: { label: 'Salida', cls: 'bg-teal-100 text-teal-700 border-teal-200' }
};
function Je(e, o, a) {
  return f({
    queryKey: ['trazabilidad', e, o || '', a || ''],
    enabled: !!e,
    staleTime: 3e4,
    queryFn: async () => {
      const { data: i, error: t } = await r.rpc('trazabilidad_producto', {
        p_codigo: e,
        p_partida: o ?? null,
        p_ubicacion: a ?? null
      });
      if (t) throw t;
      return i || { codigo: e, estado_actual: null, eventos: [] };
    }
  });
}
function He() {
  return f({
    queryKey: ['areas_calidad'],
    staleTime: 5 * 60 * 1e3,
    queryFn: async () => {
      const { data: e, error: o } = await r.from('tms_areas_calidad').select('*').order('orden');
      if (o) throw o;
      return e || [];
    }
  });
}
function Ye() {
  return f({
    queryKey: ['calidad_acciones'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: !0,
    refetchInterval: 2e4,
    refetchIntervalInBackground: !1,
    queryFn: async () => {
      const { data: e, error: o } = await A(
        r.from('tms_calidad_acciones').select('*').order('created_at', { ascending: !1 }),
        { ms: 12e3, label: 'acciones de calidad' }
      );
      if (o) throw o;
      const a = { PENDIENTE: 0, EN_PROCESO: 1, RESUELTA: 2, ANULADA: 3 };
      return (e || []).sort((i, t) => (a[i.estado] ?? 9) - (a[t.estado] ?? 9));
    }
  });
}
function We() {
  const e = u();
  return _({
    mutationFn: async ({
      itemId: o,
      tipoAccion: a,
      area: i,
      descripcion: t,
      prioridad: n,
      fechaLimite: c
    }) => {
      const { data: l, error: d } = await r.rpc('crear_accion_calidad', {
        p_item_id: o,
        p_tipo_accion: a,
        p_area: i,
        p_descripcion: t ?? null,
        p_prioridad: n || 'NORMAL',
        p_fecha_limite: c ?? null
      });
      if (d) throw d;
      return l;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_acciones'] })
  });
}
function Xe() {
  const e = u();
  return _({
    mutationFn: async ({ accionId: o, resolucion: a, estado: i }) => {
      const { data: t, error: n } = await r.rpc('resolver_accion_calidad', {
        p_accion_id: o,
        p_resolucion: a ?? '',
        p_estado: i || 'RESUELTA'
      });
      if (n) throw n;
      return t;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_acciones'] })
  });
}
function Ze() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('anular_accion_calidad', { p_accion_id: o });
      if (i) throw i;
      return a;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_acciones'] })
  });
}
function ea() {
  const e = u();
  return _({
    mutationFn: async (o) => {
      const { data: a, error: i } = await r.rpc('accion_a_ticket_pv', { p_accion_id: o });
      if (i) throw i;
      return a;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ['calidad_acciones'] }),
        e.invalidateQueries({ queryKey: ['pv_tickets'] }),
        e.invalidateQueries({ queryKey: ['pv_dashboard'] }));
    }
  });
}
function aa() {
  const e = u();
  return _({
    mutationFn: async ({ accionId: o, referencia: a }) => {
      const { data: i, error: t } = await r.rpc('accion_correo_enviado', {
        p_accion_id: o,
        p_referencia: a || null
      });
      if (t) throw t;
      return i;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_acciones'] })
  });
}
function oa() {
  const e = u();
  return _({
    mutationFn: async ({ accionId: o, referencia: a }) => {
      const { data: i, error: t } = await r.rpc('accion_registrar_referencia', {
        p_accion_id: o,
        p_referencia: a
      });
      if (t) throw t;
      return i;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ['calidad_acciones'] })
  });
}
function ia() {
  const e = u();
  return _({
    mutationFn: async ({
      tareaId: o,
      checklist: a,
      observaciones: i,
      finalizar: t,
      resultado: n,
      disposicion: c
    }) => {
      const { data: l, error: d } = await r.rpc('guardar_checklist_ingreso', {
        p_tarea_id: o,
        p_checklist: a || {},
        p_observaciones: i ?? null,
        p_finalizar: !!t,
        p_resultado: n ?? null,
        p_disposicion: c ?? null
      });
      if (d) throw d;
      return l;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ['calidad_tareas'] }),
        e.invalidateQueries({ queryKey: ['calidad_tareas_salida'] }));
    }
  });
}
export {
  oe as $,
  Ee as A,
  be as B,
  Se as C,
  Ce as D,
  g as E,
  Q as F,
  $ as G,
  x as H,
  Oe as I,
  L as J,
  Te as K,
  Ie as L,
  Ke as M,
  Le as N,
  V as O,
  ae as P,
  me as Q,
  ve as R,
  O as S,
  ge as T,
  Be as U,
  X as V,
  ee as W,
  Ae as X,
  z as Y,
  k as Z,
  ie as _,
  Ne as a,
  te as a0,
  se as a1,
  We as a2,
  He as a3,
  Qe as a4,
  Z as a5,
  G as a6,
  j as a7,
  je as a8,
  W as a9,
  H as aa,
  Y as ab,
  Ye as ac,
  Xe as ad,
  Ze as ae,
  ke as af,
  Je as ag,
  $e as ah,
  ea as ai,
  oa as aj,
  le as ak,
  ue as al,
  aa as am,
  B as an,
  Ve as ao,
  ze as ap,
  qe as b,
  q as c,
  ne as d,
  Ue as e,
  J as f,
  _e as g,
  ia as h,
  De as i,
  pe as j,
  de as k,
  T as l,
  ce as m,
  we as n,
  Fe as o,
  I as p,
  Me as q,
  Re as r,
  Pe as s,
  xe as t,
  re as u,
  fe as v,
  he as w,
  P as x,
  ye as y,
  Ge as z
};
