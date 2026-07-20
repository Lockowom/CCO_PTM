-- RPCs para cargar el mapeo producto→grupo (clasificación) y reclasificar las
-- recepciones existentes. Gateadas por permiso de Calidad.
create or replace function public.calidad_cargar_clasificacion(p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not public.usuario_tiene_algun_permiso(array['manage_quality','manage_monitoreo']) then
    raise exception 'No autorizado';
  end if;
  insert into public.tms_producto_categoria (descripcion_norm, categoria)
  select public.norm_desc(x->>'d'), x->>'c'
  from jsonb_array_elements(p_rows) x
  where coalesce(x->>'d','') <> '' and coalesce(x->>'c','') <> ''
    and exists (select 1 from public.tms_categorias_calidad c where c.codigo = x->>'c')
  on conflict (descripcion_norm) do update set categoria = excluded.categoria, updated_at = now();
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'procesados', v_n);
end $$;
create or replace function public.calidad_reclasificar_recepciones()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v1 int; v2 int;
begin
  if not public.usuario_tiene_algun_permiso(array['manage_quality','manage_monitoreo']) then
    raise exception 'No autorizado';
  end if;
  update public.tms_recepcion_items set categoria = public.categoria_efectiva(descripcion);
  get diagnostics v1 = row_count;
  update public.tms_recepcion_items_nacionales set categoria = public.categoria_efectiva(descripcion);
  get diagnostics v2 = row_count;
  return jsonb_build_object('ok', true, 'importacion', v1, 'nacional', v2);
end $$;
revoke all on function public.calidad_cargar_clasificacion(jsonb) from public, anon;
revoke all on function public.calidad_reclasificar_recepciones() from public, anon;
grant execute on function public.calidad_cargar_clasificacion(jsonb) to authenticated;
grant execute on function public.calidad_reclasificar_recepciones() to authenticated;
