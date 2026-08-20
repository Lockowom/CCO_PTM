# Coordinación Rutas — Capacidad y flota V1

## Estado

- Release status: `PRIVATE_BETA`.
- Visible solo con feature flag, rol `cco_private_beta_rutas` y permiso IAM específico.
- La autorización real vive en PostgreSQL; ocultar la ruta en React no es el control de seguridad.
- No cambia la secuencia oficial de estados de N.V.

## Flujo operativo

1. El catálogo lista solamente N.V. activas en `Shipping` y sin pausa operacional.
2. Para cada N.V. se registra el peso total y uno o más grupos de bultos.
3. Cada grupo conserva cantidad, largo, ancho y alto; el volumen se calcula en m³.
4. Se seleccionan hasta 100 N.V. para formar una carga consolidada.
5. La comparación valida capacidad por peso, volumen y cantidad máxima de paradas.
6. El costo propio usa costo fijo por viaje más costo variable por kilómetro.
7. El externo usa cargo base, N.V., bultos, kg, m³, km, mínimo y recargos.
8. La decisión elegida queda auditada con un snapshot inmutable de los datos usados.

## Reglas de cubicaje

`volumen_m3 = cantidad × largo_cm × ancho_cm × alto_cm / 1.000.000`

- Dimensiones: 1–400 cm.
- Cantidad por grupo: 1–10.000.
- Máximo: 50 grupos por N.V.
- La suma de grupos debe coincidir con los bultos ya registrados en la N.V.
- El guardado bloquea la fila y solo permite editar mientras siga en `Shipping`.

## Recomendaciones automáticas

- `COMPLETAR_DATOS`: falta peso o volumen.
- `EXTERNO_OBLIGATORIO`: excede peso, volumen o máximo de paradas.
- `CONSOLIDAR_ANTES_DE_SALIR`: vehículo propio más barato, pero bajo ocupación mínima.
- `PROPIA_RECOMENDADA`: cabe y tiene menor costo estimado.
- `EXTERNA_RECOMENDADA`: el transportista tiene menor costo estimado.

## Seguridad

- Tablas nuevas con RLS activa y solo `SELECT` directo al rol autenticado autorizado.
- Escrituras exclusivamente mediante RPC `SECURITY DEFINER` con `search_path=''` y gate IAM.
- `PUBLIC` y `anon` no ejecutan las RPC ni leen tablas/secuencias.
- El propietario inicial se asigna por migración al rol privado; no existe autorización runtime por
  UUID hardcodeado.

## Despliegue

1. Ejecutar la migración `20260820163037_coord_rutas_capacity_fleet_v1_polished.sql`.
2. Ejecutar advisors de seguridad y rendimiento.
3. Desplegar frontend solo después de confirmar que el RPC `coord_rutas_capacidad_catalogo()` existe.
4. Validar con el usuario piloto que “Capacidad y flota” carga, guarda cubicaje y registra decisiones.

## Rollback funcional

Apagar `module_rutas_private_beta` oculta el módulo inmediatamente sin perder datos. Si se necesita
revertir solo la ampliación, retirar el tab del frontend y revocar `EXECUTE` de sus cuatro RPC nuevas;
las columnas y tablas deben conservarse hasta exportar la auditoría, evitando pérdida de información.
