-- ============================================================================
--  135_perf_drop_dup_unique_farmapack.sql — Rendimiento (auditoría)
--  tms_farmapack tenía DOS constraints UNIQUE idénticas (tms_farmapack_uniq y
--  tms_farmapack_unique_key sobre las mismas columnas) → doble índice, doble
--  trabajo en cada escritura. Se elimina la redundante; la otra sigue garantizando
--  la unicidad.
-- ============================================================================
do $$
declare v_con text;
begin
  select conname into v_con from pg_constraint
  where conrelid = 'public.tms_farmapack'::regclass and contype = 'u'
    and conindid = 'public.tms_farmapack_unique_key'::regclass;
  if v_con is not null then
    execute format('alter table public.tms_farmapack drop constraint %I', v_con);
  end if;
end $$;
