# legacy_sql — scripts SQL históricos (NO EJECUTAR)

Estos archivos se aplicaron manualmente en el pasado y fueron movidos aquí desde la raíz del
repo durante la limpieza del 2026-05-29. Se conservan **solo como referencia histórica**.

⚠️ **No ejecutar.** Varios están obsoletos o contienen versiones anteriores (inseguras) de
funciones que ya fueron endurecidas en producción. Re-ejecutarlos podría **revertir**
correcciones de seguridad.

El estado actual y autoritativo del backend está en:
- `../migrations/` (migraciones numeradas)
- `../functions_snapshot.sql` (snapshot de funciones/RPC)

Notas:
- `SUPABASE_WMS_LOGIC.sql` / `SUPABASE_TRANSACTIONAL.sql` definen `wms_move_stock`,
  `wms_reserve_stock`, `get_fefo_allocation`, que referencian tablas inexistentes
  (`wms_inventory`, `wms_kardex`, `wms_allocations`). Son código muerto a nivel de datos
  (ver `REVISION_PROYECTO.md`).
- `SUPABASE_RECURSION_FIX*.sql` correspondían a iteraciones de los helpers de admin, hoy
  reemplazados por `private.is_admin()`.
