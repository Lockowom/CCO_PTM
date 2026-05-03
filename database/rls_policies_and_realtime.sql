-- ====================================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS) PARA SUPABASE
-- Este script blinda la base de datos a nivel servidor para evitar accesos no autorizados.
-- ====================================================================================

-- 1. Habilitar RLS en las tablas principales
ALTER TABLE public.tms_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_nv_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wms_ubicaciones ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'tms_usuarios'
-- Los administradores pueden ver y modificar todo.
CREATE POLICY "Admins_all_access_usuarios" 
ON public.tms_usuarios FOR ALL 
USING ( (SELECT rol FROM public.tms_usuarios WHERE id = auth.uid()) = 'ADMIN' );

-- Los usuarios normales solo pueden verse a sí mismos
CREATE POLICY "Users_view_self" 
ON public.tms_usuarios FOR SELECT 
USING ( id = auth.uid() );


-- 3. Políticas para 'tms_nv_diarias' (Notas de Venta / Tareas de Picking)
-- Todos los usuarios autenticados pueden ver las tareas
CREATE POLICY "All_users_view_tasks" 
ON public.tms_nv_diarias FOR SELECT 
USING ( auth.role() = 'authenticated' );

-- Solo los Operadores asignados o los Administradores pueden actualizar el estado de una tarea
CREATE POLICY "Assigned_users_or_admins_update_tasks" 
ON public.tms_nv_diarias FOR UPDATE 
USING (
  usuario_asignado = auth.uid() 
  OR 
  (SELECT rol FROM public.tms_usuarios WHERE id = auth.uid()) = 'ADMIN'
);


-- 4. Políticas para 'wms_ubicaciones' (Inventario Físico)
-- Todos los autenticados pueden ver ubicaciones (necesario para el buscador)
CREATE POLICY "All_users_view_locations" 
ON public.wms_ubicaciones FOR SELECT 
USING ( auth.role() = 'authenticated' );

-- Solo administradores o roles específicos pueden ELIMINAR ubicaciones
CREATE POLICY "Admins_delete_locations" 
ON public.wms_ubicaciones FOR DELETE 
USING ( (SELECT rol FROM public.tms_usuarios WHERE id = auth.uid()) = 'ADMIN' );

-- Los operarios pueden ACTUALIZAR ubicaciones (ej: al confirmar un picking o conteo cíclico)
CREATE POLICY "Operators_update_locations" 
ON public.wms_ubicaciones FOR UPDATE 
USING ( auth.role() = 'authenticated' );


-- ====================================================================================
-- ACTIVACIÓN DE SUPABASE REALTIME (Para el Modo Multijugador / Presence)
-- ====================================================================================
-- Asegurar que la tabla tms_nv_diarias y wms_ubicaciones transmitan cambios en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_nv_diarias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wms_ubicaciones;
