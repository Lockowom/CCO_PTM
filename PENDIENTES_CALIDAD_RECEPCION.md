# Pendientes — Calidad y Recepción (backlog)

> Registrado 2026-07-07. Features discutidos y **aprobados para hacer más adelante** (NO implementados aún).
> Este documento es la memoria de trabajo: incluye decisiones tomadas, decisiones pendientes y
> hallazgos técnicos para no re-investigar. No afecta la app.

---

## 1. Formato ISO 13485 en los informes de Calidad + sello/folio
> **ESTADO (2026-07-07, v1.4.66): HECHO para el Certificado/Acta del CheckList de Ingreso** —
> `src/lib/exportChecklistIngreso.js` tiene encabezado/pie de control documental (empresa, código
> `FO-CAL-001`, revisión, norma ISO 13485:2016, Página X de Y) y el folio como sello. Config en la
> constante `DOC_CONTROL`. **Sigue pendiente:** aplicar el MISMO formato ISO a los informes de
> **Monitoreo y Daños** (`exportInformeMonitoreo.js` / `exportInformeDanos.js`), y el **logo** real.

**Qué:** que los informes (Monitoreo y/o Daños) salgan con **formato de control documental ISO** para
insumos médicos (ISO 13485), no un export genérico.

**Diseño acordado:**
- **Encabezado**: logo/empresa, título, **código de documento** (ej. `FO-CC-001`), **revisión**,
  norma de referencia (ISO 13485:2016), fecha, **folio**.
- **Trazabilidad**: SKU, lote/serie, ubicación, condición, dictamen, responsables.
- **Pie de control documental**: `Código · Revisión · Página X de Y · Documento controlado`.
- Bloques de **firma** (Analista / Calidad).
- **Sello/timbre** al finalizar: folio único + fecha/hora + responsable + resultado global.

**Decisiones pendientes del usuario:**
- ¿Existe **plantilla oficial** (Word/PDF de ejemplo) a replicar, o diseño uno ISO 13485 estándar?
- Datos reales: **empresa, logo (imagen), código de documento, revisión, norma exacta**.
- ¿Aplica a ambos informes (Monitoreo + Daños) o solo Monitoreo?

**Dónde toca:** `src/lib/exportInformeMonitoreo.js`, `src/lib/exportInformeDanos.js` (encabezado/pie),
migración para `folio` y campos de sello en `tms_monitoreo_informes`.

---

## 2. Firma digital de los informes
> **ESTADO (2026-07-07, v1.4.69): HECHO para el Certificado/Acta del CheckList** — firma electrónica
> **HMAC-SHA256** server-side (migración `030`): llave en esquema `private`, RPC `firmar_certificado`
> y `verificar_certificado` (pública, para el QR), botón "Firmar digitalmente", QR en el PDF y página
> pública `/verificar`. Es una firma criptográfica interna (autenticidad + integridad, tamper-evident).
> **Sigue pendiente:** firma con **certificado acreditado (PAdES verificable en Adobe / FEA con
> validez legal plena)** — requiere el `.p12`/proveedor del usuario (opciones B/C); y extender la firma
> a los informes de Monitoreo/Daños si se desea.

**Qué:** el usuario eligió **firma digital** (no solo sello/QR).

**Regla de oro (seguridad, no negociable):** la **llave privada/certificado NUNCA va en el frontend**
(SPA React → se expondría). La firma **corre server-side** en una **Edge Function de Supabase**, con la
llave como **secreto** de la función. `pdfmake` NO puede incrustar una firma PAdES; para PDF firmado
verificable en Adobe hay que firmar el PDF en un paso server-side (`node-signpdf`/`pdf-lib`).

**Opciones planteadas (pendiente elegir A/B/C):**
- **A) Firma criptográfica propia + verificación por QR**: Edge Function firma el hash con llave
  (RSA/ECDSA); PDF lleva firma + QR a página de verificación. Tamper-evident. La más autocontenida.
- **B) Firma con certificado X.509 en el PDF (PAdES, palomita verde en Adobe)**: requiere que el
  usuario tenga un **certificado `.p12/.pfx`**.
- **C) Proveedor de firma acreditada (FEA / validez legal plena)**: integración con proveedor
  (ej. Chile: Acepta, E-Sign) con API + sellado de tiempo.

**Decisiones pendientes:** elegir A/B/C; ¿tiene `.p12`/proveedor?; ¿firma **corporativa** única o
**cada analista** con su identidad?

**Plan de arranque sugerido:** montar la tubería completa (Edge Function de firma, campos BD
`folio/firma/firmado_por/firmado_en/hash`, botón "Firmar y sellar" que bloquea el informe, sello+QR en
PDF/Word, página pública de verificación) con **llave de prueba**, y luego cambiarla por la real.

---

