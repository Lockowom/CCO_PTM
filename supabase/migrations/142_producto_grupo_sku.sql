-- Mapeo SKU (código de producto) → grupo comercial del ERP. Para el buscador de
-- grupos (Consultas → Grupo por SKU) y la Carga Masiva (dedup por código; los
-- nuevos se detectan solos). Se añade tms_producto_grupo al allowlist de
-- bulk_upsert (ver migración aplicada por MCP para la recreación completa).
create table if not exists public.tms_producto_grupo (
  codigo_producto text primary key,
  producto text,
  grupo text,
  updated_at timestamptz default now()
);
alter table public.tms_producto_grupo enable row level security;
grant select on public.tms_producto_grupo to authenticated;
drop policy if exists producto_grupo_select on public.tms_producto_grupo;
create policy producto_grupo_select on public.tms_producto_grupo for select to authenticated using (true);

-- Buscador de grupo por SKU o nombre (SECURITY DEFINER, solo authenticated).
create or replace function public.consultar_grupo(p_q text, p_limit int default 20)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(r), '[]'::jsonb) from (
    select jsonb_build_object('codigo', codigo_producto, 'producto', producto, 'grupo', grupo) r
    from public.tms_producto_grupo
    where p_q is not null and p_q <> '' and (
      codigo_producto ilike '%'||p_q||'%' or coalesce(producto,'') ilike '%'||p_q||'%'
    )
    order by (case when upper(trim(codigo_producto)) = upper(trim(p_q)) then 0 else 1 end), codigo_producto
    limit greatest(1, least(coalesce(p_limit, 20), 50))
  ) s;
$$;
revoke all on function public.consultar_grupo(text, int) from public, anon;
grant execute on function public.consultar_grupo(text, int) to authenticated;
-- NOTA: bulk_upsert se recrea con 'tms_producto_grupo' en el allowlist (aplicado vía MCP).
