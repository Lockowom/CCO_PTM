# 🧪 GUÍA RÁPIDA DE PRUEBAS - PICKING COMPLETO

## ⚡ PRUEBA RÁPIDA (5 MINUTOS)

### 1. ABRIR MÓDULO PICKING
```
1. Ir a Dashboard
2. Click en "Picking"
3. Verificar que se ven las N.V pendientes
```

### 2. EMPEZAR PICKING
```
1. Click en "Empezar Picking" de cualquier N.V
2. Verificar que se ven los productos
3. Verificar que aparece el indicador "0/X" arriba
```

### 3. PROBAR BOTÓN DE UBICACIÓN
```
1. Click en botón "Ubicación" de un producto
2. Verificar que se abre modal con ubicaciones
3. Click en una ubicación
4. Verificar que:
   - Producto se marca con check verde
   - Badge cambia a "Pickeado"
   - Indicador cambia a "1/X"
```

### 4. PROBAR MENÚ DE OPCIONES (...)
```
1. Click en botón "..." de un producto
2. Verificar que se abre menú con 2 opciones
3. Click en "Producto no encontrado"
4. Confirmar
5. Verificar que:
   - Producto se marca como "Faltante"
   - Aparece en hoja OBS
```

### 5. PROBAR PRODUCTO DAÑADO
```
1. Click en botón "..." de otro producto
2. Click en "Producto dañado"
3. Seleccionar una ubicación
4. Verificar que:
   - Producto se marca como "Faltante"
   - Aparece en hoja OBS con ubicación
```

### 6. PROBAR PICKING COMPLETO
```
1. Pickear todos los productos restantes
2. Verificar que indicador muestra "X/X" en verde
3. Click en "Picking Completo"
4. Confirmar
5. Verificar que:
   - N.V desaparece de lista de Picking
   - N.V aparece en hoja PACKING
   - N.V NO está en hoja PICKING (borrada)
   - Estado en N.V DIARIAS = "PENDIENTE PACKING"
```

---

## 🔍 VERIFICACIONES DETALLADAS

### VERIFICAR HOJA OBS
```
1. Abrir hoja "OBS"
2. Verificar columnas:
   A: CODIGO
   B: DESCRIPCION
   C: UBICACION
   D: CANTIDAD
   E: COMENTARIO
3. Verificar que hay registros de productos no encontrados/dañados
```

### VERIFICAR MIGRACIÓN DE DATOS
```
1. Antes de completar picking:
   - Contar filas en PICKING para la N.V
   
2. Después de completar picking:
   - Verificar que esas filas NO están en PICKING
   - Verificar que esas filas SÍ están en PACKING
   - Verificar que cantidad de filas coincide
```

