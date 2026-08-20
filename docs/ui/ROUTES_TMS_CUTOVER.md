# CCO 2.0 — Rutas/TMS V2 (PR20)

## Alcance implementado

- Coordinación de Rutas: superficie V2, mapa cargado en un chunk independiente, agrupación de marcadores, marcador seleccionado, trazado de ruta y estados de carga/error/vacío/sin trazado.
- TMS Torre de Control: runtime visual V2 independiente de Rutas.
- TMS Mi Ruta: superficie móvil, contexto de parada, navegación externa, sincronización visible y adaptación portrait/landscape.
- POD: estados `draft`, `uploading`, `success`, `failed` y `offline_pending`. `success` solo se asigna después de que `tms_orden_pod` devuelve `ok`.
- Seguridad: `/panel/rutas`, `/tms/control` y `/tms/pda` usan el mismo contrato de beta privada.

No se crearon tablas, catálogos, RPC ni fuentes de datos paralelas.

## Flags visuales

Todos permanecen apagados por defecto:

```bash
VITE_FF_WEB_ROUTES_V2=false
VITE_FF_WEB_TMS_V2=false
VITE_FF_MOBILE_ROUTES_V2=false
VITE_FF_MOBILE_TMS_V2=false
VITE_FF_MOBILE_MAP_V2=false
```

Estos flags solo cambian presentación. No conceden acceso.

## Gate de beta privada

El acceso requiere simultáneamente:

1. `module_rutas_private_beta=true`.
2. Rol IAM `cco_private_beta_rutas`.
3. Permiso IAM `view_rutas_private_beta`.
4. Autorización vigente de RPC/RLS para la operación solicitada.

Si falla el flag, el guard responde como ruta inexistente. Si falla IAM, responde acceso denegado. Las tres rutas permanecen fuera del sidebar, búsqueda y navegación móvil.

## Activación en beta

Activar solo en el entorno interno, conservando el gate anterior:

```bash
VITE_FF_WEB_ROUTES_V2=true
VITE_FF_WEB_TMS_V2=true
VITE_FF_MOBILE_ROUTES_V2=true
VITE_FF_MOBILE_TMS_V2=true
VITE_FF_MOBILE_MAP_V2=true
```

Validar 360×800, 768×1024, 1366×768 y landscape móvil. Comprobar mapa, detalle, navegación externa, incidencia y POD con una orden de prueba.

## Rollback (primeros 5 minutos)

1. Definir los cinco flags visuales en `false` y volver a desplegar. El código funcional legacy sigue intacto.
2. Si el problema afecta el bundle completo, redeplegar el artefacto anterior.
3. No modificar `module_rutas_private_beta`, roles ni permisos durante un rollback visual.
4. No existe rollback de base de datos para PR20 porque no contiene migraciones.

## Validación

```bash
npm run lint -- --quiet
npm run typecheck
npm run test
npm run build
```

Contrato esperado: `PRIVATE_BETA_LEAK=0` y todos los flags visuales OFF en configuración base.
