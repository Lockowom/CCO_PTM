# Informe de Seguridad y Cumplimiento Legal (Chile) — CCO_PTM

**Fecha:** 2026-07-10 · **Versión auditada:** 1.18.3 · **Alcance:** código completo (frontend, server, edge functions, Android), base de datos en vivo, Storage, terceros.
**Naturaleza:** informe técnico de brechas. No constituye asesoría legal — validar el plan con un abogado de protección de datos antes de diciembre de 2026.

---

## 1. Resumen ejecutivo

**Sí, la ley chilena aplica de lleno a este proyecto.** CCO_PTM trata datos personales de al menos 5 categorías de titulares (trabajadores, conductores, clientes/contactos, remitentes de correos y técnicos), incluye **monitoreo laboral permanente** y puede llegar a tocar **datos sensibles** (contexto hospitalario en correos de servicio técnico). Por lo tanto:

| Norma | Estado | Qué significa para PTM |
|---|---|---|
| **Ley 19.628** (vigente hoy) | Aplica ya | Deberes de finalidad, secreto y derechos de acceso/rectificación/cancelación. Fiscalización débil, pero es la base actual. |
| **Ley 21.719** (nueva LPDP) | **Plena vigencia: 1 de diciembre de 2026 — quedan ~5 meses** | Crea la Agencia de Protección de Datos, derechos ARCO+portabilidad, deber de seguridad, **notificación de brechas**, contratos con encargados, y **multas de hasta 5.000/10.000/20.000 UTM** según gravedad. |
| **Ley 21.663** (Marco de Ciberseguridad) | Aplica indirectamente | PTM (insumos/equipos médicos) probablemente no es "servicio esencial" per se, pero **es proveedor del sector salud**: sus clientes OSE pueden exigirle estándares y reportes. Deber general de ciberseguridad. |
| **Código del Trabajo art. 5 + dictámenes DT** | Aplica ya | El monitoreo de trabajadores (presencia, tiempos, errores) debe estar **informado y regulado en el Reglamento Interno**, ser general y proporcional. |

**Diagnóstico global:** la arquitectura técnica de seguridad es razonable (RPCs con gate server-side, contraseñas bcrypt, sin claves privadas en el repo, retención parcial ya operando), pero el proyecto **no está listo para la 21.719**: no hay aviso de privacidad, no hay mecanismos de derechos ARCO, hay monitoreo laboral intensivo sin transparencia, datos legibles por cualquier usuario autenticado, fotos en buckets públicos y 8 terceros recibiendo datos sin contratos de encargo documentados.

---

## 2. Hallazgos técnicos de seguridad (priorizados)

### Críticos / Altos

| # | Hallazgo | Evidencia | Riesgo |
|---|---|---|---|
| S1 | **`tms_auditoria` registra CADA heartbeat (30 s) con la fila completa del usuario** — 102.441 filas / **139 MB = 58% de toda la BD**. Historial minuto a minuto de en qué pantalla estuvo cada trabajador, sin retención. | trigger `020` sobre `tms_usuarios` + heartbeat `AuthContext` | Monitoreo laboral encubierto + crecimiento sin límite (agota el plan) |
| S2 | **`xlsx@0.18.5` con CVEs sin parche en npm** (CVE-2023-30533 prototype pollution, CVE-2024-22363 ReDoS) y la app **parsea archivos subidos por usuarios** (DataImport, Recepción, Traspasos vendorizado). | package.json, `public/traspasos/vendor/` | Un .xlsx malicioso ejecuta el ataque en el navegador del operario |
| S3 | **CSP con `script-src 'unsafe-inline'`** — anula la contención anti-XSS del navegador. | server.js:25 | Cualquier inyección de HTML se convierte en ejecución de script (y robo del JWT en localStorage) |
| S4 | **RLS permisiva en tablas con datos personales**: cualquier usuario autenticado puede leer TODA `tms_usuarios` (emails, push_token, presencia), los RUT de conductores, correos íntegros de clientes, mediciones de tiempos de todos, log de accesos. (27 tablas con `USING(true)`/`authenticated`, ya documentado en DIAGRAMA_BD §6.3 — ahora con lectura legal: es una brecha de confidencialidad 21.719.) | políticas `003`/`018`; verificado en vivo | Un operario de bodega puede exportar el directorio completo y los correos de clientes vía API |

