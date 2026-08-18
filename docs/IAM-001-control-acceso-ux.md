# IAM-001 · Control de Acceso — Contrato UX/UI Premium (IAM 2.0)

Especificaciones de referencia:

- `CCO_2_0_IAM_MEJORADO_IMPLEMENTACION_COMPLETA_V2.txt` (V2, 2026-08-17) — arquitectura funcional.
- Retroalimentación del owner (2026-08-18) — estética premium, tri-state, preview de cambios, matriz, mobile.

## Regla transversal del proyecto (nueva)

**`IAM_NEW_UI_READY != IAM_NEW_AUTHORITY_READY`**

La nueva cara del IAM puede estar 100% construida y seguir usando por debajo el
**resolver actual** mientras se comprueba equivalencia (Shadow Mode, PR-IAM-00B/03).
Se permite desarrollar la UI sin arriesgar el acceso de los usuarios.

- La nueva pantalla **Control de Acceso** (`/admin/access`) se monta **AL LADO** de
  Admin → Identidad y Seguridad (que permanece intacta durante toda la transición).
- La interfaz antigua solo se retira cuando se demuestre que todos los usuarios
  conservan su acceso efectivo (baseline zero-loss cerrado y comparado).
- **Este ticket NO modifica permisos, roles ni base de datos.** Es UI/UX pura sobre
  el resolver vigente (y luego sobre el resolver V2 en shadow).

## Objetivo

Elevar la administración de acceso a nivel premium, coherente con CCO Mobile y el
branding CCO SYSTEM (BRANDING-001). Que el dueño entienda y gobierne la
configuración **sin interpretar códigos técnicos**: nada de tablas con
`ROLE_ID / SCOPE / DIRECT_ALLOW` como experiencia normal (eso queda en **Modo avanzado**).

## Ruta y acceso

- Ruta nueva: **`/admin/access`** (item en menú Sistema → Control de Acceso).
- Permiso de vista: `view_access_control` (admin o delegado; ADMIN siempre).
- Al montar por primera vez, la pantalla nueva se sirve **sin tocar** `/admin/users`.

## Estructura general (tabs/secciones)

1. **Resumen** — KPIs + buscador global + usuarios recientes.
2. **Usuarios** — vista por usuario: módulos → funciones, tri-state, origen, efectivo.
3. **Perfiles** — perfiles (roles): qué funciones concede cada uno, tri-state por función.
4. **Módulos y funciones** — catálogo completo (14 módulos / ~126 funciones).
5. **Matriz** — comparativa por columnas (desktop) con "Solo diferencias".
6. **Equipos** — heredan funciones; ver composición y efectivo por equipo.
7. **Private Beta** — módulos ocultos, etapas (DEVELOPMENT→GA), quién tiene acceso.
8. **Simulador** — "¿Qué puede hacer hoy Nilo?" sin tocar nada (resolver en lectura).
9. **Auditoría** — denegaciones (`tms_iam_denegaciones`), cambios, historial de acceso.
10. **Integridad IAM** — gates zero-loss (PERMISSION_LOSS, UNEXPECTED_PRIVILEGE_GAIN…), alertas.

## 1) Resumen (pantalla inicial)

Header premium (PageHeader con branding CCO SYSTEM):

```
CONTROL DE ACCESO
Gestiona quién puede hacer qué dentro de CCO
```

KPIs en grilla (KPICard reutilizable):

```
27 Usuarios    7 Perfiles    14 Módulos    126 Funciones
2 Alertas      18 Críticos
```

- **Alertas** = incoherencias (ej. permiso crítico sin origen claro).
- **Críticos** = funciones marcadas críticas otorgadas vía origen individual (no perfil).

**Buscador global** (input central, ícono 🔎):

- Acepta términos como "Nilo", "Eliminar NV", "Agregar guía", "panel".
- Resultados agrupados: Usuarios | Módulos/Funciones.
- Para una función devuelve la navegación (breadcrumb) y las personas:

```
Panel PTM
└ Ingreso N.V.
  └ Documentos
    └ Editar / agregar guía

Código técnico: panel_nv.edit_documents

Nilo          ❌
Angélica      ✅

[Asignar a usuario]
```

**Usuarios recientes** (tarjetas, no tabla):

