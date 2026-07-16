-- ============================================================================
--  094_usuarios_roles_upgrade.sql
--  Upgrade "Usuarios y Roles": más eficiente, rápido y eficaz.
--
--  Nota de seguridad (verificada, NO requiere cambio): la escalada de
--  privilegios ya está bloqueada por el trigger existente
--  `trg_usuarios_freeze_privileged` (BEFORE UPDATE) → si un NO-admin edita su
--  fila, congela rol/es_admin_delegado/activo/email/auth_uid/id_usuario a su
--  valor anterior. Además RLS solo deja UPDATE de la propia fila o de admin, y
--  las RPC de auth (`private.create_auth_user`/`update_auth_password`) validan
--  `private.is_admin()`. Esta migración NO toca eso; solo agrega dos RPC.
--
--  1) `guardar_usuario(p jsonb)` — alta/edición ATÓMICA y gateada a admin
--     (crea la cuenta auth + la fila en una sola transacción; si algo falla,
--     rollback total → sin cuentas auth huérfanas). Reemplaza el guardado en
--     dos pasos que hacía el cliente.
--  2) `usuarios_bulk(ids, accion, valor)` — acciones masivas gateadas a admin
--     (activar / desactivar / cambiar rol / eliminar en lote).
-- ============================================================================

-- ── 1) Alta/edición atómica y gateada ───────────────────────────────────────
create or replace function public.guardar_usuario(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id     uuid    := nullif(p->>'id','')::uuid;
  v_nombre text    := btrim(coalesce(p->>'nombre',''));
  v_email  text    := lower(btrim(coalesce(p->>'email','')));
  v_rol    text    := nullif(p->>'rol','');
  v_activo boolean := coalesce((p->>'activo')::boolean, true);
  v_deleg  boolean := coalesce((p->>'es_admin_delegado')::boolean, false);
  v_pass   text    := nullif(p->>'password','');
  v_auth   uuid;
  v_legacy text;
begin
  if not private.is_admin() then
    raise exception 'Solo administradores pueden gestionar usuarios';
  end if;
  if v_nombre = '' or v_email = '' or v_rol is null then
    raise exception 'Nombre, email y rol son obligatorios';
  end if;

  if v_id is null then
    -- CREATE (todo en una transacción)
    if v_pass is null or length(v_pass) < 6 then
      raise exception 'La contraseña es obligatoria (mínimo 6 caracteres)';
    end if;
    v_auth := private.create_auth_user(v_email, v_pass);
    v_legacy := 'USR-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || upper(substr(md5(random()::text),1,6));
    insert into tms_usuarios (id_usuario, nombre, email, auth_uid, rol, activo, es_admin_delegado)
    values (v_legacy, v_nombre, v_email, v_auth, v_rol, v_activo, v_deleg)
    returning id into v_id;
  else
    -- UPDATE
    update tms_usuarios
       set nombre = v_nombre, email = v_email, rol = v_rol,
           activo = v_activo, es_admin_delegado = v_deleg
     where id = v_id;
    if not found then raise exception 'Usuario no encontrado'; end if;
    if v_pass is not null then
      if length(v_pass) < 6 then raise exception 'La contraseña debe tener al menos 6 caracteres'; end if;
      select auth_uid into v_auth from tms_usuarios where id = v_id;
      if v_auth is not null then perform private.update_auth_password(v_auth, v_pass); end if;
    end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_id);
exception
  when unique_violation then
    raise exception 'Ya existe un usuario con ese email';
end;
$$;

revoke execute on function public.guardar_usuario(jsonb) from anon;
grant execute on function public.guardar_usuario(jsonb) to authenticated;

-- ── 2) Acciones masivas gateadas ────────────────────────────────────────────
create or replace function public.usuarios_bulk(p_ids uuid[], p_accion text, p_valor text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_n integer := 0; v_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Solo administradores pueden gestionar usuarios';
  end if;
  if p_ids is null or array_length(p_ids, 1) is null then
    return jsonb_build_object('ok', true, 'n', 0);
  end if;

  if p_accion = 'activar' then
    update tms_usuarios set activo = true  where id = any(p_ids);
    get diagnostics v_n = row_count;
  elsif p_accion = 'desactivar' then
    update tms_usuarios set activo = false where id = any(p_ids);
    get diagnostics v_n = row_count;
  elsif p_accion = 'rol' then
    if nullif(btrim(coalesce(p_valor,'')),'') is null then raise exception 'Falta el rol destino'; end if;
    update tms_usuarios set rol = p_valor where id = any(p_ids);
    get diagnostics v_n = row_count;
  elsif p_accion = 'eliminar' then
    foreach v_id in array p_ids loop
      perform public.eliminar_usuario_completo(v_id);
      v_n := v_n + 1;
    end loop;
  else
    raise exception 'Acción no soportada: %', p_accion;
  end if;

  return jsonb_build_object('ok', true, 'n', v_n);
end;
$$;

revoke execute on function public.usuarios_bulk(uuid[], text, text) from anon;
grant execute on function public.usuarios_bulk(uuid[], text, text) to authenticated;
