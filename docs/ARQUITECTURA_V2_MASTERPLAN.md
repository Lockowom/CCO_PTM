# Arquitectura V2 Master Plan

## Objetivo

Elevar el CCO desde un monolito modular funcional a una plataforma gobernable, reusable y más resistente a regresiones, sin reescritura total ni cambios destructivos sobre la base de datos.

## Principios

- Mantener `React + Vite + Supabase + PostgreSQL + Capacitor`.
- Separar negocio, aplicación e infraestructura.
- Extraer motores reutilizables en vez de seguir creciendo por pantallas.
- Endurecer calidad antes de aumentar complejidad.
- Aplicar observabilidad y contratos desde los bordes.

## Capas objetivo

```text
UI / App Shell
↓
Application Layer
↓
Domain Layer
↓
Engine Layer
↓
Infrastructure Layer
↓
Supabase / Postgres / Realtime / Push / Storage
```

## Núcleo creado

- `src/core/domain`
- `src/core/application`
- `src/core/contracts`
- `src/core/infrastructure`
- `src/engines/*`

Estas carpetas quedan como base obligatoria para código nuevo y para refactors graduales de módulos existentes.

## Motores objetivo

### Workflow Engine

- estados
- transiciones
- guards
- permisos por transición
- historial

### Rule Engine

- validaciones
- derivaciones
- scoring
- semáforos y priorización

### Form Engine

- schema declarativo
- defaults
- visibilidad condicional
- required dinámico
- autocompletado

### Event Engine

- eventos de dominio
- jobs de notificación
- salidas `in-app`, `push`, correo

### Authz Engine

- `canRoute`
- `canAction`
- `canTab`
- filtros por scope

### Observability Engine

- trazas async
- medición sync
- correlation id
- timing de operaciones

## Reglas de evolución

- Las pantallas no deberían hablar directo con Supabase si existe un caso de uso o repositorio del dominio.
- Los RPCs compartidos se consumen por wrappers comunes y no con helpers duplicados.
- La validación runtime debe vivir en contratos y schemas, no solo en UI.
- Los hooks de React Query deben colgar de casos de uso o repositorios de dominio.
- La observabilidad debe envolverse en helpers comunes, no en `console.*`.

## Prioridades

### P1

- quality gates
- contratos de entorno
- wrappers comunes de RPC
- observabilidad reusable

### P2

- Panel como dominio piloto
- Auth/IAM como dominio crítico
- notificaciones y workflows sobre motores

### P3

- formularios y reglas declarativas
- suite E2E crítica
- runbooks operativos

## Estándar de código nuevo

- usar `src/core/*` o `src/engines/*` cuando aplique
- preferir contratos y wrappers compartidos
- no agregar acceso directo a Supabase si ya existe adaptador reusable
- no usar `console.*` fuera del logger o debugging temporal controlado
- agregar tests en cambios sensibles de negocio
