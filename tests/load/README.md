# Carga CCO 2.0

Ejecutar exclusivamente contra staging autorizado:

```bash
k6 run -e CCO_BASE_URL=https://staging.example.test tests/load/cco2-smoke.k6.js
```

Registrar commit, configuración, p50/p95/p99, error rate, pool y recursos. Este smoke no sustituye
escenarios autenticados de N.V., WMS, Calidad y TMS ni autoriza una prueba contra producción.
