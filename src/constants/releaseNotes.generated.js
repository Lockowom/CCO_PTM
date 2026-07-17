// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.34",
    "fecha": "2026-07-17",
    "titulo": "Se retira el módulo Dashboard General",
    "cambios": [
      {
        "texto": "(/dashboard). Se elimina la página src/pages/Dashboard.jsx, su ruta, permiso (ROUTE_PERMISSIONS), grupo de permisos (view_dashboard/view_kpis) y entradas de APP_MODULES/APP_ROUTES, la sección *Core* del Navbar y su etiqueta en usePresence. Inicio repunteado: como /dashboard era el landing por defecto, ahora lo…"
      }
    ]
  },
  {
    "version": "1.55.33",
    "fecha": "2026-07-17",
    "titulo": "Se retiran los módulos TMS (Transporte) y Outbound",
    "cambios": [
      {
        "texto": "(se reconstruirán desde 0). Frontend: se eliminan las 7 páginas TMS (src/pages/TMS/*) y las 5 de Outbound (src/pages/Outbound/*), sus rutas en App.jsx, el ROUTE_PRIORITY, ROUTE_PERMISSIONS, los grupos de permisos y las entradas de APP_MODULES/APP_ROUTES en modules.js, las categorías del Navbar, y las referencias en…"
      }
    ]
  },
  {
    "version": "1.55.32",
    "fecha": "2026-07-17",
    "titulo": "Menú de Inventario usable sin reducir el zoom",
    "cambios": [
      {
        "texto": "El desplegable de Inventario tenía ~17 accesos (Traspasos, Mapa de Calor, Ubicaciones, 6 de Conteo, 6 de Análisis, Carteles, Insumos) que se salían de la pantalla y obligaban a hacer *zoom out*. Ahora el menú tiene alto máximo con scroll (max-h-[78vh] overflow-y-auto) y, cuando una categoría tiene más de 8 accesos, se…"
      }
    ]
  },
  {
    "version": "1.55.31",
    "fecha": "2026-07-17",
    "titulo": "Cuadro de Novedades ahora AUTOMÁTICO (adiós al mantenimiento manual)",
    "cambios": [
      {
        "texto": "Para que nunca vuelva a quedarse atrás, src/constants/releaseNotes.js deja de escribirse a mano: un prebuild (scripts/gen_release_notes.js, enganchado en package.json → corre antes de vite build) parsea el Changelog (§15) de este documento y genera releaseNotes.generated.js con las 15 versiones más recientes (título =…"
      }
    ]
  },
  {
    "version": "1.55.30",
    "fecha": "2026-07-17",
    "titulo": "Cuadro de Novedades al día",
    "cambios": [
      {
        "texto": "El modal de Novedades (NovedadesModal ← src/constants/releaseNotes.js) muestra las notas cuya versión sea mayor a la última vista; como la última nota era 1.36.0 y la app iba en 1.55.x, había \"dejado de actualizarse\" (no es bug: el archivo se llena a mano y quedó rezagado). Se agregaron entradas en lenguaje de usuario…"
      }
    ]
  },
  {
    "version": "1.55.29",
    "fecha": "2026-07-17",
    "titulo": "Tráfico de la Consulta pública (Admin → Monitor), sin datos personales",
    "cambios": [
      {
        "texto": "Antes no había forma de ver cuánta gente usa /consulta. Migración 101: tabla tms_consulta_metricas (contador diario: total, con_resultado, sin_resultado; no guarda IP ni el número consultado) y buscar_nv_publico la incrementa por día (zona Chile) tras pasar el rate-limit → solo cuentan consultas válidas. RLS: lectura…"
      }
    ]
  },
  {
    "version": "1.55.28",
    "fecha": "2026-07-17",
    "titulo": "Panel de Insumos: correo de solicitud más profesional (con tabla)",
    "cambios": [
      {
        "texto": "armarCorreoSolicitud genera ahora (1) texto plano con una tabla ASCII alineada (columnas #, Insumo, Medida/Código, Quedan, Estado, Solicitar) + saludo/cierre formales, para el mailto:; y (2) cuerpo HTML con una tabla real (encabezados naranja, filas alternadas, badge de estado con color) que se copia al portapapeles.…"
      }
    ]
  },
  {
    "version": "1.55.27",
    "fecha": "2026-07-17",
    "titulo": "Nuevo módulo: Panel de Insumos (Inventario)",
    "cambios": [
      {
        "texto": "Panel didáctico (/inventory/insumos) para ver el stock de insumos de embalaje/despacho con semáforo (🟢 OK · 🟡 por acabarse · 🔴 crítico) según dos umbrales por ítem. Migración 100: tabla tms_insumos (categoría CAJAS/PALLETS/OTROS, nombre, medida, código PTM, unidad, cantidad, umbral_bajo/umbral_critico, orden), RLS…"
      }
    ]
  },
  {
    "version": "1.55.26",
    "fecha": "2026-07-17",
    "titulo": "Ingresar: faltaban transportistas en el selector (p.ej. Transfarma)",
    "cambios": [
      {
        "texto": "opciones() armaba la lista de transportistas con select ... .limit(5000) sobre tms_operaciones, pero PostgREST corta en 1.000 filas: tomaba solo la primera página (sin orden) y los transportistas que solo aparecían más allá quedaban fuera (Transfarma tiene 28 N.V. pero no salía). Ahora la lista se arma con la unión…"
      }
    ]
  },
  {
    "version": "1.55.25",
    "fecha": "2026-07-17",
    "titulo": "Ingresar/Buscar: ahora se pueden encontrar N.V. de CUALQUIER estado (no solo activas)",
    "cambios": [
      {
        "texto": "La lista de *Buscar* solo carga las ~50 N.V. activas (En Proceso/Shipping/Currier/En Ruta), así que las Entregado/NULA/Rechazado (1.905) no aparecían ni buscándolas por número — el buscador solo filtraba en memoria la lista activa. Ahora, al escribir ≥2 caracteres, se dispara una búsqueda contra toda la tabla…"
      }
    ]
  },
  {
    "version": "1.55.24",
    "fecha": "2026-07-17",
    "titulo": "Detalle N.V. (Ingresar): F. Aprobación Real y F. Compromiso no editables",
    "cambios": [
      {
        "texto": "En el drawer de detalle, la F. Aprobación Real pasa a solo lectura (gris, readOnly, etiqueta \"(no editable)\"), igual que la F. Compromiso (que ya era automática). Ambas fechas quedan protegidas contra edición manual desde el detalle; siguen siendo editables solo las fechas operativas (Facturación / Despacho). Sin…"
      }
    ]
  },
  {
    "version": "1.55.23",
    "fecha": "2026-07-17",
    "titulo": "Eliminar N.V. (Ingresar) restringido a admin + Angélica",
    "cambios": [
      {
        "texto": "El borrado destructivo de N.V. ya no lo puede hacer cualquier usuario con manage_panel: queda limitado a administradores (o delegados) y a María Angélica (angelica@ptm.cl). Migración 099: gate _panel_puede_eliminar_nv() (SECURITY DEFINER, anon sin EXECUTE) = is_admin o usuario activo con email en la allowlist;…"
      }
    ]
  },
  {
    "version": "1.55.22",
    "fecha": "2026-07-17",
    "titulo": "PillNav también en el filtro de estados de la lista (Buscar)",
    "cambios": [
      {
        "texto": "Los chips de filtro por estado de la pestaña *Buscar* (con su contador, ej. \"En Proceso 8 · Shipping 23 · En Ruta 20\") pasan al mismo PillNav animado de estados. PillNavEstado gana: (1) badge de contador (item.count) junto al label, con color claro en el pill activo/hover; (2) variante inline (pills al tamaño de su…"
      }
    ]
  },
  {
    "version": "1.55.21",
    "fecha": "2026-07-17",
    "titulo": "Auditoría del Panel completada e integrada (registro real por operador)",
    "cambios": [
      {
        "texto": "La bitácora ya estaba conectada a tms_operaciones_log, pero (1) la columna actor guardaba el UUID crudo de auth.uid() → la pantalla habría mostrado un identificador ilegible en \"Operador\". Migración 098: helper _panel_actor() (SECURITY DEFINER, anon sin EXECUTE) que resuelve nombre → email → uid desde tms_usuarios, y…"
      }
    ]
  },
  {
    "version": "1.55.20",
    "fecha": "2026-07-17",
    "titulo": "PillNav para el selector de Estado en Ingresar (alta + detalle)",
    "cambios": [
      {
        "texto": "El dropdown de Estado se reemplaza por un PillNav animado (estilo React Bits, la misma animación \"pill\" del selector de Canal): componente PillNavEstado.jsx (GSAP) con track claro y donde cada pill se rellena con su propio color de estado (círculo que sube al hover + fondo activo con el color) y un punto de color a la…"
      }
    ]
  }
];
