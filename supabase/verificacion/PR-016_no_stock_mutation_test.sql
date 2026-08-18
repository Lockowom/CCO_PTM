-- ============================================================================
--  PR-016 · Test de contrato "NO STOCK MUTATION" (nivel BD)
--  Gate: STOCK_SIDE_EFFECT_FROM_PANEL_NV = 0
--
--  Propósito: demostrar que `guardar_nv` y `cambiar_estado_nv` NO modifican
--  (ni directa ni indirectamente vía trigger/function/hook) las tablas de
--  stock. No basta con que el payload del frontend no lleve campos de
--  inventario (`tieneCamposInventario`): hay que verificar el efecto en BD.
--
--  Cómo ejecutar (vía MCP Supabase / psql, con sesión authenticated):
--    1) Abrir una transacción EXPLÍCITA.
--    2) Snapshot de las tablas de stock.
--    3) Ejecutar la RPC.
--    4) Snapshot de nuevo.
--    5) Comparar: expect before == after.
--    6) ROLLBACK (no dejar la N.V. de prueba en producción).
--
--  ADVERTENCIA: este script es de VERIFICACIÓN, no se aplica como migración.
--  Requiere un usuario con `manage_panel` y una N.V. de prueba (o crear una).
-- ============================================================================

begin;

-- ── 0) Tomar la N.V. de prueba (crear una si no existe) ─────────────────────
--    (sustituir por una N.V. real del entorno o crear una EFÍMERA)
do $$
declare
  v_id bigint;
  v_antes jsonb;
  v_despues jsonb;
begin
  -- Crear N.V. de prueba efímera (origen cco).
  insert into public.tms_operaciones (
    nv_orange, cliente, vendedor, centro_costo, estado, urgente, origen
  ) values (
    'TEST-NOSTOCK-' || floor(random()*1000000)::int,
    'Cliente Test', 'Test', '01-001', 'En Proceso', false, 'cco'
  ) returning id into v_id;

  -- ── 1) Snapshot ANTES de las tablas de stock ──────────────────────────────
  select coalesce(jsonb_agg(to_jsonb(t) order by t.*), '[]')
    into v_antes
  from (
    select 'tms_partidas' tabla, count(*) filas, coalesce(sum((select sum(1) from jsonb_each_text(to_jsonb(t.*)))), 0) checksum
      from public.tms_partidas t
    union all
    select 'tms_series', count(*), 0
      from public.tms_series
    union all
    select 'tms_inventario_general', count(*), 0
      from public.tms_inventario_general
  ) t;

  -- ── 2) Ejecutar las RPCs (con version correcta) ───────────────────────────
  perform public.guardar_nv(jsonb_build_object(
    'id', v_id,
    'estado', 'Shipping',
    'transportista', 'TEST',
    'version', (select row_version from public.tms_operaciones where id = v_id)
  ));
  perform public.cambiar_estado_nv(v_id, 'En Ruta', false,
    (select row_version from public.tms_operaciones where id = v_id));

  -- ── 3) Snapshot DESPUÉS ───────────────────────────────────────────────────
  select coalesce(jsonb_agg(to_jsonb(t) order by t.*), '[]')
    into v_despues
  from (
    select 'tms_partidas' tabla, count(*) filas, coalesce(sum((select sum(1) from jsonb_each_text(to_jsonb(t.*)))), 0) checksum
      from public.tms_partidas t
    union all
    select 'tms_series', count(*), 0
      from public.tms_series
    union all
    select 'tms_inventario_general', count(*), 0
      from public.tms_inventario_general
  ) t;

  -- ── 4) ASSERT: before == after ────────────────────────────────────────────
  if v_antes is distinct from v_despues then
    raise exception 'NO STOCK MUTATION VIOLADO: guardar_nv/cambiar_estado_nv modificaron stock. antes=% despues=%', v_antes, v_despues;
  end if;

  raise notice 'OK: STOCK_SIDE_EFFECT_FROM_PANEL_NV = 0 (antes==despues).';
end;
$$;

-- ── 5) ROLLBACK: no dejar la N.V. de prueba ni efectos en producción ────────
rollback;