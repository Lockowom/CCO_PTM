# Matriz de categorías de calidad — Recepción de productos (PTM)

> Documento de referencia para **validación con Asuntos Regulatorios / ISP**.
> Define cómo se segmenta el catálogo de PTM por **familia de producto** y qué
> **criterios de aceptación** aplica el CheckList de Ingreso a cada una, alineado
> con **ISO 13485 §7.4.3** (verificación del producto comprado) y el marco legal
> chileno de dispositivos médicos.
>
> Fuente técnica: migración `032_categorias_producto_calidad.sql`
> (`clasificar_producto`, `tms_categorias_calidad`, `calidad_categorias_tarea`).

## 1. Por qué segmentar

"Insumo médico" en PTM abarca desde una **jeringa estéril** hasta una **silla de
ruedas**, un **monitor multiparámetro** o un **rollo de empaque**. Cada uno tiene
un **riesgo** y un **control legal** distintos; inspeccionarlos con un checklist
único no cumple ISO 13485. El sistema clasifica automáticamente cada ítem de la
recepción y aplica los criterios de su familia, **además** de los universales.

## 2. Controles universales (todas las familias)

Se aplican siempre, con independencia de la familia:

- **Nivel 1 — Revisión documental (Packing List):** packing/factura adjunta,
  proveedor y OC, cantidad declarada vs. recibida, lote/serie, vencimiento,
  registro/certificado del producto, cadena de frío documentada (si aplica).
- **Nivel 2 — Inspección física de embalajes:** embalaje externo íntegro,
  sellos/precintos, humedad, etiquetado, N° de bultos, daño visible, empaque
  primario.

## 3. Familias y criterios específicos

| Código | Familia | ¿Dispositivo médico? | Clase riesgo (ref.) | Registro ISP | Criterios de aceptación específicos |
|---|---|---|---|---|---|
| `EQUIPO_ACTIVO` | Equipo médico activo (monitores, balanzas, concentradores O₂, otoscopios, bombas) | **Sí** | IIa | Según producto | Prueba funcional/encendido · Certificado de calibración/verificación metrológica · Manual + garantía · Accesorios y cables completos · N° de serie |
| `INSUMO_ESTERIL` | Insumo estéril / desechable (gasas, apósitos, lancetas, suturas, vendas) | **Sí** | IIa | **Sí** (control obligatorio) | Empaque estéril íntegro · Vencimiento vigente con margen · Lote trazable · **N° registro sanitario ISP** · Condiciones de transporte/cadena de frío |
| `MOBILIARIO` | Mobiliario clínico (camillas, catres, cunas, sillones, carros, biombos, colchones) | Sí | I | No | Estructura sin deformación · Mecanismos operativos (ruedas, frenos, hidráulica) · Accesorios completos · Superficies sin daño |
| `AYUDA_TECNICA` | Ayuda técnica / ortopedia (sillas de ruedas, cabestrillos, fajas, plantillas) | Sí | I | No | Función mecánica correcta · Talla/medida según pedido · Ficha técnica/instrucciones · Sin daños, partes completas |
| `BIENESTAR` | Bienestar (línea **MAXX**) | **No** | — | No | Producto y empaque en buen estado · Rotulado conforme · Cantidad declarada |
| `EMPAQUE` | Empaque / **Farmapack** (rollos BOPP, envasado; PTM solo despacha) | **No** | — | No | Rollos sin daño/humedad · Especificación correcta (medida, tipo BOPP, N° bolsas) · Cantidad de rollos |
| `SIN_CLASIFICAR` | Sin familia asignada (sin descripción o desconocida) | (conservador: sí) | — | No | Solo controles universales; requiere revisión manual |
| `BASURA` | Fila de encabezado/artefacto de importación | No | — | No | Excluida del control |

## 4. Marco legal chileno (resumen operativo)

- **Regulador:** Instituto de Salud Pública (**ISP**).
- **Control obligatorio (DS N° 825/1998, MINSAL):** un listado específico de
  dispositivos exige **registro sanitario ISP** para importar/comercializar
  (típicamente **jeringas y agujas hipodérmicas de un solo uso, guantes de
  examinación/quirúrgicos, preservativos**). Para la familia `INSUMO_ESTERIL` el
  checklist exige verificar el **N° de registro ISP** (marcable N/A con
  justificación cuando el ítem puntual no está en el listado de control).
- **Clasificación por riesgo** (I / IIa / IIb / III): la columna "Clase riesgo"
  es una **referencia** por familia; la clase real de cada producto la determina
  Regulatorios según reglas tipo IMDRF. Ajustar en `tms_categorias_calidad` si se
  formaliza por SKU.
- **Producto no sanitario** (`BIENESTAR`, `EMPAQUE`): el documento de recepción se
  emite como **conformidad de recepción**, con la leyenda explícita de que **no
  constituye certificación de dispositivo médico ISO 13485**. No se les exige
  registro ISP ni criterios clínicos.

> ⚠️ Los números de decreto y la clase por producto deben **confirmarse con
> Asuntos Regulatorios**; el marco chileno de dispositivos médicos está en
> transición. La **estructura** (ISP, control obligatorio con registro,
> clasificación por clase) es la que un auditor ISO 13485 espera ver reflejada.

## 5. Cómo funciona en el sistema

1. Al registrar una recepción, cada ítem recibe su `categoria` automáticamente
   (`clasificar_producto` sobre la descripción; trigger `BEFORE INSERT`).
2. Al abrir el CheckList, la RPC `calidad_categorias_tarea` devuelve las familias
   presentes; el checklist añade una **sección de criterios por cada familia**
   detectada, más los universales, y **exige responder todos** para certificar.
3. Si la recepción es **solo no sanitaria**, el certificado lo indica.
4. **Corrección manual:** `set_categoria_producto(descripcion, categoria)` fija un
   override persistente (`tms_producto_categoria`) y re-etiqueta los ítems con esa
   descripción. La clasificación efectiva usa primero el override y luego el
   clasificador por palabras clave.

## 6. Clasificación actual del catálogo (191 productos)

| Familia | Productos distintos |
|---|---|
| Insumo estéril / desechable | 45 |
| Equipo médico activo | 44 |
| Mobiliario clínico | 43 |
| Ayuda técnica / ortopedia | 33 |
| Bienestar (MAXX) | 6 |
| Empaque (Farmapack) | 8 |
| Filas basura (excluidas) | 12 |
| Sin clasificar | 0 |

Las **filas basura** (encabezados "DESCRIPCION"/"CODIGO", "COLOR BLUE", códigos
`0VI…`) quedan marcadas como `BASURA` y **excluidas** del checklist; no se
eliminan de forma destructiva (quedan disponibles para depuración con revisión).
