-- 046_postventa_tickets.sql
-- Módulo Post-Venta / Servicio Técnico (port nativo de lockowom/post-venta a
-- Supabase). Tickets TKT-AAAA-### de equipos médicos: cliente/hospital, región,
-- equipo/modelo, N° serie, tipo, prioridad, técnico, estado, cotizar, resultado.
--   * tms_postventa_tecnicos — catálogo editable de técnicos.
--   * tms_postventa_tickets  — tickets.
-- Escrituras por RPC SECURITY DEFINER (el extractor de correos entra como
-- service_role). Lectura por RLS a authenticated. Permisos view/manage/supervise.

-- ============================================================
-- 1. Tablas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tms_postventa_tecnicos (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden  integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.tms_postventa_tecnicos (nombre, orden) VALUES
  ('Cesar Tapia',1),('Lucas Toloza',2),('Oscar Leiva',3),
  ('Cristobal Altamirano',4),('Leticia Rivera',5),('Sin Asignar',99)
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tms_postventa_tickets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            text UNIQUE NOT NULL,
  fecha_apertura    date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Santiago')::date,
  cliente           text NOT NULL,
  region            text NOT NULL,
  contacto          text,
  equipo_modelo     text NOT NULL,
  numero_serie      text,
  tipo_solicitud    text NOT NULL,
  prioridad         text NOT NULL DEFAULT 'Media',
  tecnico_asignado  text NOT NULL DEFAULT 'Sin Asignar',
  estado            text NOT NULL DEFAULT 'Abierto',
  descripcion       text NOT NULL,
  cotizar           text DEFAULT 'No',
  fecha_cierre      date,
  resultado         text,
  observaciones     text,
  origen            text NOT NULL DEFAULT 'Manual',   -- Manual | Correo
  id_correo         text,                             -- id del mensaje M365 (dedup)
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pv_tickets_estado    ON public.tms_postventa_tickets(estado);
CREATE INDEX IF NOT EXISTS idx_pv_tickets_tecnico   ON public.tms_postventa_tickets(tecnico_asignado);
CREATE INDEX IF NOT EXISTS idx_pv_tickets_prioridad ON public.tms_postventa_tickets(prioridad);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pv_tickets_idcorreo ON public.tms_postventa_tickets(id_correo) WHERE id_correo IS NOT NULL;

-- ============================================================
-- 2. RLS: lectura authenticated; escritura por RPC
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tms_postventa_tecnicos','tms_postventa_tickets'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
    EXECUTE format($p$DROP POLICY IF EXISTS %I ON public.%I$p$, t||'_sel', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR SELECT USING (auth.role() = 'authenticated')$p$, t||'_sel', t);
  END LOOP;
END $$;

-- ============================================================
-- 3. Permisos
-- ============================================================
INSERT INTO public.tms_permisos (id, nombre, modulo) VALUES
  ('view_postventa',      'Ver Post-Venta',                 'postventa'),
  ('manage_postventa',    'Gestionar tickets Post-Venta',   'postventa'),
  ('supervise_postventa', 'Supervisar Post-Venta (cerrar/eliminar/técnicos)', 'postventa')
ON CONFLICT (id) DO NOTHING;
-- Post-venta/ventas ya existentes: dar acceso a quienes gestionan calidad/ventas.
UPDATE public.tms_roles SET permisos_json = permisos_json || '["view_postventa","manage_postventa"]'::jsonb
 WHERE (permisos_json ? 'view_acciones_calidad' OR permisos_json ? 'manage_sales_orders')
   AND NOT (permisos_json ? 'manage_postventa');

-- ============================================================
-- 4. Helper de permiso (permite service_role para el extractor)
-- ============================================================
CREATE OR REPLACE FUNCTION public._pv_assert(p_super boolean DEFAULT false)
 RETURNS TABLE(uid uuid, nombre text, rol text, es_admin_delegado boolean, permisos jsonb)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record;
BEGIN
  IF auth.role() = 'service_role' THEN
    uid := NULL; nombre := 'Extractor de correos'; rol := 'SERVICE';
    es_admin_delegado := true; permisos := '[]'::jsonb; RETURN NEXT; RETURN;
  END IF;
  SELECT u.auth_uid, u.nombre::text AS nombre, u.rol::text AS rol, u.es_admin_delegado,
         coalesce((SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol), '[]'::jsonb) AS permisos
    INTO v
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true LIMIT 1;
  IF v.auth_uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado) THEN
    IF p_super THEN
      IF NOT (v.permisos ? 'supervise_postventa') THEN RAISE EXCEPTION 'Acceso denegado: se requiere supervisión de Post-Venta'; END IF;
    ELSE
      IF NOT ((v.permisos ? 'manage_postventa') OR (v.permisos ? 'supervise_postventa')) THEN RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Post-Venta'; END IF;
    END IF;
  END IF;
  uid := v.auth_uid; nombre := v.nombre; rol := v.rol; es_admin_delegado := v.es_admin_delegado; permisos := v.permisos;
  RETURN NEXT;
END $$;