### Medios

| # | Hallazgo | Evidencia |
|---|---|---|
| S5 | **Buckets de Storage públicos** (`monitoreo-evidencias`, `fichas-productos`): cualquiera con la URL ve las fotos sin login (las URLs quedan en informes/exportes). | buckets `public:true`, verificado en vivo |
| S6 | **Sentry con Session Replay + PII**: se envía email/nombre del trabajador y se graban sesiones (5% siempre, 100% ante error) que pueden capturar datos de clientes en pantalla. | `src/lib/sentry.js` |
| S7 | **Direcciones de clientes a servicios públicos** sin contrato: Nominatim (OSM) y OSRM demo reciben el domicilio completo para geocodificar/rutear. | `src/services/logisticaService.js` |
| S8 | **HTML de la IA insertado con `innerHTML`** en el preview de correo de Traspasos (la ruta manual sí escapa). | `public/traspasos/app.js:904,1090` |
| S9 | **Sin rate-limit en `/api/traspasos-ai`**: un usuario autenticado puede quemar la cuota de la API key en bucle. | server.js |
| S10 | **Webhook `postventa-inbox` acepta el token por query string** (`?token=`) — puede quedar en logs de proxies. El header X-API-Key debería ser la única vía. | edge function |
| S11 | **HIBP (protección de contraseñas filtradas) desactivado** en Supabase Auth; sin MFA para cuentas admin. | advisors (pendiente conocido) |

### Bajos
- `allowBackup="true"` en Android (permite extraer el WebView/localStorage con JWT vía adb en equipos con depuración).
- Datos operativos persistidos sin cifrar en PDAs compartidas (Dexie `WMS_Offline_DB`, `wms_entry_queue`, `yard_*_state`) y **no se limpian al logout** (el resto sí).
- API key de Firebase en `google-services.json` (pública por diseño; restringirla por package/SHA-1 en Google Cloud).
- Sentry v7 desactualizado; `console.log` de bundle OTA y token FCM truncado.
- Nombres reales de 5 técnicos sembrados en una migración commiteada.
- **Positivo verificado:** sin claves privadas en el repo (solo anon key, pública por diseño); contraseñas solo como bcrypt en `auth.users`; correos de Post-Venta renderizados como texto (sin XSS); headers de seguridad y proxy IA con validación de sesión; trigger anti-escalada de privilegios en `tms_usuarios`; retención ya operando por pg_cron: `tms_accesos` 90 días, presencia 24 h, NVs eliminadas 60 días.

---

## 3. Inventario de datos personales (lo que exige el art. de responsabilidad de la 21.719)

| Titular | Datos | Dónde | Observación legal |
|---|---|---|---|
| **Trabajadores** | nombre, email, rol, push_token, **presencia cada 30 s** (módulo/URL/última actividad), log de logins, **tiempos de picking/packing con "tiempo de ocio"**, **errores atribuidos con nombre**, nombre incrustado en 36+ columnas `*_nombre`, firma de certificados | `tms_usuarios`, `tms_usuarios_activos`, `tms_accesos`, `tms_auditoria`, `tms_mediciones_tiempos`, `tms_errores_picking`, tablas operativas | Monitoreo y evaluación de desempeño → exige transparencia + Reglamento Interno (CdT art. 5; DT) |
| **Conductores** | nombre, apellido, **RUT**, teléfono, patente, estado en ruta | `tms_conductores` (se auto-registran desde la app sin aviso) | RUT = dato personal pleno; estado EN_RUTA = seguimiento |
| **Clientes/contactos** | razón social, nombre contacto, **RUT**, dirección, teléfono, lat/long | `tms_direcciones`, `tms_nv_diarias`, `tms_entregas`, `tms_control_despacho` | Exportable completo a Excel; direcciones viajan a OSM/OSRM |
| **Remitentes de correos** (el más delicado) | nombre, email, **Para/CC de terceros que nunca interactuaron con PTM**, asunto y **cuerpo íntegro** del correo, indefinidamente | `tms_postventa_correos`, `tms_postventa_tickets`, `tms_postventa_descartados` | Contexto hospitalario ⇒ el cuerpo libre **puede contener datos de salud (sensibles)**; hoy legible por cualquier usuario autenticado del WMS |
| **Técnicos** | nombres reales (también en el repo) | `tms_postventa_tecnicos` | Carga de trabajo por técnico visible en dashboards |
| **Fotos** | evidencias de daños (pueden captar personas incidentalmente) | Storage público `monitoreo-evidencias` | Bucket público |

