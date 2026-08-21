# CCO 2.0 — Runbook INTERNAL BETA

## Entornos

| Entorno       | Render                      | URL                                              | Flags V2    |
| ------------- | --------------------------- | ------------------------------------------------ | ----------- |
| Internal Beta | `cco-ptm-internal-beta-web` | `https://cco-ptm-internal-beta-web.onrender.com` | 12 ON       |
| Producción    | `CCO_PTM`                   | `https://cco-ptm-b05m.onrender.com`              | OFF/default |

El servicio beta es un Web Service separado en plan Free. Se usa el servidor Express del repositorio para que el fallback de React Router funcione también al refrescar rutas profundas. Ambos entornos construyen `main`, pero sus variables de compilación son independientes. Activar beta no cambia el bundle productivo.

## Piloto obligatorio

Validar con usuarios reales de estos perfiles: administrador, supervisor, operador Panel, bodega, inventario, calidad, despacho y chofer/TMS beta. Rutas/TMS deben continuar ocultos para quien no tenga el permiso Private Beta.

## Script de prueba

1. Abrir la URL beta y hacer Login.
2. Verificar landing y navegación autorizada.
3. Recorrer Dashboard, Panel, Inventario, Inbound, Calidad y Postventa.
4. Abrir Administración solo con permiso.
5. Abrir TMS solo con permiso Private Beta.
6. Verificar una pantalla móvil y una descarga representativa.
7. Cerrar sesión y confirmar que las rutas protegidas vuelven a Login.

Registrar en cada hallazgo: ruta, usuario/rol, viewport, acción, resultado esperado, resultado real, captura, hora y commit. Severidades: `BLOCKER`, `MAJOR`, `MINOR`, `POLISH`. Etiquetas: `LAYOUT`, `RESPONSIVE`, `COLOR`, `TYPOGRAPHY`, `NAVIGATION`, `MOTION`, `PERFORMANCE`, `ACCESSIBILITY`, `FUNCTIONAL`, `IAM`, `MOBILE`.

## Gates automatizados

```bash
npm run ui:flags:beta
npm run ui:audit
npm run lint -- --quiet
npm run typecheck
npm run test
npm run build
```

Para validar una configuración de producción antes del build:

```bash
npm run ui:flags:production
```

## Criterio de salida

- Entorno beta `live` y producción sin cambios.
- 12 flags V2 activos solo en beta.
- Smoke autenticado completado por los perfiles piloto.
- `BLOCKER = 0` y regresiones de permisos/rutas/datos = 0.
- Rutas/TMS continúan bajo Private Beta.
- Rollback y canal de feedback disponibles.
