-- Hito 3: vincula los certificados de salida con su N.V. y notifica a Gerencia
-- No modifica los hitos 1 y 2.

ALTER TABLE public.tms_calidad_tareas
  ADD COLUMN IF NOT EXISTS operacion_id bigint
  REFERENCES public.tms_operaciones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_calidad_salida_operacion_finalizada
  ON public.tms_calidad_tareas (operacion_id, completado_en DESC)
  WHERE tipo = 'CERTIFICADO_SALIDA' AND estado IN ('CONFORME', 'NO_CONFORME');

-- Resuelve la N.V. contra la operación vigente al crear una tarea manual o
-- generada desde despacho.  Si no existe una N.V. coincidente, la tarea sigue
-- siendo válida pero queda sin vínculo hasta que se corrija la N.V.
CREATE OR REPLACE FUNCTION public.vincular_calidad_salida_a_operacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_nv text := nullif(btrim(coalesce(NEW.oc, '')), '');
BEGIN
  IF NEW.tipo <> 'CERTIFICADO_SALIDA' OR NEW.operacion_id IS NOT NULL OR v_nv IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT o.id
    INTO NEW.operacion_id
    FROM public.tms_operaciones o
   WHERE o.nv_ptm::text = v_nv
      OR o.nv_orange = v_nv
      OR o.nv_farmapack = v_nv
      OR o.varios = v_nv
   ORDER BY coalesce(o.fecha_estado, o.updated_at, o.created_at) DESC NULLS LAST
   LIMIT 1;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vincular_calidad_salida_a_operacion ON public.tms_calidad_tareas;
CREATE TRIGGER trg_vincular_calidad_salida_a_operacion
  BEFORE INSERT OR UPDATE OF oc, tipo, operacion_id ON public.tms_calidad_tareas
  FOR EACH ROW EXECUTE FUNCTION public.vincular_calidad_salida_a_operacion();

-- Enlaza también certificados Hito 3 que ya existen, sin sobrescribir enlaces
-- que ya pudieran haberse asignado manualmente.
UPDATE public.tms_calidad_tareas t
   SET operacion_id = (
     SELECT o.id
       FROM public.tms_operaciones o
      WHERE o.nv_ptm::text = nullif(btrim(t.oc), '')
         OR o.nv_orange = nullif(btrim(t.oc), '')
         OR o.nv_farmapack = nullif(btrim(t.oc), '')
         OR o.varios = nullif(btrim(t.oc), '')
      ORDER BY coalesce(o.fecha_estado, o.updated_at, o.created_at) DESC NULLS LAST
      LIMIT 1
   )
 WHERE t.tipo = 'CERTIFICADO_SALIDA'
   AND t.operacion_id IS NULL
   AND nullif(btrim(t.oc), '') IS NOT NULL;

-- Acceso de solo lectura: quienes ya pueden ver el Panel, Calidad o Gerencia.
-- La función expone únicamente informes Hito 3 ya finalizados.
CREATE OR REPLACE FUNCTION public.puede_ver_certificados_salida()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'iam'
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.tms_usuarios u
     WHERE u.auth_uid = auth.uid()
       AND u.activo = true
       AND u.rol = 'GERENCIA'
  )
  OR public.usuario_tiene_algun_permiso(
    ARRAY['view_panel', 'manage_quality', 'manage_monitoreo', 'view_acciones_calidad']
  );
$$;

CREATE OR REPLACE FUNCTION public.nv_certificados_salida(p_operacion_id bigint)
RETURNS TABLE (
  tarea_id uuid,
  nv text,
  folio text,
  resultado text,
  completado_en timestamptz,
  realizado_nombre text,
  firmado_en timestamptz,
  firmado_nombre text,
  observaciones text,
  disposicion text,
  cliente text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.puede_ver_certificados_salida() THEN
    RAISE EXCEPTION 'No autorizado para ver certificados de salida';
  END IF;

  RETURN QUERY
  SELECT t.id, t.oc, t.folio, t.resultado, t.completado_en,
         t.realizado_nombre, t.firmado_en, t.firmado_nombre,
         t.observaciones, t.disposicion, t.proveedor
    FROM public.tms_calidad_tareas t
   WHERE t.tipo = 'CERTIFICADO_SALIDA'
     AND t.operacion_id = p_operacion_id
     AND t.estado IN ('CONFORME', 'NO_CONFORME')
   ORDER BY t.completado_en DESC, t.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.puede_ver_certificados_salida() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.nv_certificados_salida(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.puede_ver_certificados_salida() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.nv_certificados_salida(bigint) TO authenticated, service_role;

-- Al finalizar un Hito 3, emite un evento único. El despachador existente crea
-- la notificación in-app para el rol GERENCIA; no se notifica al guardar borradores.
CREATE OR REPLACE FUNCTION public.notificar_certificado_salida_finalizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo = 'CERTIFICADO_SALIDA'
     AND NEW.estado IN ('CONFORME', 'NO_CONFORME')
     AND coalesce(OLD.estado, '') NOT IN ('CONFORME', 'NO_CONFORME') THEN
    INSERT INTO public.dominio_eventos(nombre, agregado, agregado_id, actor, payload)
    VALUES (
      'CALIDAD_SALIDA_FINALIZADA',
      'CERTIFICADO_SALIDA',
      coalesce(nullif(NEW.oc, ''), NEW.id::text),
      NEW.realizado_nombre,
      jsonb_build_object(
        'tarea_id', NEW.id,
        'operacion_id', NEW.operacion_id,
        'nv', NEW.oc,
        'folio', NEW.folio,
        'resultado', NEW.resultado,
        'desde', NEW.folio,
        'hasta', NEW.resultado,
        'cliente', NEW.proveedor,
        'route', '/panel/info?nv=' || coalesce(NEW.oc, '')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notificar_certificado_salida_finalizado ON public.tms_calidad_tareas;
CREATE TRIGGER trg_notificar_certificado_salida_finalizado
  AFTER UPDATE OF estado ON public.tms_calidad_tareas
  FOR EACH ROW EXECUTE FUNCTION public.notificar_certificado_salida_finalizado();

-- Se reemplaza de forma idempotente para que exista una sola regla activa.
DELETE FROM public.notificacion_regla
 WHERE nombre = 'Certificado de salida finalizado para Gerencia';

INSERT INTO public.notificacion_regla (
  nombre, evento_patron, canal, destinatario_rol, titulo_tpl, mensaje_tpl, activo, orden
) VALUES (
  'Certificado de salida finalizado para Gerencia',
  '^CALIDAD_SALIDA_FINALIZADA$',
  'in-app',
  'GERENCIA',
  'Informe de salida NV {id}',
  'Resultado: {hasta}. Folio: {desde}.',
  true,
  60
);
