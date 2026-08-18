# PR-IAM-00A — CURRENT ACCESS SNAPSHOT (2026-08-18)

Snapshot cero-pérdida: congelamiento del acceso EFECTIVO actual de los 16 usuarios,
antes de tocar el resolver nuevo del IAM 2.0. Generado con
`generar_snapshot.cjs` (reproducible: `node generar_snapshot.cjs`).

## Entregables (spec V2)

| Archivo                              | Contenido                                                  |
| ------------------------------------ | ---------------------------------------------------------- |
| `permisos_efectivos_por_usuario.csv` | 16 usuarios × 80 permisos (PERMITIDO / No asignado)        |
| `rutas_efectivas_por_usuario.csv`    | 16 usuarios × 52 rutas (estado + vía que la habilita)      |
| `tabs_efectivas_por_usuario.csv`     | Tabs de Conteo / Análisis / Postventa por usuario          |
| `scopes_por_usuario.csv`             | Scopes por usuario (global; Angélica: global + bodega:100) |
| `funciones_rpc_por_usuario.csv`      | 14 funciones gateadas a nivel RPC por usuario              |
| `sha256sums.txt`                     | Hash SHA-256 de cada CSV (integridad del snapshot)         |
| `generar_snapshot.cjs`               | Generador reproducible                                     |

## Reglas

- **Inmutable**: no editar estos archivos. Cualquier cambio futuro se registra en
  `docs/iam-v2/deltas/` y se compara contra este snapshot.
- Si se regenera (por cambio real de accesos), los hashes de `sha256sums.txt` deben
  cambiar: eso es el "diff de baseline".
- Las verificaciones del PR-IAM-00B (equivalence harness) comparan contra ESTE
  snapshot, no contra la memoria de nadie.

## Metodología del acceso efectivo

```
permiso_efectivo(usuario) = UNION(
  legacy: tms_roles.permisos_json (columna "rol" de tms_usuarios),
  IAM: iam.role_permissions de iam.assignments del usuario,
  bypass ADMIN (is_admin / es_admin_delegado),
  allowlist individual (eliminar_nv → admin + angelica@ptm.cl, mig 099),
  superficie sin gate (bulk_upsert, tier1 RLS, wms_move_stock, batch_update_nv_estado)
)
```

- Rutas: una ruta se habilita si el usuario tiene CUALQUIERA de sus permisos
  (semántica OR del router actual). Vía = el/los permiso(s) que la abren.
- Tabs: `_amplios` abren el módulo completo; si no, cada tab con su permiso.
- Private beta (`/panel/rutas`): flag ON en código, evaluado ANTES del bypass ADMIN;
  nadie tiene `cco_private_beta_rutas` → **ningún usuario accede** (ni admin).
- `/` y `/seguridad`: todo usuario autenticado y activo.

## Hallazgos congelados en el snapshot (por resolver en PR-IAM-00B/00C)

1. **`bulk_upsert`** (mig 143): allowlist de 11 tablas pero sin gate por permiso →
   cualquier `authenticated` escribe stock (todos los usuarios: PERMITIDO).
2. **`wms_move_stock` / `batch_update_nv_estado`**: revocados de anon/public
   (mig 174) pero `authenticated` conserva EXECUTE sin gate interno → mover stock y
   cambiar estado N.V. en lote sin permiso.
3. **RLS tier1 permisiva** (mig 003): lecturas abiertas a todo `authenticated`.
4. **`eliminar_nv`**: gate por allowlist de EMAIL (mig 099) — solo admin y
   `angelica@ptm.cl`. NILO: ❌. MARIA ANGELICA: ✅ (origen Individual).
5. **Análisis de Códigos para Angélica**: ruta abierta (vía `view_batches`/`manage_data_import`)
   pero **0 tabs** (no tiene `view_analisis` ni tabs) → pantalla rota.
6. **TMS visible por `manage_panel`**: NILO y MARIA ANGELICA pasan el guard de
   `/tms/control` y `/tms/pda` (menú oculto, ruta viva).
7. **Inactivos**: Cristopher (INVENTARIO_), Gisselle (SUPERVISOR), Juan Carlos,
   MOISES, PickingBD1/3 (OPERADOR) — tienen accesos definidos pero `activo=false`.

## Datos clave del snapshot

- 16 usuarios (10 activos / 6 inactivos) · 9 perfiles + rol extra `rendiciones_oscar`
- 80 permisos · 52 rutas · 18 asignaciones (17 global + Angélica `bodega:100`)
- 8 equipos `ROL_*` espejo · **0 delegaciones** · private beta: nadie
- ACCESO MÁXIMO: Admin Respaldo, Administrador (bypass + 80 permisos)
- ACCESO MÍNIMO: OPERADOR (6 permisos: entry/reception/batches/locations/sales_status/carteles)
