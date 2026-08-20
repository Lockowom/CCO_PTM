# OTA defectuoso

## Flujo normal desde la web

1. El push con nueva versión crea un bundle inmutable y mueve únicamente `beta`.
2. En **Administración → Monitor → Despliegue OTA**, asignar uno o más PDA a Beta.
3. Confirmar que al menos uno instaló la versión, se reportó en las últimas 24 horas y no registra error.
4. Escribir evidencia y pulsar **Aprobar beta**. Rechazarla si falla una prueba.
5. Solo entonces queda habilitado **Promover a producción**. La Edge Function vuelve a validar el gate.

La asignación es server-side: un equipo no puede autoasignarse al canal beta desde el endpoint público.

## Incidente y rollback

Pausar promoción, fijar canal a la última versión estable y comunicar a soporte. Forzar manifest
estable solo después de verificar firma/compatibilidad. Probar arranque limpio, login, navegación y
cola offline. La APK base debe seguir operativa sin OTA; documentar versión afectada y dispositivos.
Desde la web, seleccionar el bundle anterior, ingresar una justificación de al menos 10 caracteres y
confirmar. El cambio de canal y su responsable quedan registrados en el historial OTA.
