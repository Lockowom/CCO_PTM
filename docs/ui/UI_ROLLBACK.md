# CCO 2.0 — Rollback UI

## Internal Beta

El rollback más rápido no toca producción: retirar la URL beta del piloto y continuar usando `https://cco-ptm-b05m.onrender.com`.

Para volver beta al shell legacy, definir en el servicio `cco-ptm-internal-beta-web` las 12 variables de `UI_FLAG_MATRIX.md` como `false`, guardar con rebuild y esperar estado `live`. Validar:

```bash
npm run ui:flags:production
```

El contenedor raíz debe exponer `data-shell-version="legacy"`. No se revierten tablas, RLS, RPC, datos ni permisos porque este cutover solo cambia variables de compilación.

## Rollback por módulo

Si el incidente está aislado, apagar solo su flag. Si afecta navegación, sesión o múltiples módulos, apagar primero `VITE_FF_WEB_SHELL_V2` y después los flags dependientes. Rutas/TMS además pueden cerrarse con su permiso/flag Private Beta sin publicar el módulo.

## Evidencia mínima

Registrar hora de inicio/fin, responsable, flag modificado, deploy Render, commit, smoke posterior y confirmación de integridad de datos. No mezclar hotfixes no relacionados durante el rollback.
