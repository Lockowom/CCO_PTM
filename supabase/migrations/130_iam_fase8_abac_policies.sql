-- ============================================================================
--  130_iam_fase8_abac_policies.sql — Identity & Security · FASE 8 (ABAC condicional)
--  Políticas condicionales sobre atributos del DATO (no solo rol/ámbito). Motor
--  con un DSL en JSON evaluado en el servidor:
--    - `iam.policies` (recurso, accion, condicion jsonb, activo).
--    - `authz.user_context(uid)` → atributos del usuario (rol, es_admin, centros).
--    - `authz.eval_condition(cond, ctx, row)` → evalúa el DSL (all/any/not + hojas).
--    - `authz.policy_check(recurso, accion, row, uid)` → ¿pasa TODAS las políticas?
--    - Ejemplo canónico NV: editar solo si el centro de costo es del usuario (o es
--      global) y la N.V. NO está despachada.
--  Decisión (como Fase 4): NO se aplica RLS sobre tablas de dominio (riesgo de
--  bloqueo); se provee la DECISIÓN (`iam_puede_editar_nv`) para adopción opt-in.
--  NO destructivo.
-- ============================================================================

create table if not exists iam.policies (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  recurso text not null,
  accion text not null,
  descripcion text,
  condicion jsonb not null default '{}'::jsonb,
  activo boolean not null default true,
  es_sistema boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid
);
create index if not exists iam_policies_ra_idx on iam.policies (recurso, accion) where activo;

