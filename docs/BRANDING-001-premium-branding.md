# BRANDING-001 · Premium Branding CC-2.0 (V1)

Especificación: `CCO_2_0_BRANDING_EXPRESION_Y_POLISH_VISUAL_V1.txt` — V1.
Objetivo: elevar la expresión visual de `CCO SYSTEM` a nivel premium sin rediseñar el logo PTM.
Fuente de branding actual: `src/components/Navbar.jsx:435-455` (sidebar top brand area).

## Estado actual (diagnóstico rápido)

| Elemento  | Código                                                                                      | Problema V1                                                       |
| --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Logo PTM  | `/logo-ptm.png` (Navbar 438)                                                                | Correcto — **no tocar**.                                          |
| CCO       | `span text-lg/2xl font-black text-slate-900 tracking-tighter` (445)                         | Mayúsculas ok, pero sin jerarquía premium/anchor; sin motion.     |
| SYSTEM    | `span text-[8px]/[10px] font-black bg-orange-500 ...` (447-449)                             | Badge texto plano; no cápsula visual; sin reveal animado.         |
| Subtítulo | `text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:block` (451-453) | Perdido en mobile (`hidden sm:block`); sin finura/elegancia.      |
| Layout    | `flex flex-col` sin contenedor premium (442)                                                | Sin hairline glow / separación premium; sin estado `Online` pill. |

## Tokens propuestos (deducibles del V1 §28)

Ver `src/styles/tokens.css` o crear `src/styles/branding.css`:

- `brand-cco-font-weight` / `brand-cco-tracking` / `brand-cco-size`
- `brand-system-badge-radius` / `brand-system-badge-padding` / `brand-system-accent`
- `brand-subtitle-tracking` / `brand-subtitle-opacity`
- `brand-block-padding` / `brand-glow-opacity` / `brand-shine-duration`

## Plan de implementación (fases V1 §29)

### FASE 1 — Foundation (prioridad) — `src/components/Navbar.jsx`

1. `cco`→`CCO` (ya ok; confirmar consistencia en todos los sinks).
2. Lockup visual: `CCO` ancla + badge `SYSTEM` cápsula + subtítulo.
3. Tipografía: CCO peso semibold/bold controlado + tracking levemente abierto.
4. Badge SYSTEM: fondo accent, bordes suaves, padding horizontal, estilo "etiqueta tech".
5. Subtítulo: fino, tracking abierto, menor contraste; **visibles en mobile** (no `hidden`).

### FASE 2 — Contenedor premium

1. `SIDEBAR_BRAND_HERO`: padding premium, hairline divider, separación vertical.
2. Active item pill premium; hover states suaves.
3. (Opcional) `BrandStatusPill` "Operativo" bajo el branding.

### FASE 3 — Motion premium

1. Entrada: fade + rise, PTM entra primero, CCO más protagonista, SYSTEM reveal lateral (`+70ms`), subtítulo fade.
2. `shine` único y sutil sobre CCO al cargar.

### FASE 4 — Responsivo

1. Compact sidebar lockup (monograma CCO o PTM+mini-CCO).
2. Mobile lockup (menor altura, jerarquía intacta).

### FASE 5 — Login/Splash + QA

1. Versión hero en `src/pages/Login.jsx:233` (`/logo-ptm.png`) — aplicar lockup completo.
2. QA checklist V1 §30 (performance, accessibility, no romper PTM).

## Componentes propuestos (V1 §27)

- `src/components/BrandHeader.jsx` (variant: desktop|compact|mobile|login|splash)
- `src/components/SystemBadge.jsx`
- `src/components/BrandStatusPill.jsx`

## Acceptance (V1 §30)

- [ ] CCO en mayúsculas
- [ ] CCO mayor protagonismo
- [ ] SYSTEM badge cápsula
- [ ] subtítulo legible en mobile
- [ ] bloque premium
- [ ] logo PTM intacto
- [ ] motion elegante
- [ ] active item mejorado
- [ ] compact mode funciona
- [ ] login coherente

## Riesgo / notas

- El dashboard web principal es Render (`cco-ptm-b05m.onrender.com`). Mobile usa Capgo OTA (beta) → los cambios de UI web **no** llegan a móvil hasta build nativa + OTA; no afecta web.
- `public/logo-ptm.png` (346x146) es el origen visual; no modificar.
- Tests visuales no automatizados (no hay test de snapshot de branding) → QA manual + checklist V1 §30.
