# Baseline IAM (PR-IAM-01) — 2026-08-18

Snapshot inmutable de entrada para el PR-IAM-00A (snapshot zero-loss).
Fuente: base de datos PROD (Supabase `vtrtyzbgpsvqwbfoudaf`) + código `src/` + `supabase/migrations/`.

## Archivos

| Archivo                             | Contenido                                                         |
| ----------------------------------- | ----------------------------------------------------------------- |
| `usuarios.csv`                      | 16 usuarios (nombre, email, rol, activo, admin delegado, landing) |
| `roles_permisos.csv`                | 9 roles × permisos (fuente `tms_roles.permisos_json`)             |
| `asignaciones.csv`                  | 18 asignaciones IAM (rol + scope)                                 |
| `nilo_angelica_acceso_efectivo.csv` | Acceso efectivo función por función de NILO y MARIA ANGELICA      |

## Reglas

- No editar estos archivos: son el baseline congelado del acceso actual.
- Cualquier cambio de acceso posterior a esta fecha debe registrarse como delta
  en `docs/iam-v2/deltas/` y compararse contra este baseline.
- El informe completo vive en `docs/iam-v2/inventario-actual.md`.

## Personas de referencia (respuesta canónica a "¿qué puede hacer hoy?")

- **NILO** (SUPERVISOR, scope global): Panel PTM completo (dashboard/ingresar/info/tv/builder),
  crear/editar/cambiar estado N.V. **Eliminar N.V. ❌**. Sin admin, sin IAM, sin stock.
- **MARIA ANGELICA** (SUPERVISOR_, global + bodega 100): Panel PTM completo + Inbound + Consultas
  - Carteles/Traspasos/Análisis (parcial). Crear/editar/cambiar estado N.V. **Eliminar N.V. ✅
    (origen Individual — allowlist mig 099)**.
