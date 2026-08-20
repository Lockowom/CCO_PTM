# PR22 · Login, público, Builder y TV

## Superficies implementadas

- Login 2.0: conserva autenticación, MFA, deep links, versión y fases reales. Se eliminaron esperas artificiales.
- PublicShell: cubre `/consulta`, `/verificar`, `/soporte` y `/rendiciones` sin navegación interna ni datos de sesión.
- Builder 2.0: workspace de tres áreas en escritorio (paleta, lienzo y propiedades) y lienzo único en tamaños menores.
- TV 2.0: continúa en fullscreen, sin Sidebar/Topbar, con branding compacto, reloj, sincronización, KPI, flujo y alertas.

## Flags y activación de beta

Todos permanecen apagados por defecto:

```bash
VITE_FF_WEB_LOGIN_V2=true
VITE_FF_WEB_PUBLIC_V2=true
VITE_FF_WEB_BUILDER_V2=true
VITE_FF_WEB_TV_V2=true
```

Se deben activar individualmente en beta. No cambian permisos, RLS, Auth ni contratos de datos.

## Verificación

```bash
npm run typecheck
npm test -- --run
npm run build
```

Validar manualmente MFA, retorno a deep link, consulta pública, formulario de soporte, rendiciones, guardar/preview del Builder y auto-refresh del TV.

## Rollback

Apagar los cuatro flags y volver a desplegar. El runtime legacy queda disponible y las rutas no cambian.
