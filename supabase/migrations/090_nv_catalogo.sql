-- 090_nv_catalogo.sql
-- ============================================================================
--  Catálogo maestro de N.V. por canal (equivalente a las hojas CARGA PTM /
--  ORANGE / FARMAPACK). Es la FUENTE PRECISA de cliente/vendedor que alimenta el
--  autocompletado de Ingresar y que pueden leer otros módulos.
--  Se carga por Carga Masiva (bulk_upsert, upsert por canal+nv).
--  Columnas del archivo: Fecha, N.Venta, Nombre Cliente, Nombre Vendedor, Monto Neto.
-- ============================================================================
create table if not exists public.tms_nv_catalogo (
  canal            text not null,
  nv               text not null,
  cliente          text,
  vendedor         text,
  fecha_aprobacion date,
  monto_neto       numeric,
  centro_costo     text,   -- reservado (deriva del vendedor; hoy no viene en el archivo)
  division         text,   -- reservado
  updated_at       timestamptz not null default now(),
  primary key (canal, nv)
);
create index if not exists ix_tms_nv_catalogo_nv on public.tms_nv_catalogo (nv);
alter table public.tms_nv_catalogo enable row level security;
drop policy if exists p_tms_nv_catalogo_sel on public.tms_nv_catalogo;
create policy p_tms_nv_catalogo_sel on public.tms_nv_catalogo for select to authenticated using (true);