-- ============================================================
-- 5. RPCs — número + tickets
-- ============================================================
CREATE OR REPLACE FUNCTION public.siguiente_pv_numero()
 RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_anio int := extract(year FROM (now() AT TIME ZONE 'America/Santiago')); v_pref text; v_n int;
BEGIN
  v_pref := 'TKT-' || v_anio || '-';
  SELECT coalesce(max((split_part(numero,'-',3))::int), 0) INTO v_n
    FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
  RETURN v_pref || lpad((v_n + 1)::text, 3, '0');
END $$;
GRANT EXECUTE ON FUNCTION public.siguiente_pv_numero() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.crear_pv_ticket(
  p_cliente text, p_region text, p_equipo_modelo text, p_tipo_solicitud text,
  p_prioridad text, p_descripcion text,
  p_contacto text DEFAULT '', p_numero_serie text DEFAULT '', p_tecnico text DEFAULT 'Sin Asignar',
  p_estado text DEFAULT 'Abierto', p_cotizar text DEFAULT 'No', p_observaciones text DEFAULT '',
  p_origen text DEFAULT 'Manual', p_id_correo text DEFAULT NULL
) RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_postventa_tickets; v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);

  -- Idempotencia para el extractor: si ya existe un ticket con ese id de correo, devolverlo.
  IF p_id_correo IS NOT NULL AND btrim(p_id_correo) <> '' THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE id_correo = p_id_correo LIMIT 1;
    IF r.id IS NOT NULL THEN RETURN r; END IF;
  END IF;

  IF coalesce(btrim(p_cliente),'')='' OR coalesce(btrim(p_region),'')='' OR coalesce(btrim(p_equipo_modelo),'')=''
     OR coalesce(btrim(p_tipo_solicitud),'')='' OR coalesce(btrim(p_prioridad),'')='' OR coalesce(btrim(p_descripcion),'')='' THEN
    RAISE EXCEPTION 'Faltan campos obligatorios (cliente, región, equipo, tipo, prioridad, descripción)';
  END IF;

  v_anio := extract(year FROM (now() AT TIME ZONE 'America/Santiago'));
  v_pref := 'TKT-' || v_anio || '-';
  PERFORM pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
  FOR i IN 1..6 LOOP
    SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
    v_numero := v_pref || lpad((v_n+1)::text, 3, '0');
    BEGIN
      INSERT INTO tms_postventa_tickets (numero, cliente, region, contacto, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, id_correo, creado_por, creado_por_nombre)
      VALUES (v_numero, btrim(p_cliente), btrim(p_region), nullif(btrim(coalesce(p_contacto,'')),''), btrim(p_equipo_modelo),
        nullif(btrim(coalesce(p_numero_serie,'')),''), btrim(p_tipo_solicitud), btrim(p_prioridad),
        coalesce(nullif(btrim(coalesce(p_tecnico,'')),''),'Sin Asignar'), coalesce(nullif(btrim(coalesce(p_estado,'')),''),'Abierto'),
        btrim(p_descripcion), coalesce(nullif(btrim(coalesce(p_cotizar,'')),''),'No'), nullif(btrim(coalesce(p_observaciones,'')),''),
        coalesce(nullif(btrim(coalesce(p_origen,'')),''),'Manual'), p_id_correo, v.uid, v.nombre)
      RETURNING * INTO r;
      RETURN r;
    EXCEPTION WHEN unique_violation THEN
      -- colisión de numero → reintentar
      CONTINUE;
    END;
  END LOOP;
  RAISE EXCEPTION 'No se pudo generar un número de ticket único';
END $$;

CREATE OR REPLACE FUNCTION public.actualizar_pv_ticket(p_numero text, p_campos jsonb)
 RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_postventa_tickets; v_super boolean;
BEGIN
  PERFORM public._pv_assert(false);
  IF p_campos IS NULL OR jsonb_typeof(p_campos) <> 'object' THEN RAISE EXCEPTION 'campos inválidos'; END IF;

  UPDATE tms_postventa_tickets t SET
    cliente          = coalesce(p_campos->>'cliente', cliente),
    region           = coalesce(p_campos->>'region', region),
    contacto         = coalesce(p_campos->>'contacto', contacto),
    equipo_modelo    = coalesce(p_campos->>'equipo_modelo', equipo_modelo),
    numero_serie     = coalesce(p_campos->>'numero_serie', numero_serie),
    tipo_solicitud   = coalesce(p_campos->>'tipo_solicitud', tipo_solicitud),
    prioridad        = coalesce(p_campos->>'prioridad', prioridad),
    tecnico_asignado = coalesce(p_campos->>'tecnico_asignado', tecnico_asignado),
    estado           = coalesce(p_campos->>'estado', estado),
    descripcion      = coalesce(p_campos->>'descripcion', descripcion),
    cotizar          = coalesce(p_campos->>'cotizar', cotizar),
    resultado        = coalesce(p_campos->>'resultado', resultado),
    observaciones    = coalesce(p_campos->>'observaciones', observaciones),
    fecha_cierre     = CASE WHEN p_campos ? 'fecha_cierre'
                            THEN nullif(p_campos->>'fecha_cierre','')::date
                            WHEN coalesce(p_campos->>'estado','') = 'Cerrado' AND t.fecha_cierre IS NULL
                            THEN (now() AT TIME ZONE 'America/Santiago')::date
                            ELSE fecha_cierre END,
    updated_at       = now()
  WHERE t.numero = p_numero
  RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  RETURN r;
