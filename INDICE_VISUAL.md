# 🗺️ ÍNDICE VISUAL - DOCUMENTACIÓN CCO WMS

## 📚 Mapa de Documentación

```
┌─────────────────────────────────────────────────────────────────┐
│                   DOCUMENTACIÓN CCO WMS                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  README_DOCUMENTACION.md (COMIENZA AQUÍ)                │  │
│  │  - Resumen ejecutivo                                    │  │
│  │  - Guía rápida                                          │  │
│  │  - Índice de documentos                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DOCUMENTACION_TECNICA.md (FUNDAMENTOS)                 │  │
│  │  - Visión general                                       │  │
│  │  - Stack tecnológico                                    │  │
│  │  - Arquitectura                                         │  │
│  │  - Componentes principales                              │  │
│  │  - Servicios                                            │  │
│  │  - Contextos                                            │  │
│  │  - Rutas y permisos                                     │  │
│  │  - Base de datos                                        │  │
│  │  - Librerías                                            │  │
│  │  - Deployment                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  COMPONENTES_DETALLADOS.md (MÓDULOS)                    │  │
│  │  - Componentes de UI                                    │  │
│  │  - Páginas por módulo                                   │  │
│  │  - Patrones de diseño                                   │  │
│  │  - Ejemplos de uso                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GUIA_DESARROLLO.md (PRÁCTICO)                          │  │
│  │  - Configuración del entorno                            │  │
│  │  - Estructura de carpetas                               │  │
│  │  - Convenciones de código                               │  │
│  │  - Flujos de trabajo                                    │  │
│  │  - Mejores prácticas                                    │  │
│  │  - Troubleshooting                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ARQUITECTURA_BD.md (BASE DE DATOS)                     │  │
│  │  - Diagrama ER                                          │  │
│  │  - Tablas principales                                   │  │
│  │  - Relaciones                                           │  │
│  │  - Índices                                              │  │
│  │  - Funciones RPC                                        │  │
│  │  - Políticas de seguridad                               │  │
│  │  - Triggers                                             │  │
│  │  - Vistas                                               │  │
│  │  - Mantenimiento                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Flujo de Lectura Recomendado

### Para Desarrolladores Nuevos
```
1. README_DOCUMENTACION.md
   ↓
2. DOCUMENTACION_TECNICA.md (Secciones 1-3)
   ↓
3. GUIA_DESARROLLO.md (Sección 1)
   ↓
4. COMPONENTES_DETALLADOS.md (Tu módulo)
   ↓
5. GUIA_DESARROLLO.md (Secciones 3-5)
   ↓
6. Empezar a desarrollar
```

### Para Arquitectos
```
1. README_DOCUMENTACION.md
   ↓
2. DOCUMENTACION_TECNICA.md (Completo)
   ↓
3. ARQUITECTURA_BD.md (Completo)
   ↓
4. COMPONENTES_DETALLADOS.md (Resumen)
```

### Para DevOps
```
1. README_DOCUMENTACION.md
   ↓
2. DOCUMENTACION_TECNICA.md (Sección 10)
   ↓
3. GUIA_DESARROLLO.md (Sección 1)
   ↓
4. ARQUITECTURA_BD.md (Sección 8)
```

---

## 📑 Tabla de Contenidos Completa

### DOCUMENTACION_TECNICA.md
```
1. Visión General
   - Características clave
   - Stack tecnológico

2. Stack Tecnológico
   - Frontend
   - Backend & BD
   - Librerías principales
   - Mobile & PWA
   - DevDependencies

3. Arquitectura del Proyecto
   - Estructura de carpetas
   - Componentes principales

4. Componentes Principales
   - Layout.jsx
   - Navbar.jsx
   - Dashboard.jsx
   - Login.jsx

5. Contextos y Estado Global
   - AuthContext.jsx
   - ConfigContext.jsx

6. Rutas y Permisos
   - Mapeo de rutas
   - ProtectedRoute
   - SmartRedirect

7. Base de Datos
   - Tablas principales (12)
   - Relaciones

