# Documentación Detallada de Flujos Operativos - CCO

Este documento detalla paso a paso cada interacción, decisión y movimiento de datos dentro del ecosistema CCO (WMS + TMS).

---

## 1. � Flujo WMS (Warehouse Management System)

El WMS controla todo lo que sucede dentro de las 4 paredes del centro de distribución.

### 1.1. Recepción (Inbound)
El proceso comienza cuando llega mercancía al almacén.
1.  **Llegada de Transporte:** El camión llega a muelle.
2.  **Verificación Documental:** Se coteja la Guía de Despacho del proveedor contra la Orden de Compra.
3.  **Ingreso al Sistema:**
    *   Se utiliza el módulo **Recepción**.
    *   Se escanea el código de producto (SKU) o Lote.
    *   Se ingresa la cantidad recibida y el estado (Conforme/Dañado).
4.  **Put-away (Almacenaje):**
    *   El sistema sugiere una ubicación óptima basada en rotación (ABC) o tipo de producto.
    *   El operario confirma la ubicación final escaneando la etiqueta del rack.
    *   **Efecto:** El inventario aumenta en la ubicación específica.

### 1.2. Gestión de Pedidos (Nota de Venta)
1.  **Creación:** Ventas ingresa una N.V. con los productos requeridos y datos del cliente.
2.  **Validación de Stock:** El sistema verifica automáticamente si hay suficiente stock disponible.
    *   *Si hay stock:* El estado pasa a `PENDIENTE_PICKING`.
    *   *Si no hay stock:* Pasa a `BACKORDER`.
3.  **Priorización:** Las órdenes se ordenan por fecha de entrega prometida o prioridad del cliente.

### 1.3. Proceso de Picking (Preparación)
1.  **Asignación de Ola:** El Jefe de Bodega agrupa varias N.V. en una "Ola de Picking" para optimizar el recorrido.
2.  **Ruta de Picking:** El sistema genera una lista ordenada por ubicación (Pasillo A -> Pasillo Z) para minimizar pasos.
3.  **Ejecución:**
    *   El picker usa la tablet/móvil.
    *   Va a la ubicación indicada.
    *   Escanea ubicación y producto (Validación doble).
    *   Ingresa cantidad retirada.
4.  **Cierre de Picking:**
    *   Al completar todos los items, la N.V. cambia de estado a `PICKING_COMPLETO` o `PENDIENTE_PACKING`.
    *   El stock se mueve virtualmente de "Estantería" a "Mesa de Packing".

### 1.4. Proceso de Packing (Embalaje)
1.  **Verificación Ciega:** El packer recibe los productos sin ver la lista original. Escanea cada ítem para asegurar que coincida con la orden.
2.  **Embalaje:** Se seleccionan las cajas adecuadas.
3.  **Generación de Bultos:**
    *   Se indica cuántos bultos (cajas) componen la orden.
    *   Se generan etiquetas de despacho con códigos QR únicos para cada bulto.
4.  **Cierre de Packing:** La N.V. cambia de estado a `LISTO_DESPACHO`.

### 1.5. Despacho (Staging)
1.  **Consolidación:** Los bultos se mueven a la zona de despacho (Staging Area).
2.  **Validación Final:** Antes de cargar al camión, se escanean los bultos para asegurar que no falta nada.
3.  **Generación de Manifiesto:** Se crea el documento que ampara la carga del camión.
4.  **Trigger de Salida:** Al confirmar el despacho, se dispara la integración hacia el TMS.

---

## 2. 🟨 Flujo de Integración (Sync Engine)

Este es el proceso invisible que conecta el WMS con el TMS.

### 2.1. Disparador (Trigger)
*   **Evento:** Cambio de estado de N.V. a `DESPACHADO` en WMS.
*   **Acción:** `TMSSync.gs` captura los datos de la N.V.

### 2.2. Lógica de Negocio (Inteligencia de Datos)
1.  **Búsqueda de Cliente:** El sistema verifica si el cliente ya existe en la base de datos maestra del TMS.
    *   *Existe:* Recupera sus coordenadas GPS (Lat/Lng) históricas para asegurar precisión.
    *   *No Existe:* Crea un nuevo registro y marca para geocodificación futura.
2.  **Transformación:**
    *   Convierte `N.V. #123` (WMS) -> `Entrega ID: 123` (TMS).
    *   Calcula volumen y peso total basado en los bultos.

### 2.3. Inserción
*   Crea una nueva fila en la hoja `TMS_ENTREGAS` con estado inicial `PENDIENTE_PLANIFICACION`.
*   Añade columna `FechaSync` para auditoría.

---

## 3. 🟪 Flujo TMS (Transportation Management System)

### 3.1. Planificación de Rutas
1.  **Visualización:** El planificador ve todas las entregas pendientes en un mapa (Módulo Route Planning).
2.  **Agrupación:**
    *   Selecciona entregas por zona geográfica (polígonos) o comuna.
    *   El sistema valida capacidad del vehículo (Peso/Volumen).
3.  **Secuenciación:**
    *   El algoritmo ordena las paradas para minimizar distancia/tiempo.
    *   Genera un `RouteID` único.
4.  **Asignación:** Se asigna un Conductor y un Vehículo a la ruta.

### 3.2. Ejecución (App Conductor)
1.  **Inicio de Ruta:**
    *   El conductor inicia sesión en la App Web Móvil.
    *   Ve su lista de tareas ordenada.
    *   Marca "Iniciar Ruta" -> Estado cambia a `EN_RUTA`.
2.  **Navegación:**
    *   Click en "Navegar" abre Waze/Google Maps con las coordenadas precisas.
3.  **En Punto de Entrega:**
    *   El conductor llega y marca "En Destino".
    *   El sistema captura GPS real para validar que está en el lugar correcto (Geofence).
4.  **Prueba de Entrega (POD):**
    *   **Entrega Exitosa:** Toma foto del paquete en domicilio o firma digital del cliente. Estado -> `ENTREGADO`.
    *   **Entrega Fallida:** Selecciona motivo (No hay morador, Dirección errónea). Estado -> `INTENTO_FALLIDO`.

### 3.3. Torre de Control (Monitoreo)
1.  **Tracking en Tiempo Real:**
    *   El mapa muestra iconos de camiones moviéndose.
    *   Colores indican estado: Verde (A tiempo), Rojo (Retrasado), Amarillo (Detenido).
2.  **Alertas Automáticas:**
    *   Si un camión está detenido más de 20 min en un punto no autorizado.
    *   Si una entrega excede la ventana horaria prometida.
3.  **Gestión de Incidentes:** El operador de la torre puede reasignar entregas o contactar al conductor directamente desde el dashboard.

---

## 4. � Flujos de Soporte y Excepciones

### 4.1. Logística Inversa (Devoluciones)
Si una entrega falla (`INTENTO_FALLIDO`):
1.  La mercancía regresa físicamente al CD al final del día.
2.  **Reingreso WMS:** Se escanea como "Retorno de Ruta".
3.  **Decisión:**
    *   *Re-programar:* Vuelve a stock de despacho para salir mañana.
    *   *Merma:* Si está dañado, pasa a proceso de destrucción/reparación.
    *   *Devolución a Stock:* Si el cliente canceló, vuelve a ubicación de almacenaje.

### 4.2. Auditoría de Inventario
*   **Conteo Cíclico:** Diariamente se cuentan ubicaciones aleatorias para asegurar que el sistema WMS coincida con la realidad física.
*   **Ajuste:** Si hay diferencia, se genera un movimiento de ajuste (Inv +/-) que requiere aprobación de supervisor.
