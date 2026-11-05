-- ABS-LOC-001: la clasificación ABS pertenece al SKU, no a una ocupación WMS.
-- Esta bitácora conserva dónde estuvo un SKU clasificado aunque se traslade o
-- se retire de la vista operativa. No actualiza cantidades, stock, Softland ni ERP.

CREATE TABLE public.wms_abs_asignaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ubicacion_wms_id uuid REFERENCES public.wms_ubicaciones(id) ON DELETE SET NULL,
  codigo text NOT NULL REFERENCES public.wms_sku_rotacion(codigo) ON UPDATE CASCADE,
  ubicacion text NOT NULL,
  es_ubicacion_abs boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'ACTIVA',
  asignada_en timestamptz NOT NULL DEFAULT now(),
  cerrada_en timestamptz,
  motivo_cierre text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wms_abs_asignaciones_estado_check
    CHECK (estado IN ('ACTIVA', 'TRASLADADA', 'LIBERADA')),
  CONSTRAINT wms_abs_asignaciones_cierre_check
    CHECK (
      (estado = 'ACTIVA' AND cerrada_en IS NULL AND motivo_cierre IS NULL)
      OR
      (estado IN ('TRASLADADA', 'LIBERADA') AND cerrada_en IS NOT NULL AND motivo_cierre IS NOT NULL)
    )
);

COMMENT ON TABLE public.wms_abs_asignaciones IS
  'Historial de ocupación visual de SKU ABS. Una baja o traslado WMS cierra la asignación, pero nunca borra ABS/rotación ni altera stock.';

COMMENT ON COLUMN public.wms_abs_asignaciones.es_ubicacion_abs IS
  'Snapshot de si la ubicación maestra estaba marcada como posición ABS al abrir la asignación.';

CREATE UNIQUE INDEX wms_abs_asignaciones_ubicacion_wms_activa_idx
  ON public.wms_abs_asignaciones (ubicacion_wms_id)
  WHERE estado = 'ACTIVA';

CREATE INDEX wms_abs_asignaciones_codigo_estado_idx
  ON public.wms_abs_asignaciones (codigo, estado, asignada_en DESC);

CREATE INDEX wms_abs_asignaciones_ubicacion_estado_idx
  ON public.wms_abs_asignaciones (ubicacion, estado, asignada_en DESC);

ALTER TABLE public.wms_abs_asignaciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.wms_abs_asignaciones FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.wms_abs_asignaciones TO authenticated;

CREATE POLICY wms_abs_asignaciones_select_authorized
  ON public.wms_abs_asignaciones
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT public.usuario_tiene_algun_permiso(
      ARRAY['view_locations', 'view_stock', 'manage_inventory', 'manage_locations']
    ))
  );

-- Mantiene la bitácora alineada con la ocupación visual. La función no es una
-- API pública: solo la ejecuta el trigger de wms_ubicaciones.
CREATE FUNCTION public.sincronizar_asignacion_abs_wms()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_codigo text;
  v_ubicacion text;
  v_es_ubicacion_abs boolean;
  v_estado_cierre text;
  v_motivo_cierre text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.wms_abs_asignaciones
       SET estado = 'LIBERADA',
           cerrada_en = now(),
           motivo_cierre = 'REGISTRO_WMS_RETIRADO',
           ubicacion_wms_id = NULL,
           updated_at = now()
     WHERE ubicacion_wms_id = OLD.id
       AND estado = 'ACTIVA';
    RETURN OLD;
  END IF;

  v_codigo := upper(btrim(coalesce(NEW.codigo, '')));
  v_ubicacion := upper(btrim(coalesce(NEW.ubicacion, '')));

  IF TG_OP = 'UPDATE' THEN
    IF upper(btrim(coalesce(OLD.codigo, ''))) IS NOT DISTINCT FROM v_codigo
       AND upper(btrim(coalesce(OLD.ubicacion, ''))) IS NOT DISTINCT FROM v_ubicacion THEN
      RETURN NEW;
    END IF;

    v_estado_cierre := CASE
      WHEN upper(btrim(coalesce(OLD.ubicacion, ''))) IS DISTINCT FROM v_ubicacion
        THEN 'TRASLADADA'
      ELSE 'LIBERADA'
    END;
    v_motivo_cierre := CASE
      WHEN v_estado_cierre = 'TRASLADADA' THEN 'TRASLADO_WMS'
      ELSE 'CAMBIO_DE_SKU_WMS'
    END;

    UPDATE public.wms_abs_asignaciones
       SET estado = v_estado_cierre,
           cerrada_en = now(),
           motivo_cierre = v_motivo_cierre,
           ubicacion_wms_id = NULL,
           updated_at = now()
     WHERE ubicacion_wms_id = OLD.id
       AND estado = 'ACTIVA';
  END IF;

  -- Si cambia a un SKU sin ABS o queda sin ubicación, se conserva el cierre
  -- anterior pero no se abre una nueva asignación.
  IF v_codigo = '' OR v_ubicacion = '' OR NOT EXISTS (
    SELECT 1 FROM public.wms_sku_rotacion r WHERE r.codigo = v_codigo
  ) THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(m.es_ubicacion_abs, false)
    INTO v_es_ubicacion_abs
    FROM public.wms_ubicaciones_maestras m
   WHERE m.ubicacion = v_ubicacion
   LIMIT 1;

  INSERT INTO public.wms_abs_asignaciones (
    ubicacion_wms_id, codigo, ubicacion, es_ubicacion_abs, estado
  )
  VALUES (NEW.id, v_codigo, v_ubicacion, coalesce(v_es_ubicacion_abs, false), 'ACTIVA')
  ON CONFLICT (ubicacion_wms_id) WHERE estado = 'ACTIVA'
  DO UPDATE SET
    codigo = EXCLUDED.codigo,
    ubicacion = EXCLUDED.ubicacion,
    es_ubicacion_abs = EXCLUDED.es_ubicacion_abs,
    updated_at = now();

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.sincronizar_asignacion_abs_wms() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER wms_ubicaciones_abs_asignacion_sync
AFTER INSERT OR UPDATE OF codigo, ubicacion OR DELETE
ON public.wms_ubicaciones
FOR EACH ROW
EXECUTE FUNCTION public.sincronizar_asignacion_abs_wms();

-- Baseline: las ocupaciones actuales de SKU ya clasificados quedan activas.
-- Solo crea trazabilidad visual; no modifica wms_ubicaciones ni ningún dato ERP.
INSERT INTO public.wms_abs_asignaciones (
  ubicacion_wms_id, codigo, ubicacion, es_ubicacion_abs, estado
)
SELECT
  w.id,
  upper(btrim(w.codigo)),
  upper(btrim(w.ubicacion)),
  coalesce(m.es_ubicacion_abs, false),
  'ACTIVA'
FROM public.wms_ubicaciones w
JOIN public.wms_sku_rotacion r
  ON r.codigo = upper(btrim(coalesce(w.codigo, '')))
LEFT JOIN public.wms_ubicaciones_maestras m
  ON m.ubicacion = upper(btrim(coalesce(w.ubicacion, '')))
WHERE nullif(btrim(coalesce(w.codigo, '')), '') IS NOT NULL
  AND nullif(btrim(coalesce(w.ubicacion, '')), '') IS NOT NULL
ON CONFLICT (ubicacion_wms_id) WHERE estado = 'ACTIVA'
DO NOTHING;
