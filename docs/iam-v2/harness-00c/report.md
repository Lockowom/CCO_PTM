# Harness PR-IAM-R06 · Legacy vs Resolver V2 (surface-level, shadow mode)

Generado: 2026-08-19T01:10:40.551Z · usuarios: 16 · surfaces: 51

## Resumen

| SAME_ALLOW | 290 |
| SAME_DENY | 526 |
| LOSS | 0 |
| GAIN | 0 |
| ERROR | 0 |

## Gate zero-loss

LOSS+GAIN+ERROR = 0 PASS — cero, equivalente a nivel pantalla

## UNMAPPED (permisos legacy sin pantalla — resolver pendiente R17+)

| permiso       | usuarios                      |
| ------------- | ----------------------------- |
| deploy_ota    | Admin Respaldo, Administrador |
| export_data   | Admin Respaldo, Administrador |
| manage_fichas | Admin Respaldo, Administrador |

> UNMAPPED no es pérdida: son permisos sin ruta (widget Asistente IA, RPCs). Se resuelven
> en la granularización por dominio (R17+) con permisos de función equivalentes.
