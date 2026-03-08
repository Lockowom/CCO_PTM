# 📱 Documentación Técnica: App Móvil Conductores (Expo)

Este documento detalla la implementación técnica, arquitectura y guía de uso de la nueva aplicación móvil nativa para conductores del proyecto CCO, construida con **Expo** y **React Native**.

---

## 1. Visión General
La aplicación **TMS Driver App** permite a los conductores gestionar sus rutas de entrega en tiempo real desde sus dispositivos móviles (Android/iOS). Reemplaza la necesidad de navegadores web móviles, ofreciendo mejor rendimiento, acceso a hardware (GPS, Cámara) y persistencia de sesión nativa.

**Ubicación del Proyecto:** `c:\Users\crisc\Documents\PROYECT CCO\tms-mobile-expo\`

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión | Justificación |
| :--- | :--- | :--- | :--- |
| **Framework** | **Expo** | SDK 52 (Stable) | Desarrollo rápido, OTA updates, compatible con Expo Go. |
| **Core** | **React Native** | 0.76.x | Rendimiento nativo cruzado (iOS/Android). |
| **Estilos** | **NativeWind** | v2 | Utiliza clases de Tailwind CSS (igual que la web). |
| **Backend** | **Supabase JS** | v2 | Conexión directa a DB sin middleware, Realtime. |
| **Navegación** | **React Navigation** | v6 | Manejo de historial y transiciones nativas. |
| **Iconos** | **Lucide React Native** | Latest | Consistencia visual con la plataforma web. |

---

## 3. Arquitectura y Estructura de Archivos

El proyecto sigue una estructura modular dentro de la carpeta `src/`:

```text
tms-mobile-expo/
├── App.js                  # Punto de entrada (Navigation Container)
├── app.json                # Configuración de Expo (Iconos, Splash, Slug)
├── babel.config.js         # Configuración de compilador (NativeWind)
├── package.json            # Dependencias (SDK 52, React 18.3.1)
└── src/
    ├── context/
    │   └── AuthContext.js  # Estado Global: Manejo de Sesión y Usuario
    ├── lib/
    │   └── supabase.js     # Cliente Supabase con AsyncStorage (Persistencia)
    └── screens/
        ├── LoginScreen.js  # Pantalla de Acceso (Diseño Dark Mode)
        ├── HomeScreen.js   # Lista de Entregas (Realtime + Filtros)
        └── DetailScreen.js # Gestión de Entrega (Mapas, Rechazos, Fotos)
```

### Componentes Clave

#### A. Autenticación (`AuthContext.js`)
*   Maneja el estado del usuario (`user`, `session`).
*   Verifica credenciales contra la tabla `tms_usuarios`.
*   Cruza información con `tms_conductores` para obtener datos del vehículo y perfil.

#### B. Sincronización Tiempo Real (`HomeScreen.js`)
*   Utiliza `supabase.channel().on('postgres_changes')` para escuchar cambios en la tabla `tms_entregas`.
*   Si un operador en la Web asigna una ruta, aparece instantáneamente en el celular del conductor sin recargar.

#### C. Integración con Mapas (`DetailScreen.js`)
*   Utiliza **Deep Linking** para abrir la dirección de entrega directamente en la app de navegación preferida del usuario (Google Maps, Waze, Apple Maps).

---

## 4. Instalación y Ejecución

### Prerrequisitos
*   Node.js instalado en el PC.
*   Celular con la app **Expo Go** instalada (disponible en Play Store / App Store).
*   PC y Celular en la misma red Wi-Fi (recomendado).

### Pasos para Ejecutar
1.  **Abrir terminal** en la carpeta del proyecto:
    ```powershell
    cd "c:\Users\crisc\Documents\PROYECT CCO\tms-mobile-expo"
    ```

2.  **Instalar dependencias** (si es la primera vez o si hubo limpieza):
    ```powershell
    npm install
    ```

3.  **Iniciar Servidor de Desarrollo**:
    ```powershell
    npx expo start -c
    ```
    *   *Nota: El flag `-c` limpia la caché de Metro Bundler, vital para evitar errores de compilación.*

4.  **Escanear QR**:
    *   Leer el código QR mostrado en la terminal con la app **Expo Go**.

---

## 5. Solución de Problemas (Troubleshooting)

Durante la implementación, se resolvieron conflictos de versiones específicos. Aquí la referencia para mantenimiento futuro:

### Error: `Cannot find module 'node:sea'` o `resolve-from`
*   **Causa:** Incompatibilidad entre Expo SDK 55 (Beta) y la versión estable de Expo Go en Android.
*   **Solución Aplicada:**
    1.  Downgrade del proyecto a **Expo SDK 52** (Versión estable actual).
    2.  Instalación de versiones exactas de `react-native` (0.76.9) y `react` (18.3.1).
    3.  Limpieza profunda de `node_modules` y `package-lock.json`.

### Error: `Value too long` al actualizar estados
*   **Causa:** Columnas de texto en BD con límite de caracteres (VARCHAR 50).
*   **Solución:** Se ejecutó script SQL para convertir columnas críticas a `TEXT` ilimitado.

### La App no conecta al Backend
*   **Verificación:** Asegurar que el archivo `src/lib/supabase.js` tenga la `SUPABASE_URL` y `SUPABASE_ANON_KEY` correctas.
*   **Red:** Verificar que el celular tenga acceso a internet (la conexión a Supabase es directa a la nube, no pasa por el localhost del PC).

---

## 6. Próximos Pasos Sugeridos
*   **Notificaciones Push:** Integrar Expo Notifications para avisar de nuevas rutas con la app cerrada.
*   **Modo Offline:** Implementar caché local (WatermelonDB o SQLite) para permitir trabajar en zonas sin señal y sincronizar al volver.
*   **Fotos de Prueba:** Agregar funcionalidad de cámara para subir foto del remito firmado al completar la entrega.
