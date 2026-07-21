-- ============================================================================
-- 145 · Realtime para el Dashboard del Panel
-- ----------------------------------------------------------------------------
-- El Dashboard se suscribía a cambios de `tms_operaciones_sync` para refrescarse
-- solo, PERO ninguna de las dos tablas estaba en la publicación `supabase_realtime`
-- → la suscripción nunca disparaba y los datos solo se actualizaban con el
-- contador de 120s ("no se actualizan los datos"). Se agregan ambas tablas a la
-- publicación para que el Dashboard refresque al instante cuando se ingresa o
-- edita una N.V. (Realtime respeta RLS: cada cliente solo recibe lo que ya puede
-- leer). Idempotente.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tms_operaciones'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_operaciones';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tms_operaciones_sync'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_operaciones_sync';
  END IF;
END $$;
