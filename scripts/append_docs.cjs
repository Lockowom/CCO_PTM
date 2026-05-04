const fs = require('fs');
let doc = fs.readFileSync('DOCUMENTACION_TECNICA_OPERATIVA.md', 'utf8');

const appendContent = `
## 📊 7. DIAGRAMA ENTIDAD-RELACIÓN (ER)

El siguiente diagrama muestra las relaciones principales entre las entidades del núcleo de la base de datos. (Soportado nativamente por Markdown en GitHub/GitLab).

\`\`\`mermaid
erDiagram
    TMS_USUARIOS ||--o{ TMS_NV_DIARIAS : "asigna / prepara"
    TMS_USUARIOS {
        uuid id PK
        text nombre
        text email
        text rol
        text push_token
    }
    TMS_NV_DIARIAS ||--o{ WMS_UBICACIONES : "reserva_stock"
    TMS_NV_DIARIAS {
        uuid id PK
        text n_venta
        text estado
        uuid usuario_asignado FK
    }
    WMS_UBICACIONES {
        int8 id PK
        text ubicacion
        text codigo
        text descripcion
        int4 cantidad
        text lote_serie
    }
\`\`\`

---

## 🔐 8. MATRIZ DE ROLES Y PERMISOS (RBAC)

El acceso a los módulos y las operaciones de escritura/eliminación están gobernados por el campo \`rol\` en \`tms_usuarios\`.

| Módulo / Acción | \`ADMIN\` | \`SUPERVISOR\` | \`OPERADOR\` | \`CONDUCTOR\` |
| :--- | :---: | :---: | :---: | :---: |
| **Acceso Inbound/Outbound** | ✅ | ✅ | ✅ | ❌ |
| **Mover Inventario (App)** | ✅ | ✅ | ✅ | ❌ |
| **Consultas y Kardex** | ✅ | ✅ | ✅ | ❌ |
| **Asignar Tareas a Otros** | ✅ | ✅ | ❌ | ❌ |
| **Eliminar Ubicaciones** | ✅ | ❌ | ❌ | ❌ |
| **Gestión TMS (Transporte)** | ✅ | ✅ | ❌ | ✅ |
| **Gestión de Usuarios (Admin)** | ✅ | ❌ | ❌ | ❌ |

---

## 🧰 9. LISTADO DE CUSTOM HOOKS Y SERVICIOS

El código está modularizado para separar la lógica de UI de la lógica de negocio y peticiones.

### 📁 \`src/services/\` (Capa de Lógica de Negocio y Datos)
*   **\`inventoryService.js\`**: Contiene las mutaciones (TanStack Query) y llamadas RPC a Supabase (\`useMoveStock\`, \`useInventoryQueries\`). También maneja el guardado en Dexie.js para el modo Offline.
*   **\`mobileService.js\`**: Controla el ciclo de vida móvil. Inicializa las actualizaciones OTA de Capgo, gestiona los listeners de red (\`online\`/\`offline\`) y registra el dispositivo en FCM para Push.
*   **\`labelPrinter.js\`**: Lógica de generación e impresión de etiquetas ZPL/PDF para Farmapack y cajas de despacho.
*   **\`wmsLogic.js\`**: Funciones puras para validación de formatos de códigos de barras, cálculos de cubicaje (L x W x H) y lógicas de validación.
*   **\`stressTest.js\`**: Utilidad de pruebas de carga para inyectar transacciones concurrentes simuladas.

### 📁 \`src/hooks/\` (Capa Reactiva de UI y Sensores)
*   **\`useScanner.js\`**: Hook global que intercepta eventos del teclado. Diferencia si escribe un humano o un láser PDA midiendo el tiempo entre pulsaciones (< 30ms).
*   **\`usePresence.js\`**: Conecta con Supabase Realtime Channels. Retorna un array con los usuarios conectados en la misma \`room\` (Modo Multijugador).
*   **\`usePushNotifications.js\`**: Hook base para envolver las peticiones de permisos de Capacitor Push Notifications.
*   **\`useConductores.js\`**: Lógica de fetching de estados para los choferes del TMS.

---

## 🚑 10. GUÍA DE TROUBLESHOOTING (Errores Comunes)

Si el proyecto presenta fallos durante el desarrollo o despliegue, revisa esta tabla antes de escalar el problema.

| Error / Síntoma | Causa Principal | Solución Rápida |
| :--- | :--- | :--- |
| \`❌ Version X.X.X already exists\` al usar \`deploy:mobile\` | Capgo no permite sobrescribir la misma versión OTA. | Abre \`package.json\` y aumenta el campo \`version\` (ej: de \`1.0.1\` a \`1.0.2\`). Luego vuelve a ejecutar el comando. |
| \`relation "public.X" does not exist\` en Supabase SQL | El nombre de la tabla en el Trigger o consulta no existe. | Verifica en el Table Editor de Supabase el nombre real. (ej: Usar \`tms_nv_diarias\` en lugar de \`tms_tareas_picking\`). |
| \`22P02: invalid input syntax for type uuid: "16"\` | Estás intentando buscar/actualizar un registro pasando un ID numérico en una columna tipo UUID. | Copia el UUID completo (ej: \`57ad329d-b44c-...\`) desde Supabase y pásalo como string. |
| **La app en el celular no muestra los cambios tras hacer deploy OTA** | El caché interno de Capgo se quedó "atrapado" en la versión vieja. | En Android: Ajustes > Aplicaciones > WMS CCO > Almacenamiento y Caché > **Borrar Almacenamiento**. Abre la app de nuevo. |
| **Push Notifications no vibran en Android** | Permisos denegados a nivel Sistema Operativo o falta el archivo de Google. | 1) Verifica que \`android/app/google-services.json\` exista.<br>2) En el celular, ve a Ajustes > Apps > WMS CCO > Notificaciones y actívalas. |
| \`El token '&&' no es un separador de instrucciones válido\` | Estás usando PowerShell para correr comandos encadenados (ej: \`npm run build && npx cap sync\`). | En PowerShell debes usar \`;\` en lugar de \`&&\`. (ej: \`npm run build; npx cap sync android\`). |

---
*Fin del Documento Técnico.*
`;

fs.appendFileSync('DOCUMENTACION_TECNICA_OPERATIVA.md', '\n' + appendContent);
console.log('Documentation updated!');
