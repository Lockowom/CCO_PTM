-- ============================================================
-- MIGRACIÓN 008: Tickets TI — desacoplar notificación del INSERT
-- Fecha: 2026-05-29
-- ============================================================
-- Bug: la creación de tickets quedaba "cargando eternamente" y no se creaba ninguno
-- desde 2026-05-08. Causa: el trigger AFTER INSERT (notify_new_ticket) hacía net.http_post
-- a la Edge Function notify-ticket DENTRO de la transacción del INSERT (SECURITY INVOKER),
-- bloqueando/abortando la creación del ticket.
-- Fix: funciones SECURITY DEFINER + net.http_post envuelto en EXCEPTION (jamás bloquea/aborta)
-- + timeout corto. También se corrige la política SELECT (casteaba usuario_id::uuid -> reventaba
-- con ids no-UUID); ahora compara por texto.
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_new_ticket()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-ticket',
      body := jsonb_build_object(
        'ticket_id', NEW.ticket_id, 'usuario_nombre', NEW.usuario_nombre, 'usuario_id', NEW.usuario_id,
        'asunto', NEW.asunto, 'descripcion', NEW.descripcion, 'prioridad', NEW.prioridad
      ),
      headers := jsonb_build_object('Content-Type', 'application/json'),
      timeout_milliseconds := 2000
    );
  EXCEPTION WHEN OTHERS THEN
    NULL; -- la notificación jamás rompe la creación del ticket
  END;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_ticket_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.estado = NEW.estado AND COALESCE(OLD.respuesta_admin, '') = COALESCE(NEW.respuesta_admin, '') THEN
    RETURN NEW;
  END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-ticket-update',
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'ticket_id', NEW.ticket_id, 'usuario_id', NEW.usuario_id, 'usuario_nombre', NEW.usuario_nombre,
          'asunto', NEW.asunto, 'estado', NEW.estado, 'respuesta_admin', NEW.respuesta_admin
        ),
        'old_record', jsonb_build_object('estado', OLD.estado, 'respuesta_admin', OLD.respuesta_admin)
      ),
      headers := jsonb_build_object('Content-Type', 'application/json'),
      timeout_milliseconds := 2000
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$function$;

-- Política SELECT robusta (sin cast a uuid)
DROP POLICY IF EXISTS "tickets_select_own_or_admin" ON tms_tickets;
CREATE POLICY "tickets_select_own_or_admin" ON tms_tickets FOR SELECT
USING ( usuario_id = (SELECT id::text FROM tms_usuarios WHERE auth_uid = auth.uid()) OR is_admin() );
