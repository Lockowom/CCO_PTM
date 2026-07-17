-- ============================================================================
--  097_nv_catalogo_purga_canal.sql
--  Modo "Reemplazar canal" para el catálogo de N.V. (Carga Masiva).
--
--  Permite que una carga de N.V PTM/ORANGE/FARMAPACK deje el canal EXACTAMENTE
--  igual al archivo (borra las filas previas de ese canal y luego se hace el
--  upsert normal). Evita residuos y cargas mezcladas (p. ej. N.V. de PTM que
--  se colaron en Orange/Farmapack). Gateado a admin / manage_data_import.
-- ============================================================================
create or replace function public.nv_catalogo_purgar_canal(p_canal text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_canal text := lower(btrim(coalesce(p_canal, ''))); v_n integer;
begin
  if not (private.is_admin() or usuario_tiene_algun_permiso(array['manage_data_import'])) then
    raise exception 'No autorizado';
  end if;
  if v_canal not in ('ptm', 'orange', 'farmapack') then
    raise exception 'Canal inválido: %', p_canal;
  end if;
  delete from public.tms_nv_catalogo where canal = v_canal;
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'canal', v_canal, 'borradas', v_n);
end;
$$;

revoke execute on function public.nv_catalogo_purgar_canal(text) from public, anon;
grant  execute on function public.nv_catalogo_purgar_canal(text) to authenticated;
