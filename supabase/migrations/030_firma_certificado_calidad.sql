-- 030_firma_certificado_calidad.sql
-- FIRMA ELECTRÓNICA del Certificado/Acta del CheckList de Ingreso (HMAC-SHA256).
-- La llave secreta vive SOLO en el esquema `private` (no expuesto por la API);
-- se firma en un RPC SECURITY DEFINER y se verifica en otro RPC (público, para el
-- QR) que jamás devuelve la llave, solo válido/ inválido + datos seguros.
-- Es una firma criptográfica tamper-evident (autenticidad + integridad) para el
-- proceso interno ISO. Para una firma con certificado acreditado (PAdES/FEA) ver
-- PENDIENTES_CALIDAD_RECEPCION.md.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Llave secreta de firma (una fila). Esquema private → no expuesto por PostgREST.
CREATE TABLE IF NOT EXISTS private.calidad_firma_key (
  id      int PRIMARY KEY DEFAULT 1,
  secreto bytea NOT NULL,
  creada  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calidad_firma_key_single CHECK (id = 1)
);
INSERT INTO private.calidad_firma_key (id, secreto)
  VALUES (1, gen_random_bytes(32))
  ON CONFLICT (id) DO NOTHING;
REVOKE ALL ON private.calidad_firma_key FROM PUBLIC, anon, authenticated;

-- Columnas de firma en la tarea.
ALTER TABLE public.tms_calidad_tareas
  ADD COLUMN IF NOT EXISTS firma_digital   text,
  ADD COLUMN IF NOT EXISTS firma_algoritmo text,
  ADD COLUMN IF NOT EXISTS firmado_por     uuid,
  ADD COLUMN IF NOT EXISTS firmado_nombre  text,
  ADD COLUMN IF NOT EXISTS firmado_en      timestamptz;

-- Mensaje canónico determinista (idéntico al firmar y al verificar). Incluye un
-- hash del checklist para que cualquier alteración invalide la firma.
-- pgcrypto vive en el esquema `extensions` en Supabase → calificar las llamadas
-- (digest/hmac) para no depender del search_path.
CREATE OR REPLACE FUNCTION private.calidad_firma_mensaje(t public.tms_calidad_tareas)
 RETURNS text
 LANGUAGE sql IMMUTABLE
AS $function$
  SELECT concat_ws('|',
    'CCO-CAL-CERT-v1',
    t.folio, t.origen, coalesce(t.proveedor,''), coalesce(t.oc,''),
    coalesce(t.fecha_recepcion::text,''), coalesce(t.resultado,''),
    coalesce(t.realizado_nombre,''), coalesce(t.completado_en::text,''),
    encode(extensions.digest(coalesce(t.checklist::text,'{}'), 'sha256'), 'hex')
  );
$function$;

-- Firmar (solo tareas finalizadas; permiso Calidad/Monitoreo).
CREATE OR REPLACE FUNCTION public.firmar_certificado(p_tarea_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user  record;
  v_tarea public.tms_calidad_tareas;
  v_secret bytea;
  v_firma  text;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  SELECT * INTO v_tarea FROM tms_calidad_tareas WHERE id = p_tarea_id;
  IF v_tarea.id IS NULL THEN RAISE EXCEPTION 'Tarea no encontrada'; END IF;
  IF v_tarea.estado NOT IN ('CONFORME','NO_CONFORME') THEN
    RAISE EXCEPTION 'Solo se puede firmar una tarea finalizada';
  END IF;
  IF v_tarea.firma_digital IS NOT NULL THEN
    RAISE EXCEPTION 'La tarea ya está firmada';
  END IF;

  SELECT secreto INTO v_secret FROM private.calidad_firma_key WHERE id = 1;
  v_firma := encode(extensions.hmac(private.calidad_firma_mensaje(v_tarea), encode(v_secret,'hex'), 'sha256'), 'hex');

  UPDATE tms_calidad_tareas
    SET firma_digital = v_firma, firma_algoritmo = 'HMAC-SHA256',
        firmado_por = v_user.id, firmado_nombre = v_user.nombre, firmado_en = now(),
        updated_at = now()
    WHERE id = p_tarea_id;

  RETURN jsonb_build_object('firma', v_firma, 'algoritmo', 'HMAC-SHA256',
                            'firmado_nombre', v_user.nombre);
END;
$function$;

-- Verificar por folio (público: para el QR). No expone la llave; recomputa y
-- compara. Devuelve solo campos seguros para mostrar.
CREATE OR REPLACE FUNCTION public.verificar_certificado(p_folio text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tarea  public.tms_calidad_tareas;
  v_secret bytea;
  v_calc   text;
  v_ok     boolean;
BEGIN
  SELECT * INTO v_tarea FROM tms_calidad_tareas WHERE folio = p_folio;
  IF v_tarea.id IS NULL THEN
    RETURN jsonb_build_object('valido', false, 'motivo', 'Folio no encontrado');
  END IF;
  IF v_tarea.firma_digital IS NULL THEN
    RETURN jsonb_build_object('valido', false, 'motivo', 'El documento no está firmado');
  END IF;

  SELECT secreto INTO v_secret FROM private.calidad_firma_key WHERE id = 1;
  v_calc := encode(extensions.hmac(private.calidad_firma_mensaje(v_tarea), encode(v_secret,'hex'), 'sha256'), 'hex');
  v_ok := (v_calc = v_tarea.firma_digital);

  RETURN jsonb_build_object(
    'valido', v_ok,
    'motivo', CASE WHEN v_ok THEN 'Documento auténtico e íntegro' ELSE 'Firma inválida: el documento pudo ser alterado' END,
    'folio', v_tarea.folio, 'resultado', v_tarea.resultado,
    'proveedor', v_tarea.proveedor, 'oc', v_tarea.oc, 'origen', v_tarea.origen,
    'fecha_recepcion', v_tarea.fecha_recepcion,
    'firmado_nombre', v_tarea.firmado_nombre, 'firmado_en', v_tarea.firmado_en,
    'algoritmo', v_tarea.firma_algoritmo
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.firmar_certificado(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.firmar_certificado(uuid) TO authenticated, service_role;
-- La verificación es pública (QR escaneado por cualquiera): no filtra la llave.
GRANT  EXECUTE ON FUNCTION public.verificar_certificado(text) TO anon, authenticated, service_role;
