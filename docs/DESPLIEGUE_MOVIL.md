# Despliegue móvil gratuito — GitHub Releases + Supabase

La app Android `com.cco.wms` conserva el plugin nativo open source
`@capgo/capacitor-updater`, pero ya no usa Capgo Cloud. GitHub Releases aloja los
ZIP y Supabase gestiona canales, checksum, adopción y auditoría.

## Flujo normal

1. Incrementar `package.json` y subir a `main`.
2. `OTA GRATIS → BETA` compila, genera `cco-ota-X.Y.Z.zip`, calcula SHA-256 y crea
   el release inmutable `ota-vX.Y.Z`.
3. El workflow registra el bundle en Supabase y mueve solo `beta`.
4. Validar en un PDA asignado a beta.
5. En Admin → Monitor OTA, elegir esa versión y promoverla a producción.

Ninguna versión llega automáticamente a toda la bodega.

## Rollback

En Admin → Monitor OTA, seleccionar la última versión conocida-buena y promoverla
a `production`. El plugin descarga ese bundle y mantiene su rollback nativo si la
app actualizada no alcanza `notifyAppReady()`.

Los GitHub Releases no se borran durante la limpieza: el panel solo archiva sus
metadatos. Esto conserva evidencia y permite recuperación manual.

## APK puente 1.55.145

La versión 1.55.145 es el puente de transición:

- se publica en el beta propio;
- también se publica una última vez en Capgo beta;
- contiene una consulta manual al backend propio, por lo que sigue actualizando
  incluso en un APK antiguo;
- el APK nuevo cambia los endpoints nativos a Supabase y desactiva la consulta
  automática del proveedor anterior.

No eliminar `CAPGO_TOKEN` ni cancelar Capgo hasta validar 1.55.145 en beta y luego
promover ese puente una sola vez en el workflow `PUENTE FINAL Capgo 1.55.145`.

## Cambios nativos

Plugins, permisos y configuración de Capacitor requieren un APK/AAB firmado:

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

La OTA solo transporta JS, CSS y assets web; nunca reemplaza código nativo.

## Seguridad y límites

- URL permitida: únicamente releases públicos de `Lockowom/CCO_PTM`.
- Integridad: SHA-256 obligatorio, validado por el plugin antes de instalar.
- Publicación: token de CI dedicado; no usa `service_role` en GitHub.
- Administración: JWT de usuario más permiso `deploy_ota`.
- Tablas OTA: RLS activo y sin acceso directo para `anon`/`authenticated`.
- El ZIP máximo aceptado es 250 MiB; el bundle actual es muy inferior.

## Rollback de la migración

Durante la transición, el rollback inmediato es promover nuevamente la versión
anterior desde Capgo. Después de retirar Capgo, promover un bundle anterior desde
Monitor OTA. Para volver temporalmente al proveedor antiguo en un APK nuevo habría
que restaurar los tres endpoints de `CapacitorUpdater` y recompilar el APK.
