# Harness PR-IAM-R06 · Legacy vs Resolver V2 (surface-level, shadow mode)

Generado: 2026-08-18T16:09:24.416Z · usuarios: 16 · surfaces: 50

## Resumen

| SAME_ALLOW | 288 |
| SAME_DENY | 512 |
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
