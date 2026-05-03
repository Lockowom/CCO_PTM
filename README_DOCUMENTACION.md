# 📚 DOCUMENTACIÓN TÉCNICA - CCO WMS

## 🎯 Resumen Ejecutivo

**CCO WMS** es una plataforma integral de gestión de almacén y transporte desarrollada con tecnologías modernas. Este repositorio contiene la documentación técnica completa del proyecto.

### 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de Código** | ~15,000+ |
| **Componentes React** | 50+ |
| **Páginas/Vistas** | 40+ |
| **Tablas BD** | 12+ |
| **Funciones RPC** | 5+ |
| **Permisos Granulares** | 30+ |
| **Módulos Principales** | 8 |

---

## 📖 Documentos Disponibles

### 1. **DOCUMENTACION_TECNICA.md** ⭐ COMIENZA AQUÍ
**Descripción:** Documentación técnica completa del proyecto
**Contenido:**
- Visión general del sistema
- Stack tecnológico completo
- Arquitectura del proyecto
- Componentes principales
- Servicios y lógica de negocio
- Contextos y estado global
- Rutas y permisos
- Base de datos
- Librerías utilizadas
- Configuración y deployment

**Cuándo leerlo:** Primero, para entender la estructura general

---

### 2. **COMPONENTES_DETALLADOS.md** 🧩
**Descripción:** Guía detallada de todos los componentes
**Contenido:**
- Componentes de UI reutilizables
- Páginas del sistema por módulo
- Patrones de diseño
- Ejemplos de uso

**Módulos Cubiertos:**
- TMS (Transporte)
- Inbound (Recepción)
- Outbound (Despacho)
- Inventory (Inventario)
- Quality (Calidad)
- Analytics (Reportes)
- Queries (Consultas)
- Admin (Administración)

**Cuándo leerlo:** Cuando necesites entender un componente específico

---

### 3. **GUIA_DESARROLLO.md** 🚀
**Descripción:** Guía práctica para desarrolladores
**Contenido:**
- Configuración del entorno
- Estructura de carpetas
- Convenciones de código
- Flujos de trabajo
- Mejores prácticas
- Troubleshooting

**Cuándo leerlo:** Antes de empezar a desarrollar

---

### 4. **ARQUITECTURA_BD.md** 💾
**Descripción:** Arquitectura completa de base de datos
**Contenido:**
- Diagrama ER
- Tablas principales
- Relaciones
- Índices
- Funciones RPC
- Políticas de seguridad
- Triggers
- Vistas
- Consultas útiles
- Mantenimiento

**Cuándo leerlo:** Cuando trabajes con datos o BD

---

## 🚀 Quick Start

### Para Desarrolladores Nuevos

1. **Lee primero:** `DOCUMENTACION_TECNICA.md` (Secciones 1-3)
2. **Configura:** `GUIA_DESARROLLO.md` (Sección 1)
3. **Entiende:** `COMPONENTES_DETALLADOS.md` (Tu módulo específico)
4. **Desarrolla:** Sigue las convenciones en `GUIA_DESARROLLO.md`

### Para Arquitectos/Leads

1. **Visión General:** `DOCUMENTACION_TECNICA.md` (Completo)
2. **Arquitectura:** `ARQUITECTURA_BD.md` (Completo)
3. **Componentes:** `COMPONENTES_DETALLADOS.md` (Resumen)

### Para DevOps/Deployment

1. **Configuración:** `DOCUMENTACION_TECNICA.md` (Sección 10)
2. **Build:** `GUIA_DESARROLLO.md` (Sección 1)
3. **BD:** `ARQUITECTURA_BD.md` (Sección 8)

---

## 🏗️ Estructura del Proyecto

