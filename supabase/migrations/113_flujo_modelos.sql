-- ============================================================================
--  113_flujo_modelos.sql
--  Persistencia del Mapa de Procesos (Flujo Maestro) editable dentro de la app.
--  Guarda modelos de flujo (nodos + aristas) como JSONB, uno por código
--  ('maestro' + los sub-diagramas si se quieren). Lectura para authenticated;
--  escritura por RPC gateada (_wf_puede_gestionar → admin o manage_workflows).
--  La 1ª carga cae al JSON empaquetado (src/data/flujoMaestro.json) si no hay
--  fila; al guardar se crea/actualiza aquí (fuente de verdad compartida).
-- ============================================================================
create table if not exists public.tms_flujo_modelos (
  codigo     text primary key,
  titulo     text,
  modelo     jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);
comment on table public.tms_flujo_modelos is 'Mapa de Procesos editable: modelos de flujo (nodes/edges) por código.';

alter table public.tms_flujo_modelos enable row level security;
drop policy if exists flujo_select on public.tms_flujo_modelos;
create policy flujo_select on public.tms_flujo_modelos for select to authenticated using (true);
grant select on public.tms_flujo_modelos to authenticated;

create or replace function public.flujo_guardar(p_codigo text, p_titulo text, p_modelo jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  if p_codigo is null or p_codigo = '' then raise exception 'Código requerido'; end if;
  insert into public.tms_flujo_modelos (codigo, titulo, modelo, updated_by)
  values (p_codigo, nullif(p_titulo,''), coalesce(p_modelo, '{"nodes":[],"edges":[]}'::jsonb), public._panel_actor())
  on conflict (codigo) do update set
    titulo = coalesce(nullif(excluded.titulo,''), public.tms_flujo_modelos.titulo),
    modelo = excluded.modelo, updated_at = now(), updated_by = public._panel_actor();
  return jsonb_build_object('ok', true, 'codigo', p_codigo);
end; $function$;
revoke all on function public.flujo_guardar(text, text, jsonb) from public, anon;
grant execute on function public.flujo_guardar(text, text, jsonb) to authenticated;
