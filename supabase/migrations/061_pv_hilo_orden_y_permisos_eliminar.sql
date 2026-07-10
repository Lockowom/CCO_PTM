-- 061 — Post-Venta: orden estable del hilo + eliminar exige supervise_postventa.
--
-- (a) pv_correos_ticket ordenaba solo por `recibido`: los correos de una misma
--     ráfaga (macro) o los que cayeron al fallback now() comparten timestamp y
--     el hilo se mostraba en orden no determinista. Se agrega `created_at, id`
--     como desempate (orden de inserción).
-- (b) eliminar_pv_ticket / eliminar_pv_correo usaban _pv_assert(false), es decir
--     bastaba manage_postventa, contradiciendo el modelo declarado del permiso
--     supervise_postventa "(cerrar/eliminar/técnicos)" (migración 046). Ahora
--     exigen _pv_assert(true). La UI (TabBandeja/ThreadReader) muestra los
--     botones de eliminar solo con ese permiso.

CREATE OR REPLACE FUNCTION public.pv_correos_ticket(p_numero text)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id_correo', c.id_correo, 'remitente_nombre', c.remitente_nombre, 'remitente_email', c.remitente_email,
      'para', c.para, 'cc', c.cc, 'asunto', c.asunto, 'cuerpo', c.cuerpo, 'adjuntos', c.adjuntos,
      'recibido', c.recibido) ORDER BY c.recibido, c.created_at, c.id), '[]'::jsonb)
  FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id
  WHERE t.numero = p_numero;
$$;

-- Igual que la versión de 051, con _pv_assert(true).
CREATE OR REPLACE FUNCTION public.eliminar_pv_ticket(p_numero text, p_descartar boolean DEFAULT true)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; v_id uuid;
BEGIN
  SELECT * INTO v FROM public._pv_assert(true);
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

CREATE OR REPLACE FUNCTION public.eliminar_pv_correo(p_id_correo text, p_descartar boolean DEFAULT true)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; v_ticket uuid;
BEGIN
  SELECT * INTO v FROM public._pv_assert(true);
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
    'pv_correos_ticket(text)',
    'eliminar_pv_ticket(text,boolean)',
    'eliminar_pv_correo(text,boolean)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
