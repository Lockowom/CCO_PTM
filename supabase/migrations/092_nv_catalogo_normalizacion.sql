-- ============================================================================
--  092_nv_catalogo_normalizacion.sql
--  N.V. NORMALIZADA — evita el bug del BUSCARV del Sheet (datos cruzados)
--
--  En el Sheet, el BUSCARV aproximado + desajuste de formato (número vs texto,
--  sufijo ".0", espacios) devolvía a veces los datos de OTRA N.V. En CCO el match
--  es por igualdad EXACTA (.eq), así que nunca devuelve datos de otra N.V.; para
--  que además el match nunca FALLE, normalizamos la clave (canal + nv) tanto al
--  escribir (este trigger) como al leer (normNV en ingresarService.js):
--    · canal → minúsculas, sin espacios
--    · nv    → sin espacios y sin sufijo ".0" (97200.0 → 97200)
-- ============================================================================

create or replace function public.normalizar_nv(p text)
returns text language sql immutable as $$
  select case
           when p is null then null
           when btrim(p) ~ '^\d+\.0+$' then split_part(btrim(p), '.', 1)
           else btrim(p)
         end;
$$;

create or replace function public.tms_nv_catalogo_norm()
returns trigger language plpgsql as $$
begin
  new.canal := lower(btrim(new.canal));
  new.nv := public.normalizar_nv(new.nv);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_tms_nv_catalogo_norm on public.tms_nv_catalogo;
create trigger trg_tms_nv_catalogo_norm
  before insert or update on public.tms_nv_catalogo
  for each row execute function public.tms_nv_catalogo_norm();

-- Normaliza lo ya cargado (por si se sembró antes del trigger).
update public.tms_nv_catalogo
   set nv = public.normalizar_nv(nv)
 where nv is distinct from public.normalizar_nv(nv);
