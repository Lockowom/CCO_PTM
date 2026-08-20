# CCO 2.0 — Administración V2 (PR21)

## Resultado

La administración conserva sus pantallas, servicios, RPC y permisos actuales, pero incorpora una portada agrupada en cuatro dominios:

- Identidad: IAM, seguridad y vistas.
- Operación: ubicaciones, solicitudes, bodegas y rendiciones.
- Plataforma: workflows, eventos, API Keys y cleanup.
- Observabilidad: monitor, errores/latencia, historial de cargas y tickets TI.

Cada tarjeta se calcula con `canAccessRoute`; una herramienta sin acceso IAM efectivo no se renderiza. IAM no fue reconstruido ni duplicado.

## Cambios transversales

- `/admin` es una ruta protegida y solo abre cuando el usuario tiene al menos un permiso administrativo compatible (ADMIN conserva el bypass solo para rutas registradas).
- Todas las rutas `/admin/*` resuelven la superficie `web_admin_v2`.
- La revocación de API Keys usa `ConfirmDialog`; el secreto continúa mostrándose una sola vez y después permanece enmascarado.
- No se agregaron campos de expiración/owner ni rotación ficticia: esos cambios requieren contrato backend y quedan fuera de un cutover exclusivamente UI.

## Activación

El flag permanece apagado por defecto. En beta interna:

```bash
VITE_FF_WEB_ADMIN_V2=true
```

## Rollback

```bash
VITE_FF_WEB_ADMIN_V2=false
```

Volver a desplegar. Las rutas, permisos y componentes funcionales permanecen disponibles en su versión legacy. PR21 no incluye migraciones de base de datos.

## Verificación

```bash
npm run lint -- --quiet
npm run typecheck
npm run test
npm run build
```
