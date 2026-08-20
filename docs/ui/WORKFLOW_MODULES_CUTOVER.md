# CCO 2.0 — Cutover Inbound, Calidad y Postventa

## Flags beta

```bash
VITE_FF_WEB_INBOUND_V2=true
VITE_FF_WEB_QUALITY_V2=true
VITE_FF_WEB_POSTVENTA_V2=true
```

## Contrato preservado

- Inbound conserva identificación, evidencia, observaciones y confirmación.
- Calidad conserva permisos de decisión, lotes/series ERP y ubicación CCO como fuentes separadas.
- Postventa conserva tickets, asignación, SLA, adjuntos y calendario.
- No se modifican tablas, RPC, payloads, permisos ni estados.

## Rollback

Apagar los tres flags y reconstruir. Cada pantalla vuelve al estilo legacy manteniendo exactamente la misma ruta y componente.
