# Generar la APK nueva (build nativa) — CCO WMS `com.cco.wms`

Cuándo se necesita: cuando cambian **dependencias nativas** (plugins de Capacitor)
y el OTA ya no puede actualizar la app instalada — Capgo lo avisa en
**Compatibilidad → "Se necesita una nueva construcción nativa"**. El OTA solo
actualiza el contenido web; el caparazón nativo se renueva con una APK nueva.

Este repo ya quedó preparado:
- `android/app/build.gradle`: **versionCode 2 / versionName "1.26.0"** (alinea la
  versión nativa con la serie OTA → resuelve el evento de compatibilidad) y un
  **signingConfig de release** que lee de `keystore.properties`.
- `android/keystore.properties.example`: plantilla de la firma (los secretos NO se
  commitean; ya están en `.gitignore`).

---

## Opción A — Constructor en la nube de Capgo (recomendado, sin Android Studio)

En el panel de Capgo: **Compatibilidad** → botón **"Abre el constructor de Capgo"**
(o pestaña **Construcciones**). El servicio compila la APK/AAB en la nube desde este
repo. Pasos:

1. **Firma**: Capgo administra el keystore de Android por ti. La primera vez te pedirá
   **generar o subir un keystore de release** — deja que Capgo lo genere y **guarda/
   respalda** las credenciales que te dé (si se pierden, no podrás actualizar la app
   publicada nunca más).
2. **Rama**: apunta el build a `main`.
3. **Construir**: inicia el build. Al terminar, descarga la **APK** (para instalar
   directo en el teléfono) o el **AAB** (para Play Store).
4. **Instala la APK** en tu teléfono (habilita "instalar apps de origen desconocido"
   si la instalas directo). Esta APK ya trae la versión 1.26.0 y el nativo alineado.
5. **De aquí en adelante**, el OTA vuelve a fluir: mientras solo cambie el web/JS, los
   equipos se actualizan solos por Capgo sin reinstalar.

> Con el constructor de Capgo NO necesitas `keystore.properties` local — Capgo pone la
> firma. Ese archivo es solo para builds locales/CI (Opción B).

---

## Opción B — Build local (si tienes Android Studio / SDK)

1. Crea el keystore de release **una sola vez** y guárdalo fuera del repo:
   ```bash
   keytool -genkey -v -keystore cco-release.jks -keyalg RSA -keysize 2048 \
     -validity 10000 -alias cco
   ```
2. Copia la plantilla y complétala:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   # edita android/keystore.properties con tus contraseñas y la ruta al .jks
   ```
3. Compila el web y sincroniza el proyecto nativo, luego arma el release:
   ```bash
   npm ci
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease      # APK  → app/build/outputs/apk/release/
   # o:  ./gradlew bundleRelease                # AAB  → app/build/outputs/bundle/release/
   ```
4. Instala la APK firmada en el teléfono.

---

## Después de instalar la APK nueva

1. En Capgo, la app reportará **versión nativa 1.26.0** → el evento de compatibilidad
   queda resuelto.
2. Para recibir las **versiones de prueba**: asigna el equipo al canal **beta**
   (Capgo → Devices, o el botón **Beta** en Admin → Monitor, que ya sí aparecerá).
3. El canal **production** sigue sirviendo lo que promuevas (hoy 1.10.3 → cuando
   valides, promueve 1.26.0 con el workflow *Capgo PROMOVER a producción*).

## Cada próxima build nativa

Sube el **versionCode** (Android exige que aumente: 2 → 3 → 4…) y el `versionName`
a la serie vigente de `package.json`, y repite la Opción A o B. Solo hace falta una
build nativa nueva cuando cambian **plugins nativos**; los cambios de web/JS siguen
yendo por OTA sin reinstalar.
