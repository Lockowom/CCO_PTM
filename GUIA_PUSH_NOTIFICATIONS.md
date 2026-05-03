# 🚀 Guía de Despliegue de Notificaciones Push (Supabase + FCM)

Esta guía detalla los pasos finales para activar el envío automático de notificaciones push a los dispositivos móviles de los operarios cada vez que se les asigne una tarea u orden.

## 📁 ¿Qué se ha creado?
1. **Edge Function (`supabase/functions/send-push/index.ts`)**: Código en TypeScript/Deno que recibe el aviso de la base de datos y se conecta con Firebase para enviar el mensaje al celular.
2. **Trigger SQL (`database/push_trigger.sql`)**: Código SQL que "escucha" las asignaciones en tu base de datos y avisa a la Edge Function usando `pg_net`.

---

## 🛠️ PASO 1: Desplegar la Edge Function en Supabase

Si ya tienes la CLI de Supabase instalada y logueada, ejecuta estos comandos en tu terminal:

1. **Iniciar sesión en Supabase CLI** (si no lo has hecho):
   ```bash
   npx supabase login
   ```

2. **Vincular el proyecto local con tu base de datos en la nube**:
   ```bash
   npx supabase link --project-ref <TU_PROYECTO_REF>
   ```
   *(El `<TU_PROYECTO_REF>` son las letras/números aleatorios que aparecen en la URL de tu proyecto en Supabase, por ejemplo: `abxyz...`)*

3. **Subir los secretos (Keys) a la Edge Function**:
   Debes guardar la clave de Firebase y la clave de servicio de Supabase de forma segura.
   ```bash
   npx supabase secrets set SUPABASE_URL="https://<TU_PROYECTO_REF>.supabase.co"
   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<TU_SERVICE_ROLE_KEY_AQUI>"
   npx supabase secrets set FCM_SERVER_KEY="<TU_CLAVE_LEGACY_DE_FIREBASE>"
   ```
   *(La `FCM_SERVER_KEY` la encuentras en la Consola de Firebase -> Configuración del proyecto -> Cloud Messaging -> Cloud Messaging API (Legacy))*

4. **Desplegar la Función**:
   ```bash
   npx supabase functions deploy send-push
   ```

---

## 🛠️ PASO 2: Activar el Trigger en la Base de Datos

1. Abre el archivo `database/push_trigger.sql`.
2. Reemplaza `<TU_PROYECTO_REF>` con el ID real de tu proyecto Supabase.
3. Reemplaza `<TU_SUPABASE_ANON_KEY>` con la Anon Key pública de tu proyecto.
4. Ajusta la línea `on public.tms_nv_diarias` al nombre real de la tabla donde guardas las órdenes o tareas. (Ya lo dejé ajustado para tu tabla `tms_nv_diarias`).
5. Copia todo el código SQL y pégalo en el **SQL Editor** dentro de la web de Supabase y dale a **Run**.

---

## 🎉 ¡Listo!
Ahora, cuando a un operario se le asigne un nuevo trabajo, el Trigger detectará el cambio (`asignado_a`), llamará a tu nueva Edge Function, y ésta buscará el Token del celular en la base de datos para hacer que el teléfono vibre.