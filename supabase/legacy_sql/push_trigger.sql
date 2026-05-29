-- ====================================================================================
-- SCRIPT: TRIGGER DE BASE DE DATOS PARA DISPARAR EDGE FUNCTION (PUSH NOTIFICATIONS)
-- ====================================================================================
-- Este script crea un Webhook nativo en PostgreSQL (usando la extensión pg_net)
-- que escucha actualizaciones en tus tablas y dispara la Edge Function "send-push".
-- ====================================================================================

-- 1. Asegurarnos de que la extensión http/net esté habilitada en Supabase
create extension if not exists pg_net;

-- 2. Crear la función que envía el Payload a la Edge Function
create or replace function public.trigger_push_notification()
returns trigger as $$
declare
  edge_function_url text := 'https://<TU_PROYECTO_REF>.supabase.co/functions/v1/send-push';
  anon_key text := '<TU_SUPABASE_ANON_KEY>';
  payload jsonb;
begin
  -- Solo disparamos si se ha asignado un nuevo operario o si cambia el estado a algo urgente
  -- (Ajusta la lógica de 'asignado_a' según el nombre real de tu columna en tu tabla de órdenes/tareas)
  if (TG_OP = 'UPDATE' and new.asignado_a is distinct from old.asignado_a and new.asignado_a is not null) or 
     (TG_OP = 'INSERT' and new.asignado_a is not null) then

    -- Construimos el payload JSON que enviaremos a Deno
    payload := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(new)
    );

    -- Hacemos la petición HTTP POST a nuestra propia Edge Function
    perform net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := payload
    );

  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 3. Crear el Trigger en la tabla deseada (tms_nv_diarias)
drop trigger if exists on_task_assigned_push on public.tms_nv_diarias;

create trigger on_task_assigned_push
after insert or update on public.tms_nv_diarias
for each row execute function public.trigger_push_notification();

-- Mensaje de éxito
-- Ejecuta este script en el SQL Editor de Supabase.