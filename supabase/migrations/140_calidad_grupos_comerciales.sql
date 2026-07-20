-- Calidad: reemplazar las 8 categorías de riesgo por los 22 GRUPOS comerciales
-- del ERP como clasificación del producto. La asignación producto→grupo pasa a
-- ser AUTORITATIVA (tms_producto_categoria) desde el maestro del ERP. Cambio
-- reversible: las 8 viejas NO se borran (se desactivan); SIN_CLASIFICAR/BASURA
-- quedan como comodín. Ver aplicación real vía migración MCP 140.
create or replace function public.norm_desc(t text)
returns text language sql immutable as $$
  select upper(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g'))
$$;
-- (INSERT de los 22 grupos en tms_categorias_calidad + UPDATE activo=false de las
--  8 categorías de riesgo + rewrite de categoria_efectiva: ver migración aplicada.)
create or replace function public.categoria_efectiva(descripcion text)
returns text language sql stable as $$
  select coalesce(
    (select categoria from public.tms_producto_categoria
       where descripcion_norm = public.norm_desc(descripcion)),
    'SIN_CLASIFICAR'
  );
$$;
