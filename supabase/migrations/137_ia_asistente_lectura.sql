-- ============================================================================
--  Asistente IA (v1, solo lectura). Herramientas que el modelo puede invocar
--  para responder sobre datos REALES. Cada RPC:
--   · es SECURITY DEFINER pero GATEA por permiso del llamante (auth.uid) con
--     public.usuario_tiene_algun_permiso(...) → si no tiene el permiso, error.
--   · operaciones respeta el MISMO ámbito centro_costo que el Panel
--     (public.iam_mis_scopes), fail-open si no hay ámbitos definidos.
--   · devuelve JSON compacto y acotado (LIMIT) — nunca vuelca la tabla.
--  Permiso nuevo: view_asistente (módulo "Asistente IA"). Cambio ADITIVO.
-- ============================================================================

insert into public.tms_permisos (id, nombre, modulo)
values ('view_asistente', 'Usar el Asistente IA', 'Asistente IA')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

insert into public.tms_modules_config (id, enabled, label, description)
values ('asistente', true, 'Asistente IA', 'Asistente conversacional que consulta datos reales (solo lectura)')
on conflict (id) do update set label = excluded.label, description = excluded.description;

-- ── KPIs / snapshot (solo las secciones que el usuario puede ver) ────────────
create or replace function public.ia_kpis()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_panel  boolean := public.usuario_tiene_algun_permiso(array['view_panel','manage_panel','panel_info']);
  v_pv     boolean := public.usuario_tiene_algun_permiso(array['view_postventa','manage_postventa','supervise_postventa']);
  v_stock  boolean := public.usuario_tiene_algun_permiso(array['view_stock','manage_stock','view_inventario']);
  v_out    jsonb := '{}'::jsonb;
  v_all    boolean := true;
  v_codes  text[] := '{}';
  v_scope  jsonb;
  v_tmp    jsonb;
begin
  if not (v_panel or v_pv or v_stock) then
    raise exception 'Sin permisos para consultar indicadores';
  end if;

  if v_panel then
    begin
      v_scope := public.iam_mis_scopes('view_panel','centro_costo');
      v_all := coalesce((v_scope->>'all')::boolean, true);
      v_codes := coalesce(array(select jsonb_array_elements_text(v_scope->'codes')), '{}');
    exception when others then v_all := true; end;

    select jsonb_build_object(
      'total', count(*),
      'urgentes', count(*) filter (where urgente),
      'con_incidencia', count(*) filter (where coalesce(incidencia,'') <> ''),
      'por_estado', coalesce((
        select jsonb_object_agg(estado, c) from (
          select estado, count(*) c from public.tms_operaciones
          where (v_all or centro_costo = any(v_codes)) and estado is not null
          group by estado order by count(*) desc limit 12
        ) e), '{}'::jsonb)
    ) into v_tmp
    from public.tms_operaciones
    where (v_all or centro_costo = any(v_codes));

    v_out := v_out || jsonb_build_object('operaciones', v_tmp);
  end if;

  if v_pv then
    select jsonb_build_object(
      'total', count(*),
      'abiertos', count(*) filter (where lower(coalesce(estado,'')) not in ('cerrado','finalizado','resuelto','anulado','cancelado')),
      'por_estado', coalesce((
        select jsonb_object_agg(estado, c) from (
          select estado, count(*) c from public.tms_postventa_tickets
          where estado is not null group by estado order by count(*) desc limit 12
        ) e), '{}'::jsonb)
    ) into v_tmp
    from public.tms_postventa_tickets;
    v_out := v_out || jsonb_build_object('postventa', v_tmp);
  end if;

  if v_stock then
    select jsonb_build_object(
      'skus', count(*),
      'con_disponible', count(*) filter (where coalesce(disponible,0) > 0),
      'sin_stock', count(*) filter (where coalesce(stock_total,0) <= 0)
    ) into v_tmp
    from public.tms_inventario_general;
    v_out := v_out || jsonb_build_object('stock', v_tmp);
  end if;

  return v_out;
end;
$$;