8. Servicios y Lógica
   - inventoryService.js
   - wmsLogic.js
   - useConductores.js

9. Componentes de Gráficos
   - BarChart
   - PieChart
   - AreaChart

10. Estilos y Diseño
    - Tailwind CSS
    - Animaciones GSAP

11. Configuración y Deployment
    - Variables de entorno
    - Scripts de build
    - Vite Configuration
    - Capacitor Configuration
    - PWA Manifest

12. Características Mobile
    - Capacitor Android
    - PWA Features

13. Flujo de Datos
    - Autenticación
    - Autorización
    - Datos

14. Seguridad
    - Autenticación
    - Autorización
    - Datos

15. Performance
    - Optimizaciones
    - Monitoreo

16. Debugging
    - Logs disponibles

17. Recursos Adicionales
    - Documentación oficial
    - Comandos útiles
```

### COMPONENTES_DETALLADOS.md
```
1. Componentes de UI
   - StatCard
   - PipelineStep
   - ClockWidget
   - MobileMenu

2. Páginas del Sistema
   - Módulo TMS (6 páginas)
   - Módulo Inbound (4 páginas)
   - Módulo Outbound (5 páginas)
   - Módulo Inventory (6 páginas)
   - Módulo Quality (1 página)
   - Módulo Analytics (2 páginas)
   - Módulo Queries (8 páginas)
   - Módulo Admin (13 páginas)

3. Patrones de Diseño
   - Patrón Context + Hook
   - Patrón Realtime Subscription
   - Patrón Protected Route
   - Patrón Custom Hook

4. Ejemplos de Uso
   - Crear componente
   - Usar Realtime
   - Usar Custom Hook
```

### GUIA_DESARROLLO.md
```
1. Configuración del Entorno
   - Requisitos previos
   - Instalación inicial
   - Configuración de Supabase

2. Estructura de Carpetas
   - Crear nueva página
   - Crear nuevo componente
   - Crear nuevo servicio

3. Convenciones de Código
   - Nombres de archivos
   - Estructura de componentes
   - Estilos Tailwind
   - Comentarios

4. Flujos de Trabajo
   - Flujo de desarrollo
   - Flujo de autenticación
   - Flujo de permisos
   - Flujo de Realtime

5. Mejores Prácticas
   - Manejo de errores
   - Limpieza de efectos
   - Validación de permisos
   - Optimización de renders
   - Logs útiles
   - Animaciones
   - Notificaciones
   - Nombres descriptivos

6. Troubleshooting
   - Cannot find module
   - Supabase no conecta
   - Permisos no se cargan
   - Realtime no actualiza
   - Build falla
   - Estilos no aplican
   - Componente no renderiza

7. Recursos Útiles
   - Documentación
   - Herramientas
   - Extensiones VS Code

8. Checklist de Desarrollo
```

### ARQUITECTURA_BD.md
```
1. Diagrama ER
   - Relaciones visuales

2. Tablas Principales
   - tms_usuarios
   - tms_roles
   - tms_nv_diarias
   - tms_partidas
   - tms_series
   - wms_inventory
   - wms_movements
   - tms_conductores
   - tms_usuarios_activos
   - tms_accesos
   - tms_modules_config
   - tms_farmapack

3. Relaciones
   - Relaciones principales
   - Integridad referencial

4. Índices
   - Índices recomendados
   - Análisis de índices

5. Funciones RPC
   - get_fefo_allocation
   - wms_move_stock
   - wms_reserve_stock

6. Políticas de Seguridad
   - Habilitar RLS
   - Políticas de ejemplo

7. Triggers
   - Actualizar updated_at
   - Validar stock negativo
   - Auditoría de cambios

8. Vistas
   - Vista: Resumen de N.V.
   - Vista: Stock por ubicación
   - Vista: Usuarios activos

9. Consultas Útiles
   - Estadísticas de N.V.
   - Stock bajo
   - Movimientos por usuario
   - Lotes próximos a vencer

10. Mantenimiento
    - Backup
    - Restore
    - Optimización
