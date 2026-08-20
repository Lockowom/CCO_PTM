# Supabase Advisor · baseline 2026-08-20

Consulta live posterior a la prueba transaccional (la migración fue revertida).

## Seguridad — 299 avisos legacy

- 14 tablas con RLS y sin policy.
- 5 funciones con `search_path` mutable.
- 1 materialized view expuesta por API.
- 2 funciones `security definer` ejecutables por `anon`.
- 276 funciones `security definer` ejecutables por `authenticated`.
- Protección de contraseñas filtradas desactivada.

## Rendimiento — 182 avisos legacy

- 12 foreign keys sin índice de cobertura.
- 1 tabla sin primary key.
- 159 índices no usados (no eliminar sin ventana representativa).
- 10 casos de policies permisivas múltiples.

Estos avisos son baseline, no regresiones atribuidas al SQL probado con `ROLLBACK`. Se corrigen en
PRs pequeños por dominio después de demostrar equivalencia funcional; revocar masivamente rompería
clientes actuales. Referencia: [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter).
