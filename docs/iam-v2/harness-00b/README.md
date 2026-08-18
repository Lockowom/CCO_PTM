# PR-IAM-00B — ACCESS EQUIVALENCE HARNESS (2026-08-18)

Compara el resolver **LEGACY** (snapshot-00a congelado) contra el resolver **IAM 2.0** (spec V2:
solo `iam.role_permissions` de roles asignados, sin bypass ADMIN, sin allowlist por email, sin
superficie sin gate). Ejecutar: `node run_harness.cjs` (requiere `../datos_iam.json`).

## Outputs

| Archivo                  | Contenido                                                 |
| ------------------------ | --------------------------------------------------------- |
| `loss.csv`               | Permisos que se pierden bajo IAM2 (por usuario)           |
| `gain.csv`               | Permisos que se ganan bajo IAM2 (por usuario)             |
| `loss_funciones.csv`     | Funciones gateadas que se pierden bajo IAM2               |
| `gain_funciones.csv`     | Funciones que se ganan bajo IAM2                          |
| `unmapped.csv`           | Elementos sin representación en un lado o el otro         |
| `rutas_impacto.csv`      | Rutas que se romperían bajo IAM2                          |
| `rutas_ganadas_iam2.csv` | Rutas nuevas bajo IAM2                                    |
| `resumen.md`             | Resumen autogenerado (regenerar siempre al cambiar datos) |

## Resultado (snapshot 2026-08-18)

- **Permisos: loss=4, gain=0** — solo los 2 admins pierden `complete_rendiciones` y
  `view_asistente` (bypass ADMIN que no existe en IAM2).
- **Rutas: 0 se pierden, 0 se ganan** — el mapa de rutas queda idéntico (ningún usuario
  queda fuera de sus pantallas).
- **Funciones: loss=53** — el grueso del riesgo real:

| Función                  | Pierden                          | Causa                                                             |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| `wms_move_stock`         | 16/16                            | no existe permiso en catálogo; hoy EXECUTE authenticated sin gate |
| `batch_update_nv_estado` | 16/16                            | idem                                                              |
| `bulk_upsert`            | 16/16                            | idem (allowlist 11 tablas sin gate)                               |
| `eliminar_nv`            | 3/16 (2 admins + María Angélica) | allowlist por EMAIL (mig 099), no representable en IAM2           |
| Asistente IA (`ia_*`)    | 2/16 (admins)                    | `view_asistente` no está en el rol ADMIN de IAM                   |

- **Unmapped: 6** — `view_asistente` (huérfano), rol `rendiciones_oscar` (solo IAM), y las 4
  funciones sin permiso de catálogo arriba.

## Plan de cierre (llevar loss → 0 antes de activar IAM2)

1. **Catálogo**: crear permisos `nv_eliminar`, `stock_mover`, `nv_batch_estado`,
   `stock_bulk_upsert` (y dar `view_asistente` al rol ADMIN en `iam.role_permissions`).
2. **Asignación por rol**: `nv_eliminar` → ADMIN + SUPERVISOR_ (María Angélica conserva lo que
   tiene HOY vía allowlist; Nilo sigue sin poder eliminar); `stock_mover`/`nv_batch_estado`/
   `stock_bulk_upsert` → ADMIN + GERENCIA + INVENTARIO_ + SUPERVISOR_ (quien tenga `manage_*`
   de stock hoy) o según decisión de negocio en PR-IAM-01.
3. **RPCs**: reemplazar los gates legacy (allowlist email / EXECUTE a authenticated) por el
   permiso nuevo (`private.tiene_permiso('nv_eliminar')`).
4. **Rol ADMIN**: completar `iam.role_permissions` con `complete_rendiciones` (hoy solo lo tiene
   `rendiciones_oscar`).
5. **Re-ejecutar el harness**: objetivo `loss=0` de funciones y permisos para los 16 usuarios.

## Verificación

`node run_harness.cjs` termina con `OK: snapshot == resolver legacy (sin divergencias)`:
el snapshot congelado coincide con el cálculo del resolver legacy (integridad del baseline).
