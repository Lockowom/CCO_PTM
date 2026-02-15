-- Habilitar RLS
ALTER TABLE public.tms_direcciones ENABLE ROW LEVEL SECURITY;

-- Borrar políticas anteriores si existen para evitar el error 42710
DROP POLICY IF EXISTS "Permitir Insertar Anonimos" ON public.tms_direcciones;
DROP POLICY IF EXISTS "Permitir Actualizar Anonimos" ON public.tms_direcciones;
DROP POLICY IF EXISTS "Permitir Leer Anonimos" ON public.tms_direcciones;

-- Crear políticas nuevas
CREATE POLICY "Permitir Insertar Anonimos" 
ON public.tms_direcciones 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir Actualizar Anonimos" 
ON public.tms_direcciones 
FOR UPDATE 
TO anon 
USING (true);

CREATE POLICY "Permitir Leer Anonimos" 
ON public.tms_direcciones 
FOR SELECT 
TO anon 
USING (true);
