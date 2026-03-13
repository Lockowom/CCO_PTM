-- Agregar columna para token de notificaciones push en la tabla de usuarios
ALTER TABLE public.tms_usuarios 
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Asegurar que los usuarios autenticados puedan actualizar su propio token
CREATE POLICY "Usuarios actualizan su propio token" ON public.tms_usuarios
FOR UPDATE
USING (auth.email() = email)
WITH CHECK (auth.email() = email);
