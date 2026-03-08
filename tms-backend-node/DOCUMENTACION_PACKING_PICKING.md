# Documentación: Packing/Picking – Resumen de Implementación

## Objetivo
- Medir tiempos de Packing sin penalizar errores atribuibles a Picking.
- Permitir “Devolver a Picking” para registrar y gestionar errores detectados en Packing.
- Enfocar la vista de Packing en un resumen por cliente: clientes en proceso, N.V. por cliente e ítems.

## Cambios Clave
- Se añadió el botón “Devolver a Picking” en Packing con modal de motivo; registra el error y devuelve la N.V.
- Se excluye del KPI de Packing todo tramo de tiempo asociado a errores, marcando la medición como RECHAZADO.
- Se reemplazó el panel de métricas técnicas por un “Resumen de Clientes en Proceso”, agrupando N.V. por cliente.
- En Administración (Mediciones) se agregaron columnas de errores y una tabla de detalle para análisis.

## Arquitectura y Datos
- Frontend: React + Tailwind; estado local para modales; sincronización en tiempo real con Supabase.
- Backend/Datos: Supabase Postgres con RLS.
- Tablas relevantes:
  - tms_mediciones_tiempos: mediciones de tiempo por proceso (EN_PROCESO, FINALIZADO, RECHAZADO).
  - tms_errores_picking: registro de errores detectados en Packing, atribuibles a Picking.

### Estados y reglas
- Al detectar un error durante Packing:
  - Se actualiza la medición activa de Packing (para la N.V.) a estado RECHAZADO.
  - Se inserta un registro en tms_errores_picking con motivo, usuario y fecha.
  - El tiempo marcado como RECHAZADO no entra en los KPIs de Packing.

## Flujo de Usuario
### Packing
1. Visualiza “Resumen de Clientes” con:
   - Cantidad de clientes en proceso.
   - Total de N.V. en proceso.
   - Tarjetas por cliente con conteo de N.V. e ítems.
2. Si detecta un error de Picking, pulsa “Devolver a Picking”, completa motivo y confirma.
3. El sistema registra el error y marca el tiempo de Packing como RECHAZADO.

### Administración
- Revisa métricas por usuario (Picking/Packing) y tabla de errores.
- Observa porcentaje de errores para orientar capacitación/mejora.

## Métricas
- Packing:
  - Computa solo tiempos con estado FINALIZADO.
  - Excluye tramos RECHAZADO (errores atribuibles a Picking).
- Errores:
  - Conteo de errores y % sobre Picking para visibilidad operativa.

## Archivos Modificados
- Packing.jsx: “Resumen de Clientes”, botón/flujo “Devolver a Picking”, lógica de exclusión de tiempos  
  [Packing.jsx](file:///c:/Users/crisc/Documents/PROYECT CCO/tms-backend-node/CCO_PTM/src/pages/Outbound/Packing.jsx)
- Mediciones.jsx: columnas de errores y tabla de detalle  
  [Mediciones.jsx](file:///c:/Users/crisc/Documents/PROYECT CCO/tms-backend-node/CCO_PTM/src/pages/Admin/Mediciones.jsx)

## SQL de Soporte
- Creación de tabla de errores con RLS:  
  [CREATE_ERRORES_PICKING_TABLE.sql](file:///c:/Users/crisc/Documents/PROYECT CCO/tms-backend-node/CREATE_ERRORES_PICKING_TABLE.sql)

Ejemplo de estructura:

```sql
CREATE TABLE IF NOT EXISTS public.tms_errores_picking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    usuario_picking_id UUID REFERENCES auth.users(id),
    usuario_picking_nombre TEXT,
    usuario_packing_id UUID REFERENCES auth.users(id),
    usuario_packing_nombre TEXT,
    motivo TEXT,
    fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Notas Operativas
- Mantener RLS activo en tablas sensibles.
- El botón “Devolver a Picking” debe usarse únicamente para errores imputables a Picking.
- El resumen por cliente facilita priorización y balanceo de carga por cuenta.

