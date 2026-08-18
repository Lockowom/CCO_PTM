# PR-002 — Contratos Operacionales y Constantes Compartidas

**Programa:** CCO 2.0 · Release A (Foundation)
**PR:** PR-002
**Fuente:** TXT 01 `CCO_2_0_MODELO_OPERACIONAL_Y_CONTRATOS_V1`
**Fecha:** 2026-08-17

Define **qué significa cada dato/proceso** y las constantes compartidas.
Regla: ninguna regla de negocio se hardcodea en un componente; se importa de
`src/constants/operationalContracts.js`.

---

## 1. SSOT por dominio

| Dato | Fuente de verdad | Implicación |
|---|---|---|
| **Stock oficial** | ERP (Softland) | CCO no descuenta stock. Los espejos operativos de CCO no transaccionan inventario. |
| **Ubicación (Put Away)** | CCO visual (`wms_ubicaciones`) | Es una ubicación VISUAL: señala dónde está el material físicamente, no transacciona stock. |
| **Conteo** | Observación física CCO | Es una observación/comparación contra el ERP. **No ajusta stock automáticamente.** El ajuste exige aprobación y va por la RPC `conteo_ajuste_erp`. |
| **Picking + Packing** | Estado operativo "En Proceso" | Son procesos físicos contenidos en el estado; **no** son transacciones de inventario. |
| **Shipping** | Estado operativo | Preparación física terminada / disponible para coordinación. |
| **Calidad · ubicación** | CCO | Calidad usa la ubicación visual de CCO. |
| **Calidad · stock** | ERP | Calidad lee lotes/series del stock ERP (`calidad_lotes_series`). |
| **UNKNOWN ≠ 0** | — | Valor desconocido no es igual a cero en ningún reporte. |

## 2. Estados operativos (SSOT)

Ver `src/constants/operationalContracts.js` → `ESTADO_FLUJO`, `ESTADOS_ACTIVOS`,
`ESTADOS_DESCARTADOS`.

- **Activos:** Pendiente · Aprobada · Pendiente Picking · PACKING · LISTO_DESPACHO ·
  Pendiente Shipping · Despachado · ENTREGADO.
- **Descartados** (no cuentan en pipeline activo): NULA · Refacturacion · SOLO_FACTURAR.

> Nota: el flujo de `src/constants/estados.js` (interfaz visual) y estos contratos
> deben mantenerse alineados. `ESTADOS_PIPELINE` es la lista visual histórica.

## 3. SLA por etapa

`SLA_ETAPA_HORAS` y `SLA_NV_TOTAL_HORAS` (72 h objetivo Pendiente → Entregado).
Sirven para lead time y alertas de sobre-paso.

## 4. Gates de stock (prohibiciones absolutas)

`STOCK_SIDE_EFFECT_PROHIBITIONS`:
| Flujo | Prohibición |
|---|---|
| Put Away / ubicación visual | NO descuenta stock |
| Conteo | NO ajusta stock automáticamente |
| Rutas | NO transaccionan stock |
| TMS | NO transacciona stock |
| Picking | NO descuenta stock |
| Packing | NO descuenta stock |

Única vía de ajuste desde CCO: RPC `conteo_ajuste_erp` (conteo aprobado) y
`wms_move_stock` (traspaso/ajuste manual con permisos).

## 5. Cómo se verifica

`src/tests/operationalContracts.test.js` valida que:
- las listas de estados son inmutables y sin duplicados;
- ningún estado activo figura en descartados;
- SLA por etapa no es negativo;
- los gates de stock están todos en `true`.
