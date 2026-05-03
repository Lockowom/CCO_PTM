-- ==============================================================================
-- EDGE FUNCTION / TRIGGER: NOTIFICACIONES PUSH NATIVAS
-- ==============================================================================
-- Este script crea una función y un trigger en Supabase para enviar
-- notificaciones push automáticas cuando ocurren eventos críticos en el WMS.
-- ==============================================================================

-- 1. Asegúrate de tener activada la extensión 'http' en tu proyecto Supabase
create extension if not exists http with schema extensions;

-- 2. Crear la función que envía el Push usando la API de FCM (Firebase)
create or replace function public.notify_wms_critical_event()
returns trigger as $$
declare
  user_token text;
  fcm_server_key text := 'TU_CLAVE_DE_SERVIDOR_FCM_AQUI'; -- Reemplazar con la Server Key de Firebase
  payload json;
  request_body text;
begin
  -- Ejemplo: Notificar si el stock de un producto cae por debajo de 10
  if TG_OP = 'UPDATE' and NEW.stock_total <= 10 and OLD.stock_total > 10 then
    
    -- Obtener el token del usuario (ejemplo: Jefe de Bodega o el usuario asociado a la ubicación)
    -- Aquí asumo que tienes una tabla tms_usuarios con una columna 'fcm_token'
    select fcm_token into user_token 
    from public.tms_usuarios 
    where rol = 'JEFE_BODEGA' 
    limit 1;

    if user_token is not null then
      -- Construir el JSON de la notificación
      payload := json_build_object(
        'to', user_token,
        'notification', json_build_object(
          'title', '⚠️ Alerta de Quiebre de Stock',
          'body', 'El producto ' || NEW.codigo_producto || ' ha bajado a ' || NEW.stock_total || ' unidades en ' || NEW.bodega,
          'sound', 'default'
        ),
        'data', json_build_object(
          'sku', NEW.codigo_producto,
          'bodega', NEW.bodega,
          'action', 'REPLENISHMENT_REQUIRED'
        )
      );

      request_body := payload::text;

      -- Hacer el POST request a Firebase Cloud Messaging
      perform http_post(
        'https://fcm.googleapis.com/fcm/send',
        request_body,
        'application/json',
        'key=' || fcm_server_key
      );
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- 3. Crear el Trigger para que se dispare cuando el inventario cambia
drop trigger if exists on_stock_critical on public.tms_inventario_general;
create trigger on_stock_critical
  after update on public.tms_inventario_general
  for each row
  execute function public.notify_wms_critical_event();
