-- 082_operaciones_migracion.sql
-- ============================================================================
--  Migración Panel PTM → CCO (Fase 0: esquema destino).
--  Trae la tabla `operaciones` del proyecto Panel (Google Sheet → Supabase
--  `yynlmcxmkrlmhqqoxskb`) a la BD de CCO como FUTURA fuente de verdad.
--
--  Decisiones de diseño (validadas contra los datos reales, 1.970 filas):
--   • `id` surrogate IDENTITY estable: NUNCA se regenera (arregla el problema
--     de raíz del Panel, cuyo swap_operaciones borraba+reinsertaba y regeneraba
--     el id en cada sync). Cuando CCO sea dueño de las escrituras, cada fila
--     conserva su id para siempre.
--   • SIN clave única de negocio: los datos tienen duplicados LEGÍTIMOS
--     (parcializaciones: 1 NV en hasta 65 guías) que no se distinguen por
--     (canal, nv, guía). Forzar unicidad rechazaría filas válidas.
--   • `row_hash` determinístico: para import idempotente y reconciliación
--     (re-ejecutar el import sin duplicar), no como restricción de unicidad.
--   • `estado` auto-normalizado por trigger (ENTREGADO→Entregado, etc.) contra
--     el catálogo canónico → datos limpios EN la BD, no en el cliente.
--   • `origen`: distingue filas importadas del Sheet vs creadas nativamente en CCO.
--
--  Docs: DOCUMENTACION_PROYECTO.md §Panel PTM + Changelog.
-- ============================================================================

-- ── Catálogo de estados canónicos (SSOT en la BD) ───────────────────────────
create table if not exists public.tms_operaciones_estado_cat (
  estado    text primary key,
  orden     smallint not null default 0,   -- posición en el flujo logístico
  activo    boolean  not null default true, -- estado "en operación" (no terminal/descarte)
  terminal  boolean  not null default false,
  descarte  boolean  not null default false,
  color     text
);

insert into public.tms_operaciones_estado_cat (estado, orden, activo, terminal, descarte, color) values
  ('En Proceso',   10, true,  false, false, '#f59e0b'),
  ('P / VENDEDOR', 11, true,  false, false, '#d97706'),
  ('P / STOCK',    12, true,  false, false, '#b45309'),
  ('P / RETIRO',   13, true,  false, false, '#92400e'),
  ('Shipping',     20, true,  false, false, '#8b5cf6'),
  ('Currier',      30, true,  false, false, '#7c3aed'),
  ('En Ruta',      40, true,  false, false, '#06b6d4'),
  ('Entregado',    50, false, true,  false, '#22c55e'),
  ('NULA',         90, false, false, true,  '#6b7280'),
  ('REFACTURADO',  91, false, false, true,  '#6b7280'),
  ('RECHAZADO',    92, false, false, true,  '#6b7280')
on conflict (estado) do update
  set orden = excluded.orden, activo = excluded.activo,
      terminal = excluded.terminal, descarte = excluded.descarte, color = excluded.color;

-- ── Normalización de estados (viejos MAYÚSCULAS + fusiones → canónico) ───────
-- Espejo EXACTO de ESTADO_MIGRACION (src/lib/estados.ts del Panel). Decisión
-- julio 2026: ENTREGADO viejo + Recibido Conforme + Recibido C/OBS se fusionan
-- en el estado terminal único "Entregado".
create or replace function public.tms_operaciones_norm_estado(p text)
returns text
language sql immutable
as $$
  select case
    when p is null or btrim(p) = '' then null
    when upper(btrim(p)) = 'EN PROCESO'        then 'En Proceso'
    when upper(btrim(p)) = 'EN SHIPPING'       then 'Shipping'
    when upper(btrim(p)) = 'SHIPPING'          then 'Shipping'
    when upper(btrim(p)) = 'EN RUTA'           then 'En Ruta'
    when upper(btrim(p)) = 'CURRIER'           then 'Currier'
    when upper(btrim(p)) = 'ENTREGADO'         then 'Entregado'
    when upper(btrim(p)) = 'RECIBIDO CONFORME' then 'Entregado'
    when upper(btrim(p)) = 'RECIBIDO C/OBS'    then 'Entregado'
    else btrim(p)
  end;
$$;