```
┌──────────────────────────────────────┐
│ AN  Angélica                         │
│     Operador Panel N.V.              │
│     4 módulos  •  1 permiso especial │
│                                >     │
└──────────────────────────────────────┘
```

- "1 permiso especial" = excepción individual; "Sin excepciones" cuando no hay.

## 2) Usuarios — vista por persona (la más importante)

Entrar a una persona (Angélica, Nilo…):

```
ANGÉLICA
Operador Panel N.V.                ● Activa

[Resumen] [Accesos] [Auditoría]
```

**Accesos** — lista por módulo, colapsable:

```
▼ Panel PTM                          ✅

   Ver N.V.             ✅  Perfil
   Crear N.V.           ✅  Perfil
   Editar N.V.          ✅  Perfil
   Cambiar estado       ✅  Perfil

   Eliminar N.V.        ✅  ⚠
                            Individual

   Reabrir N.V.         ❌
                            No asignado
```

Reglas visuales:

- ✅ permitido / ❌ no asignado / ⚠ permiso crítico.
- **Origen del permiso SIEMPRE visible**: `Perfil` | `Individual` | `Equipo` |
  `Delegación` | `Legacy` | `No asignado`.
- Sin tablas técnicas; colapsos por módulo con fade+slide.

## 3) Tri-state: HEREDAR / PERMITIR / DENEGAR

Cada función de un usuario se gobierna con tres estados (no un checkbox):

```
HEREDAR     PERMITIR     DENEGAR
   ○            ●           ○
```

- **HEREDAR** (default) = el resultado lo decide el perfil/equipo/origen.
- **PERMITIR / DENEGAR** = excepción individual explícita.

Siempre debajo del tri-state:

```
Resultado efectivo: ✅ PERMITIDO     (o ❌ DENEGADO)
Origen: Permiso individual         (o: El perfil no concede esta función)
```

Ejemplo Angélica (Eliminar N.V.): HEREDAR=○ PERMITIR=● DENEGAR=○ → efectivo ✅, origen Individual.
Ejemplo Nilo (Eliminar N.V.): HEREDAR=● → efectivo ❌, motivo "El perfil no concede esta función".

## 4) Permisos críticos (⚠)

- Conjunto definido en el resolver: **eliminar/borrar, aprobar reaperturas,
  ajuste de stock, cambiar estado de N.V., administración**.
- En la UI: badge `⚠ Crítico` con **emphasis suave** (nunca parpadeo ni rojo agresivo).
- Al otorgar un crítico, el preview de cambios lo muestra destacado.

## 5) Preview animado antes de guardar (StickyActionBar)

Cualquier cambio NO se aplica al instante. Se levanta un panel inferior:

```
┌──────────────────────────────────────────┐
│ 1 CAMBIO PENDIENTE                       │
│                                          │
│ Nilo                                     │
│ + Eliminar N.V.                          │
│ ⚠ Permiso crítico                        │
│                                          │
│ [Revisar]                [Guardar]       │
└──────────────────────────────────────────┘
```

- **Revisar** → vista Antes → Después:

```
ANTES                        DESPUÉS
Eliminar N.V.                Eliminar N.V.
❌ No permitido      →       ✅ Permitido
Otros permisos
SIN CAMBIOS
```

- **Guardar** → persiste vía RPC del resolver (hoy: resolver actual; mañana: V2).
- Al guardar: success suave + cierre; sin parpadeos. Errores → estado de error en el mismo panel.
- Reutiliza `StickyActionBar` + `Drawer` de CCO Web 2.0.

## 6) Matriz (desktop) + Solo diferencias

Vista comparativa por columnas (personas o perfiles):

```
               Nilo   Angélica   Oliver
Ver N.V.        ✓        ✓        ✓
Crear N.V.      ✓        ✓        —
Editar N.V.     ✓        ✓        —
Cambiar estado  ✓        ✓        —
Eliminar N.V.   —        ✓        —
```

- Toggle **[ Solo diferencias ]** → oculta filas donde todos coinciden.
- Click en una celda → edición rápida (tri-state en Drawer).
- Solo desktop; en móvil se usa la ruta Usuario → Módulo → Funciones.

## 7) Móvil — otra cara (no copia de la tabla)