-- ── bulk_upsert: agregar tms_nv_catalogo al allowlist (resto idéntico) ───────
CREATE OR REPLACE FUNCTION public.bulk_upsert(p_table text, p_data jsonb, p_conflict_keys text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_allowed text[] := ARRAY[
    'tms_inventario_general','tms_nv_diarias','tms_control_despacho',
    'tms_partidas','tms_series','tms_farmapack','wms_ubicaciones','tms_matriz_codigos',
    'tms_productos_activo','tms_nv_catalogo'
  ];
  v_cols     text[];
  v_keys     text[];
  v_coldef   text;
  v_collist  text;
  v_update   text;
  v_conflict text := '';
  v_total    int;
  v_affected int := 0;
  v_data_clean jsonb;
BEGIN
  IF NOT (p_table = ANY(v_allowed)) THEN
    RETURN jsonb_build_object('error', 'Tabla no permitida: ' || p_table);
  END IF;

  v_total := jsonb_array_length(p_data);
  IF v_total = 0 THEN
    RETURN jsonb_build_object('inserted', 0, 'updated', 0, 'errors', 0, 'total', 0);
  END IF;

  SELECT jsonb_agg(
    (SELECT jsonb_object_agg(k,
              CASE WHEN jsonb_typeof(val)='string' AND (val#>>'{}')='' THEN 'null'::jsonb ELSE val END)
     FROM jsonb_each(elem) AS e(k, val))
  )
  INTO v_data_clean
  FROM jsonb_array_elements(p_data) AS elem;

  SELECT array_agg(k ORDER BY k) INTO v_cols
  FROM jsonb_object_keys(v_data_clean->0) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns
              WHERE table_schema='public' AND table_name=p_table);

  IF v_cols IS NULL OR array_length(v_cols,1) = 0 THEN
    RETURN jsonb_build_object('error', 'Sin columnas válidas para ' || p_table);
  END IF;

  SELECT string_agg(
           format('%I %s', c.column_name,
             CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END), ', ')
  INTO v_coldef
  FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.table_name=p_table AND c.column_name = ANY(v_cols);

  SELECT string_agg(quote_ident(c), ', ') INTO v_collist FROM unnest(v_cols) AS c;

  IF p_conflict_keys IS NOT NULL AND p_conflict_keys <> '' THEN
    v_keys := ARRAY(SELECT trim(x) FROM unnest(string_to_array(p_conflict_keys, ',')) AS x WHERE trim(x) <> '');
    SELECT string_agg(format('%I = EXCLUDED.%I', c, c), ', ') INTO v_update
    FROM unnest(v_cols) AS c WHERE NOT (c = ANY(v_keys));

    IF v_update IS NOT NULL THEN
      v_conflict := format(' ON CONFLICT (%s) DO UPDATE SET %s',
        (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k), v_update);
    ELSE
      v_conflict := format(' ON CONFLICT (%s) DO NOTHING',
        (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k));
    END IF;
  END IF;

  EXECUTE format(
    'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_to_recordset($1) AS x(%s)%s',
    p_table, v_collist, v_collist, v_coldef, v_conflict
  ) USING v_data_clean;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN jsonb_build_object('inserted', v_affected, 'updated', 0, 'errors', 0, 'total', v_total);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'inserted', 0, 'updated', 0, 'errors', v_total, 'total', v_total);
END;
$function$;

-- ── guardar_nv: al CREAR, persistir cliente/vendedor/división/ccosto ─────────
-- (antes solo se guardaban para el canal "Varios"; ahora también los que trae
--  el catálogo para PTM/Orange/Farmapack).
create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_canal text := coalesce(p->>'canal','ptm');
  r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  if v_id is not null then
    update public.tms_operaciones set
      estado                = coalesce(nullif(p->>'estado',''), estado),
      urgente               = coalesce((p->>'urgente')::boolean, urgente),
      tipo_despacho         = coalesce(nullif(p->>'tipoDespacho',''), tipo_despacho),
      transportista         = coalesce(nullif(p->>'transportista',''), transportista),
      cliente               = coalesce(nullif(p->>'cliente',''), cliente),
      vendedor              = coalesce(nullif(p->>'vendedor',''), vendedor),
      fecha_compromiso      = coalesce(nullif(p->>'fechaCompromiso','')::date, fecha_compromiso),
      fecha_aprobacion      = coalesce(nullif(p->>'fechaAprobacion','')::date, fecha_aprobacion),
      fecha_aprobacion_real = coalesce(nullif(p->>'fechaAprobacionReal','')::date, fecha_aprobacion_real),
      fecha_facturacion     = coalesce(nullif(p->>'fechaFacturacion',''), fecha_facturacion),
      fecha_despacho        = coalesce(nullif(p->>'fechaDespacho','')::date, fecha_despacho),
      factura               = coalesce(nullif(p->>'factura',''), factura),
      guia                  = coalesce(nullif(p->>'guia',''), guia),
      bultos                = coalesce(nullif(p->>'bultos','')::bigint, bultos),
      valor_factura         = coalesce(nullif(p->>'valorFactura','')::numeric, valor_factura),
      numero_envio          = coalesce(nullif(p->>'numeroEnvio',''), numero_envio),
      origen                = 'cco'
    where id = v_id
    returning * into r;
    if r.id is null then raise exception 'N.V. no encontrada'; end if;
  else
    insert into public.tms_operaciones (
      nv_ptm, nv_orange, nv_farmapack, varios,
      cliente, vendedor, division, centro_costo,
      estado, urgente, tipo_despacho, transportista,
      fecha_compromiso, fecha_aprobacion, fecha_aprobacion_real, fecha_facturacion, fecha_despacho,
      factura, guia, bultos, valor_factura, numero_envio, origen
    ) values (
      case when v_canal='ptm'       then nullif(p->>'nv','')::bigint end,
      case when v_canal='orange'    then nullif(p->>'nv','') end,
      case when v_canal='farmapack' then nullif(p->>'nv','') end,
      case when v_canal='varios'    then nullif(p->>'nv','') end,
      coalesce(nullif(p->>'variosCliente',''),  nullif(p->>'cliente','')),
      coalesce(nullif(p->>'variosVendedor',''), nullif(p->>'vendedor','')),
      coalesce(nullif(p->>'variosDivision',''), nullif(p->>'division','')),
      coalesce(nullif(p->>'variosCcosto',''),   nullif(p->>'centro_costo','')),
      nullif(p->>'estado',''), coalesce((p->>'urgente')::boolean,false), nullif(p->>'tipoDespacho',''), nullif(p->>'transportista',''),
      nullif(p->>'fechaCompromiso','')::date, nullif(p->>'fechaAprobacion','')::date, nullif(p->>'fechaAprobacionReal','')::date, nullif(p->>'fechaFacturacion',''), nullif(p->>'fechaDespacho','')::date,
      nullif(p->>'factura',''), nullif(p->>'guia',''), nullif(p->>'bultos','')::bigint, nullif(p->>'valorFactura','')::numeric, nullif(p->>'numeroEnvio',''), 'cco'
    ) returning * into r;
  end if;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, case when v_id is null then 'create' else 'update' end,
          coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r));

  return jsonb_build_object('ok', true, 'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), 'estado', r.estado);
end;
$$;