```

---

## 🔍 Búsqueda Rápida

### Por Tema

#### Autenticación
- DOCUMENTACION_TECNICA.md → Sección 5
- GUIA_DESARROLLO.md → Sección 4 (Flujo de autenticación)
- ARQUITECTURA_BD.md → Tabla tms_usuarios

#### Permisos
- DOCUMENTACION_TECNICA.md → Sección 6
- COMPONENTES_DETALLADOS.md → Patrones de diseño
- GUIA_DESARROLLO.md → Sección 4 (Flujo de permisos)

#### Base de Datos
- ARQUITECTURA_BD.md → Completo
- DOCUMENTACION_TECNICA.md → Sección 7

#### Componentes
- COMPONENTES_DETALLADOS.md → Completo
- DOCUMENTACION_TECNICA.md → Sección 4

#### Desarrollo
- GUIA_DESARROLLO.md → Completo
- DOCUMENTACION_TECNICA.md → Sección 3

#### Módulos
- COMPONENTES_DETALLADOS.md → Sección 2
- DOCUMENTACION_TECNICA.md → Sección 4

---

## 🎯 Por Rol

### Desarrollador Frontend
```
Leer:
1. DOCUMENTACION_TECNICA.md (Secciones 1-4)
2. COMPONENTES_DETALLADOS.md (Completo)
3. GUIA_DESARROLLO.md (Secciones 1-5)

Referencia:
- DOCUMENTACION_TECNICA.md (Sección 6)
- GUIA_DESARROLLO.md (Sección 6)
```

### Desarrollador Backend
```
Leer:
1. DOCUMENTACION_TECNICA.md (Secciones 1-2, 7-8)
2. ARQUITECTURA_BD.md (Completo)
3. GUIA_DESARROLLO.md (Sección 1)

Referencia:
- DOCUMENTACION_TECNICA.md (Sección 5)
- ARQUITECTURA_BD.md (Secciones 5-8)
```

### DevOps/Deployment
```
Leer:
1. DOCUMENTACION_TECNICA.md (Secciones 1-2, 10)
2. GUIA_DESARROLLO.md (Sección 1)
3. ARQUITECTURA_BD.md (Sección 8)

Referencia:
- README_DOCUMENTACION.md
- DOCUMENTACION_TECNICA.md (Sección 10)
```

### Arquitecto
```
Leer:
1. DOCUMENTACION_TECNICA.md (Completo)
2. ARQUITECTURA_BD.md (Completo)
3. COMPONENTES_DETALLADOS.md (Resumen)

Referencia:
- GUIA_DESARROLLO.md (Secciones 4-5)
```

### QA/Tester
```
Leer:
1. README_DOCUMENTACION.md
2. DOCUMENTACION_TECNICA.md (Secciones 1, 6)
3. COMPONENTES_DETALLADOS.md (Sección 2)

