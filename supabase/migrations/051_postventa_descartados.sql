-- 051_postventa_descartados.sql
-- Post-Venta: poder ELIMINAR correos/casos y que NO se vuelvan a cargar por error.
--   * tms_postventa_descartados — lista negra de id_correo (EntryID) descartados.
--   * ingesta_pv_correo ignora los id_correo descartados (RETURN NULL).
--   * eliminar_pv_ticket(numero) — borra el caso y descarta sus correos.
--   * eliminar_pv_correo(id_correo) — borra un correo del hilo y lo descarta.

CREATE TABLE IF NOT EXISTS public.tms_postventa_descartados (
  id_correo             text PRIMARY KEY,
  motivo                text,
  descartado_por        uuid,
  descartado_por_nombre text,
  created_at            timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_postventa_descartados ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tms_postventa_descartados FROM anon;
GRANT SELECT ON public.tms_postventa_descartados TO authenticated;
DROP POLICY IF EXISTS tms_postventa_descartados_sel ON public.tms_postventa_descartados;
CREATE POLICY tms_postventa_descartados_sel ON public.tms_postventa_descartados FOR SELECT USING (auth.role() = 'authenticated');

-- ingesta_pv_correo: ahora ignora los correos descartados.
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

  -- Descartado por el usuario: no volver a cargarlo nunca.
  IF EXISTS (SELECT 1 FROM tms_postventa_descartados d WHERE d.id_correo = p_id_correo) THEN
    RETURN NULL;
  END IF;

  -- Idempotencia: el correo ya fue ingresado → devolver su ticket.
  SELECT t.* INTO r FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id
   WHERE c.id_correo = p_id_correo LIMIT 1;
  IF r.id IS NOT NULL THEN RETURN r; END IF;

  v_conv := coalesce(nullif(btrim(p_conversation_id),''), p_id_correo);
  BEGIN v_recibido := (nullif(btrim(coalesce(p_recibido,'')),''))::timestamptz;
  EXCEPTION WHEN others THEN v_recibido := now(); END;
  IF v_recibido IS NULL THEN v_recibido := now(); END IF;
  v_cliente := coalesce(nullif(btrim(p_remitente_nombre),''), nullif(btrim(p_remitente_email),''), 'Correo sin remitente');

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
    FOR i IN 1..40 LOOP  -- reintentos altos: la macro inserta ~1000 tickets en ráfaga
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

-- Eliminar un caso completo (y descartar sus correos para que no reingresen).
CREATE OR REPLACE FUNCTION public.eliminar_pv_ticket(p_numero text, p_descartar boolean DEFAULT true)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; v_id uuid;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);
  SELECT id INTO v_id FROM tms_postventa_tickets WHERE numero = p_numero;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF p_descartar THEN
    INSERT INTO tms_postventa_descartados (id_correo, motivo, descartado_por, descartado_por_nombre)
    SELECT c.id_correo, 'caso eliminado', v.uid, v.nombre FROM tms_postventa_correos c WHERE c.ticket_id = v_id
    ON CONFLICT (id_correo) DO NOTHING;
    INSERT INTO tms_postventa_descartados (id_correo, motivo, descartado_por, descartado_por_nombre)
    SELECT t.id_correo, 'caso eliminado', v.uid, v.nombre FROM tms_postventa_tickets t
     WHERE t.id = v_id AND t.id_correo IS NOT NULL
    ON CONFLICT (id_correo) DO NOTHING;
  END IF;
  DELETE FROM tms_postventa_tickets WHERE id = v_id;  -- cascade borra los correos
END $$;

-- Eliminar un correo puntual del hilo (y descartarlo).
CREATE OR REPLACE FUNCTION public.eliminar_pv_correo(p_id_correo text, p_descartar boolean DEFAULT true)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; v_ticket uuid;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);
  SELECT ticket_id INTO v_ticket FROM tms_postventa_correos WHERE id_correo = p_id_correo;
  IF p_descartar THEN
    INSERT INTO tms_postventa_descartados (id_correo, motivo, descartado_por, descartado_por_nombre)
    VALUES (p_id_correo, 'correo eliminado', v.uid, v.nombre) ON CONFLICT (id_correo) DO NOTHING;
  END IF;
  DELETE FROM tms_postventa_correos WHERE id_correo = p_id_correo;
  -- Si el caso queda sin correos, se elimina (era un caso de correo).
  IF v_ticket IS NOT NULL AND NOT EXISTS (SELECT 1 FROM tms_postventa_correos WHERE ticket_id = v_ticket) THEN
    DELETE FROM tms_postventa_tickets WHERE id = v_ticket AND origen = 'Correo';
  END IF;
END $$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'ingesta_pv_correo(text,text,text,text,text,text,text,text,text,text)',
    'eliminar_pv_ticket(text,boolean)',
    'eliminar_pv_correo(text,boolean)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
