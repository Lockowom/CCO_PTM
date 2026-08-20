# Proveedor de rutas caído

La Edge Function debe responder fallback explícito, nunca fingir distancia vial. Permitir guardar un
borrador con precisión `ESTIMATED`; bloquear despacho si la política exige ruta verificada. Revisar
secreto, cuota y latencia del proveedor. Al recuperar, recalcular y comparar firma antes de confirmar.
