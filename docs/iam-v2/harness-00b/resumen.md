# PR-IAM-00B — Resultado del equivalence harness

Fecha snapshot: 2026-08-18 · Usuarios: 16

| usuario          | legacy | IAM2 | loss | gain |
| ---------------- | ------ | ---- | ---- | ---- |
| ARIEL SPOLANSKY  | 4      | 4    | 0    | 0    |
| Lucas Toloza     | 6      | 6    | 0    | 0    |
| Admin Respaldo   | 81     | 79   | 2    | 0    |
| Juan Carlos      | 6      | 6    | 0    | 0    |
| Christian Vargas | 6      | 6    | 0    | 0    |
| Marco Negroni    | 14     | 14   | 0    | 0    |
| Gisselle Romero  | 4      | 4    | 0    | 0    |
| Administrador    | 81     | 79   | 2    | 0    |
| Oscar Leiva      | 29     | 29   | 0    | 0    |
| NILO Langebach   | 4      | 4    | 0    | 0    |
| Cristopher       | 31     | 31   | 0    | 0    |
| María Angélica   | 12     | 12   | 0    | 0    |
| Revision         | 6      | 6    | 0    | 0    |
| MOISES           | 6      | 6    | 0    | 0    |
| PickingBD1       | 6      | 6    | 0    | 0    |
| PickingBD3       | 6      | 6    | 0    | 0    |

## Totales: loss=4 · gain=0 · unmapped=6 · rutas que se pierden=0 · rutas ganadas=0 · funciones-loss=53 · funciones-gain=0

## Pérdida de FUNCIONES bajo IAM2 (por usuario)

- **wms_move_stock** → pierden 16/16: ARIEL SPOLANSKY, Lucas Toloza, Admin Respaldo, Juan Carlos, Christian Vargas, Marco Negroni, Gisselle Romero, Administrador, Oscar Leiva, NILO Langebach, Cristopher, María Angélica, Revision, MOISES, PickingBD1, PickingBD3
- **batch_update_nv_estado** → pierden 16/16: ARIEL SPOLANSKY, Lucas Toloza, Admin Respaldo, Juan Carlos, Christian Vargas, Marco Negroni, Gisselle Romero, Administrador, Oscar Leiva, NILO Langebach, Cristopher, María Angélica, Revision, MOISES, PickingBD1, PickingBD3
- **bulk_upsert (11 tablas stock)** → pierden 16/16: ARIEL SPOLANSKY, Lucas Toloza, Admin Respaldo, Juan Carlos, Christian Vargas, Marco Negroni, Gisselle Romero, Administrador, Oscar Leiva, NILO Langebach, Cristopher, María Angélica, Revision, MOISES, PickingBD1, PickingBD3
- **eliminar_nv** → pierden 3/16: Admin Respaldo, Administrador, María Angélica
- _*ia_kpis / ia_buscar_* (Asistente)_* → pierden 2/16: Admin Respaldo, Administrador

## Ganancia de FUNCIONES bajo IAM2 (por usuario)

- (ninguna)

## Verificaciones de integridad (snapshot == resolver legacy)

- OK: snapshot consistente.

## Rutas que se pierden bajo IAM2 (por usuario)

- (ninguna)

## Rutas que se GANAN bajo IAM2 (por usuario)

- (ninguna)

## Unmapped

- [rol-iam-sin-legacy] rendiciones_oscar — IAM 2.0: rol no existe en tms_roles
- [permiso-huerfano] view_asistente — catalog: ningun rol lo tiene (legacy ni IAM2)
- [funcion-sin-permiso] eliminar_nv — allowlist por EMAIL en mig 099 (admin + angelica@ptm.cl): no existe permiso en catalog; IAM2 no la representa
- [funcion-sin-permiso] wms_move_stock — EXECUTE a authenticated sin gate (mig 174): no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS
- [funcion-sin-permiso] batch_update_nv_estado — EXECUTE a authenticated sin gate (mig 174): no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS
- [funcion-sin-permiso] bulk_upsert — allowlist de 11 tablas sin gate (mig 143): no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS
