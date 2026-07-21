-- ============================================================================
-- 144 · Auto-enriquecimiento de tms_operaciones desde el catálogo maestro
-- ----------------------------------------------------------------------------
-- PROBLEMA: al ingresar/actualizar una N.V. sólo con su estado (p. ej. "En
-- Proceso"), la fila de `tms_operaciones` quedaba SIN cliente/vendedor/centro de
-- costo/división, aunque el catálogo maestro `tms_nv_catalogo` (hojas CARGA) SÍ
-- los tiene. Resultado: la ficha de Ingresar mostraba los datos (porque hace el
-- fallback al catálogo en el front) pero el Dashboard/Modo TV los veía vacíos
-- ("—") y el chequeo de calidad marcaba "sin cliente". Es decir, el panel no
-- quedaba sincronizado con la N.V. real.
--
-- SOLUCIÓN: un trigger BEFORE INSERT/UPDATE que, cuando falta un dato comercial,
-- lo completa desde el catálogo (por canal:nv) y, si aún falta, deriva centro de
-- costo/división del vendedor (cascada, igual que el front). NUNCA sobrescribe un
-- valor ya presente (COALESCE de sólo-vacíos) → no destruye datos y es idempotente.
-- Cubre TODAS las rutas de escritura (guardar_nv, cambiar_estado_nv, imports,
-- bulk) → la tabla se mantiene sincronizada sola. Luego se hace backfill de las
-- filas históricas incompletas.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.tms_operaciones_enrich_catalogo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_canal text;
  v_nv    text;
  c       record;
  vc      record;
BEGIN
  -- Canal + número de N.V. de la fila (mismo criterio que el resto del Panel).
  IF NEW.nv_ptm IS NOT NULL THEN
    v_canal := 'ptm';       v_nv := NEW.nv_ptm::text;
  ELSIF NEW.nv_orange IS NOT NULL AND NEW.nv_orange <> '' THEN
    v_canal := 'orange';    v_nv := NEW.nv_orange;
  ELSIF NEW.nv_farmapack IS NOT NULL AND NEW.nv_farmapack <> '' THEN
    v_canal := 'farmapack'; v_nv := NEW.nv_farmapack;
  ELSIF NEW.varios IS NOT NULL AND NEW.varios <> '' THEN
    v_canal := 'varios';    v_nv := NEW.varios;
  ELSE
    RETURN NEW;  -- sin N.V. identificable
  END IF;

  -- 1) Completar desde el catálogo maestro sólo los campos vacíos.
  IF (NEW.cliente      IS NULL OR NEW.cliente      = '')
  OR (NEW.vendedor     IS NULL OR NEW.vendedor     = '')
  OR (NEW.centro_costo IS NULL OR NEW.centro_costo = '')
  OR (NEW.division     IS NULL OR NEW.division     = '')
  OR (NEW.fecha_aprobacion IS NULL) THEN
    SELECT cliente, vendedor, centro_costo, division, fecha_aprobacion
      INTO c
      FROM public.tms_nv_catalogo
     WHERE canal = v_canal AND nv = v_nv
     LIMIT 1;
    IF FOUND THEN
      IF (NEW.cliente      IS NULL OR NEW.cliente      = '') AND c.cliente      IS NOT NULL AND c.cliente      <> '' THEN NEW.cliente      := c.cliente;      END IF;
      IF (NEW.vendedor     IS NULL OR NEW.vendedor     = '') AND c.vendedor     IS NOT NULL AND c.vendedor     <> '' THEN NEW.vendedor     := c.vendedor;     END IF;
      IF (NEW.centro_costo IS NULL OR NEW.centro_costo = '') AND c.centro_costo IS NOT NULL AND c.centro_costo <> '' THEN NEW.centro_costo := c.centro_costo; END IF;
      IF (NEW.division     IS NULL OR NEW.division     = '') AND c.division     IS NOT NULL AND c.division     <> '' THEN NEW.division     := c.division;     END IF;
      IF  NEW.fecha_aprobacion IS NULL AND c.fecha_aprobacion IS NOT NULL THEN NEW.fecha_aprobacion := c.fecha_aprobacion; END IF;
    END IF;
  END IF;

  -- 2) Cascada: si hay vendedor pero falta centro de costo/división, derivarlos.
  IF NEW.vendedor IS NOT NULL AND NEW.vendedor <> ''
     AND ((NEW.centro_costo IS NULL OR NEW.centro_costo = '')
       OR (NEW.division     IS NULL OR NEW.division     = '')) THEN
    SELECT centro_costo, division
      INTO vc
      FROM public.tms_panel_vendedores
     WHERE nombre ILIKE NEW.vendedor
     LIMIT 1;
    IF FOUND THEN
      IF (NEW.centro_costo IS NULL OR NEW.centro_costo = '') AND vc.centro_costo IS NOT NULL AND vc.centro_costo <> '' THEN NEW.centro_costo := vc.centro_costo; END IF;
      IF (NEW.division     IS NULL OR NEW.division     = '') AND vc.division     IS NOT NULL AND vc.division     <> '' THEN NEW.division     := vc.division;     END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_operaciones_enrich_catalogo ON public.tms_operaciones;
CREATE TRIGGER trg_operaciones_enrich_catalogo
  BEFORE INSERT OR UPDATE ON public.tms_operaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.tms_operaciones_enrich_catalogo();

-- ── Backfill de filas históricas incompletas ────────────────────────────────
-- Un UPDATE no-op dispara el trigger sólo en las filas a las que les falta algo
-- y que el catálogo puede completar → rellena sin tocar el resto.
UPDATE public.tms_operaciones o
   SET cliente = o.cliente                -- no-op: sólo para disparar el trigger
 WHERE (o.cliente IS NULL OR o.cliente = ''
        OR o.vendedor IS NULL OR o.vendedor = ''
        OR o.centro_costo IS NULL OR o.centro_costo = ''
        OR o.division IS NULL OR o.division = '')
   AND EXISTS (
     SELECT 1 FROM public.tms_nv_catalogo c
      WHERE c.canal = CASE
                        WHEN o.nv_ptm IS NOT NULL THEN 'ptm'
                        WHEN o.nv_orange IS NOT NULL AND o.nv_orange <> '' THEN 'orange'
                        WHEN o.nv_farmapack IS NOT NULL AND o.nv_farmapack <> '' THEN 'farmapack'
                        ELSE 'varios' END
        AND c.nv = CASE
                        WHEN o.nv_ptm IS NOT NULL THEN o.nv_ptm::text
                        WHEN o.nv_orange IS NOT NULL AND o.nv_orange <> '' THEN o.nv_orange
                        WHEN o.nv_farmapack IS NOT NULL AND o.nv_farmapack <> '' THEN o.nv_farmapack
                        ELSE o.varios END
   );
