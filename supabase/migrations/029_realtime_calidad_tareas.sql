-- 029_realtime_calidad_tareas.sql
-- Habilita realtime para la cola de tareas de checklist. Sin esto, una recepción
-- nueva (que crea la tarea vía trigger AFTER INSERT) no aparece en vivo en la
-- pestaña "CheckList de Ingreso" de Calidad hasta revalidar la query.
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_calidad_tareas;