-- ── Buscar operaciones / N.V. (respeta ámbito centro_costo) ──────────────────
create or replace function public.ia_buscar_operaciones(p_q text default null, p_estado text default null, p_limit int default 20)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_all boolean := true; v_codes text[] := '{}'; v_scope jsonb; v_rows jsonb;
begin
  if not public.usuario_tiene_algun_permiso(array['view_panel','manage_panel','panel_info']) then
    raise exception 'Sin permisos para consultar operaciones';
  end if;
  begin
    v_scope := public.iam_mis_scopes('view_panel','centro_costo');
    v_all := coalesce((v_scope->>'all')::boolean, true);
    v_codes := coalesce(array(select jsonb_array_elements_text(v_scope->'codes')), '{}');
  exception when others then v_all := true; end;

  select coalesce(jsonb_agg(r), '[]'::jsonb) into v_rows from (
    select jsonb_build_object(
      'nv_ptm', nv_ptm, 'nv_orange', nv_orange, 'cliente', cliente, 'estado', estado,
      'vendedor', vendedor, 'centro_costo', centro_costo, 'urgente', urgente,
      'fecha_despacho', fecha_despacho, 'fecha_compromiso', fecha_compromiso,
      'valor_nv', valor_nv, 'incidencia', nullif(incidencia,''), 'transportista', transportista
    ) r
    from public.tms_operaciones
    where (v_all or centro_costo = any(v_codes))
      and (p_estado is null or lower(estado) = lower(p_estado))
      and (
        p_q is null or p_q = '' or
        nv_ptm::text ilike '%'||p_q||'%' or coalesce(nv_orange,'') ilike '%'||p_q||'%' or
        coalesce(nv_farmapack,'') ilike '%'||p_q||'%' or coalesce(cliente,'') ilike '%'||p_q||'%' or
        coalesce(vendedor,'') ilike '%'||p_q||'%' or coalesce(factura,'') ilike '%'||p_q||'%'
      )
    order by coalesce(fecha_estado, created_at) desc nulls last
    limit greatest(1, least(coalesce(p_limit,20), 50))
  ) s;
  return v_rows;
end;
$$;

-- ── Buscar stock (inventario general consolidado) ────────────────────────────
create or replace function public.ia_buscar_stock(p_q text default null, p_limit int default 20)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_rows jsonb;
begin
  if not public.usuario_tiene_algun_permiso(array['view_stock','manage_stock','view_inventario']) then
    raise exception 'Sin permisos para consultar stock';
  end if;
  select coalesce(jsonb_agg(r), '[]'::jsonb) into v_rows from (
    select jsonb_build_object(
      'codigo', codigo_producto, 'producto', producto, 'bodega', bodega,
      'disponible', disponible, 'reserva', reserva, 'stock_total', stock_total,
      'unidad', unidad_medida
    ) r
    from public.tms_inventario_general
    where (p_q is null or p_q = '' or codigo_producto ilike '%'||p_q||'%' or producto ilike '%'||p_q||'%')
    order by coalesce(disponible,0) desc
    limit greatest(1, least(coalesce(p_limit,20), 50))
  ) s;
  return v_rows;
end;
$$;

-- ── Buscar tickets Post-Venta ────────────────────────────────────────────────
create or replace function public.ia_tickets(p_q text default null, p_estado text default null, p_limit int default 20)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_rows jsonb;
begin
  if not public.usuario_tiene_algun_permiso(array['view_postventa','manage_postventa','supervise_postventa']) then
    raise exception 'Sin permisos para consultar Post-Venta';
  end if;
  select coalesce(jsonb_agg(r), '[]'::jsonb) into v_rows from (
    select jsonb_build_object(
      'numero', numero, 'cliente', cliente, 'estado', estado, 'prioridad', prioridad,
      'tecnico', tecnico_asignado, 'equipo', equipo_modelo, 'region', region, 'comuna', comuna,
      'fecha_apertura', fecha_apertura, 'fecha_programada', fecha_programada,
      'tipo', tipo_solicitud, 'descripcion', left(coalesce(descripcion,''), 240)
    ) r
    from public.tms_postventa_tickets
    where (p_estado is null or lower(estado) = lower(p_estado))
      and (
        p_q is null or p_q = '' or coalesce(numero,'') ilike '%'||p_q||'%' or
        coalesce(cliente,'') ilike '%'||p_q||'%' or coalesce(tecnico_asignado,'') ilike '%'||p_q||'%' or
        coalesce(equipo_modelo,'') ilike '%'||p_q||'%' or coalesce(numero_serie,'') ilike '%'||p_q||'%'
      )
    order by coalesce(fecha_apertura, created_at::date) desc nulls last
    limit greatest(1, least(coalesce(p_limit,20), 50))
  ) s;
  return v_rows;
end;
$$;

revoke all on function public.ia_kpis() from public;
revoke all on function public.ia_buscar_operaciones(text,text,int) from public;
revoke all on function public.ia_buscar_stock(text,int) from public;
revoke all on function public.ia_tickets(text,text,int) from public;
grant execute on function public.ia_kpis() to authenticated;
grant execute on function public.ia_buscar_operaciones(text,text,int) to authenticated;
grant execute on function public.ia_buscar_stock(text,int) to authenticated;
grant execute on function public.ia_tickets(text,text,int) to authenticated;