```
CCO_PTM/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── context/             # Contextos (Auth, Config)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilidades
│   ├── pages/               # Páginas/Vistas
│   │   ├── Admin/           # Módulo Admin
│   │   ├── Analytics/       # Reportes
│   │   ├── Inbound/         # Recepción
│   │   ├── Inventory/       # Inventario
│   │   ├── Mobile/          # Apps móviles
│   │   ├── Outbound/        # Despacho
│   │   ├── QualityControl/  # Calidad
│   │   ├── Queries/         # Consultas
│   │   └── TMS/             # Transporte
│   ├── services/            # Servicios
│   ├── App.jsx              # Componente raíz
│   ├── main.jsx             # Punto de entrada
│   └── supabase.js          # Config Supabase
├── android/                 # Proyecto Android
├── public/                  # Archivos estáticos
├── vite.config.js           # Config Vite
├── capacitor.config.json    # Config Capacitor
├── package.json             # Dependencias
└── .env.example             # Variables de entorno
```

---

## 🔑 Conceptos Clave

### Autenticación
- Login con email/contraseña
- Sesión persistente en localStorage
- Heartbeat cada 30 segundos
- Vigilancia de cambios en usuario

### Autorización
- Permisos granulares por rol
- Validación en rutas
- Bypass automático para ADMIN
- Módulos habilitables/deshabilitables

### Realtime
- Suscripción a cambios en BD
- Notificaciones automáticas
- Sincronización en tiempo real
- Actualización de UI sin refresh

### Componentes
- Reutilizables y composables
- Props bien documentadas
- Manejo de errores
- Animaciones suaves

---

## 📚 Tecnologías Principales

### Frontend
- **React 18.2.0** - Framework UI
- **Vite 5.0.0** - Build tool
- **Tailwind CSS 3.3.5** - Estilos
- **React Router 6.20.0** - Enrutamiento

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos
- **Realtime** - Sincronización

### Librerías
- **GSAP 3.14.2** - Animaciones
- **Recharts 3.7.0** - Gráficos
- **Leaflet 1.9.4** - Mapas
- **Lucide React 0.294.0** - Iconos
- **Sonner 2.0.7** - Notificaciones

### Mobile
- **Capacitor 8.2.0** - Apps nativas
- **PWA Plugin** - Progressive Web App

---

## 🎯 Módulos del Sistema

### 1. **TMS** (Transportation Management System)
- Planificación de rutas
- Torre de control
- Gestión de conductores
- Gestión de patios

### 2. **Inbound** (Recepción)
- Recepción de mercancía
- Cubicaje (pesos/dimensiones)
- Ingreso (Putaway)
- Devoluciones

### 3. **Outbound** (Despacho)
- Notas de venta
- Picking (recolección)
- Packing (empaque)
- Shipping (despacho)

### 4. **Inventory** (Inventario)
- Dashboard WMS
- Gestión de stock
- Layout de almacén
- Transferencias
- Inventario cíclico
- Reabastecimiento

### 5. **Quality** (Calidad)
- Inspección de productos

### 6. **Analytics** (Reportes)
- Reportes generales
- Modo TV

### 7. **Queries** (Consultas)
- Kardex (trazabilidad)
- Productividad
- Historial de N.V.
- Control de despacho
- Lotes y series
- Estado de N.V.
- Direcciones
- Ubicaciones

### 8. **Admin** (Administración)
- Gestión de usuarios
- Gestión de roles
- Configuración de módulos
- Mediciones
- Salud del sistema
- Control de operaciones
- Auditoría
- Historial de accesos
- Configuración WMS
- Limpieza de datos
- Reportes de tiempo
- Soporte TI
- Historial de cargas

---

## 🔐 Seguridad

### Autenticación
✅ Contraseñas hasheadas
✅ Validación en cliente y servidor
✅ Sesión persistente
✅ Logout automático si usuario es eliminado

### Autorización
✅ Permisos granulares
✅ Validación por ruta
✅ Bypass para ADMIN
✅ Auditoría de accesos

### Datos
✅ Conexión HTTPS
✅ Anon key para frontend
✅ RPC para operaciones críticas
✅ Transacciones ACID

---

## 📈 Performance

### Optimizaciones
- Code splitting automático (Vite)
- Lazy loading de rutas
- Memoización de componentes
- Virtualización de listas
- Caché de Realtime

### Monitoreo
- Heartbeat cada 30s
- Indicador online/offline
- Logs de errores
- Métricas de actividad