## 3. Checklist de recepción (conecta Recepción → Calidad)
> **ESTADO (2026-07-07): PARCIALMENTE IMPLEMENTADO (v1.4.62).** El **disparo + la cola de tareas +
> el checklist operativo** ya están (hito "Ingreso a bodega"): trigger `AFTER INSERT` en
> `tms_recepciones(_nacionales)` → tarea en `tms_calidad_tareas` → pestaña **"CheckList de Ingreso"**
> en el módulo Calidad, con los parámetros por nivel (Rev. documental PL / Inspección física),
> certificación **CONFORME** con folio o **NO CONFORME** con alerta urgente. Migración `028`.
> **Sigue pendiente:** la **validación automática de cantidad leyendo el packing list** (punto 4);
> hoy la cantidad es una verificación **manual** dentro del checklist. Fotos por parámetro: pendiente.

**Qué:** al cerrar una recepción, un checklist:
1. **Validación de cantidades** recibidas vs **packing list** (esperado) → PASS/FAIL con detalle de
   discrepancias (faltantes/sobrantes).
2. **Inspección visual de cajas** → OK/NOK (con foto/nota vía `PhotoUploader`).
3. **Certificación automática**: si 1 y 2 OK → recepción `CERTIFICADO/CONFORME` (con timbre/folio).
4. Si **falla** cualquiera → genera **tarea URGENTE** = **Informe de Daños/No Conformidad** en Calidad,
   **pre-cargado** (SKU, cantidades, ubicación, discrepancias, fotos) + `tms_notificaciones`
   `urgente=true` + **push** al rol Calidad/Inventario.

**Decisiones pendientes:**
- **Fuente del packing list / cantidad esperada** (ver punto 4 — lectura automática).
- Inspección visual: ¿un OK/NOK con foto, o lista de sub-puntos (embalaje, sellos, etiquetado, golpes,
  humedad…)?
- Certificación: ¿cantidad **exacta** (0 discrepancia) o **tolerancia %**?
- Alcance: aplica a **Recepción Importaciones + Nacionales** (ambas).

**Dónde toca:** `src/pages/Inbound/Reception.jsx` y `ReceptionNacional.jsx`; migración con campos de
checklist/estado en `tms_recepciones(_nacionales)` + enlace a la tarea/informe.

---

## 4. Lectura automática de packing lists (multi-país / multi-formato)
**Hallazgo técnico (revisados 2 ejemplos reales):**
- **PTM / France Hopital (Italia)** → **PDF de texto** (tabla real: Mod. · Description · Qty · pesos ·
  packages). **Parseable directo** (extraer texto).
- **Manwell Medical (China)** → **PDF escaneado / de imágenes** (12 págs, 19 imágenes JPEG, **0 texto
  seleccionable**). **Requiere OCR** — no hay texto que extraer.
- Conclusión: no son solo layouts distintos; son **tipos distintos** (texto vs imagen). Un parser
  rígido por reglas **no** generaliza (idiomas/plantillas/país distintos).

**Enfoque recomendado:** **extracción con IA de visión** (Claude API con visión, misma infra
Anthropic): se le pasa el PDF (texto o imágenes) y devuelve **esquema normalizado**
`{ sku, descripcion, cantidad, bultos, peso_neto, peso_bruto }`. Lee ambos tipos (hace OCR del
escaneado y entiende el layout del de texto).

**Reglas:**
- Corre **server-side** (Edge Function) para no exponer la API key.
- **Paso de confirmación del operario** sobre la tabla leída **antes de certificar** (insumos médicos →
  no se certifica a ciegas; la extracción no es 100%).
- Alimenta la "cantidad esperada" del checklist (punto 3).

**Decisiones pendientes:** ¿API key de **Anthropic** para la Edge Function (o dejarla como secreto a
cargar después)?; confirmar arquitectura server-side.

---

## 5. Segmentación del catálogo por familia (criterios ISO por tipo de producto)
> **ESTADO (2026-07-08, v1.5.0): HECHO.** Migración `032` + frontend. El catálogo se clasifica
> automáticamente en familias (equipo activo, insumo estéril, mobiliario, ayuda técnica, bienestar
> MAXX **no sanitario**, empaque Farmapack **no sanitario**), y el CheckList aplica **criterios de
> aceptación específicos por familia** además de los universales; flag de **control obligatorio ISP** y
> disclaimer de **no sanitario**. Ver `MATRIZ_CATEGORIAS_CALIDAD.md`.
> **Pendiente menor:** UI de administración para revisar/reasignar categorías (hoy la corrección se hace
> por RPC `set_categoria_producto`); refinar la **clase de riesgo por SKU** con Regulatorios (hoy es por
> familia); confirmar N° de decreto/registro ISP exactos con Asuntos Regulatorios.

---

## Orden sugerido cuando se retome
1. **Packing list read (4)** + **Checklist de recepción (3)** — van juntos (uno alimenta al otro).
2. **Formato ISO (1)** — base documental.
3. **Firma digital (2)** — encima del formato ISO, con el certificado/decisión A/B/C ya definidos.

## Otros pendientes menores (de la revisión 2026-07-07)
- Permisos huérfanos `manage_mediciones` / `view_time_reports` (rutas admin sin entrada en el editor;
  solo ADMIN accede → sin impacto, limpiar cuando se pueda).
- Activar "leaked password protection" (dashboard Supabase Auth).
- Backlog de refactor: dividir god-components, logger central (`console.*`).
