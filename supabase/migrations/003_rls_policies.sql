-- ============================================================
-- MIGRACIÓN: Habilitar RLS en todas las tablas
-- Fecha: 2026-05-26
-- Prerequisito: 002_auth_migration.sql (auth_uid, helpers)
-- ============================================================

-- PASO 1: Eliminar todas las políticas existentes (EMERGENCY_ALLOW_ALL, rotas)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END;
$$;

-- ============================================================
-- TIER 1: TABLAS OPERACIONALES — auth.role() = 'authenticated' full access
-- Bloquea acceso anónimo, permite operación normal para empleados
-- ============================================================

ALTER TABLE wms_ubicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_wms_ubicaciones" ON wms_ubicaciones FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_nv_diarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_nv_diarias" ON tms_nv_diarias FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_matriz_codigos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_matriz_codigos" ON tms_matriz_codigos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_partidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_partidas" ON tms_partidas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_series" ON tms_series FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_farmapack ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_farmapack" ON tms_farmapack FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DO $$
BEGIN
  IF to_regclass('public.tms_pesos') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.tms_pesos ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'tms_pesos'
        AND policyname = 'auth_all_pesos'
    ) THEN
      EXECUTE 'CREATE POLICY "auth_all_pesos" ON public.tms_pesos FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')';
    END IF;
  END IF;
END $$;

ALTER TABLE tms_control_despacho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_control_despacho" ON tms_control_despacho FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_direcciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_direcciones" ON tms_direcciones FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_mediciones_tiempos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_mediciones" ON tms_mediciones_tiempos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_conductores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_conductores" ON tms_conductores FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_entregas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_entregas" ON tms_entregas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_rutas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_rutas" ON tms_rutas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_recepciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_recepciones" ON tms_recepciones FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_recepcion_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_recepcion_items" ON tms_recepcion_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_nv_eliminadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_nv_eliminadas" ON tms_nv_eliminadas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_errores_picking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_errores_picking" ON tms_errores_picking FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DO $$
BEGIN
  IF to_regclass('public.tms_cubicaje_historial') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.tms_cubicaje_historial ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'tms_cubicaje_historial'
        AND policyname = 'auth_all_cubicaje'
    ) THEN
      EXECUTE 'CREATE POLICY "auth_all_cubicaje" ON public.tms_cubicaje_historial FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')';
    END IF;
  END IF;
END $$;

ALTER TABLE tms_inventario_general ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_inventario_general" ON tms_inventario_general FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_inventario_resumen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_inventario_resumen" ON tms_inventario_resumen FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE wms_layout ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_wms_layout" ON wms_layout FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_historial_cargas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_historial_cargas" ON tms_historial_cargas FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_accesos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_accesos" ON tms_accesos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_usuarios_activos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_usuarios_activos" ON tms_usuarios_activos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_permisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_permisos" ON tms_permisos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE tms_roles_permisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_roles_permisos" ON tms_roles_permisos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- TIER 2: TABLAS SENSIBLES — restricciones por rol
-- ============================================================

-- tms_usuarios: todos leen, solo admin o el propio usuario edita
ALTER TABLE tms_usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios_select_auth" ON tms_usuarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "usuarios_insert_admin" ON tms_usuarios FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "usuarios_update_self_or_admin" ON tms_usuarios FOR UPDATE USING (auth.uid() = auth_uid OR is_admin());
CREATE POLICY "usuarios_delete_admin" ON tms_usuarios FOR DELETE USING (is_admin());

-- tms_roles: todos leen, solo admin escribe
ALTER TABLE tms_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_auth" ON tms_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "roles_write_admin" ON tms_roles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "roles_update_admin" ON tms_roles FOR UPDATE USING (is_admin());
CREATE POLICY "roles_delete_admin" ON tms_roles FOR DELETE USING (is_admin());

-- tms_modules_config: todos leen, solo admin modifica
ALTER TABLE tms_modules_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_select_auth" ON tms_modules_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "modules_write_admin" ON tms_modules_config FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "modules_update_admin" ON tms_modules_config FOR UPDATE USING (is_admin());

-- tms_tickets: todos crean, ven propios; admin ve/edita todos
ALTER TABLE tms_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_insert_auth" ON tms_tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "tickets_select_own_or_admin" ON tms_tickets FOR SELECT USING (usuario_id::uuid = (SELECT id FROM tms_usuarios WHERE auth_uid = auth.uid()) OR is_admin());
CREATE POLICY "tickets_update_admin" ON tms_tickets FOR UPDATE USING (is_admin());
CREATE POLICY "tickets_delete_admin" ON tms_tickets FOR DELETE USING (is_admin());

-- NOTA: Esta migración fue ejecutada manualmente el 2026-05-26.
-- 30 tablas con RLS habilitado y políticas aplicadas.
