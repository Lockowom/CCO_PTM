-- 041_emil_traspasos_supabase.sql
-- Backend en Supabase para el módulo Inventario → Traspasos/Ajustes (app em-il):
--  * tms_emil_sync     — historial compartido (blob {traspasos, ajustes}) por
--    "espacio"; reemplaza la sincronización Firestore de la app (vía cco-bridge.js).
--  * tms_emil_catalogo — catálogo maestro de SKUs (blob array {c,d,u}); se siembra
--    desde el catálogo estático la primera vez y luego vive en Supabase.
-- Ambos accesibles por usuarios AUTENTICADOS (ledger interno compartido). El puente
-- usa el access_token de la sesión de CCO (localStorage) para autenticar los fetch.

CREATE TABLE IF NOT EXISTS public.tms_emil_sync (
  space      text PRIMARY KEY DEFAULT 'default',
  rev        bigint NOT NULL DEFAULT 0,
  data       jsonb  NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_emil_sync ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.tms_emil_sync TO authenticated;
DROP POLICY IF EXISTS emil_sync_auth ON public.tms_emil_sync;
CREATE POLICY emil_sync_auth ON public.tms_emil_sync
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.tms_emil_catalogo (
  id         text PRIMARY KEY DEFAULT 'master',
  data       jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_emil_catalogo ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.tms_emil_catalogo TO authenticated;
DROP POLICY IF EXISTS emil_catalogo_auth ON public.tms_emil_catalogo;
CREATE POLICY emil_catalogo_auth ON public.tms_emil_catalogo
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
