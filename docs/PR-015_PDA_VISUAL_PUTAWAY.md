# PR-015 — PDA visual Put Away correction (RELEASE C)

Fecha: 2026-08-17 · Rama: `release-a-foundation` (sin commit) · Baseline: 183 tests OK.

**Corrección del Put Away del PDA según TXT 01 §3 + TXT 04 §9-11.** El Put Away
de CCO es una **referencia visual operacional**: NO persiste cantidad ni toca
stock ERP. El RPC `registrar_putaway_ubicaciones` ya era idempotente (upsert por
ubicacion+codigo con advisory lock, cantidad=0); lo que se corrige es el **flujo
de UI** que pedía cantidad y usaba una key de cola no idempotente.

---

## Cambios

### `src/pages/Mobile/putawayVisual.js` (nuevo, contrato puro)
- `PUTAWAY_STEPS = ['SCAN_LOC','SCAN_SKU','CONFIRM']` — **sin paso de cantidad**.
- `buildPutawayRecord({ubicacion,codigo,descripcion})` → record **sin campo
  `cantidad`**, normalizado (trim + mayúsculas), descripción vacía → `null`.
- `putawayQueueKey({ubicacion,codigo})` → clave determinista `putaway_UBI_SKU`
  para **idempotencia en la cola offline**.
- `isValidPutaway()` → exige ubicación y código.
- `PUTAWAY_COPY` → `"Registrar ubicación visual"` + `"No modifica stock ERP."`.

### `src/pages/Mobile/WarehousePDA.jsx`
- Eliminado el paso **ENTER_QTY** (stepper `+/-` de cantidad, input numérico) y el
  bloque "Cantidad" del confirm.
- Flujo nuevo: SCAN_LOC → SCAN_SKU → **CONFIRM** (al escanear SKU va directo a
  confirmar).
- `confirmPutaway` ahora usa `buildPutawayRecord` (sin cantidad) y `putawayQueueKey`
  como `recordId` estable.
- **Dedupe en cola**: antes de encolar se consulta `db.syncQueue` por `recordId`;
  si ya hay un pending/failed con la misma clave, no se duplica (toast informativo).
- Pantalla CONFIRM muestra la copia: "Registrar ubicación visual" / "No modifica
  stock ERP.".
- `db` importado desde `src/lib/db`; iconos `Plus`/`Minus`/`ChevronRight` removidos.

## Gates

| Gate | Resultado |
|------|-----------|
| PERMISSION_LOSS | 0 |
| FUNCTION_LOSS | 0 |
| ROUTE_LOSS | 0 |
| DATA_LOSS | 0 |
| STOCK_SIDE_EFFECT_FROM_VISUAL_LOCATION | 0 (cantidad ya no se pide ni se envía; RPC persiste cantidad=0) |
| STOCK_SIDE_EFFECT_FROM_COUNT | 0 (Conteo/Consulta no se tocaron) |

## Verificación
- Lint: sin errores ni warnings nuevos (1 warning preexistente `result` en
  `openCameraScanner`, sin cambios).
- Test nuevo `src/tests/putawayVisualContract.test.js` (7): flujo sin cantidad,
  record sin campo cantidad, normalización, idempotencia de la clave, validación,
  copia operacional. **7/7 OK**.
- Suite completa, typecheck y build: verificado al cierre de RELEASE C.

## Archivos
```
src/pages/Mobile/putawayVisual.js            (nuevo)
src/pages/Mobile/WarehousePDA.jsx            (modificado)
src/tests/putawayVisualContract.test.js      (nuevo)
```