---

## 🐛 Debugging

### Logs Disponibles
```javascript
// AuthContext
console.log('📥 Cargando permisos...')
console.log('✅ Permisos cargados')
console.log('🔄 Refrescando permisos...')

// ConfigContext
console.log('📥 Cargando configuración...')
console.log('✅ Módulos cargados')

// Navbar
console.log('🎨 Navbar render')
console.log('🔄 Refrescando manualmente...')
```

### Herramientas
- React DevTools
- Redux DevTools
- Chrome DevTools
- Supabase Dashboard

---

## 📞 Soporte

### Documentación Oficial
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [Capacitor](https://capacitorjs.com)

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Capacitor
npx cap add android
npx cap build android
npx cap open android
```

---

## 📝 Notas Importantes

1. **Supabase Realtime**: Configurado con 10 eventos por segundo
2. **Heartbeat**: Se actualiza cada 30 segundos automáticamente
3. **Permisos**: Se cargan al login y se sincronizan en tiempo real
4. **Módulos**: Se pueden habilitar/deshabilitar desde Admin
5. **PWA**: Se actualiza automáticamente cuando hay cambios
6. **Offline**: Funciona con datos cacheados (limitado)

---

## 🎓 Recursos de Aprendizaje

### Principiantes
1. Leer `DOCUMENTACION_TECNICA.md` (Secciones 1-3)
2. Seguir `GUIA_DESARROLLO.md` (Sección 1)
3. Explorar componentes en `COMPONENTES_DETALLADOS.md`

### Intermedios
1. Entender flujos en `GUIA_DESARROLLO.md` (Sección 4)
2. Aplicar mejores prácticas (Sección 5)
3. Resolver problemas en `GUIA_DESARROLLO.md` (Sección 6)

### Avanzados
1. Arquitectura completa en `ARQUITECTURA_BD.md`
2. Funciones RPC y triggers
3. Políticas de seguridad
4. Optimización de queries

---

## 🚀 Próximos Pasos

### Para Empezar
1. Clonar repositorio
2. Instalar dependencias (`npm install`)
3. Configurar `.env`
4. Iniciar servidor (`npm run dev`)
5. Acceder a `http://localhost:5173`

### Para Desarrollar
1. Crear rama (`git checkout -b feature/...`)
2. Hacer cambios
3. Probar localmente
4. Commit y push
5. Pull request

### Para Desplegar
1. Build (`npm run build`)
2. Verificar `dist/`
3. Desplegar en servidor
4. Configurar variables de entorno
5. Verificar funcionamiento

---

## 📊 Estadísticas de Documentación

| Documento | Secciones | Páginas | Palabras |
|-----------|-----------|---------|----------|
| DOCUMENTACION_TECNICA.md | 10 | ~15 | ~8,000 |
| COMPONENTES_DETALLADOS.md | 4 | ~20 | ~10,000 |
| GUIA_DESARROLLO.md | 6 | ~18 | ~9,000 |
| ARQUITECTURA_BD.md | 8 | ~25 | ~12,000 |
| **TOTAL** | **28** | **~78** | **~39,000** |

---

## 📅 Historial de Cambios

### Versión 1.0.0 (Mayo 2026)
- ✅ Documentación técnica completa
- ✅ Guía de componentes
- ✅ Guía de desarrollo
- ✅ Arquitectura de BD
- ✅ Ejemplos de uso

---

## 👥 Contribuidores

- **Centro de Control Operacional (CCO)**
- **Equipo de Desarrollo**
- **Equipo de Arquitectura**

---

## 📄 Licencia

Documentación interna de CCO WMS. Uso restringido.

---

## 📞 Contacto

Para preguntas o sugerencias sobre la documentación:
- Email: soporte@cco.com
- Slack: #desarrollo
- Jira: CCO-WMS

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
**Estado:** ✅ Completa y Actualizada

---

## 🎉 ¡Gracias por usar CCO WMS!

Esta documentación fue creada con ❤️ para facilitar el desarrollo y mantenimiento del sistema.

**Recuerda:** Una buena documentación es la base de un buen proyecto.