**Terceros que reciben datos** (encargados — todos requieren contrato/DPA bajo 21.719): Supabase (toda la BD), Sentry (PII trabajador + replay), Google/FCM (push token), Anthropic (texto del asistente IA), Nominatim/OSRM (domicilios de clientes), Microsoft Graph (buzón), Render (hosting), Capgo (bundles), CARTO (tiles). **No hay ningún DPA/inventario de encargados documentado.**

---

## 4. Mapeo contra la Ley 21.719 — qué cumple y qué FALTA

| Obligación (21.719) | Estado | Detalle |
|---|---|---|
| **Base de licitud documentada** por tratamiento | ❌ FALTA | Nada documenta por qué se trata cada dato (contrato laboral, interés legítimo, consentimiento). El monitoreo de "tiempo de ocio" y los correos de terceros son los más difíciles de justificar tal como están. |
| **Deber de información / aviso de privacidad** | ❌ FALTA | 0 menciones de privacidad en toda la app. Ni el login, ni el auto-registro del conductor (que entrega su RUT), ni el buzón de correos avisan nada. |
| **Derechos ARCO + portabilidad** | ❌ FALTA | No existe "exportar mis datos" ni flujo de solicitud del titular. La supresión es parcial: borrar un usuario **no borra su cuenta en `auth.users`** (no existe `delete_auth_user`), ni sus rastros (`*_nombre` en 36 columnas, mediciones, errores, auditoría con la fila completa). |
| **Principio de proporcionalidad/minimización** | ❌ FALTA | S1: histórico de presencia cada 30 s con copia completa de la fila (incluye push_token) es desproporcionado por diseño. "Tiempo de ocio" nominativo idem. |
| **Retención limitada** | 🟡 PARCIAL | Ya hay pg_cron para accesos (90 d), presencia (24 h) y NVs eliminadas (60 d). **Sin retención**: `tms_auditoria` (139 MB), correos Post-Venta, mediciones de tiempos, errores de picking, tickets, historial de cargas. |
| **Seguridad (medidas técnicas)** | 🟡 PARCIAL | Base sólida (RPC gates, bcrypt, HTTPS, RLS activa) pero con S2–S5, S8–S11 abiertos; RLS permisiva contradice "acceso según necesidad". |
| **Notificación de brechas a la Agencia** | ❌ FALTA | No hay procedimiento de detección/registro/notificación de incidentes ni responsable designado. |
| **Contratos con encargados (DPA)** | ❌ FALTA | 9 terceros sin contrato documentado; Nominatim/OSRM ni siquiera tienen términos empresariales — hay que reemplazarlos o contratar un proveedor. |
| **Transferencias internacionales** | ❌ FALTA | Supabase/Sentry/Google/Anthropic procesan fuera de Chile; la 21.719 exige nivel adecuado o garantías (cláusulas contractuales). Documentarlo. |
| **Datos sensibles (salud)** | ❌ RIESGO | Los cuerpos de correos de hospitales pueden traer datos de pacientes: se guardan íntegros, sin filtro, indefinidamente y legibles por todos los usuarios. Régimen agravado si ocurre. |
| **Registro de actividades de tratamiento** | 🟡 | La §3 de este informe es el borrador inicial — falta formalizarlo y mantenerlo. |
| **DPO / modelo de prevención** | ❌ Opcional pero recomendado | Designar responsable de datos y adoptar modelo de prevención (atenúa multas). |

