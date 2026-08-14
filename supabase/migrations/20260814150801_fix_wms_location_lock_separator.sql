-- chr(0) no se puede concatenar en text de PostgreSQL. Se reemplaza por el
-- separador de unidad ASCII 31, válido para construir la llave de advisory lock.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef('public.registrar_putaway_ubicaciones(jsonb)'::regprocedure)
    into v_definition;
  execute replace(v_definition, 'chr(0)', 'chr(31)');

  select pg_get_functiondef('public.mover_ubicacion_wms(uuid,text)'::regprocedure)
    into v_definition;
  execute replace(v_definition, 'chr(0)', 'chr(31)');
end;
$$;