-- ── Contexto del usuario (atributos para el evaluador) ──────────────────────
create or replace function authz.user_context(p_uid uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
declare v_uid uuid := coalesce(p_uid, auth.uid()); v_rol text; v_nombre text;
        v_admin boolean; v_global boolean; v_centros jsonb;
begin
  if p_uid is not null and p_uid <> auth.uid() and not authz._es_admin_app() then
    raise exception 'No autorizado para inspeccionar el contexto de otro usuario';
  end if;
  select rol, nombre into v_rol, v_nombre from public.tms_usuarios where auth_uid = v_uid limit 1;
  v_admin := (v_rol = 'ADMIN') or exists (select 1 from public.tms_usuarios
             where auth_uid = v_uid and coalesce(es_admin_delegado,false));
  v_global := v_admin or exists (select 1 from iam.assignments a
              where a.principal_type='user' and a.principal_id=v_uid and a.scope_type='global');
  v_centros := coalesce((select jsonb_agg(distinct a.scope_code) from iam.assignments a
                 where a.principal_type='user' and a.principal_id=v_uid
                   and a.scope_type='centro_costo' and a.scope_code is not null), '[]'::jsonb);
  return jsonb_build_object(
    'uid', v_uid, 'rol', v_rol, 'nombre', v_nombre,
    'es_admin', v_admin, 'sin_limite_centro', v_global, 'centros_costo', v_centros);
end $$;
revoke all on function authz.user_context(uuid) from public, anon;
grant execute on function authz.user_context(uuid) to authenticated;

-- ── Resolver de operandos (ctx.x / row.x / literal) ─────────────────────────
create or replace function authz._resolve(v jsonb, ctx jsonb, p_row jsonb)
returns jsonb language plpgsql immutable as $$
declare s text;
begin
  if v is null then return 'null'::jsonb; end if;
  if jsonb_typeof(v) = 'string' then
    s := v #>> '{}';
    if s like 'ctx.%' then return coalesce(ctx -> substr(s,5), 'null'::jsonb); end if;
    if s like 'row.%' then return coalesce(p_row -> substr(s,5), 'null'::jsonb); end if;
    return v;                         -- literal string
  end if;
  return v;                            -- literal number/bool/array/object
end $$;

-- ── Evaluador del DSL (recursivo) ───────────────────────────────────────────
create or replace function authz.eval_condition(cond jsonb, ctx jsonb, p_row jsonb)
returns boolean language plpgsql immutable as $$
declare item jsonb; v_op text; v_left jsonb; v_right jsonb; ln numeric; rn numeric;
begin
  if cond is null or cond = '{}'::jsonb then return true; end if;

  if cond ? 'all' then
    for item in select * from jsonb_array_elements(cond->'all') loop
      if not authz.eval_condition(item, ctx, p_row) then return false; end if;
    end loop;
    return true;
  elsif cond ? 'any' then
    for item in select * from jsonb_array_elements(cond->'any') loop
      if authz.eval_condition(item, ctx, p_row) then return true; end if;
    end loop;
    return false;
  elsif cond ? 'not' then
    return not authz.eval_condition(cond->'not', ctx, p_row);
  end if;

  -- hoja: { attr, op, value }
  v_op    := coalesce(cond->>'op','eq');
  v_left  := authz._resolve(to_jsonb(cond->>'attr'), ctx, p_row);
  v_right := authz._resolve(cond->'value', ctx, p_row);

  if v_op = 'is_null'  then return v_left is null or v_left = 'null'::jsonb; end if;
  if v_op = 'not_null' then return v_left is not null and v_left <> 'null'::jsonb; end if;

  if v_op = 'eq'  then return v_left = v_right; end if;
  if v_op = 'neq' then return v_left is distinct from v_right; end if;

  if v_op = 'in'  then
    return jsonb_typeof(v_right) = 'array'
       and exists (select 1 from jsonb_array_elements(v_right) e where e = v_left);
  end if;
  if v_op = 'nin' then
    return not (jsonb_typeof(v_right) = 'array'
       and exists (select 1 from jsonb_array_elements(v_right) e where e = v_left));
  end if;

  if v_op = 'contains' then
    return (v_left #>> '{}') ilike '%' || (v_right #>> '{}') || '%';
  end if;

  if v_op in ('gt','lt','gte','lte') then
    begin ln := (v_left #>> '{}')::numeric; rn := (v_right #>> '{}')::numeric;
      return case v_op when 'gt' then ln > rn when 'lt' then ln < rn
                       when 'gte' then ln >= rn else ln <= rn end;
    exception when others then
      return case v_op when 'gt' then (v_left#>>'{}') > (v_right#>>'{}')
                       when 'lt' then (v_left#>>'{}') < (v_right#>>'{}')
                       when 'gte' then (v_left#>>'{}') >= (v_right#>>'{}')
                       else (v_left#>>'{}') <= (v_right#>>'{}') end;
    end;
  end if;

  return false;  -- operador desconocido → deniega la hoja
end $$;

-- ── Chequeo de políticas para (recurso, accion) sobre una fila ──────────────
create or replace function authz.policy_check(p_recurso text, p_accion text, p_row jsonb, p_uid uuid default null)
returns boolean language plpgsql stable security definer set search_path = iam, authz, public as $$
declare v_ctx jsonb := authz.user_context(p_uid); pol record;
begin
  if coalesce((v_ctx->>'es_admin')::boolean, false) then return true; end if;   -- admin bypass
  for pol in select condicion from iam.policies where recurso=p_recurso and accion=p_accion and activo loop
    if not authz.eval_condition(pol.condicion, v_ctx, p_row) then return false; end if;
  end loop;
  return true;   -- sin políticas activas, o todas se cumplen
end $$;
revoke all on function authz.policy_check(text, text, jsonb, uuid) from public, anon;
grant execute on function authz.policy_check(text, text, jsonb, uuid) to authenticated;

-- ── Ejemplo canónico: ¿puede el usuario editar esta N.V.? ───────────────────
create or replace function public.iam_puede_editar_nv(p_id bigint, p_uid uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
declare v_row jsonb; v_ok boolean;
begin
  select to_jsonb(o) into v_row from public.tms_operaciones o where o.id = p_id;
  if v_row is null then return jsonb_build_object('permitida', false, 'error', 'N.V. inexistente'); end if;
  v_ok := authz.policy_check('nv', 'editar', v_row, p_uid);
  return jsonb_build_object(
    'permitida', v_ok,
    'contexto', authz.user_context(p_uid),
    'nv', jsonb_build_object('id', p_id, 'centro_costo', v_row->>'centro_costo',
          'estado', v_row->>'estado', 'vendedor', v_row->>'vendedor', 'cliente', v_row->>'cliente')
  );
end $$;
revoke all on function public.iam_puede_editar_nv(bigint, uuid) from public, anon;
grant execute on function public.iam_puede_editar_nv(bigint, uuid) to authenticated;

-- ── Administración de políticas (admin ∨ manage_roles) ──────────────────────
create or replace function public.iam_policies()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id', p.id, 'codigo', p.codigo, 'recurso', p.recurso, 'accion', p.accion,
    'descripcion', p.descripcion, 'condicion', p.condicion, 'activo', p.activo,
    'es_sistema', p.es_sistema) order by p.recurso, p.accion, p.codigo)
    from iam.policies p), '[]'::jsonb);
end $$;
revoke all on function public.iam_policies() from public, anon;
grant execute on function public.iam_policies() to authenticated;

create or replace function public.iam_policy_guardar(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_id uuid;
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  if nullif(p->>'codigo','') is null or nullif(p->>'recurso','') is null or nullif(p->>'accion','') is null then
    raise exception 'codigo, recurso y accion son obligatorios';
  end if;
  if jsonb_typeof(coalesce(p->'condicion','{}'::jsonb)) not in ('object') then
    raise exception 'La condición debe ser un objeto JSON';
  end if;
  insert into iam.policies (codigo, recurso, accion, descripcion, condicion, activo, updated_by, updated_at)
  values (p->>'codigo', p->>'recurso', p->>'accion', p->>'descripcion',
          coalesce(p->'condicion','{}'::jsonb), coalesce((p->>'activo')::boolean,true), auth.uid(), now())
  on conflict (codigo) do update set
    recurso=excluded.recurso, accion=excluded.accion, descripcion=excluded.descripcion,
    condicion=excluded.condicion, activo=excluded.activo, updated_by=auth.uid(), updated_at=now()
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;
revoke all on function public.iam_policy_guardar(jsonb) from public, anon;
grant execute on function public.iam_policy_guardar(jsonb) to authenticated;

create or replace function public.iam_policy_toggle(p_id uuid, p_activo boolean)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  update iam.policies set activo = p_activo, updated_by = auth.uid(), updated_at = now() where id = p_id;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.iam_policy_toggle(uuid, boolean) from public, anon;
grant execute on function public.iam_policy_toggle(uuid, boolean) to authenticated;

-- ── Seed: política de ejemplo para editar N.V. ──────────────────────────────
insert into iam.policies (codigo, recurso, accion, descripcion, condicion, es_sistema)
values (
  'nv_editar_ambito', 'nv', 'editar',
  'Editar N.V. solo si es de un centro de costo del usuario (o el usuario es global) y la N.V. no está despachada.',
  '{"all":[
     {"any":[
       {"attr":"ctx.sin_limite_centro","op":"eq","value":true},
       {"attr":"row.centro_costo","op":"in","value":"ctx.centros_costo"}
     ]},
     {"attr":"row.estado","op":"nin","value":["DESPACHADO","ENTREGADO","EN RUTA","FACTURADO"]}
   ]}'::jsonb,
  true)
on conflict (codigo) do nothing;
