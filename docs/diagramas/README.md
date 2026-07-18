# Sub-diagramas CCO

Descomposición **física** (no funcional) del plano maestro
(`docs/flujo-maestro-cco.json`) en 5 sub-mapas por dominio, según
`docs/ARQUITECTURA_CCO.md` §9. El JSON maestro sigue siendo el índice que los une;
los 5 motores de plataforma (§7) son una capa transversal, no un sexto diagrama.

Cada archivo es importable al **Modelador de Procesos** con el botón **⬆ Importar**
(mismo formato `{_meta, nodes, edges}` que el maestro).

| # | Archivo | Dominio | Nodos |
|---|---|---|---|
| 1 | `1-master-data.json` | Datos maestros (productos, clientes, direcciones, series, lotes, catálogos) | hub + 6 |
| 2 | `2-warehouse-wms.json` | Bodega/WMS (recepción → ubicación → conteo → calidad → ajustes → inventario) | 7 |
| 3 | `3-operaciones.json` | Operaciones (NV → proceso → picking → packing → shipping) | 6 |
| 4 | `4-tms.json` | Transporte (orden → vehículos/choferes → rutas → GPS → POD) | 6 |
| 5 | `5-postventa.json` | Post-Venta (ticket → agenda → técnico → informe → cliente → cierre) | 7 |

> Son plantillas de partida: ábrelos en el Modelador y ajústalos como quieras.
> Al guardar/exportar, versiona el resultado aquí mismo.
