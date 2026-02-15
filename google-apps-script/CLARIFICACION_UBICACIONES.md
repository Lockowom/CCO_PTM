# CLARIFICACIÓN: UBICACIONES vs INGRESO

## RESUMEN
**HOJA CORRECTA: UBICACIONES** ✅

## SITUACIÓN ENCONTRADA

Había confusión sobre qué hoja usar para buscar ubicaciones de productos:
- **PickingUbicaciones.gs** → usa hoja **UBICACIONES** ✅ (CORRECTO)
- **PickingEnhanced.gs** → usa hoja **INGRESO** ❌ (OBSOLETO)

## CONFIRMACIÓN DEL USUARIO
El usuario confirmó que **UBICACIONES es la hoja correcta**.

## ESTRUCTURA DE LA HOJA UBICACIONES

```
Columna A = UBICACION
Columna B = CODIGO
Columna C = SERIE
Columna D = PARTIDA
Columna E = PIEZA
Columna F = FECHA_VENCIMIENTO
Columna G = TALLA
Columna H = COLOR
Columna I = CANTIDAD_CONTADA
Columna J = DESCRIPCION
```

**Solo se muestran columnas A-J en el módulo de picking** (según requerimientos del usuario).

## ARCHIVO ACTIVO

**PickingUbicaciones.gs** es el archivo que está siendo usado actualmente:

### Funciones principales:
1. `getUbicacionesDisponibles(codigoProducto)` - Obtiene todas las ubicaciones de un producto
2. `validarStockUbicacion(ubicacion, codigo, cantidad)` - Valida stock disponible
3. `descontarStockUbicacion(ubicacion, codigo, cantidad)` - Descuenta stock al confirmar picking
4. `getStockTotalProducto(codigoProducto)` - Obtiene stock total en todas las ubicaciones
5. `buscarUbicacionEspecifica(ubicacion, codigo)` - Busca una ubicación específica

### Frontend:
El archivo `Picking_Page.html` llama a `getUbicacionesDisponibles()` correctamente.

## ARCHIVO OBSOLETO

**PickingEnhanced.gs** es un archivo antiguo que:
- Usa la hoja **INGRESO** (incorrecta)
- Tiene mapeo de columnas diferente
- NO está siendo usado por el frontend actual
- Puede ser ignorado o eliminado

## CONCLUSIÓN

✅ **La implementación actual es CORRECTA**
✅ **PickingUbicaciones.gs** lee de la hoja **UBICACIONES**
✅ **El frontend está conectado correctamente**
❌ **PickingEnhanced.gs** es obsoleto y no debe usarse

## DATOS DEL SISTEMA

- Usuario tiene **5700 filas** en la hoja UBICACIONES
- Sistema soporta **2 usuarios trabajando simultáneamente** en picking
- Búsqueda optimizada con filtrado por código y cantidad > 0
- Ordenamiento por cantidad disponible (mayor a menor)

## PRÓXIMOS PASOS

No se requieren cambios. La implementación actual es correcta y funcional.

Si se desea limpiar el código:
1. Eliminar o archivar `PickingEnhanced.gs`
2. Documentar que UBICACIONES es la única fuente de verdad para ubicaciones
