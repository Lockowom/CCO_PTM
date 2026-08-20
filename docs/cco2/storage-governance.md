# CCO 2.0 · Gobierno de Storage

Los buckets se consideran privados por defecto. Cada flujo debe validar propietario, MIME real,
tamaño, checksum y nombre generado por servidor. Las descargas privadas usan URL firmada corta;
los enlaces públicos requieren token opaco revocable, expiración y rate limit. No se registra la URL
firmada ni contenido sensible. Los plazos de retención quedan pendientes de aprobación formal.
