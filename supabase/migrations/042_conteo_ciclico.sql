-- 042_conteo_ciclico.sql
-- Módulo "Conteo Cíclico de Inventario" — port nativo a Supabase del proyecto
-- lockowom/t-o-inventario, reusando el stock que ya vive en CCO_PTM
-- (tms_partidas / tms_series) en vez de duplicar el maestro.
--
-- Dominio (prefijo tms_conteo_):
--   * tms_conteo_sesiones        — campañas de conteo (abierta/cerrada)
--   * tms_conteos                — registros físicos de conteo (hoja DATOS)
--   * tms_conteo_bloques (+ _items)      — bloques/pallets con QR propio
--   * tms_conteo_auditorias (+ _items)   — auditoría física de un bloque
--   * tms_conteo_proyecciones    — calculadora de palletizado compartida
--   * tms_conteo_costos          — costo unitario por SKU (para valorizado;
--                                  CCO no tenía tabla de costos)
--
-- Permisos (catálogo tms_permisos + roles.permisos_json):
--   * view_conteo       — ver conteos/reportes
--   * manage_conteo     — contar (crear/editar los propios en sesión abierta)
--   * supervise_conteo  — editar/eliminar cualquiera, cerrar sesiones, ajustes,
--                         cargar costos
--   ADMIN / es_admin_delegado siempre pasan.
--
-- Escrituras SOLO vía RPC SECURITY DEFINER (revocadas de anon). Lecturas por RLS
-- SELECT para authenticated (el módulo ya está gateado por ruta/permiso).

-- ============================================================
-- 1. Tablas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tms_conteo_sesiones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  descripcion text,
  tipo        text NOT NULL DEFAULT 'ciclico',   -- ciclico | total | ubicacion
  estado      text NOT NULL DEFAULT 'abierta',   -- abierta | cerrada
  semana      integer,
  creado_por  uuid,
  creado_por_nombre text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz
);

CREATE TABLE IF NOT EXISTS public.tms_conteos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id          uuid REFERENCES public.tms_conteo_sesiones(id) ON DELETE SET NULL,
  ubicacion          text,
  codigo_producto    text NOT NULL,
  descripcion        text,
  unidad_medida      text,
  partida            text,
  serie              text,
  fecha_vencimiento  text,
  cantidad_contada   numeric NOT NULL DEFAULT 0,
  cantidad_sistema   numeric DEFAULT 0,   -- snapshot del stock al momento de contar
  observaciones      text,
  estado             text,                -- CUADRADO | FALTA | SOBRA | SIN_STOCK
  contado_por        uuid,
  contado_por_nombre text,
  dispositivo        text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tms_conteos_sesion ON public.tms_conteos(sesion_id);
CREATE INDEX IF NOT EXISTS idx_tms_conteos_codigo ON public.tms_conteos(codigo_producto);
CREATE INDEX IF NOT EXISTS idx_tms_conteos_ubic   ON public.tms_conteos(ubicacion);

