# CCO | Centro de Control Operacional — PTM

Plataforma integral **WMS + TMS + Calidad + Post-Venta** para la operación logística de PTM
(insumos y equipos médicos): recepción, bodega, picking/packing, despacho, transporte,
inventario, calidad ISO 13485 y servicio técnico — en una sola SPA.

> **Versión vigente:** la de `package.json` (fuente de verdad; hoy serie **1.2x**).
> Documentación técnica canónica: [`DOCUMENTACION_PROYECTO.md`](DOCUMENTACION_PROYECTO.md)
> (incluye el changelog completo).

## 🚀 Stack

- **Frontend:** React 18 · Vite 5 · TailwindCSS 3 · Zustand 4 · TanStack React Query 5
- **Backend:** Supabase (PostgreSQL 17 + RLS + Realtime + Storage privado + Edge Functions)
  + `server.js` (Express) sirviendo el build en Render con proxys (`/api/geocode`, `/api/route`,
  `/api/traspasos-ai`) y CSP estricta
- **Móvil:** Capacitor 8 (Android) — escáner ML Kit, Haptics, Push FCM y **OTA con Capgo**
- **Offline:** Dexie (cola de sincronización en PDA)
- **Mapas/Rutas:** Leaflet + OSM/OSRM (vía proxy propio) · **Gráficos:** Recharts · **Tests:** Vitest

## 📦 Módulos

### 📥 Inbound
| Módulo | Descripción |
|--------|-------------|
| Recepción (Importación / Nacional) | Llegadas de proveedores, validación de OC y bultos. |
| Ingreso / Put-away | Ubicación de mercadería en racks (PDA con escáner). |
| Carga Masiva | Importación de datos por pegado/CSV con historial y reversa. |

### 📤 Outbound
| Módulo | Descripción |
|--------|-------------|
| Notas de Venta | Gestión de pedidos, priorización y liberación a picking. |
| Picking | Preparación con validación de ubicación/producto y bloqueo de concurrencia. |
| Packing (+ modo TV) | Verificación de bultos, etiquetado y tablero de sala. |
| Cubicaje | Registro de dimensiones/peso por bulto. |
| Despacho | Control de despacho, asignación de transporte y manifiestos. |

### 🚛 TMS
| Módulo | Descripción |
|--------|-------------|
| Planificación de Rutas | Optimización de rutas (geocodificación y ruteo vía proxy propio). |
| Torre de Control | Seguimiento de flota, estados de entrega e incidencias. |
| Conductores / Costos | Perfiles de flota y costos de transporte. |

### 🏭 Inventario
| Módulo | Descripción |
|--------|-------------|
| Traspasos y Ajustes | App em-il embebida con backend Supabase propio (historial compartido). |
| Conteo Cíclico | Sesiones de conteo en PDA, conciliación, **correo de ajuste**, ajuste ERP, bloques con QR y proyección. |
| Análisis de Códigos | Port del Excel "STOCK NAME": avance a nomenclatura **P/S**, duplicados con código equivalente, anomalías, activos/no activos; tablas dinámicas y generación de **Traspaso/Ajuste/correo de actualización** desde la selección. |
| Carteles de Bodega | Impresión de carteles (código gigante + CODE128) en formato Único/Doble/Cuádruple. |
| Mapa de Calor | Ocupación de ubicaciones de bodega. |
| Gestión de Ubicaciones | Maestro de ubicaciones WMS. |

### 🛡️ Calidad (ISO 13485)
| Módulo | Descripción |
|--------|-------------|
| Checklist de Ingreso | Auditoría por niveles + requisitos por familia, clasificación del producto, evaluación de embalaje, **riesgo automático 🟢🟠🔴**, disposición inmediata, indicadores ISO y tabla Requisito·Resultado·**Evidencia**·Observación. |
| Monitoreo | Informes de daños con evidencia fotográfica y dictámenes. |
| Certificación de Salida | Certificado previo al despacho conectado al **Panel Dashboard PTM** (datos de la N.V), trazabilidad del producto, fotos pallet/embalaje/camión, control de peso, etiquetas por bulto, riesgos y **semáforo** (LIBERADO / CON OBSERVACIONES / NO DESPACHAR). |
| Firma y verificación | Folios CERT-/ACTA-, firma electrónica HMAC-SHA256 y verificación pública por QR (`/verificar`). |

