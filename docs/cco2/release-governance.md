# CCO 2.0 · Gobierno de releases

1. Congelar baseline y generar inventarios con `npm run cco2:baseline`.
2. Ejecutar secret scan, lint, typecheck, unit, build y contratos.
3. Probar SQL con transacción y rollback; revisar Advisors.
4. Desplegar primero a staging con flags apagados.
5. Habilitar piloto por rol; observar métricas y errores.
6. Cutover solo con `LOSS=0`, rollback probado y aprobación de negocio.

No se mezclan fundación, rediseño global y migración destructiva en una sola publicación.