END $$;

-- ============================================================
-- 6. RPC — dashboard
-- ============================================================
CREATE OR REPLACE FUNCTION public.pv_dashboard()
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'resumen', (SELECT jsonb_build_object(
        'total', count(*),
        'abiertos', count(*) FILTER (WHERE estado='Abierto'),
        'en_proceso', count(*) FILTER (WHERE estado='En Proceso'),
        'pendiente_cliente', count(*) FILTER (WHERE estado='Pendiente Cliente'),
        'cerrados', count(*) FILTER (WHERE estado='Cerrado'),
        'prioridad_alta', count(*) FILTER (WHERE prioridad='Alta')
      ) FROM tms_postventa_tickets),
    'por_estado', coalesce((SELECT jsonb_object_agg(estado, c) FROM (SELECT estado, count(*) c FROM tms_postventa_tickets GROUP BY estado) a), '{}'::jsonb),
    'por_tipo',   coalesce((SELECT jsonb_object_agg(tipo_solicitud, c) FROM (SELECT tipo_solicitud, count(*) c FROM tms_postventa_tickets GROUP BY tipo_solicitud) a), '{}'::jsonb),
    'por_tecnico', coalesce((SELECT jsonb_object_agg(tec, jsonb_build_object('total', tot, 'abiertos', ab)) FROM (
        SELECT coalesce(nullif(btrim(tecnico_asignado),''),'Sin Asignar') AS tec, count(*) AS tot,
               count(*) FILTER (WHERE estado IN ('Abierto','En Proceso','En Evaluación','Programada','Pendiente Cliente')) AS ab
        FROM tms_postventa_tickets GROUP BY 1) a), '{}'::jsonb),
    'tiempos', (SELECT jsonb_build_object(
        'promedio_dias', coalesce(round(avg(d)::numeric,1),0),
        'min_dias', coalesce(min(d),0), 'max_dias', coalesce(max(d),0),
        'cerrados_mes', (SELECT count(*) FROM tms_postventa_tickets WHERE estado='Cerrado' AND to_char(fecha_cierre,'YYYY-MM')=to_char((now() AT TIME ZONE 'America/Santiago'),'YYYY-MM')),
        'sin_tecnico', (SELECT count(*) FROM tms_postventa_tickets WHERE coalesce(nullif(btrim(tecnico_asignado),''),'Sin Asignar')='Sin Asignar')
      ) FROM (SELECT (fecha_cierre - fecha_apertura) AS d FROM tms_postventa_tickets WHERE estado='Cerrado' AND fecha_cierre IS NOT NULL) z),
    'tickets_recientes', coalesce((SELECT jsonb_agg(to_jsonb(t)) FROM (
        SELECT numero, fecha_apertura, cliente, region, tipo_solicitud, equipo_modelo,
               tecnico_asignado, prioridad, estado, fecha_cierre, resultado, observaciones, created_at
        FROM tms_postventa_tickets ORDER BY created_at DESC LIMIT 50) t), '[]'::jsonb)
  );
$$;
GRANT EXECUTE ON FUNCTION public.pv_dashboard() TO authenticated, service_role;

-- ============================================================
-- 7. RPCs — técnicos (catálogo editable, supervisor)
-- ============================================================
CREATE OR REPLACE FUNCTION public.guardar_pv_tecnico(p_id uuid, p_nombre text, p_activo boolean DEFAULT true, p_orden integer DEFAULT 0)
 RETURNS public.tms_postventa_tecnicos LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_postventa_tecnicos;
BEGIN
  PERFORM public._pv_assert(true);
  IF coalesce(btrim(p_nombre),'')='' THEN RAISE EXCEPTION 'El nombre es obligatorio'; END IF;
  IF p_id IS NULL THEN
    INSERT INTO tms_postventa_tecnicos (nombre, activo, orden) VALUES (btrim(p_nombre), p_activo, p_orden) RETURNING * INTO r;
  ELSE
    UPDATE tms_postventa_tecnicos SET nombre=btrim(p_nombre), activo=p_activo, orden=p_orden WHERE id=p_id RETURNING * INTO r;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Técnico inexistente'; END IF;
  END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.eliminar_pv_tecnico(p_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public._pv_assert(true);
  DELETE FROM tms_postventa_tecnicos WHERE id = p_id;
END $$;

-- ============================================================
-- 8. Grants (revocar de anon)
-- ============================================================
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'crear_pv_ticket(text,text,text,text,text,text,text,text,text,text,text,text,text,text)',
    'actualizar_pv_ticket(text,jsonb)',
    'guardar_pv_tecnico(uuid,text,boolean,integer)',
    'eliminar_pv_tecnico(uuid)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
