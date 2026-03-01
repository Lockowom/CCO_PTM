# Manual de Usuario - Actualización v2.0 (Marzo 2026)

Este documento detalla las nuevas funcionalidades y cambios visuales implementados en la plataforma CCO.

## 1. 📊 Nuevo Dashboard Operacional

El panel principal ha sido rediseñado bajo el concepto de **"Alta Densidad"** para mostrar más información en menos espacio, eliminando la necesidad de hacer scroll.

### Componentes Clave:
*   **KPIs Superiores:** 4 tarjetas que muestran los números críticos del día (Total N.V., Pendientes, En Picking, Quiebres).
    *   *Color Rojo:* Indica alertas críticas (ej. Quiebres de Stock > 0).
    *   *Color Ámbar:* Indica atención requerida (ej. Pendientes acumulados).
*   **Flujo Operativo (Pipeline):** Gráfico visual que muestra el "viaje" de los pedidos desde que entran hasta que se entregan.
*   **Alertas Laterales:**
    *   **Refacturación:** Pedidos que requieren corrección administrativa inmediata.
    *   **Conductores:** Disponibilidad de flota en tiempo real.
*   **Tabla de Actividad:** Muestra las últimas 7 transacciones.

> **Tip:** El dashboard se actualiza automáticamente cada 30 segundos. No es necesario recargar la página.

## 2. 🔐 Acceso y Seguridad

### Login Renovado
*   Nueva pantalla de acceso con validación biométrica simulada y fondo animado.
*   **Importante:** Si su usuario es desactivado por un administrador, su sesión se cerrará automáticamente en menos de 5 segundos gracias al nuevo sistema "Session Watchdog".

### Menú de Navegación
*   El menú ahora es **inteligente**:
    *   En pantallas grandes (PC), se muestra horizontalmente.
    *   En laptops pequeñas o tablets, se convierte automáticamente en un botón de menú ("Hamburguesa") para no saturar la pantalla.
*   Widgets de perfil y reloj actualizados al tema claro (Light Theme).

## 3. 📦 Módulo de Picking (Mejorado)

### Botón "Espera Otra Zona"
Se ha añadido una lógica especial para pedidos mixtos (productos pequeños + productos grandes/pallet).

**¿Cómo funciona?**
1.  Si usted está haciendo picking de productos pequeños y encuentra un ítem de "Zona Pallet":
2.  No deje la N.V. incompleta.
3.  Presione el botón **"Espera Otra Zona"**.
4.  El sistema guardará su avance y liberará la N.V. para que el operario de la otra zona pueda continuar con los productos restantes.

## 4. 🔍 Consulta Maestra (Ex-Historial N.V.)

El módulo de consultas ha sido potenciado:
*   **Búsqueda Global:** Puede buscar por N.V., Cliente, RUT o SKU en un solo campo.
*   **Filtros Avanzados:** Filtre por rango de fechas, estado específico o vendedor.
*   **Vista de Detalle:** Al hacer clic en una fila, se abre una tarjeta detallada con toda la trazabilidad del pedido, incluyendo quién lo preparó, quién lo despachó y la prueba de entrega (foto).

## 5. 🛠️ Soporte

Si encuentra algún error visual o funcional, por favor repórtelo al administrador del sistema indicando:
1.  Módulo donde ocurrió.
2.  N.V. afectada (si aplica).
3.  Captura de pantalla.

---
*Departamento de Tecnología y Operaciones - CCO*
