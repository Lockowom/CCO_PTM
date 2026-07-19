# API de Operaciones — v1

Contrato público para consumir CCO desde sistemas externos (**Portal Cliente,
ERP, integraciones**) con las **mismas reglas** que la app (estados, sellos de
fecha, validaciones): el gateway `api-v1` autentica la API-key y llama las
**RPCs canónicas** (`guardar_nv`, `cambiar_estado_nv`, `tms_orden_crear_desde_nv`,
…) como `service_role`. Es la materialización del pilar §8 del blueprint.

- **Base URL:** `https://<PROYECTO>.supabase.co/functions/v1/api-v1`
- **Auth:** header `x-api-key: cco_...` (se generan en **Admin → API**, permiso
  `manage_api`). La clave en claro se muestra **una sola vez**; se guarda hasheada
  (SHA-256). Cada llamada se audita en `tms_api_log`.
- **Scopes:** `operaciones:read`, `operaciones:write`, `tms:read`, `tms:write`.
- **Versionado:** la ruta lleva `v1`. Cambios incompatibles → `v2` (nueva Edge),
  sin romper a los clientes existentes.

## Endpoints

| Método | Ruta | Scope | Descripción |
|---|---|---|---|
| `GET` | `/` | — | Devuelve el contrato (metadatos, endpoints). Sin key. |
| `GET` | `/operaciones?nv=123` | `operaciones:read` | Consulta una N.V. por número (ptm/orange/farmapack/varios). |
| `POST` | `/operaciones` | `operaciones:write` | Crea/edita una N.V. Body = payload de `guardar_nv`. |
| `POST` | `/operaciones/estado` | `operaciones:write` | `{ "id": 123, "estado": "En Ruta", "urgente": false }` |
| `GET` | `/tms/ordenes?estado=` | `tms:read` | Lista órdenes de transporte (opcional filtrar por estado). |
| `POST` | `/tms/ordenes` | `tms:write` | Crea una orden desde una operación: `{ "oper_id": 456 }`. |

Respuesta: `{ "ok": true, "data": ... }` o `{ "ok": false, "error": "..." }` con
código HTTP acorde (401 sin/ mala key, 403 sin scope, 400 error de negocio).

## Ejemplos

```bash
# Contrato
curl "$BASE/"

# Consultar N.V.
curl "$BASE/operaciones?nv=97281" -H "x-api-key: cco_xxx"

# Cambiar estado
curl -X POST "$BASE/operaciones/estado" \
  -H "x-api-key: cco_xxx" -H "Content-Type: application/json" \
  -d '{"id":123,"estado":"En Ruta"}'

# Crear orden de transporte desde una operación
curl -X POST "$BASE/tms/ordenes" \
  -H "x-api-key: cco_xxx" -H "Content-Type: application/json" \
  -d '{"oper_id":456}'
```

## Seguridad

- La key vive **hasheada**; `_api_validar` compara SHA-256 y marca `ultimo_uso`.
- El gateway corre como `service_role` (secret sólo en la Edge). Los gates de
  escritura (`_panel_puede_escribir`, `_tms_puede_gestionar`) aceptan
  `service_role` — alcanzable **sólo desde el servidor**, nunca desde el cliente
  (mismo patrón que `_pv_assert` para la ingesta de correos).
- Revocar una key es inmediato (`activo=false`).
- Toda llamada queda en `tms_api_log` (método, ruta, HTTP, prefijo).

## Arquitectura (por qué así)

El mismo patrón aplica al resto de dominios: mañana se agregan endpoints
`/postventa/*`, `/calidad/*`, `/conteo/*` reusando sus RPCs, sin reimplementar
reglas. La app web, Android y los externos consumen **la misma capa** — es lo
que vuelve a CCO una plataforma integrable, no un conjunto de pantallas.