```
CONTROL DE ACCESO
Buscar usuario... 🔎

┌──────────────────────┐
│ Angélica          >  │
│ Operador Panel N.V.  │
└──────────────────────┘
┌──────────────────────┐
│ Nilo              >  │
│ Operador Panel N.V.  │
└──────────────────────┘
```

- Tocar usuario → secciones: `Panel PTM > Inventario > WMS > Calidad` (acordeón).
- Tocar módulo → funciones con ✅/❌/⚠.
- Tocar una función → **BottomSheet** con tri-state + origen + efectivo + [Guardar].
- Matriz grande exclusivamente desktop.

## 8) Motion premium (alineado a BRANDING-001)

- Apertura de módulo: **fade + slide 6px + stagger 25–40ms** por función.
- Cambio de tri-state: **transición suave** entre estados (selección se desliza), nunca instantánea con salto.
- Badge `⚠ Permiso crítico`: **emphasis suave** (escala + glow leve, sin intermitencia).
- Preview "N CAMBIOS PENDIENTES": **slide-up** del panel (StickyActionBar) + detalle con stagger.
- Drawer desktop / BottomSheet mobile: entrada estándar CCO Web 2.0 (portal + trap de foco).
- Entrada de la pantalla: mismo lenguaje de marca (`animate-brand-enter`), respeto a
  `prefers-reduced-motion` (todo desactivado si el sistema lo pide).
- Nada de parpadeos, bounce excesivo ni animaciones de más en una pantalla de administración.

## 9) Estados loading / error / empty

- **Loading**: skeletons (componentes `Skeleton` CCO) por sección; nunca spinner solitario gigante.
- **Error**: estado de error con acción "Reintentar" + detalle técnico colapsable; mensaje claro.
- **Empty**: "No hay usuarios recientes", "Sin funciones asignadas", "Sin diferencias" con ilustración sutil.
- Búsqueda sin resultados: sugerencias ("Prueba con 'Nilo' o 'Eliminar NV'").

## 10) Integración con branding CCO SYSTEM

- Header con lockup premium (CCO + SystemBadge + subtítulo) y `BrandStatusPill` si aplica.
- Tokens `--brand-*` de `src/index.css` (branding FASE 1/2) para acentos, glow y dividers.
- Tipografía Poppins/Plus Jakarta, tracking de marca, radios de marca.
- Coherencia con CCO Mobile (misma identidad en escritorio y táctil).

## 11) Modo avanzado (explícitamente secundario)

- Toggle "Modo avanzado" en Configuración de la sección → muestra la tabla técnica
  (`ROLE_ID / SCOPE / DIRECT_ALLOW / origen / estado`) solo para administradores técnicos.
- No es la experiencia por defecto.

## Fuera de alcance (de este ticket)

- NO modifica permisos, roles, scopes, RLS ni base de datos.
- NO retira Admin → Identidad y Seguridad (sigue durante la transición).
- NO implementa el resolver V2 (PR-IAM-03/04); solo consume el resolver vigente
  (y luego el shadow) para leer/escribir con la misma autoridad de hoy.

## Dependencias

- PR-IAM-01 (inventario) → catálogos reales para poblar la UI.
- PR-IAM-00A/00B (snapshot + comparador) → estado "Integridad IAM" y Simulador.
- BRANDING-001 (FASE 1-5) → identidad visual en la que se apoya la estética.

## Acceptance

- [ ] Resumen con KPIs reales (usuarios/perfiles/módulos/funciones/alertas/críticos).
- [ ] Buscador global con breadcrumb + código técnico + asignación por persona.
- [ ] Vista por usuario: módulos → funciones con ✅/❌/⚠ + origen + efectivo.
- [ ] Tri-state HEREDAR/PERMITIR/DENEGAR con resultado efectivo y motivo.
- [ ] Preview "N CAMBIOS PENDIENTES" con Antes → Después antes de guardar.
- [ ] Matriz + "Solo diferencias" (desktop) y BottomSheet (mobile).
- [ ] Motion premium con prefers-reduced-motion respetado.
- [ ] Estados loading/error/empty en todas las secciones.
- [ ] Branding CCO SYSTEM integrado.
- [ ] `/admin/access` montada AL LADO de Identidad y Seguridad; cero cambios de acceso.
- [ ] Modo avanzado accesible pero secundario.
