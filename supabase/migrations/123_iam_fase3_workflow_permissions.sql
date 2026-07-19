-- ============================================================================
--  123_iam_fase3_workflow_permissions.sql — Identity & Security · FASE 3
--  Capa de DECISIÓN de transiciones (Workflow Permissions) sobre el Workflow
--  Engine existente (`workflow_definition/state/transition/history`, mig 108).
--
--  El Workflow Engine ya tenía la matriz transición×permiso (`workflow_transition
--  .permiso_id`) y un editor visual. Fase 3 añade la función de decisión REUTILIZABLE
--  que el roadmap pide y la conecta al IAM (vía `usuario_tiene_algun_permiso`, que
--  desde Fase 1 lee del IAM con respaldo legado):
--    - `authz.can_transition(workflow, desde, accion)` → boolean, SIN efectos.
--    - `wf_transicionar` se re-centra sobre `authz.can_transition` (comportamiento
--      IDÉNTICO; una sola definición de la regla).
--    - `wf_acciones_disponibles(workflow, desde)` → jsonb, para que el cliente
--      muestre solo las acciones que el usuario en sesión puede ejecutar.
--
--  Decisión de diseño (igual que en Fase 1): las tablas `workflow_*` siguen siendo
--  la fuente canónica operativa; NO se crea una copia paralela `iam.workflows`
--  (sería redundante y riesgosa). La "autorización de workflow" vive en `authz`
--  leyendo esas tablas. NO destructivo.
-- ============================================================================

-- ── Decisión: ¿puede el usuario en sesión ejecutar esta transición? ─────────
-- Réplica EXACTA del gate que tenía inline `wf_transicionar`:
--   sin permiso_id → permitido (a cualquier autenticado);
--   con permiso_id → admin (private.is_admin) ∨ usuario_tiene_algun_permiso (IAM).
create or replace function authz.can_transition(
  p_workflow text, p_desde text, p_accion text
) returns boolean
language plpgsql stable security definer set search_path = public, authz as $$
declare t public.workflow_transition;
begin
  select * into t from public.workflow_transition
   where workflow = p_workflow and accion = p_accion
     and (desde is not distinct from nullif(p_desde,''))
   order by orden limit 1;
  if t.id is null then return false; end if;               -- transición inexistente
  if t.permiso_id is null then return true; end if;         -- sin permiso específico
  return coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array[t.permiso_id]), false);
end $$;
revoke all on function authz.can_transition(text, text, text) from public, anon;
grant execute on function authz.can_transition(text, text, text) to authenticated;

-- ── wf_transicionar re-centrado sobre authz.can_transition (idéntico) ───────
create or replace function public.wf_transicionar(
  p_workflow text, p_entidad_id text, p_desde text, p_accion text, p_nota text default null
) returns jsonb
language plpgsql security definer set search_path = public, authz as $$
declare t public.workflow_transition;
begin
  select * into t from public.workflow_transition
   where workflow = p_workflow and accion = p_accion
     and (desde is not distinct from nullif(p_desde,''))
   order by orden limit 1;
  if t.id is null then
    raise exception 'Transición no válida: % / % desde %', p_workflow, p_accion, coalesce(p_desde,'(inicio)');
  end if;
  if not authz.can_transition(p_workflow, p_desde, p_accion) then
    raise exception 'No autorizado para la acción % (requiere %)', p_accion, coalesce(t.permiso_id,'—');
  end if;
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values (p_workflow, p_entidad_id, nullif(p_desde,''), t.hasta, p_accion, public._panel_actor(), p_nota);
  return jsonb_build_object('ok', true, 'hasta', t.hasta);
end $$;

-- ── Descubrimiento: acciones desde un estado + si el usuario puede ejecutarlas ──
create or replace function public.wf_acciones_disponibles(
  p_workflow text, p_desde text default null
) returns jsonb
language sql stable security definer set search_path = public, authz as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', t.id,
           'accion', t.accion,
           'hasta', t.hasta,
           'hasta_etiqueta', coalesce(s.etiqueta, t.hasta),
           'permiso_id', t.permiso_id,
           'permitida', authz.can_transition(p_workflow, p_desde, t.accion)
         ) order by t.orden), '[]'::jsonb)
  from public.workflow_transition t
  left join public.workflow_state s on s.workflow = t.workflow and s.codigo = t.hasta
  where t.workflow = p_workflow
    and (t.desde is not distinct from nullif(p_desde,''));
$$;
revoke all on function public.wf_acciones_disponibles(text, text) from public, anon;
grant execute on function public.wf_acciones_disponibles(text, text) to authenticated;
