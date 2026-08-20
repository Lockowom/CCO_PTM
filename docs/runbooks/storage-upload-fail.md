# Falla de carga Storage

Conservar formulario y archivo local, mostrar reintento y correlation ID. Validar sesión, bucket,
MIME, tamaño, checksum y policy. No hacer público el bucket. Reintentar con nombre nuevo idempotente;
si quedó objeto huérfano, registrarlo para limpieza auditada, nunca eliminar por prefijo amplio.
