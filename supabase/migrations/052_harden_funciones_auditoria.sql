-- 052_harden_funciones_auditoria.sql
-- Endurecimiento derivado de la AUDITORÍA COMPLETA de la BD (2026-07-09, get_advisors):
--
-- (A) 11 funciones SECURITY DEFINER eran ejecutables por `anon` (riesgo real: p.ej.
--     pv_dashboard / conteo_conciliacion / conteo_stock_sistema filtraban datos de
--     tickets y stock sin sesión). Se revoca anon/PUBLIC. `verificar_certificado`
--     se conserva pública A PROPÓSITO (verificación por QR del certificado).
-- (B) 7 funciones tenían search_path mutable (advertencia del linter): se fija.
-- (C) La vista materializada mv_dashboard_kpis estaba legible por anon vía API: se revoca
--     (authenticated se mantiene: get_dashboard_kpis es SECURITY INVOKER y la lee).
--
-- Se hace por OID (pg_proc) para no depender de las firmas exactas.

DO $$
DECLARE r record;
BEGIN
  -- (A) revocar anon de las SECURITY DEFINER señaladas por el advisor
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      '_asignacion_calidad_assert_permiso','_calidad_assert_admin','_conteo_assert',
      '_conteo_user','_pv_assert','conteo_ajuste_erp','conteo_conciliacion',
      'conteo_stock_sistema','pv_dashboard','siguiente_pv_numero')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.fn);
  END LOOP;

  -- set_categoria_item es función de TRIGGER: nadie la llama directo (el privilegio
  -- se evalúa al crear el trigger). Se revoca de todos los roles de API.
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'set_categoria_item'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.fn);
  END LOOP;

  -- (B) fijar search_path en las funciones con search_path mutable
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE (n.nspname = 'public' AND p.proname IN (
            '_tms_partidas_norm_partida','_tms_series_norm_serie',
            'categoria_efectiva','clasificar_producto','_conteo_es_super','_conteo_estado'))
       OR (n.nspname = 'private' AND p.proname = 'calidad_firma_mensaje')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.fn);
  END LOOP;
END $$;

-- (C) la MV del dashboard no debe ser legible sin sesión
REVOKE SELECT ON public.mv_dashboard_kpis FROM anon;