Referencia:
- GUIA_DESARROLLO.md (Sección 6)
```

---

## 📊 Estadísticas de Documentación

### Por Documento
| Documento | Secciones | Tablas | Ejemplos | Código |
|-----------|-----------|--------|----------|--------|
| DOCUMENTACION_TECNICA.md | 10 | 15+ | 20+ | 50+ |
| COMPONENTES_DETALLADOS.md | 4 | 8+ | 15+ | 30+ |
| GUIA_DESARROLLO.md | 6 | 5+ | 25+ | 40+ |
| ARQUITECTURA_BD.md | 8 | 12+ | 20+ | 60+ |

### Por Tema
| Tema | Documentos | Secciones |
|------|-----------|-----------|
| Autenticación | 3 | 5 |
| Permisos | 3 | 4 |
| Base de Datos | 2 | 8 |
| Componentes | 2 | 6 |
| Desarrollo | 2 | 8 |
| Módulos | 2 | 10 |

---

## 🔗 Enlaces Cruzados

### DOCUMENTACION_TECNICA.md
- → COMPONENTES_DETALLADOS.md (Sección 4)
- → GUIA_DESARROLLO.md (Sección 1)
- → ARQUITECTURA_BD.md (Sección 2)

### COMPONENTES_DETALLADOS.md
- → DOCUMENTACION_TECNICA.md (Sección 4)
- → GUIA_DESARROLLO.md (Sección 3)
- → ARQUITECTURA_BD.md (Sección 2)

### GUIA_DESARROLLO.md
- → DOCUMENTACION_TECNICA.md (Sección 3)
- → COMPONENTES_DETALLADOS.md (Sección 1)
- → ARQUITECTURA_BD.md (Sección 1)

### ARQUITECTURA_BD.md
- → DOCUMENTACION_TECNICA.md (Sección 7)
- → GUIA_DESARROLLO.md (Sección 4)
- → COMPONENTES_DETALLADOS.md (Sección 2)

---

## 🎓 Rutas de Aprendizaje

### Ruta 1: Principiante (1-2 semanas)
```
Día 1-2: README_DOCUMENTACION.md + DOCUMENTACION_TECNICA.md (Secciones 1-3)
Día 3-4: GUIA_DESARROLLO.md (Sección 1)
Día 5-7: COMPONENTES_DETALLADOS.md (Tu módulo)
Día 8-10: GUIA_DESARROLLO.md (Secciones 3-5)
Día 11-14: Práctica: Crear componente simple
```

### Ruta 2: Intermedio (2-4 semanas)
```
Semana 1: DOCUMENTACION_TECNICA.md (Completo)
Semana 2: ARQUITECTURA_BD.md (Secciones 1-4)
Semana 3: GUIA_DESARROLLO.md (Completo)
Semana 4: Práctica: Crear módulo completo
```

### Ruta 3: Avanzado (4-8 semanas)
```
Semana 1-2: ARQUITECTURA_BD.md (Completo)
Semana 3-4: DOCUMENTACION_TECNICA.md (Profundo)
Semana 5-6: COMPONENTES_DETALLADOS.md (Análisis)
Semana 7-8: Práctica: Optimizar y refactorizar
```

---

## 🚀 Checklist de Lectura

### Antes de Empezar
- [ ] Leer README_DOCUMENTACION.md
- [ ] Entender estructura del proyecto
- [ ] Configurar entorno

### Antes de Desarrollar
- [ ] Leer DOCUMENTACION_TECNICA.md (Secciones 1-3)
- [ ] Leer GUIA_DESARROLLO.md (Secciones 1-3)
- [ ] Leer COMPONENTES_DETALLADOS.md (Tu módulo)

### Antes de Hacer Commit
- [ ] Seguir convenciones (GUIA_DESARROLLO.md Sección 3)
- [ ] Aplicar mejores prácticas (GUIA_DESARROLLO.md Sección 5)
- [ ] Verificar checklist (GUIA_DESARROLLO.md Sección 8)

### Antes de Desplegar
- [ ] Leer DOCUMENTACION_TECNICA.md (Sección 10)
- [ ] Leer ARQUITECTURA_BD.md (Sección 8)
- [ ] Verificar configuración

---

## 📞 Preguntas Frecuentes

### ¿Por dónde empiezo?
→ README_DOCUMENTACION.md → DOCUMENTACION_TECNICA.md

### ¿Cómo creo un componente?
→ GUIA_DESARROLLO.md (Sección 2) → COMPONENTES_DETALLADOS.md (Ejemplos)

### ¿Cómo funciona la autenticación?
→ DOCUMENTACION_TECNICA.md (Sección 5) → ARQUITECTURA_BD.md (Tabla tms_usuarios)

### ¿Cómo agrego un nuevo módulo?
→ COMPONENTES_DETALLADOS.md (Sección 2) → GUIA_DESARROLLO.md (Sección 2)

### ¿Cómo optimizo la BD?
→ ARQUITECTURA_BD.md (Secciones 4, 8)

### ¿Cómo resuelvo un error?
→ GUIA_DESARROLLO.md (Sección 6)

---

## 📈 Progreso de Lectura

```
Principiante:     ████░░░░░░ 40%
Intermedio:       ████████░░ 80%
Avanzado:         ██████████ 100%
```

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
**Estado:** ✅ Completa
