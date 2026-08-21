# PR24 · Certificación de accesibilidad

Baseline: WCAG 2.2 AA.

## Controles automatizados

- Login navegable con Tab y activación con Space.
- Nombre accesible para usuario, contraseña, visibilidad de contraseña, MFA y búsqueda pública.
- Estado `aria-pressed` en mostrar/ocultar contraseña.
- Consulta pública con control de limpieza identificable.
- `prefers-reduced-motion: reduce` elimina animaciones y transiciones decorativas.
- Overlay compartido mantiene focus trap, Escape y devolución del foco al trigger.

```bash
npx playwright test tests/e2e/accessibility.spec.ts
```

## Inspección manual de salida

Antes del cutover se exige revisar contraste, zoom 200%, lector de pantalla, orden de encabezados, mensajes de error, targets táctiles y que ningún estado dependa sólo del color. Un hallazgo crítico bloquea la ruta.

## Rollback

Revertir el PR restaura el markup anterior. No se modificaron Auth, IAM, RLS ni lógica de negocio.