### VERIFICAR LOGS
```
1. Abrir hoja "PICKING_LOG"
2. Verificar que hay registros de cada picking
3. Verificar columnas: ID, FechaHora, TipoOperacion, NotaVenta, Codigo, Ubicacion, Cantidad, Usuario

4. Abrir hoja "ESTADO_LOG"
5. Verificar que hay registros de cambios de estado
6. Verificar columnas: ID, FechaHora, NotaVenta, EstadoAnterior, EstadoNuevo, Usuario
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### ❌ "No se ven ubicaciones"

**Diagnóstico**:
```javascript
// Ejecutar en Google Apps Script:
function diagnosticar() {
  var result = DIAGNOSTICO_RAPIDO();
  Logger.log(JSON.stringify(result, null, 2));
}
```

**Posibles causas**:
1. Códigos no coinciden (ej: "PROD001" vs "PROD-001")
2. CANTIDAD_CONTADA = 0 en UBICACIONES
3. Hoja UBICACIONES vacía

**Solución**:
- Revisar formato de códigos en ambas hojas
- Verificar que columna I (CANTIDAD_CONTADA) tiene valores > 0

---

### ❌ "Error al confirmar picking"

**Diagnóstico**:
```javascript
// Ver logs en Google Apps Script
Ver → Registros
```

**Posibles causas**:
1. Stock insuficiente
2. Ubicación no existe
3. Error de permisos

**Solución**:
- Verificar que ubicación tiene stock > 0
- Verificar permisos de edición en hoja UBICACIONES

---

### ❌ "N.V no se mueve a PACKING"

**Diagnóstico**:
```javascript
// Ejecutar manualmente:
function test() {
  var result = migrarPickingAPacking('NV001');
  Logger.log(JSON.stringify(result, null, 2));
}
```

**Posibles causas**:
1. Hoja PACKING no existe
2. Error en función de migración
3. N.V no está en PICKING

**Solución**:
- Crear hoja PACKING si no existe
- Verificar que N.V está en hoja PICKING
- Revisar logs de error

---

### ❌ "Otro usuario tiene bloqueada la N.V"

**Esto es NORMAL** - el sistema está funcionando correctamente.

**Solución**:
- Esperar a que el otro usuario termine
- O pedir al otro usuario que salga del picking (botón "Volver")

---

## 📋 CHECKLIST DE PRUEBA COMPLETA

### FUNCIONALIDADES BÁSICAS
- [ ] Se ven las N.V pendientes
- [ ] Se puede empezar picking
- [ ] Se ven los productos de la N.V
- [ ] Se puede abrir modal de ubicaciones
- [ ] Se puede seleccionar una ubicación
- [ ] Producto se marca como pickeado
- [ ] Stock se descuenta en UBICACIONES

### MENÚ DE OPCIONES
- [ ] Botón "..." se muestra
- [ ] Menú se abre al hacer click
- [ ] Opción "Producto no encontrado" funciona
- [ ] Opción "Producto dañado" funciona
- [ ] Modal de ubicaciones para dañado funciona
- [ ] Registros aparecen en hoja OBS

### BOTONES DE ESTADO
- [ ] Botón "Faltante BIG TICKET" funciona
- [ ] Botón "Faltante MINI TICKET" funciona
- [ ] Botón "Picking Completo" funciona
- [ ] Estado se actualiza en N.V DIARIAS
- [ ] Datos se mueven correctamente

### INDICADORES
- [ ] Progreso se muestra (X/Y)
- [ ] Progreso se actualiza en tiempo real
- [ ] Color cambia según progreso
- [ ] Estados visuales correctos (pendiente/pickeado/faltante)

### MIGRACIÓN DE DATOS
- [ ] Datos se copian a PACKING
- [ ] Datos se BORRAN de PICKING
- [ ] Estado se actualiza en N.V DIARIAS
- [ ] Logs se registran correctamente

### SISTEMA COMPARTIDO
- [ ] Usuario 1 puede bloquear N.V
- [ ] Usuario 2 no puede acceder a N.V bloqueada
- [ ] Usuario 2 recibe mensaje de bloqueo
- [ ] Al salir, N.V se desbloquea

---

## 🎯 ESCENARIOS DE PRUEBA

### ESCENARIO 1: Picking Perfecto
```
1. Empezar picking
2. Pickear todos los productos desde ubicaciones
3. Completar picking
4. Verificar migración a PACKING
```

### ESCENARIO 2: Productos No Encontrados
```
1. Empezar picking
2. Marcar algunos productos como "no encontrado"
3. Pickear los demás
4. Completar picking
5. Verificar registros en OBS
```

### ESCENARIO 3: Productos Dañados
```
1. Empezar picking
2. Marcar algunos productos como "dañado"
3. Seleccionar ubicaciones
4. Pickear los demás
5. Completar picking
6. Verificar registros en OBS con ubicaciones
```

### ESCENARIO 4: Faltante BIG TICKET
```
1. Empezar picking
2. Pickear algunos productos
3. Click en "Faltante PROD BIG TICKET"
4. Verificar que N.V vuelve a pendientes
5. Verificar estado en N.V DIARIAS
6. Verificar que datos NO se movieron
```

### ESCENARIO 5: Picking Incompleto
```
1. Empezar picking
2. Pickear solo algunos productos (no todos)
3. Click en "Picking Completo"
4. Verificar advertencia "No todos los productos están pickeados"
5. Confirmar de todas formas
6. Verificar que se completa igual
```

---

## 📊 DATOS DE PRUEBA SUGERIDOS

### N.V DE PRUEBA
```
N° Venta: TEST001
Cliente: Cliente de Prueba
Fecha Entrega: Hoy
Productos:
  - PROD001: Producto 1 (Cantidad: 5)
  - PROD002: Producto 2 (Cantidad: 3)
  - PROD003: Producto 3 (Cantidad: 10)
```

### UBICACIONES DE PRUEBA
```
Ubicación: A-01-01
Código: PROD001
Cantidad: 100

Ubicación: A-01-02
Código: PROD002
Cantidad: 50

Ubicación: B-02-01
Código: PROD003
Cantidad: 200
```

---

## ✅ RESULTADO ESPERADO

Al finalizar todas las pruebas:

1. **Hoja PICKING**: Vacía (o solo con N.V no completadas)
2. **Hoja PACKING**: Contiene las N.V completadas
3. **Hoja OBS**: Contiene registros de productos no encontrados/dañados
4. **Hoja PICKING_LOG**: Contiene registros de cada picking
5. **Hoja ESTADO_LOG**: Contiene registros de cambios de estado
6. **Hoja UBICACIONES**: Stock descontado correctamente
7. **Hoja N.V DIARIAS**: Estados actualizados correctamente

---

## 🚀 SIGUIENTE PASO

Una vez que el Picking funcione correctamente, implementar el mismo flujo para:

1. **PACKING MODULE**
   - Leer de hoja PACKING
   - Botón "Packing Completo" → migrar a SHIPPING
   - Mismas opciones de observaciones

2. **SHIPPING MODULE**
   - Leer de hoja SHIPPING
   - Marcar como despachado
   - Generar documentos

---

**¡LISTO PARA PROBAR!** 🎉