**Código del Trabajo (aplica HOY):** el Monitor en tiempo real, los tiempos con "ocio" y los errores nominativos deben describirse en el **Reglamento Interno de Orden, Higiene y Seguridad** y comunicarse a los trabajadores (criterio DT: control informado, general —no selectivo— y proporcional). Nada de eso consta en el sistema.

---

## 5. Qué falta — plan de acción priorizado

### A. Técnico inmediato (días — puedo implementarlo yo)
1. **S1**: excluir el heartbeat del trigger de auditoría (auditar solo cambios de rol/permisos/activo, no `last_seen/current_*`), purgar el histórico acumulado (139 MB) y agregar retención pg_cron a `tms_auditoria` (p.ej. 1 año).
2. **S4**: endurecer RLS — `tms_usuarios` legible solo el propio registro (+admins); restringir lectura de `tms_conductores` (RUT/teléfono), `tms_postventa_correos` (solo permisos de Post-Venta), `tms_mediciones_tiempos`/`tms_errores_picking`/`tms_accesos` (solo admin/supervisión).
3. **S2**: actualizar `xlsx` a la build parcheada de SheetJS (app y copia vendorizada de Traspasos).
4. **S5**: volver privados los buckets y servir las fotos con URLs firmadas con expiración.
5. **S3/S8/S9/S10**: CSP sin `unsafe-inline` (nonce), sanitizar el HTML de IA, rate-limit al proxy, token del webhook solo por header.
6. **S6/S7**: apagar Session Replay (o masking total) y quitar el email de `Sentry.setUser`; reemplazar Nominatim/OSRM públicos por un proveedor con contrato (o geocodificar server-side con caché propia).
7. **Supresión completa**: RPC `delete_auth_user` + rutina de anonimización (reemplazar `*_nombre` por "Usuario eliminado" en tablas históricas) al borrar un usuario.
8. Retención para correos Post-Venta / mediciones / tickets (definir plazos con negocio, p.ej. 24–36 meses) + HIBP on + MFA para admins + `allowBackup=false` + limpiar Dexie/colas al logout.

### B. Organizacional / legal (antes del 1-dic-2026 — requiere a PTM y abogado)
9. **Aviso de privacidad** (pantalla de login + primer uso de la app del conductor) y política interna de tratamiento.
10. **Reglamento Interno**: incorporar y comunicar el monitoreo (presencia, tiempos, errores, replay si se mantiene).
11. **Procedimiento de derechos ARCO** (canal, plazos de respuesta) apoyado en las herramientas técnicas del punto 7.
12. **Contratos de encargo (DPA)** con Supabase, Sentry, Google, Anthropic, Render, Capgo + documentar transferencias internacionales.
13. **Procedimiento de brechas**: quién detecta, registro, evaluación y notificación a la Agencia; simulacro anual.
14. **Registro de actividades de tratamiento** formal (partir de la §3) y designar un responsable/DPO.
15. Evaluar con el abogado el tratamiento del **buzón de correos** (aviso en la firma/autorespuesta del buzón postventa@, filtrado o minimización del cuerpo, y régimen de datos sensibles si aparecen datos de pacientes).

---

*Fuentes técnicas: auditoría de código v1.18.3 (2 revisiones paralelas + verificación en BD en vivo), `get_advisors` de Supabase, políticas RLS y cron jobs consultados en producción. Referencias legales: Ley 19.628; Ley 21.719 (D.O. 13-12-2024, vigencia 01-12-2026); Ley 21.663; Código del Trabajo art. 5 y dictámenes de la Dirección del Trabajo sobre control laboral.*
