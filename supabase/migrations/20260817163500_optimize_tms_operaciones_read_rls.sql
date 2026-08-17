-- ============================================================================
-- 20260817163500_optimize_tms_operaciones_read_rls.sql
-- Lectura de tms_operaciones sin timeout para usuarios no admin.
--
-- Problema: p_tms_operaciones_sel (mig 153) evaluaba
-- authz.can_read_operacion_row(to_jsonb(fila)) por CADA fila. Esa función
-- plpgsql ejecuta varias subconsultas IAM (usuario_tiene_algun_permiso,
-- can_any_on_scope sobre iam.user_effective_permissions, que a su vez expande
-- roles heredados y delegaciones). Para un admin, private.is_admin() corta
-- rápido; para el resto, el costo por fila multiplicado por el escaneo
-- completo que hace la vista tms_operaciones_vigentes (window function sobre
-- toda la tabla) supera el statement_timeout → error 57014 / HTTP 500 en el
-- dashboard del Panel.
--
-- Solución: separar la decisión en partes que NO dependen de la fila
-- (admin, permisos TMS, permisos de Panel, ámbito global, lista de centros de
-- costo permitidos) y evaluarlas UNA sola vez por consulta mediante initplans
-- `(select fn())` dentro de la política. El predicado por fila queda reducido
-- a una comparación trivial sobre centro_costo.
--
-- La semántica es IDÉNTICA a authz.can_read_operacion_row (mig 153):
--   admin → todo; view_tms/manage_tms/supervise_tms → todo;
--   sin permisos de Panel → nada;
--   con permisos de Panel: filas sin centro_costo → sí;
--   con centro_costo → ámbito global o centro dentro del scope asignado.
-- ============================================================================

-- ── ¿Puede leer TODAS las operaciones? (independiente de la fila) ───────────
create or replace function authz.operaciones_lectura_total()
returns boolean
language sql
stable
security definer
set search_path = iam, authz, public
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(
           array['view_tms', 'manage_tms', 'supervise_tms']
         ), false)
      or exists (
        select 1
        from iam.user_effective_permissions e
        where e.user_id = auth.uid()
          and e.permission = any(array[
            'view_panel', 'panel_ingresar', 'panel_info',
            'panel_tv', 'panel_builder', 'manage_panel'
          ])
          and e.scope_type = 'global'
      );
$$;
revoke all on function authz.operaciones_lectura_total() from public, anon;
grant execute on function authz.operaciones_lectura_total() to authenticated;

-- ── ¿Tiene algún permiso de Panel? (independiente de la fila) ───────────────
create or replace function authz.operaciones_lectura_panel()
returns boolean
language sql
stable
security definer
set search_path = iam, authz, public
as $$
  select coalesce(public.usuario_tiene_algun_permiso(array[
    'view_panel', 'panel_ingresar', 'panel_info',
    'panel_tv', 'panel_builder', 'manage_panel'
  ]), false);
$$;
revoke all on function authz.operaciones_lectura_panel() from public, anon;
grant execute on function authz.operaciones_lectura_panel() to authenticated;

-- ── Centros de costo permitidos para lectura de Panel ───────────────────────
create or replace function authz.operaciones_centros_lectura()
returns text[]
language sql
stable
security definer
set search_path = iam, authz, public
as $$
  select coalesce(array_agg(distinct e.scope_code), '{}'::text[])
  from iam.user_effective_permissions e
  where e.user_id = auth.uid()
    and e.permission = any(array[
      'view_panel', 'panel_ingresar', 'panel_info',
      'panel_tv', 'panel_builder', 'manage_panel'
    ])
    and e.scope_type = 'centro_costo'
    and e.scope_code is not null;
$$;
revoke all on function authz.operaciones_centros_lectura() from public, anon;
grant execute on function authz.operaciones_centros_lectura() to authenticated;

-- ── Política de lectura: initplans por consulta + predicado trivial por fila ─
drop policy if exists p_tms_operaciones_sel on public.tms_operaciones;
create policy p_tms_operaciones_sel
on public.tms_operaciones
for select
to authenticated
using (
  (select authz.operaciones_lectura_total())
  or (
    (select authz.operaciones_lectura_panel())
    and (
      nullif(btrim(coalesce(centro_costo, '')), '') is null
      or btrim(centro_costo) = any ((select authz.operaciones_centros_lectura()))
    )
  )
);

-- ── Bitácora: visible si la operación asociada es visible ───────────────────
-- La subconsulta sobre tms_operaciones corre como invoker, por lo que aplica
-- la política optimizada de arriba (misma semántica que la versión anterior,
-- sin invocar can_read_operacion_row por fila de log).
drop policy if exists p_tms_oper_log_sel on public.tms_operaciones_log;
create policy p_tms_oper_log_sel
on public.tms_operaciones_log
for select
to authenticated
using (
  (select authz.operaciones_lectura_total())
  or exists (
    select 1
    from public.tms_operaciones o
    where o.id = tms_operaciones_log.oper_id
  )
);

-- Índice de apoyo para el join de la bitácora bajo RLS.
create index if not exists ix_tms_operaciones_log_oper_id
  on public.tms_operaciones_log (oper_id);
