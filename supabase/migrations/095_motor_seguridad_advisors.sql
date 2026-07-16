-- ============================================================================
--  095_motor_seguridad_advisors.sql
--  Mejoras de MOTOR (rendimiento) + SEGURIDAD guiadas por get_advisors.
--
--  RENDIMIENTO
--   · 7 índices de claves foráneas sin cubrir (joins/borrados más rápidos).
--   · Elimina un índice duplicado en tms_farmapack.
--   · RLS "initplan": envuelve auth.uid()/auth.role()/auth.jwt()/is_admin() en
--     `(select …)` en TODAS las policies que los reevaluaban POR FILA → Postgres
--     los evalúa UNA vez por consulta (gran mejora en tablas grandes). Cambio
--     semánticamente idéntico; se aplica con ALTER POLICY (la policy nunca deja
--     de existir).
--  SEGURIDAD
--   · Cierra el EXECUTE por `PUBLIC` (default de CREATE FUNCTION) en RPC que solo
--     deben usar admins/autenticados: guardar_usuario, usuarios_bulk y las
--     funciones internas/trigger _panel_puede_escribir, pv_log_historial(_alta),
--     sync_calidad_a_recepcion → `anon` deja de poder invocarlas.
--   · Fija search_path en 4 funciones (advisor function_search_path_mutable).
-- ============================================================================

-- ── RENDIMIENTO: índices de FKs sin cubrir ──────────────────────────────────
create index if not exists ix_tms_accesos_usuario_id             on public.tms_accesos(usuario_id);
create index if not exists ix_tms_calidad_acciones_item_id       on public.tms_calidad_acciones(item_id);
create index if not exists ix_tms_calidad_asignaciones_informe   on public.tms_calidad_asignaciones(informe_id);
create index if not exists ix_tms_conductores_user_id            on public.tms_conductores(user_id);
create index if not exists ix_tms_errores_picking_pack_id        on public.tms_errores_picking(usuario_packing_id);
create index if not exists ix_tms_nv_eliminadas_usuario_elimino  on public.tms_nv_eliminadas(usuario_elimino);
create index if not exists ix_tms_producto_categoria_categoria   on public.tms_producto_categoria(categoria);

-- Nota: el "índice duplicado" tms_farmapack_unique_key respalda una UNIQUE
-- CONSTRAINT (no es un simple índice) → no se elimina para no alterar la
-- integridad; queda como observación de bajo impacto (INFO).

-- ── RENDIMIENTO: RLS initplan (envolver funciones auth en subconsulta) ───────
do $$
declare r record; v_u text; v_c text; v_sql text;
begin
  for r in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and ( coalesce(qual,'')       ~* 'auth\.(uid|role|jwt)\(\)|is_admin\(\)'
            or coalesce(with_check,'') ~* 'auth\.(uid|role|jwt)\(\)|is_admin\(\)' )
      and coalesce(qual,'')       !~* '\(\s*select'
      and coalesce(with_check,'') !~* '\(\s*select'
  loop
    v_u := r.qual; v_c := r.with_check;
    if v_u is not null then
      v_u := regexp_replace(v_u, '(auth\.(uid|role|jwt)\(\))', '(select \1)', 'g');
      v_u := regexp_replace(v_u, '(^|[^.a-z_])(is_admin\(\))', '\1(select \2)', 'g');
    end if;
    if v_c is not null then
      v_c := regexp_replace(v_c, '(auth\.(uid|role|jwt)\(\))', '(select \1)', 'g');
      v_c := regexp_replace(v_c, '(^|[^.a-z_])(is_admin\(\))', '\1(select \2)', 'g');
    end if;
    v_sql := format('alter policy %I on public.%I', r.policyname, r.tablename);
    if v_u is not null then v_sql := v_sql || format(' using (%s)', v_u); end if;
    if v_c is not null then v_sql := v_sql || format(' with check (%s)', v_c); end if;
    execute v_sql;
  end loop;
end $$;

-- ── SEGURIDAD: cerrar EXECUTE por PUBLIC/anon (conservar authenticated) ──────
revoke execute on function public.guardar_usuario(jsonb)              from public, anon;
revoke execute on function public.usuarios_bulk(uuid[], text, text)   from public, anon;
grant  execute on function public.guardar_usuario(jsonb)              to authenticated;
grant  execute on function public.usuarios_bulk(uuid[], text, text)   to authenticated;

revoke execute on function public._panel_puede_escribir()            from public, anon;
grant  execute on function public._panel_puede_escribir()            to authenticated;
revoke execute on function public.pv_log_historial()                 from public, anon;
revoke execute on function public.pv_log_historial_alta()            from public, anon;
revoke execute on function public.sync_calidad_a_recepcion()         from public, anon;

-- ── SEGURIDAD: fijar search_path (function_search_path_mutable) ──────────────
alter function public.normalizar_nv(text)             set search_path to 'public';
alter function public.tms_nv_catalogo_norm()          set search_path to 'public';
alter function public.tms_operaciones_norm_estado(text) set search_path to 'public';
alter function public.tms_operaciones_before_write()  set search_path to 'public';
