# NAV-001 — Sidebar V2

## Resultado

El Sidebar de escritorio de CCO 2.0 conserva `AppShell`, `routeMeta`, `getNavGroups(canAccessRoute)`, IAM y los feature flags, pero reconstruye su representación visual para que el modo colapsado sea una navegación completa.

## Causa raíz

La versión anterior repetía el icono de cada grupo en modo colapsado, usaba glyphs Unicode dependientes del sistema operativo y ocultaba todas las subrutas sin proporcionar una alternativa de navegación. El branding también desaparecía y el estado colapsado no se conservaba entre sesiones.

## Diseño implementado

- Expandido: 252 px, branding PTM/CCO, grupos desplegables, ruta activa y footer operativo.
- Colapsado: 72 px, marca compacta, un solo icono Lucide de 44 × 44 por grupo y estado activo visible.
- Grupo con una ruta: navegación directa.
- Grupo con varias rutas: flyout accesible renderizado por portal.
- Estado: `cco.sidebar.collapsed` en `localStorage`, con fallback seguro a expandido.
- Motion: transiciones CSS y respeto global por `prefers-reduced-motion`.

## Árbol de componentes

```text
AppShell
└── Sidebar
    ├── SidebarBrand
    ├── SidebarGroup
    │   ├── SidebarGroupTrigger
    │   ├── SidebarNavItem
    │   └── SidebarFlyout
    └── SidebarFooter
```

## Límite de seguridad e IAM

`Sidebar` recibe únicamente los grupos producidos por `getNavGroups(canAccessRoute)`. No interpreta roles, permisos crudos, UUID ni excepciones de usuarios. El flyout consume `group.items`; no consulta `APP_ROUTES` y no puede reintroducir rutas `hiddenFromNav` o Private Beta filtradas por la fuente de verdad.

## Accesibilidad

- `aside` y `nav` tienen nombres accesibles.
- Los triggers declaran estado expandido y relación con su contenido.
- Enter/Espacio activan los botones nativos.
- Escape cierra el flyout y devuelve el foco al trigger.
- Click fuera, navegación, resize y scroll cierran el flyout.
- No se usa un patrón ARIA `menu`; los destinos siguen siendo enlaces normales.

## Pruebas

`src/tests/sidebarV2Contract.test.jsx` cubre:

- eliminación de Unicode y duplicación;
- expanded/collapsed;
- flyout multi-ruta;
- navegación directa de un grupo de una ruta;
- filtrado IAM en ambos modos;
- cierre con Escape y retorno de foco;
- fallback Lucide;
- persistencia y storage inválido.

Los contratos existentes de `routeMeta`, Private Beta y AppShell permanecen vigentes.

## Rollback

No hay migraciones ni cambios de datos. El rollback operacional principal es desactivar `web_shell_v2`. Para revertir solamente NAV-001, se puede revertir su commit sin modificar IAM, `routeMeta` ni las rutas.

## Validación visual requerida en beta

- 1024×768, 1280×800, 1366×768, 1440×900 y 1920×1080.
- Zoom 100 %, 125 % y 150 %.
- Tema claro y oscuro.
- Grupo activo Panel, Inventario, Calidad y Admin.
- Flyout cercano al borde inferior y con listas largas.
- Confirmar ausencia de overflow horizontal, iconos duplicados y rutas no autorizadas.