-- ── Tabla principal ─────────────────────────────────────────────────────────
create table if not exists public.tms_operaciones (
  id            bigint generated always as identity primary key,
  -- Canales (una NV por fila; la clave lógica es canal:nv con prioridad ptm→orange→farmapack→varios)
  nv_ptm        bigint,
  nv_orange     text,
  nv_farmapack  text,
  varios        text,
  -- Documentos
  factura       text,
  guia          text,
  numero_envio  text,
  -- Comercial (auto-rellenado en origen)
  vendedor      text,
  cliente       text,
  centro_costo  text,
  division      text,
  -- Logística
  transportista     text,
  empresa_transporte text,
  tipo_despacho     text,
  estado        text,
  urgente       boolean not null default false,
  -- Fechas de gestión
  fecha_aprobacion       date,
  fecha_aprobacion_real  date,
  fecha_facturacion      text,          -- legacy: llega como texto libre en el Sheet
  fecha_despacho         date,
  fecha_compromiso       date,
  -- Timestamps de flujo (estampados por etapa)
  fecha_estado       timestamptz,
  fecha_registro_nv  timestamptz,
  fecha_en_proceso   date,
  fecha_shipping     date,
  fecha_en_ruta      date,
  fecha_entregado    date,
  -- Montos y contadores
  valor_factura  numeric,
  costo_flete    numeric,
  valor_nv       numeric,
  bultos         bigint,
  dias_en_proceso bigint default 0,
  -- Incidencias
  incidencia               text,
  estado_incidencia        text,
  observaciones_incidencia text,
  dias_incidencia          bigint default 0,
  -- Legacy
  fillrate       text,                  -- columna legacy Si/No (el dashboard la recalcula)
  -- Metadatos de migración/gobernanza
  origen         text not null default 'sheet',  -- 'sheet' (import) | 'cco' (nativo)
  row_hash       text,                            -- hash determinístico p/ import idempotente
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint tms_operaciones_estado_fk
    foreign key (estado) references public.tms_operaciones_estado_cat (estado)
);

-- ── Índices (perfil de lectura del dashboard) ───────────────────────────────
create index if not exists ix_tms_oper_nv_ptm       on public.tms_operaciones (nv_ptm)       where nv_ptm is not null;
create index if not exists ix_tms_oper_nv_orange    on public.tms_operaciones (nv_orange)    where nv_orange is not null;
create index if not exists ix_tms_oper_nv_farmapack on public.tms_operaciones (nv_farmapack) where nv_farmapack is not null;
create index if not exists ix_tms_oper_estado       on public.tms_operaciones (estado);
create index if not exists ix_tms_oper_fecha_estado on public.tms_operaciones (fecha_estado);
create index if not exists ix_tms_oper_fecha_aprob  on public.tms_operaciones (fecha_aprobacion);
create index if not exists ix_tms_oper_row_hash     on public.tms_operaciones (row_hash);

-- ── Trigger: normalizar estado + refrescar updated_at en cada escritura ──────
create or replace function public.tms_operaciones_before_write()
returns trigger
language plpgsql
as $$
begin
  new.estado := public.tms_operaciones_norm_estado(new.estado);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_tms_operaciones_before_write on public.tms_operaciones;
create trigger trg_tms_operaciones_before_write
  before insert or update on public.tms_operaciones
  for each row execute function public.tms_operaciones_before_write();

-- ── RLS: lectura para autenticados; escritura solo vía RPC/service_role ──────
-- (Las escrituras nativas de CCO se harán por RPC SECURITY DEFINER en una fase
--  posterior; por ahora no hay policy de INSERT/UPDATE para el rol anon/auth.)
alter table public.tms_operaciones            enable row level security;
alter table public.tms_operaciones_estado_cat enable row level security;

drop policy if exists p_tms_operaciones_sel on public.tms_operaciones;
create policy p_tms_operaciones_sel on public.tms_operaciones
  for select to authenticated using (true);

drop policy if exists p_tms_oper_estado_cat_sel on public.tms_operaciones_estado_cat;
create policy p_tms_oper_estado_cat_sel on public.tms_operaciones_estado_cat
  for select to authenticated using (true);

comment on table public.tms_operaciones is
  'Operaciones/despachos (NVs). Migrado desde el Panel PTM (Google Sheet → Supabase). Futura fuente de verdad de CCO. id surrogate estable; sin clave única de negocio (parcializaciones legítimas). estado auto-normalizado.';

-- ── Import histórico (one-time, Fase 1) ─────────────────────────────────────
-- La copia inicial de las 1.970 filas del Panel (proyecto yynlmcxmkrlmhqqoxskb)
-- se hizo SERVER-SIDE con la extensión `http`: CCO leyó la PostgREST del Panel
-- (GET /rest/v1/operaciones paginado) e insertó vía jsonb_populate_recordset,
-- normalizando estados por el trigger y calculando row_hash. Los datos viajaron
-- DB→DB (no por el cliente). Reconciliación posterior: filas, conteo por estado
-- y por canal, y sumas de control (valor_nv, bultos) → coincidencia 100 %.
-- El row_hash NO es único a propósito: existen 5 parcializaciones idénticas
-- (mismos campos identificadores) que son duplicados legítimos.
create extension if not exists http with schema extensions;
