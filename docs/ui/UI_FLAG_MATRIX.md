# CCO 2.0 — Matriz de feature flags UI

Fecha de corte: 2026-08-20. Los valores de esta matriz son deliberadamente distintos entre el sitio beta y producción. No existen overrides ocultos.

| Flag               | Default | Internal Beta | Producción | Owner          | Rollback                     | Dependencia                       | Private beta |
| ------------------ | ------- | ------------- | ---------- | -------------- | ---------------------------- | --------------------------------- | ------------ |
| `web_shell_v2`     | OFF     | ON            | OFF        | Plataforma     | `VITE_FF_WEB_SHELL_V2=false` | IAM + route registry              | No           |
| `web_dashboard_v2` | OFF     | ON            | OFF        | Panel PTM      | desactivar flag              | Shell V2                          | No           |
| `web_panel_nv_v2`  | OFF     | ON            | OFF        | Panel PTM      | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_inventory_v2` | OFF     | ON            | OFF        | Inventario     | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_inbound_v2`   | OFF     | ON            | OFF        | Inbound        | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_quality_v2`   | OFF     | ON            | OFF        | Calidad        | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_postventa_v2` | OFF     | ON            | OFF        | Postventa      | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_routes_v2`    | OFF     | ON            | OFF        | Logística      | desactivar flag              | `module_rutas_private_beta` + IAM | Sí           |
| `web_tms_v2`       | OFF     | ON            | OFF        | Transporte     | desactivar flag              | `module_rutas_private_beta` + IAM | Sí           |
| `web_admin_v2`     | OFF     | ON            | OFF        | Administración | desactivar flag              | Shell V2 + IAM                    | No           |
| `web_login_v2`     | OFF     | ON            | OFF        | Plataforma     | desactivar flag              | Auth                              | No           |
| `web_builder_v2`   | OFF     | ON            | OFF        | Panel PTM      | desactivar flag              | Shell V2 + IAM                    | No           |

La activación visual no reemplaza IAM, RLS ni los guards de ruta. Coordinación de Rutas y TMS siguen exigiendo su permiso de Private Beta aunque sus flags visuales estén activos.
