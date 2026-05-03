// Sigue la especificación de Deno requerida por Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Reemplazar con el ID del proyecto Firebase o leer desde variable de entorno
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID") || "tu-proyecto-firebase-id";

/**
 * Para utilizar FCM v1 HTTP API, necesitamos obtener un token OAuth2
 * Esto asume que tienes un Service Account JSON guardado en variables de entorno.
 * Por simplicidad de integración sin librería pesada de google-auth, se puede usar el Legacy API
 * o configurar la URL del webhook en Supabase pg_net si prefieres no usar Edge Functions.
 * Aquí implementaremos la estructura que recibe el trigger de la base de datos.
 */

serve(async (req) => {
  try {
    // 1. Validar request
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const payload = await req.json();
    console.log("🔔 Payload recibido de Supabase Trigger:", payload);

    // 2. Inicializar cliente Supabase para buscar el push_token
    // Usamos el Service Role para bypassear RLS y buscar los datos del usuario
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Extraer información del registro nuevo/modificado
    // Ejemplo asumiendo tabla "tms_ordenes"
    const record = payload.record;
    
    // Si la orden no tiene asignado un operador, no mandamos push
    if (!record || !record.asignado_a) {
      return new Response(JSON.stringify({ message: 'No operario asignado. Ignorado.' }), { status: 200 });
    }

    // 4. Buscar el push_token del operario asignado
    const { data: user, error: userError } = await supabase
      .from('tms_usuarios')
      .select('push_token, nombre')
      .eq('id', record.asignado_a)
      .single();

    if (userError || !user?.push_token) {
      console.log(`Usuario ${record.asignado_a} no tiene push_token. Ignorando.`);
      return new Response(JSON.stringify({ message: 'User without push_token' }), { status: 200 });
    }

    // 5. Preparar el mensaje Push para FCM
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY"); // Clave del Legacy API de Firebase (Console -> Cloud Messaging -> Cloud Messaging API)
    
    if (!fcmServerKey) {
      throw new Error("FCM_SERVER_KEY is not set in Edge Function secrets");
    }

    const message = {
      to: user.push_token,
      notification: {
        title: `🚨 Nueva Orden Asignada`,
        body: `Hola ${user.nombre.split(' ')[0]}, se te ha asignado la orden ${record.numero_orden || record.id}.`,
        sound: "default",
        badge: 1
      },
      data: {
        route: `/picking`,
        orderId: record.id
      }
    };

    // 6. Enviar a Firebase Cloud Messaging
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${fcmServerKey}`
      },
      body: JSON.stringify(message)
    });

    const fcmResult = await response.json();
    console.log("✅ FCM Response:", fcmResult);

    return new Response(
      JSON.stringify({ success: true, fcmResponse: fcmResult }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error enviando Push:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});