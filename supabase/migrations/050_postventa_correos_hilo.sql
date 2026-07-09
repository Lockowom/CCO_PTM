-- 050_postventa_correos_hilo.sql
-- Post-Venta: leer el correo como en Outlook (De/Para/CC/Asunto/cuerpo) y agrupar
-- por CONVERSACIÓN (un hilo = un caso, sin tickets duplicados por cada respuesta).
--   * tms_postventa_correos — cada correo con todos sus campos (dedup por id_correo/EntryID).
--   * tms_postventa_tickets.conversation_id — el hilo al que pertenece el ticket.
--   * ingesta_pv_correo(...) — RPC que guarda el correo y lo enlaza a UN ticket por hilo.
--   * pv_correos_ticket(numero) — devuelve el hilo completo ordenado por fecha.

ALTER TABLE public.tms_postventa_tickets ADD COLUMN IF NOT EXISTS conversation_id text;
CREATE INDEX IF NOT EXISTS idx_pv_tickets_conv ON public.tms_postventa_tickets(conversation_id);

CREATE TABLE IF NOT EXISTS public.tms_postventa_correos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_correo        text UNIQUE NOT NULL,
  conversation_id  text,
  ticket_id        uuid REFERENCES public.tms_postventa_tickets(id) ON DELETE CASCADE,
  remitente_nombre text,
  remitente_email  text,
  para             text,
  cc               text,
  asunto           text,
  cuerpo           text,
  adjuntos         text,
  recibido         timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pv_correos_ticket ON public.tms_postventa_correos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_pv_correos_conv   ON public.tms_postventa_correos(conversation_id);

ALTER TABLE public.tms_postventa_correos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tms_postventa_correos FROM anon;
GRANT SELECT ON public.tms_postventa_correos TO authenticated;
DROP POLICY IF EXISTS tms_postventa_correos_sel ON public.tms_postventa_correos;
CREATE POLICY tms_postventa_correos_sel ON public.tms_postventa_correos FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.ingesta_pv_correo(
  p_id_correo text, p_conversation_id text DEFAULT NULL, p_recibido text DEFAULT NULL,
  p_remitente_nombre text DEFAULT '', p_remitente_email text DEFAULT '',
  p_para text DEFAULT '', p_cc text DEFAULT '', p_asunto text DEFAULT '',
  p_cuerpo text DEFAULT '', p_adjuntos text DEFAULT ''
) RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_postventa_tickets; v_conv text; v_recibido timestamptz;
  v_cliente text; v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);
  IF coalesce(btrim(p_id_correo),'')='' THEN RAISE EXCEPTION 'id_correo requerido'; END IF;

  -- Idempotencia: el correo ya fue ingresado → devolver su ticket.
  SELECT t.* INTO r FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id
   WHERE c.id_correo = p_id_correo LIMIT 1;
  IF r.id IS NOT NULL THEN RETURN r; END IF;

  v_conv := coalesce(nullif(btrim(p_conversation_id),''), p_id_correo);
  BEGIN v_recibido := (nullif(btrim(coalesce(p_recibido,'')),''))::timestamptz;
  EXCEPTION WHEN others THEN v_recibido := now(); END;
  IF v_recibido IS NULL THEN v_recibido := now(); END IF;
  v_cliente := coalesce(nullif(btrim(p_remitente_nombre),''), nullif(btrim(p_remitente_email),''), 'Correo sin remitente');

  -- Ticket del hilo, o del flujo viejo (id_correo directo en el ticket).
  SELECT * INTO r FROM tms_postventa_tickets WHERE conversation_id = v_conv ORDER BY created_at LIMIT 1;
  IF r.id IS NULL THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE id_correo = p_id_correo LIMIT 1;
    IF r.id IS NOT NULL AND coalesce(r.conversation_id,'') = '' THEN
      UPDATE tms_postventa_tickets SET conversation_id = v_conv WHERE id = r.id;
    END IF;
  END IF;

  IF r.id IS NULL THEN
    v_anio := extract(year FROM (now() AT TIME ZONE 'America/Santiago'));
    v_pref := 'TKT-' || v_anio || '-';
    PERFORM pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
    FOR i IN 1..6 LOOP
      SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
      v_numero := v_pref || lpad((v_n+1)::text, 3, '0');
      BEGIN
        INSERT INTO tms_postventa_tickets (numero, cliente, region, contacto, equipo_modelo,
          tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar,
          origen, id_correo, conversation_id, creado_por, creado_por_nombre)
        VALUES (v_numero, v_cliente, 'Por Definir', nullif(btrim(coalesce(p_remitente_email,'')),''), 'Por Definir',
          'Otro', 'Media', 'Sin Asignar', 'Abierto', coalesce(nullif(btrim(p_asunto),''),'(sin asunto)'), 'No',
          'Correo', p_id_correo, v_conv, v.uid, v.nombre)
        RETURNING * INTO r;
        EXIT;
      EXCEPTION WHEN unique_violation THEN CONTINUE; END;
    END LOOP;
    IF r.id IS NULL THEN RAISE EXCEPTION 'No se pudo generar un número de ticket único'; END IF;
  END IF;

  INSERT INTO tms_postventa_correos (id_correo, conversation_id, ticket_id, remitente_nombre, remitente_email,
    para, cc, asunto, cuerpo, adjuntos, recibido)
  VALUES (p_id_correo, v_conv, r.id, nullif(btrim(p_remitente_nombre),''), nullif(btrim(p_remitente_email),''),
    nullif(btrim(p_para),''), nullif(btrim(p_cc),''), nullif(btrim(p_asunto),''), p_cuerpo, nullif(btrim(p_adjuntos),''), v_recibido)
  ON CONFLICT (id_correo) DO NOTHING;

  UPDATE tms_postventa_tickets SET updated_at = now() WHERE id = r.id;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.pv_correos_ticket(p_numero text)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id_correo', c.id_correo, 'remitente_nombre', c.remitente_nombre, 'remitente_email', c.remitente_email,
      'para', c.para, 'cc', c.cc, 'asunto', c.asunto, 'cuerpo', c.cuerpo, 'adjuntos', c.adjuntos,
      'recibido', c.recibido) ORDER BY c.recibido), '[]'::jsonb)
  FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id
  WHERE t.numero = p_numero;
$$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'ingesta_pv_correo(text,text,text,text,text,text,text,text,text,text)',
    'pv_correos_ticket(text)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