### 🔧 Post-Venta / Servicio Técnico
| Módulo | Descripción |
|--------|-------------|
| Tickets | Folio TKT-AAAA-###, técnicos, dashboard y calendario/agenda. |
| Bandeja de Correos | Un hilo = un caso (lector estilo Outlook); ingesta por Edge Function (Microsoft Graph o webhook). |

### 📱 Móvil (PDA) y ⚙️ Administración
PDA de bodega (picking/ingreso/conteo con escáner) · Usuarios y Roles (permisos granulares) ·
Vistas por perfil · Monitor de actividad · Consulta Maestra e Historial N.V.

## 🔌 Integraciones

- **Panel Dashboard PTM** (Supabase externo): info de la Nota de Venta en Calidad · Salida.
- **em-il** (`lockowom/em-il`): módulo Traspasos/Ajustes vendorizado (`npm run update:traspasos`).
- **Microsoft Graph**: extractor de correos de post-venta (Edge Function).
- **Capgo**: actualizaciones OTA de la app Android (`npm run deploy:mobile`).
- **Anthropic API**: asistente "Mejorar con IA" en Traspasos (clave solo en el servidor).

## 🔐 Seguridad

RLS en todas las tablas · permisos por ruta con default-deny · RPCs `SECURITY DEFINER` con
gate de permisos · buckets **privados** con URLs firmadas · CSP sin `unsafe-inline` ·
auditoría con retención automática (pg_cron) · supresión completa de usuarios y minimización
de datos según **Ley 21.719** (ver [`INFORME_SEGURIDAD_LEY_CHILE.md`](INFORME_SEGURIDAD_LEY_CHILE.md)).

## 🛠️ Desarrollo

```bash
git clone https://github.com/Lockowom/CCO_PTM.git
cd CCO_PTM
npm install

# .env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_KEY=tu_anon_key

npm run dev              # desarrollo (Vite)
npm test                 # tests (Vitest)
npm run build            # build producción → dist/
npm run deploy:mobile    # bundle OTA a Capgo (canal production)
npm run update:traspasos # re-sincroniza el módulo Traspasos (em-il)
```

## 🚢 Despliegue

- **Web (Render):** push a `main` → Render sirve el **`dist/` commiteado** con `server.js`
  (regenerar con `npm run build` y commitear al desplegar). Ver [`DEPLOY_RENDER.md`](DEPLOY_RENDER.md).
- **Android:** `npm run deploy:mobile` sube el bundle OTA a Capgo (app `com.cco.wms`);
  los equipos se actualizan solos al abrir la app.

## 📚 Documentación

| Documento | Contenido |
|-----------|-----------|
| [`DOCUMENTACION_PROYECTO.md`](DOCUMENTACION_PROYECTO.md) | **Canónica**: arquitectura, módulos, BD, RPCs y changelog. |
| [`FLUJO_SISTEMA.md`](FLUJO_SISTEMA.md) | Cómo se conecta cada pieza de punta a punta. |
| [`INFORME_SEGURIDAD_LEY_CHILE.md`](INFORME_SEGURIDAD_LEY_CHILE.md) | Auditoría de seguridad y cumplimiento legal chileno. |
| [`supabase/README.md`](supabase/README.md) · [`supabase/DIAGRAMA_BD.md`](supabase/DIAGRAMA_BD.md) | Migraciones y diagrama ER de la base de datos. |
| [`MANUAL_USUARIO_V2.md`](MANUAL_USUARIO_V2.md) | Manual de usuario. |
| [`CLAUDE.md`](CLAUDE.md) | Guía para agentes de desarrollo (reglas del repo). |

## 📄 Licencia

Proyecto privado CCO/PTM — Todos los derechos reservados 2026.
