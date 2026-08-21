# PR25 · Performance hardening

## Medición reproducible

```bash
npm run build
npm run perf:bundle
npx playwright test tests/e2e/performance.spec.ts
```

La auditoría falla si un chunk normal supera 650 KiB raw o si un artefacto pesado aislado (`pdfmake`, fuentes PDF o XLSX) supera 1.400 KiB. Los 15 chunks mayores quedan visibles en CI/local.

## Offenders observados

- `pdfmake` y `vfs_fonts`: aislados en chunks lazy de exportación.
- `xlsx`: aislado para cargas/exportaciones, no forma parte del arranque público.
- Recharts: separado como `charts-vendor`.
- Leaflet: cargado por la ruta/mapa, no por Login.
- Flujo Maestro: ruta lazy; requiere revisión posterior si su frecuencia de uso aumenta.

Las listas de Ubicaciones ya usan `@tanstack/react-virtual`. Las suscripciones inspeccionadas limpian sus canales al desmontar; la certificación de carga concurrente permanece en la beta interna.

## Presupuestos operativos

- objetivo móvil: al menos 50 FPS;
- transición percibida: menos de 300 ms;
- feedback de acción crítica: hasta 150 ms cuando sea viable;
- cero long tasks superiores a 300 ms durante la estabilización de Login/Consulta.

## Rollback

Revertir este PR sólo retira gates y documentación; no cambia contratos ni datos.