CREATE TABLE IF NOT EXISTS public.tms_conteo_bloques (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo            text UNIQUE NOT NULL,   -- BLQ-XXXXXXXX (QR)
  bodega            text NOT NULL,
  nombre            text,
  descripcion       text,
  estado            text NOT NULL DEFAULT 'activo',  -- activo | cerrado
  ubicacion         text,
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tms_conteo_bloques_bodega ON public.tms_conteo_bloques(bodega);

CREATE TABLE IF NOT EXISTS public.tms_conteo_bloque_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id         uuid NOT NULL REFERENCES public.tms_conteo_bloques(id) ON DELETE CASCADE,
  codigo_producto   text NOT NULL,
  descripcion       text,
  unidad_medida     text,
  partida           text,
  serie             text,
  fecha_vencimiento text,
  cantidad          numeric NOT NULL DEFAULT 0,
  observaciones     text,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tms_conteo_bloque_items_bloque ON public.tms_conteo_bloque_items(bloque_id);

CREATE TABLE IF NOT EXISTS public.tms_conteo_auditorias (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id      uuid NOT NULL REFERENCES public.tms_conteo_bloques(id) ON DELETE CASCADE,
  bloque_codigo  text,
  bodega         text,
  auditor_id     uuid,
  auditor_nombre text,
  esperado_total numeric DEFAULT 0,
  contado_total  numeric DEFAULT 0,
  items_total    integer DEFAULT 0,
  items_ok       integer DEFAULT 0,
  items_dif      integer DEFAULT 0,
  estado         text,                 -- cuadrado | con_diferencias
  observaciones  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tms_conteo_auditorias_bloque ON public.tms_conteo_auditorias(bloque_id);

CREATE TABLE IF NOT EXISTS public.tms_conteo_auditoria_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id    uuid NOT NULL REFERENCES public.tms_conteo_auditorias(id) ON DELETE CASCADE,
  codigo_producto text,
  descripcion     text,
  unidad_medida   text,
  partida         text,
  serie           text,
  esperada        numeric DEFAULT 0,
  contada         numeric DEFAULT 0,
  diferencia      numeric DEFAULT 0,
  estado          text                 -- CUADRADO | FALTA | SOBRA
);
CREATE INDEX IF NOT EXISTS idx_tms_conteo_aud_items_aud ON public.tms_conteo_auditoria_items(auditoria_id);

CREATE TABLE IF NOT EXISTS public.tms_conteo_proyecciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prod              text,
  cant_oc           numeric DEFAULT 0,
  cant_bx           numeric DEFAULT 0,
  cant_x_bx         numeric DEFAULT 0,
  pie               numeric DEFAULT 0,
  altura            numeric DEFAULT 0,
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tms_conteo_costos (
  codigo_producto text PRIMARY KEY,
  costo_unitario  numeric NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. RLS: lectura para authenticated; escritura solo por RPC
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tms_conteo_sesiones','tms_conteos','tms_conteo_bloques','tms_conteo_bloque_items',
    'tms_conteo_auditorias','tms_conteo_auditoria_items','tms_conteo_proyecciones','tms_conteo_costos'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
    EXECUTE format($p$DROP POLICY IF EXISTS %I ON public.%I$p$, t||'_sel', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR SELECT USING (auth.role() = 'authenticated')$p$, t||'_sel', t);
  END LOOP;
END $$;

-- ============================================================
-- 3. Permisos en el catálogo + asignación a roles existentes
-- ============================================================
INSERT INTO public.tms_permisos (id, nombre, modulo) VALUES
  ('view_conteo',      'Ver Conteo Cíclico',                 'inventario'),
  ('manage_conteo',    'Contar (crear/editar propios)',      'inventario'),
  ('supervise_conteo', 'Supervisar Conteo (editar/cerrar/ajustes)', 'inventario')
ON CONFLICT (id) DO NOTHING;

-- Los operadores de inventario (manage_inventory) pueden ver y contar.
UPDATE public.tms_roles
   SET permisos_json = permisos_json || '["view_conteo","manage_conteo"]'::jsonb
 WHERE permisos_json ? 'manage_inventory'
   AND NOT (permisos_json ? 'manage_conteo');

-- Quien gestiona ubicaciones (perfil supervisor de bodega) además supervisa.
UPDATE public.tms_roles
   SET permisos_json = permisos_json || '["supervise_conteo"]'::jsonb
 WHERE permisos_json ? 'manage_locations'
   AND NOT (permisos_json ? 'supervise_conteo');

-- ============================================================
-- 4. Helpers de permiso y de negocio
-- ============================================================
CREATE OR REPLACE FUNCTION public._conteo_user()
 RETURNS TABLE(uid uuid, nombre text, rol text, es_admin_delegado boolean, permisos jsonb)
 LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT u.auth_uid, u.nombre, u.rol, u.es_admin_delegado,
         (SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol)
  FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid() AND u.activo = true
  LIMIT 1;
$$;

-- Verifica permiso y devuelve el usuario (RETURNS TABLE → columnas nombradas,
-- accesibles vía SELECT * INTO). Lanza excepción si no está autorizado.
CREATE OR REPLACE FUNCTION public._conteo_assert(p_super boolean DEFAULT false)
 RETURNS TABLE(uid uuid, nombre text, rol text, es_admin_delegado boolean, permisos jsonb)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record;
BEGIN
  SELECT * INTO v FROM public._conteo_user();
  IF v.uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado) THEN
    IF p_super THEN
      IF NOT (v.permisos ? 'supervise_conteo') THEN
        RAISE EXCEPTION 'Acceso denegado: se requiere supervisión de Conteo';
      END IF;
    ELSE
      IF NOT ((v.permisos ? 'manage_conteo') OR (v.permisos ? 'supervise_conteo')) THEN
        RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Conteo';
      END IF;
    END IF;
  END IF;
  uid := v.uid; nombre := v.nombre; rol := v.rol;
  es_admin_delegado := v.es_admin_delegado; permisos := v.permisos;
  RETURN NEXT;
END $$;

-- Es supervisor/admin (para reglas de edición).
CREATE OR REPLACE FUNCTION public._conteo_es_super(p_rol text, p_delegado boolean, p_permisos jsonb)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $$ SELECT p_rol = 'ADMIN' OR coalesce(p_delegado,false) OR coalesce(p_permisos ? 'supervise_conteo', false) $$;

-- Stock del sistema (prioridad serie > partida > total del SKU), desde el
-- stock real de CCO (tms_series.disponible, tms_partidas.stock_total).
CREATE OR REPLACE FUNCTION public.conteo_stock_sistema(p_codigo text, p_partida text DEFAULT '', p_serie text DEFAULT '')
 RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v numeric;
BEGIN
  IF coalesce(p_serie,'') <> '' THEN
    SELECT coalesce(disponible,0) INTO v FROM tms_series
      WHERE codigo_producto = p_codigo AND serie = p_serie LIMIT 1;
    IF FOUND THEN RETURN coalesce(v,0); END IF;
  END IF;
  IF coalesce(p_partida,'') <> '' THEN
    SELECT coalesce(stock_total,0) INTO v FROM tms_partidas
      WHERE codigo_producto = p_codigo AND partida = p_partida LIMIT 1;
    IF FOUND THEN RETURN coalesce(v,0); END IF;
  END IF;
  SELECT coalesce(sum(stock_total),0) INTO v FROM tms_partidas WHERE codigo_producto = p_codigo;
  RETURN coalesce(v,0);
END $$;
GRANT EXECUTE ON FUNCTION public.conteo_stock_sistema(text,text,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public._conteo_estado(p_contada numeric, p_sistema numeric)
 RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT CASE
    WHEN coalesce(p_sistema,0) = 0 AND coalesce(p_contada,0) > 0 THEN 'SIN_STOCK'
    WHEN coalesce(p_contada,0) = coalesce(p_sistema,0) THEN 'CUADRADO'
    WHEN coalesce(p_contada,0) < coalesce(p_sistema,0) THEN 'FALTA'
    ELSE 'SOBRA' END $$;

-- ============================================================
-- 5. RPCs — Sesiones
-- ============================================================
CREATE OR REPLACE FUNCTION public.crear_conteo_sesion(p_nombre text, p_descripcion text DEFAULT NULL, p_tipo text DEFAULT 'ciclico', p_semana integer DEFAULT NULL)
 RETURNS public.tms_conteo_sesiones LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_conteo_sesiones;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  IF coalesce(btrim(p_nombre),'') = '' THEN RAISE EXCEPTION 'El nombre es obligatorio'; END IF;
  INSERT INTO tms_conteo_sesiones (nombre, descripcion, tipo, estado, semana, creado_por, creado_por_nombre)
  VALUES (btrim(p_nombre), p_descripcion,
          CASE WHEN p_tipo IN ('ciclico','total','ubicacion') THEN p_tipo ELSE 'ciclico' END,
          'abierta', p_semana, v.uid, v.nombre)
  RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.cerrar_conteo_sesion(p_id uuid, p_reabrir boolean DEFAULT false)
 RETURNS public.tms_conteo_sesiones LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_conteo_sesiones;
BEGIN
  PERFORM public._conteo_assert(true);
  UPDATE tms_conteo_sesiones
     SET estado = CASE WHEN p_reabrir THEN 'abierta' ELSE 'cerrada' END,
         closed_at = CASE WHEN p_reabrir THEN NULL ELSE now() END
   WHERE id = p_id
  RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Sesión inexistente'; END IF;
  RETURN r;
END $$;

-- ============================================================
-- 6. RPCs — Conteos
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_conteo(
  p_sesion_id uuid, p_codigo text, p_cantidad numeric,
  p_ubicacion text DEFAULT '', p_partida text DEFAULT '', p_serie text DEFAULT '',
  p_fecha_venc text DEFAULT NULL, p_observaciones text DEFAULT '',
  p_descripcion text DEFAULT '', p_um text DEFAULT '', p_dispositivo text DEFAULT ''
) RETURNS public.tms_conteos LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_conteos; v_sist numeric; v_estado text;
        v_prod record; v_desc text; v_um text;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  IF coalesce(btrim(p_codigo),'') = '' THEN RAISE EXCEPTION 'codigo_producto requerido'; END IF;
  IF p_cantidad IS NULL OR p_cantidad < 0 THEN RAISE EXCEPTION 'La cantidad debe ser un número mayor o igual a 0'; END IF;
  IF p_sesion_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM tms_conteo_sesiones WHERE id = p_sesion_id) THEN RAISE EXCEPTION 'Sesión inexistente'; END IF;
    IF (SELECT estado FROM tms_conteo_sesiones WHERE id = p_sesion_id) <> 'abierta' THEN RAISE EXCEPTION 'La sesión está cerrada'; END IF;
  END IF;

  SELECT producto, unidad_medida INTO v_prod FROM tms_partidas WHERE codigo_producto = p_codigo LIMIT 1;
  v_desc := coalesce(nullif(btrim(p_descripcion),''), v_prod.producto, '');
  v_um   := coalesce(nullif(btrim(p_um),''), v_prod.unidad_medida, '');
  v_sist := public.conteo_stock_sistema(p_codigo, coalesce(p_partida,''), coalesce(p_serie,''));
  v_estado := public._conteo_estado(p_cantidad, v_sist);

  INSERT INTO tms_conteos (sesion_id, ubicacion, codigo_producto, descripcion, unidad_medida,
    partida, serie, fecha_vencimiento, cantidad_contada, cantidad_sistema, observaciones,
    estado, contado_por, contado_por_nombre, dispositivo)
  VALUES (p_sesion_id, btrim(coalesce(p_ubicacion,'')), btrim(p_codigo), v_desc, v_um,
    btrim(coalesce(p_partida,'')), btrim(coalesce(p_serie,'')), nullif(btrim(coalesce(p_fecha_venc,'')),''),
    p_cantidad, v_sist, btrim(coalesce(p_observaciones,'')), v_estado, v.uid, v.nombre, btrim(coalesce(p_dispositivo,'')))
  RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.editar_conteo(
  p_id uuid, p_cantidad numeric DEFAULT NULL, p_ubicacion text DEFAULT NULL,
  p_partida text DEFAULT NULL, p_serie text DEFAULT NULL, p_fecha_venc text DEFAULT NULL,
  p_observaciones text DEFAULT NULL
) RETURNS public.tms_conteos LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; ex public.tms_conteos; r public.tms_conteos;
        v_part text; v_serie text; v_cant numeric; v_sist numeric; v_estado text; v_ses_estado text;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  SELECT * INTO ex FROM tms_conteos WHERE id = p_id;
  IF ex.id IS NULL THEN RAISE EXCEPTION 'Conteo no encontrado'; END IF;

  IF NOT public._conteo_es_super(v.rol, v.es_admin_delegado, v.permisos) THEN
    IF ex.contado_por IS DISTINCT FROM v.uid THEN RAISE EXCEPTION 'Solo podés modificar tus propios conteos'; END IF;
    IF ex.sesion_id IS NOT NULL THEN
      SELECT estado INTO v_ses_estado FROM tms_conteo_sesiones WHERE id = ex.sesion_id;
      IF v_ses_estado IS NOT NULL AND v_ses_estado <> 'abierta' THEN RAISE EXCEPTION 'La sesión está cerrada'; END IF;
    END IF;
  END IF;

  IF p_cantidad IS NOT NULL AND p_cantidad < 0 THEN RAISE EXCEPTION 'La cantidad debe ser un número mayor o igual a 0'; END IF;
  v_part  := coalesce(p_partida, ex.partida);
  v_serie := coalesce(p_serie, ex.serie);
  v_cant  := coalesce(p_cantidad, ex.cantidad_contada);
  v_sist  := public.conteo_stock_sistema(ex.codigo_producto, coalesce(v_part,''), coalesce(v_serie,''));
  v_estado := public._conteo_estado(v_cant, v_sist);

  UPDATE tms_conteos SET
    ubicacion = coalesce(p_ubicacion, ubicacion),
    partida = v_part, serie = v_serie,
    fecha_vencimiento = CASE WHEN p_fecha_venc IS NULL THEN fecha_vencimiento ELSE nullif(btrim(p_fecha_venc),'') END,
    cantidad_contada = v_cant, cantidad_sistema = v_sist,
    observaciones = coalesce(p_observaciones, observaciones),
    estado = v_estado, updated_at = now()
  WHERE id = p_id RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.eliminar_conteo(p_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; ex public.tms_conteos; v_ses_estado text;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  SELECT * INTO ex FROM tms_conteos WHERE id = p_id;
  IF ex.id IS NULL THEN RAISE EXCEPTION 'Conteo no encontrado'; END IF;
  IF NOT public._conteo_es_super(v.rol, v.es_admin_delegado, v.permisos) THEN
    IF ex.contado_por IS DISTINCT FROM v.uid THEN RAISE EXCEPTION 'Solo podés eliminar tus propios conteos'; END IF;
    IF ex.sesion_id IS NOT NULL THEN
      SELECT estado INTO v_ses_estado FROM tms_conteo_sesiones WHERE id = ex.sesion_id;
      IF v_ses_estado IS NOT NULL AND v_ses_estado <> 'abierta' THEN RAISE EXCEPTION 'La sesión está cerrada'; END IF;
    END IF;
  END IF;
  DELETE FROM tms_conteos WHERE id = p_id;
END $$;

-- ============================================================
-- 7. RPCs — Bloques + auditoría por QR
-- ============================================================
CREATE OR REPLACE FUNCTION public.crear_conteo_bloque(p_bodega text, p_nombre text DEFAULT NULL, p_descripcion text DEFAULT NULL, p_ubicacion text DEFAULT NULL)
 RETURNS public.tms_conteo_bloques LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_conteo_bloques; v_cod text; i int;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  IF coalesce(btrim(p_bodega),'') = '' THEN RAISE EXCEPTION 'La bodega es obligatoria'; END IF;
  FOR i IN 1..6 LOOP
    v_cod := 'BLQ-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM tms_conteo_bloques WHERE codigo = v_cod);
  END LOOP;
  INSERT INTO tms_conteo_bloques (codigo, bodega, nombre, descripcion, ubicacion, creado_por, creado_por_nombre)
  VALUES (v_cod, btrim(p_bodega), p_nombre, p_descripcion, p_ubicacion, v.uid, v.nombre)
  RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.editar_conteo_bloque(p_id uuid, p_bodega text DEFAULT NULL, p_nombre text DEFAULT NULL, p_descripcion text DEFAULT NULL, p_estado text DEFAULT NULL, p_ubicacion text DEFAULT NULL)
 RETURNS public.tms_conteo_bloques LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_conteo_bloques;
BEGIN
  PERFORM public._conteo_assert(false);
  UPDATE tms_conteo_bloques SET
    bodega = coalesce(nullif(btrim(coalesce(p_bodega,'')),''), bodega),
    nombre = coalesce(p_nombre, nombre),
    descripcion = coalesce(p_descripcion, descripcion),
    estado = CASE WHEN p_estado IN ('activo','cerrado') THEN p_estado ELSE estado END,
    ubicacion = coalesce(p_ubicacion, ubicacion),
    updated_at = now()
  WHERE id = p_id RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Bloque inexistente'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.agregar_conteo_bloque_item(
  p_bloque_id uuid, p_codigo text, p_cantidad numeric,
  p_descripcion text DEFAULT '', p_um text DEFAULT '', p_partida text DEFAULT '',
  p_serie text DEFAULT '', p_fecha_venc text DEFAULT NULL, p_observaciones text DEFAULT ''
) RETURNS public.tms_conteo_bloque_items LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_conteo_bloque_items; v_estado text; v_prod record; v_desc text; v_um text;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  IF coalesce(btrim(p_codigo),'') = '' THEN RAISE EXCEPTION 'codigo_producto requerido'; END IF;
  SELECT estado INTO v_estado FROM tms_conteo_bloques WHERE id = p_bloque_id;
  IF v_estado IS NULL THEN RAISE EXCEPTION 'Bloque inexistente'; END IF;
  IF v_estado <> 'activo' THEN RAISE EXCEPTION 'El bloque está cerrado'; END IF;
  SELECT producto, unidad_medida INTO v_prod FROM tms_partidas WHERE codigo_producto = p_codigo LIMIT 1;
  v_desc := coalesce(nullif(btrim(p_descripcion),''), v_prod.producto, '');
  v_um   := coalesce(nullif(btrim(p_um),''), v_prod.unidad_medida, '');
  INSERT INTO tms_conteo_bloque_items (bloque_id, codigo_producto, descripcion, unidad_medida, partida, serie, fecha_vencimiento, cantidad, observaciones, creado_por_nombre)
  VALUES (p_bloque_id, btrim(p_codigo), v_desc, v_um, btrim(coalesce(p_partida,'')), btrim(coalesce(p_serie,'')),
          nullif(btrim(coalesce(p_fecha_venc,'')),''), coalesce(p_cantidad,0), btrim(coalesce(p_observaciones,'')), v.nombre)
  RETURNING * INTO r;
  UPDATE tms_conteo_bloques SET updated_at = now() WHERE id = p_bloque_id;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.eliminar_conteo_bloque_item(p_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public._conteo_assert(false);
  DELETE FROM tms_conteo_bloque_items WHERE id = p_id;
END $$;

-- Registrar una auditoría física de un bloque. p_items: jsonb array de
-- { codigo_producto, descripcion, unidad_medida, partida, serie, esperada, contada }.
CREATE OR REPLACE FUNCTION public.registrar_conteo_auditoria(p_bloque_id uuid, p_items jsonb, p_observaciones text DEFAULT '')
 RETURNS public.tms_conteo_auditorias LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; b public.tms_conteo_bloques; a public.tms_conteo_auditorias;
        it jsonb; v_esp numeric; v_con numeric; v_dif numeric; v_est text;
        tot_esp numeric := 0; tot_con numeric := 0; n_ok int := 0; n_dif int := 0; n_tot int := 0;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  SELECT * INTO b FROM tms_conteo_bloques WHERE id = p_bloque_id;
  IF b.id IS NULL THEN RAISE EXCEPTION 'Bloque inexistente'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'items inválidos'; END IF;

  INSERT INTO tms_conteo_auditorias (bloque_id, bloque_codigo, bodega, auditor_id, auditor_nombre, observaciones, estado)
  VALUES (b.id, b.codigo, b.bodega, v.uid, v.nombre, btrim(coalesce(p_observaciones,'')), 'con_diferencias')
  RETURNING * INTO a;

  FOR it IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_esp := coalesce((it->>'esperada')::numeric, 0);
    v_con := coalesce((it->>'contada')::numeric, 0);
    v_dif := v_con - v_esp;
    v_est := CASE WHEN v_dif = 0 THEN 'CUADRADO' WHEN v_dif < 0 THEN 'FALTA' ELSE 'SOBRA' END;
    tot_esp := tot_esp + v_esp; tot_con := tot_con + v_con; n_tot := n_tot + 1;
    IF v_dif = 0 THEN n_ok := n_ok + 1; ELSE n_dif := n_dif + 1; END IF;
    INSERT INTO tms_conteo_auditoria_items (auditoria_id, codigo_producto, descripcion, unidad_medida, partida, serie, esperada, contada, diferencia, estado)
    VALUES (a.id, it->>'codigo_producto', it->>'descripcion', it->>'unidad_medida', it->>'partida', it->>'serie', v_esp, v_con, v_dif, v_est);
  END LOOP;

  UPDATE tms_conteo_auditorias
     SET esperado_total = tot_esp, contado_total = tot_con, items_total = n_tot,
         items_ok = n_ok, items_dif = n_dif,
         estado = CASE WHEN n_dif = 0 THEN 'cuadrado' ELSE 'con_diferencias' END
   WHERE id = a.id RETURNING * INTO a;
  RETURN a;
END $$;

-- ============================================================
-- 8. RPCs — Proyecciones + Costos
-- ============================================================
CREATE OR REPLACE FUNCTION public.guardar_conteo_proyeccion(
  p_id uuid, p_prod text, p_cant_oc numeric DEFAULT 0, p_cant_bx numeric DEFAULT 0,
  p_cant_x_bx numeric DEFAULT 0, p_pie numeric DEFAULT 0, p_altura numeric DEFAULT 0
) RETURNS public.tms_conteo_proyecciones LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_conteo_proyecciones;
BEGIN
  SELECT * INTO v FROM public._conteo_assert(false);
  IF p_id IS NULL THEN
    INSERT INTO tms_conteo_proyecciones (prod, cant_oc, cant_bx, cant_x_bx, pie, altura, creado_por, creado_por_nombre)
    VALUES (p_prod, p_cant_oc, p_cant_bx, p_cant_x_bx, p_pie, p_altura, v.uid, v.nombre)
    RETURNING * INTO r;
  ELSE
    UPDATE tms_conteo_proyecciones SET
      prod = p_prod, cant_oc = p_cant_oc, cant_bx = p_cant_bx, cant_x_bx = p_cant_x_bx,
      pie = p_pie, altura = p_altura, updated_at = now()
    WHERE id = p_id RETURNING * INTO r;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Proyección inexistente'; END IF;
  END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.eliminar_conteo_proyeccion(p_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public._conteo_assert(false);
  DELETE FROM tms_conteo_proyecciones WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.guardar_conteo_costo(p_codigo text, p_costo numeric)
 RETURNS public.tms_conteo_costos LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_conteo_costos;
BEGIN
  PERFORM public._conteo_assert(true);
  IF coalesce(btrim(p_codigo),'') = '' THEN RAISE EXCEPTION 'codigo_producto requerido'; END IF;
  INSERT INTO tms_conteo_costos (codigo_producto, costo_unitario, updated_at)
  VALUES (btrim(p_codigo), coalesce(p_costo,0), now())
  ON CONFLICT (codigo_producto) DO UPDATE SET costo_unitario = excluded.costo_unitario, updated_at = now()
  RETURNING * INTO r;
  RETURN r;
END $$;

-- ============================================================
-- 9. Grants de ejecución (revocar de anon)
-- ============================================================
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'crear_conteo_sesion(text,text,text,integer)',
    'cerrar_conteo_sesion(uuid,boolean)',
    'registrar_conteo(uuid,text,numeric,text,text,text,text,text,text,text,text)',
    'editar_conteo(uuid,numeric,text,text,text,text,text)',
    'eliminar_conteo(uuid)',
    'crear_conteo_bloque(text,text,text,text)',
    'editar_conteo_bloque(uuid,text,text,text,text,text)',
    'agregar_conteo_bloque_item(uuid,text,numeric,text,text,text,text,text,text)',
    'eliminar_conteo_bloque_item(uuid)',
    'registrar_conteo_auditoria(uuid,jsonb,text)',
    'guardar_conteo_proyeccion(uuid,text,numeric,numeric,numeric,numeric,numeric)',
    'eliminar_conteo_proyeccion(uuid)',
    'guardar_conteo_costo(text,numeric)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
