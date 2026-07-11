# Despliegue móvil (Capacitor + Capgo OTA) — Runbook

App Android `com.cco.wms`. Las actualizaciones de **JS/CSS** viajan por **OTA con
Capgo** (sin pasar por Play Store); solo los cambios **nativos** requieren recompilar
el APK/AAB.

## Canales

| Canal | Quién lo recibe | Para qué |
|-------|-----------------|----------|
| **`beta`** | Solo los PDA de prueba que asignes | Validar una versión antes de soltarla. |
| **`production`** | Toda la bodega (canal por defecto) | Versión estable, ya validada en beta. |

> **Regla de oro:** ninguna versión llega a `production` sin pasar antes por `beta`.

## Flujo normal (cambios de JS/CSS)

```
1. Desarrollas y subes la versión en package.json (push a main)
        ↓  (CI automático: workflow "Capgo OTA → BETA")
2. El bundle queda en el canal BETA
        ↓
3. Validas en un PDA de prueba (asignado a beta)  ← ver "Asignar un PDA a beta"
        ↓  (si algo falla → nunca llegó a la bodega; corriges y repites)
4. Promueves a PRODUCTION  ← ver "Promover a producción"
        ↓
5. Toda la bodega recibe la versión con autoUpdate
```

**Importante:** desde este cambio, un push a `main` **ya no actualiza la bodega**
automáticamente — solo el canal beta. La bodega se actualiza recién cuando promueves.
Es el freno de seguridad, no un error.

## Asignar un PDA a beta

**Opción A — desde la app (recomendado):** en el PDA de prueba, entra como admin a
**Admin → Monitor** y usa la tarjeta *"Canal de actualizaciones (este dispositivo)"* →
botón **Beta**. Para devolverlo a estable, botón **Producción**.
*(Requiere que el canal `beta` tenga "Allow self-assign" activado en Capgo — se hace
una sola vez en el panel: app.capgo.io → Channels → beta → Allow device self-assign.)*

**Opción B — desde el panel Capgo:** app.capgo.io → tu app → **Devices** → busca el
dispositivo → asígnalo al canal `beta`.

## Promover a producción

**Opción A — GitHub Actions:** Actions → **"Capgo PROMOVER a producción"** →
Run workflow → escribe la versión (ej. `1.22.1`) → Run.

**Opción B — panel Capgo (un clic, siempre disponible):** app.capgo.io → tu app →
**Channels** → `production` → **Set bundle** → elige la versión validada.

## Rollback (revertir una versión mala)

Si una versión ya en producción da problemas:

**Panel Capgo (lo más rápido):** app.capgo.io → **Channels** → `production` →
**Set bundle** → elige la **versión anterior** conocida-buena. Los equipos vuelven a
ella en el próximo autoUpdate (segundos/minutos).

Capgo además revierte solo si un bundle **crashea al arrancar** (la app llama
`notifyAppReady()` en `mobileService.js`; si no lo logra, Capgo restaura el bundle
anterior automáticamente).

## Cambios NATIVOS (nuevo plugin, permiso, o subir Capacitor)

OTA **no** cubre cambios nativos. En ese caso:

1. Sube `versionCode` y `versionName` en `android/app/build.gradle`
   (hoy en `1` / `"1.0"` — increméntalos).
2. `npm run build && npx cap sync android`
3. Compila el AAB/APK firmado (`android/app/build.gradle` tiene el bloque `release`)
   y distribúyelo (Play Store o instalación directa).
4. Capgo exige que la **versión nativa** sea compatible con los bundles OTA; mantén
   el `versionName` alineado con la serie de `package.json`.

## Requisito único de configuración

Secreto de repositorio **`CAPGO_TOKEN`** (GitHub → Settings → Secrets and variables →
Actions). Sin él, los workflows avisan y se omiten sin romper nada.

## Comandos

```bash
npm run deploy:mobile               # build + sync + sube a BETA (seguro)
npm run deploy:mobile -- production # build + sync + sube directo a PRODUCTION (evítalo)
```
